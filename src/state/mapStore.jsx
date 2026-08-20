import { makeAutoObservable, runInAction } from "mobx";
import {
  objectConfigs,
  objectConfigByType,
  buildInitialNextSpawnDistances,
} from "./objects";
import { dataObjectsSub } from "./subobject";
import {
  CROSS_ON_RED_CHANCE,
  clampPeacefulWorldXOutsideAllQuestCrossings,
  getCrosswalkStartX,
  getCrosswalkStopX,
  getQuestCrossingLayout,
  getVisibleQuestCrossingExclusionZones,
  isQuestCrossingEngaged,
  isQuestCrossingType,
  QUEST_CROSSING_HUMAN_WIDTH,
  QUEST_CROSSING_WIDTH_DESKTOP,
  randomGreenSwitchDelay,
  randomRedWalkDelay,
  WALK_SPEED,
} from "./questCrossingConstants";
import {
  computeEvacuatorStopX,
  computeParkingCarScreenX,
  createIdleParkingEvacuation,
  EVACUATOR_APPROACH_TOLERANCE_PX,
  EVACUATOR_DESPAWN_MARGIN_PX,
  EVACUATOR_SPAWN_MARGIN_PX,
  EVACUATOR_WHEEL_SPIN_FACTOR,
  isParkingZoneType,
  isParkingEvacuatorDebugHoldAfterLoad,
  randomParkingIllegalViolation,
  PARKING_ILLEGAL_CHANCE,
  PARKING_LOAD_DELAY_SEC,
  PARKING_LIFT_SETTLE_SEC,
  PARKING_OCCUPIED_CHANCE,
  PARKING_SPOT_HEIGHT,
  PARKING_SPOT_WIDTH,
  randomEvacuatorSpawnDelaySec,
  randomEvacuatorSpeed,
  randomParkingSpotCount,
} from "./parkingZoneConstants";
import QuestCarStore from "./questCarStore";
import Cars from "./cars";
import {
  isNightChaseContext,
  isPeacefulHumanType,
} from "./modeScoring";
import coinsStore from "./coinsStore";
import {
  CIVILIAN_QUEST_CAR_INITIAL_TIMER_SEC,
  DISPATCH_ORIENTATION_CONFLICT_CHANCE,
  ENEMY_QUEST_CAR_INITIAL_TIMER_SEC,
  getEnemyFirstSpawnGateSec,
  randomCivilianQuestCarRespawnDelaySec,
  randomEnemyQuestCarRespawnDelaySec,
  TRAFFIC_LIGHT_CYCLE_MS,
} from "./event.config";
import {
  DISPATCH_CONFLICT_MESSAGE,
  DISPATCH_ORIENTATION_ALREADY_MESSAGE,
  DISPATCH_QUIET_MESSAGE,
  DISPATCH_REQUEST_MESSAGES,
  EVACUATION_RATIO_MESSAGE,
  ORIENTATION_MAX_WORLD_PX,
  ORIENTATION_MIN_WORLD_PX,
} from "./ratioConstants";
import ratioStore from "./ratioStore";
import {
  ROAD_MARKING_DESPAWN_MARGIN_PX,
  ROAD_MARKING_STEP_PX,
  ROAD_MARKING_WIDTH_PX,
} from "./roadMarkingConstants";
import {
  buildPeacefulGroupMembers,
  clampFleeWorldX,
  computeFollowerWorldX,
  computeFleeSpeedX,
  computePeacefulHumanWorldX,
  createGroupId,
  createPeacefulPedestrianProfile,
  findNearestAggrWithinRadius,
  getEffectiveDriftSpeedX,
  getPeacefulSpawnInterval,
  getVisibleHumanAggrObjects,
  isPeacefulHumanCapReached,
  isPeacefulHumanVisibleOnScreen,
  PEACEFUL_HUMAN_WIDTH_PX,
  pickPeacefulGroupSize,
  pickSidewalkSlot,
  resetPeacefulAggrReaction,
  resolvePeacefulHumanSpawnWorldX,
  shouldSpawnPeacefulGroup,
  tickPeacefulDriftX,
  tickPeacefulMovementState,
  tickPeacefulYDriftSlot,
} from "./peacefulHumanSpawn";
import {
  computeRoadsideBreakdownCarScreenX,
  isRoadsideBreakdownType,
  ROADSIDE_BREAKDOWN_WIDTH,
} from "./roadsideBreakdownConstants";

const QUEST_CAR_VISIBLE_MARGIN = 150;
const QUEST_CAR_DESPAWN_MARGIN = 250;

// #region agent log
let starDebugLastLog = 0;
const starDebugLog = (location, message, data, hypothesisId) => {
  fetch("http://127.0.0.1:7266/ingest/053c2454-03a1-497a-bc51-1e14d05d5e7f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc4486",
    },
    body: JSON.stringify({
      sessionId: "cc4486",
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

export const STAR_PICKUP_MIN_X = 30;
export const STAR_PICKUP_MAX_X = 280;
export const PLAYER_CAR_LEFT_PX = 30;
export const PLAYER_CAR_WIDTH_DESKTOP_PX = 250;
export const PLAYER_CAR_WIDTH_MOBILE_PX = 220;

/** Правый край машины игрока на экране (совпадает с CSS left + width) */
export function getPlayerCarRightEdgePx(viewportWidth = 1024) {
  const isMobileLandscape = viewportWidth <= 900;
  const width = isMobileLandscape
    ? PLAYER_CAR_WIDTH_MOBILE_PX
    : PLAYER_CAR_WIDTH_DESKTOP_PX;
  return PLAYER_CAR_LEFT_PX + width;
}
export const STAR_SPAWN_RIGHT_INSET = 16;

class MapStore {
  id = 0;
  name = "";
  url = "";

  // Текущее смещение дороги в пикселях (накапливается как distance)
  offsetX = 0;

  // Массив активных объектов на экране
  // Каждый элемент: { uid, typeId, worldX, appeared }
  activeObjects = [];

  // Расстояния до следующего спавна — инициализируются из objectConfigs
  nextSpawnDistances = {};

  // Состояние светофора
  trafficLightColor = "red";
  trafficLightTimer = null;
  trafficLightOnTheMap = false;

  // Состояние заправки
  isRefueling = false;
  refuelInterval = null;

  // Метр, на котором закончился самый последний созданный объект любого типа
  lastObjectEndMeter = 0;

  // Ссылка на carStore для заправки
  carStore = null;

  // Police Quest state
  isPoliceQuestActive = false;
  questTargetObject = null;
  questCarPosition = -150;

  // Pedestrian Crossing Quest state
  isPedestrianCrossingQuestActive = false;
  pedestrianCrossingTargetObject = null;
  lastViewportWidth = 1024;
  __forcePedestrianCrossOnRed = false;

  // Parking Fine Quest state
  parkingFineTargetZone = null;
  parkingEvacuation = createIdleParkingEvacuation();
  pendingEvacuationTarget = null;
  orientationQuest = {
    active: false,
    targetUid: null,
    targetWorldX: 0,
  };
  __forceParkingIllegal = false;

  // Quest Cars state
  questCars = [];
  questCarSpawnTimer = ENEMY_QUEST_CAR_INITIAL_TIMER_SEC;
  civilianQuestCarSpawnTimer = CIVILIAN_QUEST_CAR_INITIAL_TIMER_SEC;
  questCarForArrest = null;

  // Quest Arrest modal state
  isQuestArrestActive = false;
  arrestAnimFinished = false;

  gameMode = "free";

  sessionElapsedSec = 0;

  questsAtLastCoinEvent = 0;
  collectibleCoinSpawnTimer = null;
  coinFlies = [];

  // Сегменты дорожной разметки: { uid, worldX }
  roadMarkings = [];
  roadMarkingSpawnCursor = null;

  constructor(mapData) {
    Object.assign(this, mapData);
    this.nextSpawnDistances = buildInitialNextSpawnDistances(objectConfigs);
    makeAutoObservable(this);
  }

  // Накопление смещения мира (единственный источник для рендера карты)
  advance(carSpeed, deltaTime) {
    runInAction(() => {
      this.offsetX += carSpeed * deltaTime;
    });
  }

  /** Один тик мира после advance: спавн, деспавн, quest-cars, зона ареста */
  tickWorld(carStore, deltaTime, viewportWidth) {
    this.lastViewportWidth = viewportWidth;
    runInAction(() => {
      this.sessionElapsedSec += deltaTime;
    });
    this.updateQuestCarSpawner(deltaTime);
    this.updateRoadMarkings(viewportWidth);
    this.spawnEnvironmentObjects(viewportWidth);
    this.updatePeacefulPedestrians(deltaTime);
    this.despawnObjects(viewportWidth);
    this.updateOrientationQuest();
    this.triggerAppearEvents(carStore);
    this.updateCollectibleCoinSpawner(deltaTime, viewportWidth);
    this.checkCollectibleCoinPickup();
    this.updateQuestCars(deltaTime);
    this.updateQuestCrossings(deltaTime, viewportWidth);
    this.updateParkingEvacuation(deltaTime);
    this.checkQuestCarDistance();
  }

  get isWorldFrozen() {
    return this.parkingEvacuation.phase !== "idle";
  }

  get questsSinceLastCoin() {
    if (!this.carStore) return 0;
    return this.carStore.totalQuestCompletions - this.questsAtLastCoinEvent;
  }

  hasActiveCollectibleCoin() {
    return this.activeObjects.some((obj) => obj.typeId === "collectible_coin");
  }

  randomCollectibleCoinSpawnDelay() {
    return 15 + Math.random() * 10;
  }

  updateCollectibleCoinSpawner(deltaTime, viewportWidth) {
    if (this.gameMode !== "free") return;
    if (!this.carStore?.isCoinCollectionUnlocked) return;
    if (this.hasActiveCollectibleCoin()) return;

    if (this.questsSinceLastCoin < 2) {
      runInAction(() => {
        this.collectibleCoinSpawnTimer = null;
      });
      return;
    }

    if (this.collectibleCoinSpawnTimer === null) {
      runInAction(() => {
        this.collectibleCoinSpawnTimer = this.randomCollectibleCoinSpawnDelay();
      });
      return;
    }

    runInAction(() => {
      this.collectibleCoinSpawnTimer -= deltaTime;
      if (this.collectibleCoinSpawnTimer <= 0) {
        this.spawnCollectibleCoin(viewportWidth);
        this.collectibleCoinSpawnTimer = null;
      }
    });
  }

  spawnCollectibleCoin(viewportWidth) {
    if (this.hasActiveCollectibleCoin()) return;

    const config = objectConfigByType.collectible_coin;
    if (!config) return;

    const spawnScreenX = viewportWidth;
    const worldX = this.offsetX + spawnScreenX;
    const uid = `obj_collectible_coin_${Date.now()}_${Math.random()}`;

    runInAction(() => {
      this.activeObjects.push({
        uid,
        typeId: "collectible_coin",
        worldX,
        appeared: false,
      });
    });

    // #region agent log
    starDebugLog(
      "mapStore.jsx:spawnCollectibleCoin",
      "star spawned",
      {
        uid,
        worldX,
        screenX: spawnScreenX,
        viewportWidth,
        offsetX: this.offsetX,
      },
      "H3",
    );
    // #endregion
  }

  checkCollectibleCoinPickup() {
    if (this.gameMode !== "free") return;
    if (!this.carStore?.isCoinCollectionUnlocked) return;

    const star = this.activeObjects.find(
      (obj) => obj.typeId === "collectible_coin",
    );
    if (!star) return;

    const screenX = star.worldX - this.offsetX;

    // #region agent log
    const now = Date.now();
    if (now - starDebugLastLog > 500) {
      starDebugLastLog = now;
      const el = document.querySelector(`[data-uid="${star.uid}"]`);
      const rect = el?.getBoundingClientRect();
      const cs = el ? getComputedStyle(el) : null;
      starDebugLog(
        "mapStore.jsx:checkCollectibleCoinPickup",
        "star active on map",
        {
          uid: star.uid,
          screenX,
          inPickupZone:
            screenX >= STAR_PICKUP_MIN_X && screenX <= STAR_PICKUP_MAX_X,
          domFound: Boolean(el),
          rect: rect
            ? {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              }
            : null,
          zIndex: cs?.zIndex ?? null,
          opacity: cs?.opacity ?? null,
          visibility: cs?.visibility ?? null,
          viewportWidth:
            typeof window !== "undefined" ? window.innerWidth : null,
        },
        rect && rect.width > 0 && rect.height > 0 ? "H1" : "H2",
      );
    }
    // #endregion

    if (screenX < STAR_PICKUP_MIN_X || screenX > STAR_PICKUP_MAX_X) return;

    const config = objectConfigByType.collectible_coin;
    let startX = screenX + (config?.width ?? 48) / 2;
    let startY = window.innerHeight * 0.62;

    let domUsed = false;
    if (typeof document !== "undefined") {
      const el = document.querySelector(`[data-uid="${star.uid}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        domUsed = rect.width > 0 && rect.height > 0;
      }
    }

    // #region agent log
    starDebugLog(
      "mapStore.jsx:checkCollectibleCoinPickup",
      "star pickup triggered",
      {
        uid: star.uid,
        screenX,
        startX,
        startY,
        domUsed,
        fallbackY: window.innerHeight * 0.62,
      },
      domUsed ? "H5" : "H4",
    );
    // #endregion

    this.beginCoinPickup(star.uid, startX, startY);
  }

  beginCoinPickup(uid, startX, startY) {
    if (!this.carStore) return;

    runInAction(() => {
      this.questsAtLastCoinEvent = this.carStore.totalQuestCompletions;
      this.collectibleCoinSpawnTimer = null;
      this.removeObjectByUid(uid);

      const flyId = `coin_fly_${Date.now()}_${Math.random()}`;
      this.coinFlies.push({
        id: flyId,
        startX,
        startY,
      });
    });
  }

  completeCoinFly(flyId) {
    runInAction(() => {
      this.coinFlies = this.coinFlies.filter((fly) => fly.id !== flyId);
    });
    coinsStore.addCoins(1);
  }

  updateQuestCarSpawner(deltaTime) {
    if (!isNightChaseContext(this)) {
      this.civilianQuestCarSpawnTimer -= deltaTime;
      if (this.civilianQuestCarSpawnTimer <= 0) {
        this.spawnCivilianQuestCar();
      }
    }

    this.questCarSpawnTimer -= deltaTime;
    if (this.questCarSpawnTimer <= 0) {
      this.spawnEnemyQuestCar();
    }
  }

  randomCivilianQuestCarSpawnDelay() {
    return randomCivilianQuestCarRespawnDelaySec();
  }

  randomEnemyQuestCarSpawnDelay() {
    return randomEnemyQuestCarRespawnDelaySec(this.gameMode);
  }

  spawnCivilianQuestCar() {
    const pool = Cars.otherCars.filter((car) => !car.enemy);
    if (pool.length === 0) return;

    const randomCarData = pool[Math.floor(Math.random() * pool.length)];
    const questCar = new QuestCarStore(randomCarData);
    const viewportWidth = window.innerWidth;

    questCar.spawn(viewportWidth + 200, questCar.currentSpeed);

    runInAction(() => {
      this.questCars.push(questCar);
      this.civilianQuestCarSpawnTimer = this.randomCivilianQuestCarSpawnDelay();
    });
  }

  spawnEnemyQuestCar() {
    const pool = Cars.otherCars.filter((car) => car.enemy);
    if (pool.length === 0) return;

    const randomCarData = pool[Math.floor(Math.random() * pool.length)];

    if (this.isEnemyQuestCarSpawnBlocked()) {
      runInAction(() => {
        this.questCarSpawnTimer = this.randomEnemyQuestCarSpawnDelay();
      });
      return;
    }

    const questCar = new QuestCarStore(randomCarData);
    questCar.spawn(-200, questCar.currentSpeed);

    runInAction(() => {
      this.questCars.push(questCar);
      this.questCarSpawnTimer = this.randomEnemyQuestCarSpawnDelay();
    });
  }

  getVisibleQuestCars(viewportWidth, margin = QUEST_CAR_VISIBLE_MARGIN) {
    const minX = -margin;
    const maxX = viewportWidth;
    return this.questCars.filter(
      (car) => car.positionX > minX && car.positionX < maxX,
    );
  }

  hasVisiblePoliceAggroOnScreen(viewportWidth = this.lastViewportWidth) {
    return this.activeObjects.some((obj) => {
      if (!/^human_aggr\d+$/.test(obj.typeId)) return false;
      const config = objectConfigByType[obj.typeId];
      if (!config) return false;
      const screenX = obj.worldX - this.offsetX;
      return screenX < viewportWidth && screenX + config.width > 0;
    });
  }

  hasVisibleParkingZoneOnScreen(viewportWidth = this.lastViewportWidth) {
    return this.activeObjects.some((obj) => {
      if (!isParkingZoneType(obj.typeId) || !obj.parkingZone) return false;
      const screenX = obj.worldX - this.offsetX;
      const width = this.getParkingZoneWidth(obj);
      return screenX < viewportWidth && screenX + width > 0;
    });
  }

  isEnemyQuestCarSpawnBlocked() {
    return (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isParkingFineActive() ||
      this.sessionElapsedSec < getEnemyFirstSpawnGateSec(this.gameMode)
    );
  }

  isEvacuationInProgress() {
    return this.parkingEvacuation.phase !== "idle";
  }

  hasPendingEvacuationTarget() {
    if (this.pendingEvacuationTarget) return true;
    return this.activeObjects.some((obj) => {
      const pz = obj.parkingZone;
      return pz && pz.pendingSpotIndex !== null;
    });
  }

  isParkingFineActive() {
    return this.isEvacuationInProgress() || this.hasPendingEvacuationTarget();
  }

  getParkingZoneWidth(obj) {
    return obj.parkingZone?.totalWidth ?? PARKING_SPOT_WIDTH * 8;
  }

  updateRoadMarkings(viewportWidth) {
    runInAction(() => {
      const leftDespawnWorldX = this.offsetX - ROAD_MARKING_DESPAWN_MARGIN_PX;
      const rightSpawnWorldX = this.offsetX + viewportWidth;

      if (this.roadMarkingSpawnCursor === null) {
        this.roadMarkingSpawnCursor =
          Math.floor(leftDespawnWorldX / ROAD_MARKING_STEP_PX) *
          ROAD_MARKING_STEP_PX;
      }

      while (this.roadMarkingSpawnCursor <= rightSpawnWorldX) {
        this.roadMarkings.push({
          uid: `road_mark_${this.roadMarkingSpawnCursor}`,
          worldX: this.roadMarkingSpawnCursor,
        });
        this.roadMarkingSpawnCursor += ROAD_MARKING_STEP_PX;
      }

      while (
        this.roadMarkings.length > 0 &&
        this.roadMarkings[0].worldX + ROAD_MARKING_WIDTH_PX <= leftDespawnWorldX
      ) {
        this.roadMarkings.shift();
      }
    });
  }

  // Спавн объектов окружения справа за экраном
  spawnEnvironmentObjects(viewportWidth) {
    let peacefulSpawnedThisTick = false;

    objectConfigs.forEach((config) => {
      if (config.type === "collectible_coin") {
        return;
      }

      if (/^human_aggr\d+$/.test(config.type) && this.isPedestrianCrossingQuestActive) {
        return;
      }

      if (isPeacefulHumanType(config.type) && isNightChaseContext(this)) {
        return;
      }

      if (isQuestCrossingType(config.type) && isNightChaseContext(this)) {
        return;
      }

      if (isParkingZoneType(config.type) && isNightChaseContext(this)) {
        return;
      }

      if (isRoadsideBreakdownType(config.type)) {
        if (isNightChaseContext(this)) return;
        if (this.isEvacuationInProgress() || this.hasPendingEvacuationTarget()) {
          return;
        }
      }

      if (isPeacefulHumanType(config.type)) {
        if (peacefulSpawnedThisTick) {
          return;
        }

        const nextSpawn = this.nextSpawnDistances[config.type];
        if (this.offsetX >= nextSpawn) {
          if (
            isPeacefulHumanCapReached(
              this.activeObjects,
              this.offsetX,
              viewportWidth,
            )
          ) {
            return;
          }

          const questCrossingZones = getVisibleQuestCrossingExclusionZones(
            this.activeObjects,
            this.offsetX,
            viewportWidth,
          );
          const worldX = resolvePeacefulHumanSpawnWorldX(
            this.activeObjects,
            this.offsetX,
            viewportWidth,
            Math.random,
            questCrossingZones,
          );
          const sidewalkSlot = pickSidewalkSlot();

          if (shouldSpawnPeacefulGroup()) {
            const groupId = createGroupId();
            const groupSize = pickPeacefulGroupSize();
            const humanTypes = dataObjectsSub
              .filter((entry) => /^human\d+$/.test(entry.type))
              .map((entry) => entry.type);
            const followerTypeIds = [];
            const followerPool =
              humanTypes.length > 1
                ? humanTypes.filter((typeId) => typeId !== config.type)
                : humanTypes;

            for (let i = 0; i < groupSize - 1; i += 1) {
              followerTypeIds.push(
                followerPool[Math.floor(Math.random() * followerPool.length)],
              );
            }

            const members = buildPeacefulGroupMembers({
              groupId,
              leaderWorldX: worldX,
              sidewalkSlot,
              leaderTypeId: config.type,
              followerTypeIds,
            });

            runInAction(() => {
              for (const member of members) {
                this.activeObjects.push({
                  uid: member.uid,
                  typeId: member.typeId,
                  worldX: member.worldX,
                  appeared: false,
                  pedestrian: member.pedestrian,
                });
              }
            });
          } else {
            const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;
            const pedestrian = createPeacefulPedestrianProfile({
              uid,
              worldX,
              sidewalkSlot,
            });

            runInAction(() => {
              this.activeObjects.push({
                uid,
                typeId: config.type,
                worldX,
                appeared: false,
                pedestrian,
              });
            });
          }

          this.nextSpawnDistances[config.type] =
            nextSpawn + getPeacefulSpawnInterval(config);
          peacefulSpawnedThisTick = true;
        }
        return;
      }

      if (config.type === "traffic_light") {
        if (
          this.hasVisibleParkingZoneOnScreen(viewportWidth) ||
          this.isParkingFineActive()
        ) {
          return;
        }
      }

      const nextSpawn = this.nextSpawnDistances[config.type];

      if (this.offsetX >= nextSpawn) {
        const worldX =
          Math.max(this.offsetX + viewportWidth, this.lastObjectEndMeter) +
          Math.random() * 100;

        const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;

        if (isParkingZoneType(config.type)) {
          const spotCount = randomParkingSpotCount();
          const totalWidth = spotCount * PARKING_SPOT_WIDTH;

          runInAction(() => {
            this.activeObjects.push({
              uid,
              typeId: config.type,
              worldX,
              appeared: false,
              parkingSpotCount: spotCount,
            });
            this.lastObjectEndMeter = worldX + totalWidth;
          });
        } else {
          runInAction(() => {
            this.activeObjects.push({
              uid,
              typeId: config.type,
              worldX,
              appeared: false,
            });
            this.lastObjectEndMeter = worldX + config.width;
          });
        }

        this.nextSpawnDistances[config.type] =
          nextSpawn +
          config.minDistance +
          Math.random() * (config.maxDistance - config.minDistance);
      }
    });
  }

  updatePeacefulPedestrians(deltaTime) {
    if (isNightChaseContext(this)) return;

    runInAction(() => {
      const viewportWidth = this.lastViewportWidth;
      const questCrossingZones = getVisibleQuestCrossingExclusionZones(
        this.activeObjects,
        this.offsetX,
        viewportWidth,
      );
      const visibleAggrs = getVisibleHumanAggrObjects(
        this.activeObjects,
        this.offsetX,
        viewportWidth,
      );
      const aggrOnScreen = visibleAggrs.length > 0;

      const applyQuestCrossingBoundary = (obj, nextWorldX) => {
        const previousWorldX = obj.worldX;
        const clampedWorldX = clampPeacefulWorldXOutsideAllQuestCrossings(
          nextWorldX,
          PEACEFUL_HUMAN_WIDTH_PX,
          questCrossingZones,
          previousWorldX,
        );
        if (clampedWorldX !== nextWorldX) {
          obj.pedestrian.driftSpeedX = 0;
        }
        obj.worldX = clampedWorldX;
      };

      const peaceful = this.activeObjects.filter(
        (obj) => isPeacefulHumanType(obj.typeId) && obj.pedestrian,
      );
      const leadersByGroupId = new Map();

      for (const obj of peaceful) {
        const pedestrian = obj.pedestrian;
        if (pedestrian.groupId && pedestrian.pairRole === "leader") {
          leadersByGroupId.set(pedestrian.groupId, obj);
        }
      }

      if (!aggrOnScreen) {
        for (const obj of peaceful) {
          resetPeacefulAggrReaction(obj.pedestrian);
        }
      }

      for (const obj of peaceful) {
        const pedestrian = obj.pedestrian;
        if (pedestrian.pairRole === "follower") continue;

        const isVisible = isPeacefulHumanVisibleOnScreen(
          obj,
          this.offsetX,
          viewportWidth,
        );
        let reactionActive = false;

        if (aggrOnScreen && isVisible) {
          const nearestAggr = findNearestAggrWithinRadius(
            obj.worldX,
            visibleAggrs,
            pedestrian.fleeRadius,
          );

          if (nearestAggr) {
            reactionActive = true;

            if (pedestrian.reactionToAggr === "watch") {
              pedestrian.driftSpeedX = 0;
            } else {
              const fleeSpeedX = computeFleeSpeedX(
                obj.worldX,
                nearestAggr.worldX,
                pedestrian.fleeSpeed,
              );
              applyQuestCrossingBoundary(
                obj,
                clampFleeWorldX(
                  tickPeacefulDriftX(obj.worldX, fleeSpeedX, deltaTime),
                  pedestrian.spawnWorldX,
                  pedestrian.fleeMaxDistance,
                ),
              );
            }
          } else if (
            pedestrian.reactionToAggr === "watch" &&
            pedestrian.driftSpeedX === 0
          ) {
            resetPeacefulAggrReaction(pedestrian);
          }
        }

        if (!reactionActive) {
          tickPeacefulMovementState(pedestrian, deltaTime, Math.random);
          const speedX = getEffectiveDriftSpeedX(pedestrian);
          applyQuestCrossingBoundary(
            obj,
            tickPeacefulDriftX(obj.worldX, speedX, deltaTime),
          );
          if (pedestrian.isWalking) {
            tickPeacefulYDriftSlot(pedestrian, deltaTime, Math.random);
          }
        }
      }

      for (const obj of peaceful) {
        const pedestrian = obj.pedestrian;
        if (pedestrian.pairRole !== "follower") continue;

        const leader = leadersByGroupId.get(pedestrian.groupId);
        if (!leader) continue;

        pedestrian.isWalking = leader.pedestrian.isWalking;
        pedestrian.driftSpeedX = leader.pedestrian.driftSpeedX;
        pedestrian.sidewalkSlot = leader.pedestrian.sidewalkSlot;
        const leaderSpeedX =
          leader.pedestrian.reactionToAggr === "watch" &&
          leader.pedestrian.driftSpeedX === 0
            ? 0
            : getEffectiveDriftSpeedX(leader.pedestrian);
        applyQuestCrossingBoundary(
          obj,
          computeFollowerWorldX(
            leader.worldX,
            leaderSpeedX,
            pedestrian.groupFollowOffsetX,
          ),
        );
      }
    });
  }

  // Удаление объектов, ушедших за левый край экрана
  despawnObjects(viewportWidth) {
    runInAction(() => {
      this.activeObjects = this.activeObjects.filter((obj) => {
        const config = objectConfigByType[obj.typeId];
        if (!config) {
          if (obj.longPressTimeout) {
            clearTimeout(obj.longPressTimeout);
            obj.longPressTimeout = null;
          }
          return false;
        }

        const screenX = obj.worldX - this.offsetX;
        if (obj.typeId === "traffic_light") {
          this.trafficLightOnTheMap =
            screenX < viewportWidth && screenX + config.width > 0;
        }

        if (isQuestCrossingType(obj.typeId)) {
          const objectVisible = screenX > -config.width;
          let humanVisible = false;
          if (obj.questCrossing) {
            const humanScreenX =
              obj.questCrossing.humanWorldX - this.offsetX;
            humanVisible =
              humanScreenX > -QUEST_CROSSING_HUMAN_WIDTH;
          }
          const visible = objectVisible || humanVisible;
          if (!visible) {
            if (obj.longPressTimeout) {
              clearTimeout(obj.longPressTimeout);
              obj.longPressTimeout = null;
            }
            this.clearPedestrianQuestTargetIfMatches(obj);
            return false;
          }
          return true;
        }

        if (isParkingZoneType(obj.typeId)) {
          const zoneWidth = this.getParkingZoneWidth(obj);
          const visible = screenX > -zoneWidth;
          if (!visible) {
            if (obj.longPressTimeout) {
              clearTimeout(obj.longPressTimeout);
              obj.longPressTimeout = null;
            }
            this.clearParkingFineState(obj);
            return false;
          }
          return true;
        }

        if (isRoadsideBreakdownType(obj.typeId)) {
          const visible = screenX > -ROADSIDE_BREAKDOWN_WIDTH;
          if (!visible) {
            if (obj.longPressTimeout) {
              clearTimeout(obj.longPressTimeout);
              obj.longPressTimeout = null;
            }
            this.clearRoadsideBreakdownState(obj);
            return false;
          }
          return true;
        }

        if (
          this.orientationQuest.active &&
          obj.uid === this.orientationQuest.targetUid
        ) {
          const visible = screenX > -config.width;
          if (!visible) {
            if (obj.longPressTimeout) {
              clearTimeout(obj.longPressTimeout);
              obj.longPressTimeout = null;
            }
            this.clearOrientationQuestIfTargetDespawned(obj);
            return false;
          }
          return true;
        }

        const visible = screenX > -config.width;
        if (!visible && obj.longPressTimeout) {
          clearTimeout(obj.longPressTimeout);
          obj.longPressTimeout = null;
        }
        return visible;
      });
      const sorted = [...this.activeObjects].sort(
        (a, b) => b.worldX - a.worldX,
      );
      if (sorted.length > 0) {
        const lastObj = sorted[0];
        const lastConfig = objectConfigByType[lastObj.typeId];
        const lastWidth = isParkingZoneType(lastObj.typeId)
          ? this.getParkingZoneWidth(lastObj)
          : isRoadsideBreakdownType(lastObj.typeId)
            ? ROADSIDE_BREAKDOWN_WIDTH
            : lastConfig.width;
        this.lastObjectEndMeter = lastObj.worldX + lastWidth;
      } else {
        this.lastObjectEndMeter = this.offsetX;
      }
    });
  }

  // Вызов onAppear для новых объектов
  triggerAppearEvents(carStore) {
    this.activeObjects.forEach((obj) => {
      if (!obj.appeared) {
        const config = objectConfigByType[obj.typeId];
        let appearResult;
        if (config?.onAppear) {
          appearResult = config.onAppear({ ...obj, config }, this, carStore);
        }
        if (appearResult !== "retry") {
          runInAction(() => {
            obj.appeared = true;
          });
        }
      }
    });
  }

  // Глобальный таймер светофора (10 секунд)
  startTrafficLightTimer() {
    if (isNightChaseContext(this)) {
      if (this.trafficLightTimer) {
        clearInterval(this.trafficLightTimer);
        this.trafficLightTimer = null;
      }
      return;
    }

    if (this.trafficLightTimer) {
      clearInterval(this.trafficLightTimer);
    }

    this.trafficLightTimer = setInterval(() => {
      runInAction(() => {
        this.trafficLightColor =
          this.trafficLightColor === "red" ? "green" : "red";
      });
    }, TRAFFIC_LIGHT_CYCLE_MS);
  }

  // Однократная заправка
  refuelCar(amount) {
    if (this.carStore) {
      runInAction(() => {
        this.carStore.fuel = Math.min(
          this.carStore.fuel + amount,
          this.carStore.maxFuel,
        );
      });
      this.carStore.persistFuel();
    }
  }

  // Начать непрерывную заправку
  startRefueling() {
    if (this.isRefueling) return;
    runInAction(() => {
      this.isRefueling = true;
    });

    this.refuelInterval = setInterval(() => {
      if (this.carStore && this.isRefueling) {
        runInAction(() => {
          this.carStore.fuel = Math.min(
            this.carStore.fuel + 200,
            this.carStore.maxFuel,
          );
        });
        this.carStore.persistFuel();
      }
    }, 100);
  }

  // Остановить непрерывную заправку
  stopRefueling() {
    runInAction(() => {
      this.isRefueling = false;
    });
    if (this.refuelInterval) {
      clearInterval(this.refuelInterval);
      this.refuelInterval = null;
    }
  }

  // Очистка всех таймеров
  dispose() {
    this.stopRefueling();

    if (this.trafficLightTimer) {
      clearInterval(this.trafficLightTimer);
      this.trafficLightTimer = null;
    }
    if (this.refuelInterval) {
      clearInterval(this.refuelInterval);
      this.refuelInterval = null;
    }
    this.questCars = [];
    this.questCarForArrest = null;
    this.questsAtLastCoinEvent = 0;
    this.collectibleCoinSpawnTimer = null;
    this.coinFlies = [];
    this.pendingEvacuationTarget = null;
    this.finishOrientationQuest();
    ratioStore.clearRatioTimers();
  }

  // Готовый признак: светофор на экране И красный
  get isTrafficLightRed() {
    return this.trafficLightOnTheMap && this.trafficLightColor === "red";
  }

  startQuest(targetObj) {
    if (this.isPedestrianCrossingQuestActive || this.isParkingFineActive()) {
      return;
    }

    runInAction(() => {
      this.isPoliceQuestActive = true;
      this.questTargetObject = targetObj;
      this.questCarPosition = -150;
    });
  }

  finishQuest() {
    const target = this.questTargetObject;
    if (
      target?.orientationSpawn ||
      (target?.uid && target.uid === this.orientationQuest.targetUid)
    ) {
      this.finishOrientationQuest();
    }

    runInAction(() => {
      this.isPoliceQuestActive = false;
      this.questTargetObject = null;
      this.questCarPosition = -150;
    });
  }

  removeObjectByUid(uid) {
    runInAction(() => {
      const idx = this.activeObjects.findIndex((obj) => obj.uid === uid);
      if (idx !== -1) {
        this.activeObjects.splice(idx, 1);
        const configMap = objectConfigByType;
        const sorted = [...this.activeObjects].sort(
          (a, b) => b.worldX - a.worldX,
        );
        if (sorted.length > 0) {
          const lastObj = sorted[0];
          const lastConfig = configMap[lastObj.typeId];
          const lastWidth = isParkingZoneType(lastObj.typeId)
            ? this.getParkingZoneWidth(lastObj)
            : lastConfig.width;
          this.lastObjectEndMeter = lastObj.worldX + lastWidth;
        } else {
          this.lastObjectEndMeter = this.offsetX;
        }
      }
    });
  }

  updateQuestCarPosition(newPosition) {
    runInAction(() => {
      this.questCarPosition = newPosition;
    });
  }

  clearPedestrianQuestTargetIfMatches(obj) {
    if (this.pedestrianCrossingTargetObject?.uid === obj.uid) {
      this.isPedestrianCrossingQuestActive = false;
      this.pedestrianCrossingTargetObject = null;
    }
  }

  clearOrientationQuestIfTargetDespawned(obj) {
    if (!this.orientationQuest.active) return;
    if (obj.uid !== this.orientationQuest.targetUid) return;
    if (
      this.isPoliceQuestActive &&
      this.questTargetObject?.uid === this.orientationQuest.targetUid
    ) {
      return;
    }
    this.finishOrientationQuest();
  }

  updateOrientationQuest() {
    if (!this.orientationQuest.active) return;
    if (
      this.isPoliceQuestActive &&
      this.questTargetObject?.uid === this.orientationQuest.targetUid
    ) {
      return;
    }

    const targetExists = this.activeObjects.some(
      (obj) => obj.uid === this.orientationQuest.targetUid,
    );
    if (!targetExists) {
      runInAction(() => {
        this.finishOrientationQuest();
      });
    }
  }

  initQuestCrossing(obj) {
    if (isNightChaseContext(this)) return false;
    if (
      this.isPedestrianCrossingQuestActive ||
      this.isPoliceQuestActive ||
      this.isQuestArrestActive ||
      this.isParkingFineActive() ||
      this.hasVisiblePoliceAggroOnScreen()
    ) {
      return false;
    }
    if (this.carStore?.sirena) return false;
    if (obj.questCrossing) return true;

    const humanTypes = dataObjectsSub.filter((entry) =>
      /^human\d+$/.test(entry.type),
    );
    if (humanTypes.length === 0) return false;

    const randomHuman =
      humanTypes[Math.floor(Math.random() * humanTypes.length)];
    const crossesOnRed =
      typeof window !== "undefined" &&
      window.__PLAYWRIGHT__ &&
      this.__forcePedestrianCrossOnRed
        ? true
        : Math.random() < CROSS_ON_RED_CHANCE;

    const forceInstantWalk =
      typeof window !== "undefined" &&
      window.__PLAYWRIGHT__ &&
      this.__forcePedestrianCrossOnRed;

    const layout = getQuestCrossingLayout(this.lastViewportWidth);

    runInAction(() => {
      obj.questCrossing = {
        humanType: randomHuman.type,
        crossesOnRed,
        phase: crossesOnRed ? "waiting_red" : "waiting_green",
        crossingWidth: layout.width,
        humanWorldX: getCrosswalkStartX(obj.worldX, layout.width),
        trafficLightGreen: false,
        greenSwitchTimer: null,
        redWalkTimer: null,
        forceInstantWalk,
        stopWorldX: getCrosswalkStopX(obj.worldX, layout.width),
        showFinishOverlay: false,
      };
      this.isPedestrianCrossingQuestActive = true;
      this.pedestrianCrossingTargetObject = obj;
    });
    return true;
  }

  updateQuestCrossings(deltaTime, viewportWidth) {
    runInAction(() => {
      for (const obj of this.activeObjects) {
        if (!isQuestCrossingType(obj.typeId) || !obj.questCrossing) continue;

        const qc = obj.questCrossing;
        if (qc.phase === "finished") continue;

        const config = objectConfigByType[obj.typeId];
        const crossingWidth =
          qc.crossingWidth ?? config?.width ?? QUEST_CROSSING_WIDTH_DESKTOP;
        const screenX = obj.worldX - this.offsetX;
        const engaged = isQuestCrossingEngaged(
          screenX,
          crossingWidth,
          viewportWidth,
        );

        if (qc.phase === "waiting_green") {
          if (engaged) {
            if (qc.greenSwitchTimer === null) {
              qc.greenSwitchTimer = qc.forceInstantWalk
                ? 0.05
                : randomGreenSwitchDelay();
            }
            qc.greenSwitchTimer -= deltaTime;
            if (qc.greenSwitchTimer <= 0) {
              qc.trafficLightGreen = true;
              qc.phase = "walking";
            }
          }
        }

        if (qc.phase === "waiting_red") {
          if (engaged) {
            if (qc.redWalkTimer === null) {
              qc.redWalkTimer = qc.forceInstantWalk
                ? 0.05
                : randomRedWalkDelay();
            }
            qc.redWalkTimer -= deltaTime;
            if (qc.redWalkTimer <= 0) {
              qc.phase = "walking";
            }
          }
        }

        if (qc.phase === "walking") {
          qc.humanWorldX -= WALK_SPEED * deltaTime;

          if (qc.humanWorldX <= qc.stopWorldX) {
            qc.phase = "stopped";
            qc.humanWorldX = qc.stopWorldX;
          }
        }
      }
    });
  }

  handlePedestrianCrossingClick(obj) {
    const qc = obj.questCrossing;
    if (!qc || !qc.crossesOnRed) return;
    if (qc.phase !== "walking" && qc.phase !== "stopped") return;
    if (qc.showFinishOverlay) return;

    runInAction(() => {
      qc.phase = "stopped";
      qc.showFinishOverlay = true;
    });
  }

  finishPedestrianCrossingQuest() {
    runInAction(() => {
      const obj = this.pedestrianCrossingTargetObject;
      if (obj?.questCrossing) {
        obj.questCrossing.phase = "finished";
        obj.questCrossing.showFinishOverlay = false;
      }
      this.isPedestrianCrossingQuestActive = false;
      this.pedestrianCrossingTargetObject = null;
    });
  }

  getCivilianCars() {
    return Cars.otherCars.filter((car) => !car.enemy);
  }

  pickRandomCivilianCar(randomFn = Math.random) {
    const civilianCars = this.getCivilianCars();
    if (civilianCars.length === 0) return null;
    return civilianCars[Math.floor(randomFn() * civilianCars.length)];
  }

  createParkingCarStore(carData) {
    return {
      urlBody: carData.urlBody,
      urlShell: carData.urlShell,
      wheelRotation: 0,
      sirena: false,
    };
  }

  shouldForceParkingIllegal() {
    return (
      typeof window !== "undefined" &&
      window.__PLAYWRIGHT__ &&
      this.__forceParkingIllegal
    );
  }

  initParkingZone(obj) {
    if (isNightChaseContext(this)) return false;
    if (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isParkingFineActive() ||
      this.hasVisiblePoliceAggroOnScreen()
    ) {
      return false;
    }
    if (obj.parkingZone) return true;

    const spotCount = obj.parkingSpotCount ?? randomParkingSpotCount();
    const spotWidth = PARKING_SPOT_WIDTH;
    const spotHeight = PARKING_SPOT_HEIGHT;
    const totalWidth = spotCount * spotWidth;
    const forceIllegal = this.shouldForceParkingIllegal();
    const spots = [];

    for (let index = 0; index < spotCount; index += 1) {
      const occupied = Math.random() < PARKING_OCCUPIED_CHANCE;
      let status = "empty";
      let violationType = null;
      let carData = null;

      if (occupied) {
        const isIllegal =
          forceIllegal || Math.random() < PARKING_ILLEGAL_CHANCE;
        status = isIllegal ? "illegal" : "legal";
        const civilianCar = this.pickRandomCivilianCar();
        if (!civilianCar) {
          status = "empty";
        } else {
          carData = this.createParkingCarStore(civilianCar);
          if (isIllegal) {
            violationType = randomParkingIllegalViolation();
          }
        }
      }

      spots.push({
        index,
        status,
        violationType,
        carData,
        fined: false,
        fining: false,
      });
    }

    runInAction(() => {
      obj.parkingZone = {
        spotCount,
        spotWidth,
        spotHeight,
        totalWidth,
        spots,
        pendingSpotIndex: null,
      };
    });
    return true;
  }

  initRoadsideBreakdown(obj) {
    if (isNightChaseContext(this)) return false;
    if (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isParkingFineActive() ||
      this.hasVisiblePoliceAggroOnScreen()
    ) {
      return false;
    }
    if (obj.roadsideBreakdown) return true;

    const civilianCar = this.pickRandomCivilianCar();
    if (!civilianCar) return false;

    runInAction(() => {
      obj.roadsideBreakdown = {
        carData: this.createParkingCarStore(civilianCar),
        selected: false,
        helped: false,
      };
    });
    return true;
  }

  selectRoadsideBreakdownTarget(breakdownObj) {
    if (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isEvacuationInProgress() ||
      this.hasPendingEvacuationTarget()
    ) {
      return;
    }

    const rb = breakdownObj?.roadsideBreakdown;
    if (!rb || rb.selected || rb.helped) {
      return;
    }

    const targetScreenX = computeRoadsideBreakdownCarScreenX(
      breakdownObj.worldX,
      this.offsetX,
    );
    const stopPositionX = computeEvacuatorStopX(targetScreenX);

    this.carStore?.releaseGas?.();
    if (this.carStore) {
      runInAction(() => {
        this.carStore.isGasPressed = false;
        this.carStore.currentSpeed = 0;
      });
    }

    runInAction(() => {
      rb.selected = true;
      this.pendingEvacuationTarget = {
        kind: "roadside",
        breakdownUid: breakdownObj.uid,
        targetScreenX,
        stopPositionX,
      };
    });
  }

  selectParkingViolationTarget(zoneObj, spotIndex) {
    if (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isEvacuationInProgress() ||
      this.hasPendingEvacuationTarget()
    ) {
      return;
    }

    const pz = zoneObj?.parkingZone;
    if (!pz || pz.pendingSpotIndex !== null) {
      return;
    }

    const spot = pz.spots[spotIndex];
    if (!spot || spot.status !== "illegal" || spot.fined || spot.fining) {
      return;
    }

    const zoneScreenX = zoneObj.worldX - this.offsetX;
    const targetScreenX = computeParkingCarScreenX(
      zoneScreenX,
      spotIndex,
      pz.spotWidth,
    );
    const stopPositionX = computeEvacuatorStopX(targetScreenX);

    this.carStore?.releaseGas?.();
    if (this.carStore) {
      runInAction(() => {
        this.carStore.isGasPressed = false;
        this.carStore.currentSpeed = 0;
      });
    }

    runInAction(() => {
      spot.fining = true;
      pz.pendingSpotIndex = spotIndex;
      this.parkingFineTargetZone = zoneObj;
      this.pendingEvacuationTarget = {
        kind: "parking",
        zoneUid: zoneObj.uid,
        spotIndex,
        targetScreenX,
        stopPositionX,
      };
    });
  }

  confirmParkingEvacuationViaRadio() {
    const target = this.pendingEvacuationTarget;
    if (
      !target ||
      (target.kind !== "parking" && target.kind !== "roadside") ||
      this.isEvacuationInProgress()
    ) {
      return;
    }

    ratioStore.showMessage(EVACUATION_RATIO_MESSAGE, {
      responseDelaySec: 0,
      onComplete: () => {
        runInAction(() => {
          if (target.kind === "parking") {
            this.parkingEvacuation = {
              phase: "spawn_delay",
              sourceKind: "parking",
              targetUid: target.zoneUid,
              zoneUid: target.zoneUid,
              spotIndex: target.spotIndex,
              targetScreenX: target.targetScreenX,
              stopPositionX: target.stopPositionX,
              positionX: 0,
              currentSpeed: 0,
              wheelRotation: 0,
              spawnDelayRemaining: randomEvacuatorSpawnDelaySec(),
              loadDelayRemaining: 0,
              loadedSettleRemaining: 0,
              carOnPlatform: false,
            };
          } else {
            const breakdownObj = this.activeObjects.find(
              (obj) => obj.uid === target.breakdownUid,
            );
            if (breakdownObj?.roadsideBreakdown) {
              breakdownObj.roadsideBreakdown.selected = false;
            }
            this.parkingEvacuation = {
              phase: "spawn_delay",
              sourceKind: "roadside",
              targetUid: target.breakdownUid,
              zoneUid: null,
              spotIndex: null,
              targetScreenX: target.targetScreenX,
              stopPositionX: target.stopPositionX,
              positionX: 0,
              currentSpeed: 0,
              wheelRotation: 0,
              spawnDelayRemaining: randomEvacuatorSpawnDelaySec(),
              loadDelayRemaining: 0,
              loadedSettleRemaining: 0,
              carOnPlatform: false,
            };
          }
          this.pendingEvacuationTarget = null;
        });
      },
    });
  }

  handleRatioPress() {
    if (ratioStore.isFlowActive || this.gameMode === "chase") {
      return;
    }

    if (this.hasPendingEvacuationTarget()) {
      this.confirmParkingEvacuationViaRadio();
      return;
    }

    if (
      this.isPoliceQuestActive ||
      this.isPedestrianCrossingQuestActive ||
      this.isQuestArrestActive ||
      this.isEvacuationInProgress()
    ) {
      return;
    }

    if (this.orientationQuest.active) {
      ratioStore.showMessage(DISPATCH_ORIENTATION_ALREADY_MESSAGE);
      return;
    }

    const message =
      DISPATCH_REQUEST_MESSAGES[
        Math.floor(Math.random() * DISPATCH_REQUEST_MESSAGES.length)
      ];
    ratioStore.showMessage(message, {
      onComplete: () => {
        this.handleDispatchResponse();
      },
    });
  }

  handleDispatchResponse() {
    if (Math.random() < DISPATCH_ORIENTATION_CONFLICT_CHANCE) {
      ratioStore.showDispatchResult(DISPATCH_CONFLICT_MESSAGE, {
        onComplete: () => {
          this.spawnOrientationTarget();
        },
      });
      return;
    }

    ratioStore.showDispatchResult(DISPATCH_QUIET_MESSAGE);
  }

  spawnOrientationTarget() {
    const aggrTypes = ["human_aggr1", "human_aggr2", "human_aggr3"];
    const typeId =
      aggrTypes[Math.floor(Math.random() * aggrTypes.length)];
    const config = objectConfigByType[typeId];
    if (!config) return;

    const distancePx =
      ORIENTATION_MIN_WORLD_PX +
      Math.random() * (ORIENTATION_MAX_WORLD_PX - ORIENTATION_MIN_WORLD_PX);
    const worldX = this.offsetX + distancePx;
    const uid = `orientation_${typeId}_${Date.now()}_${Math.random()}`;

    runInAction(() => {
      this.activeObjects.push({
        uid,
        typeId,
        worldX,
        appeared: false,
        orientationSpawn: true,
      });
      this.orientationQuest = {
        active: true,
        targetUid: uid,
        targetWorldX: worldX,
      };
      this.lastObjectEndMeter = Math.max(
        this.lastObjectEndMeter,
        worldX + config.width,
      );
    });
  }

  finishOrientationQuest() {
    runInAction(() => {
      this.orientationQuest = {
        active: false,
        targetUid: null,
        targetWorldX: 0,
      };
    });
  }

  getParkingEvacuationLoadedCar() {
    const ev = this.parkingEvacuation;
    if (!ev.carOnPlatform) {
      return null;
    }

    if (ev.sourceKind === "roadside" && ev.targetUid != null) {
      const breakdownObj = this.activeObjects.find(
        (obj) => obj.uid === ev.targetUid,
      );
      return breakdownObj?.roadsideBreakdown?.carData ?? null;
    }

    if (ev.zoneUid == null || ev.spotIndex == null) {
      return null;
    }
    const zoneObj = this.activeObjects.find((obj) => obj.uid === ev.zoneUid);
    return zoneObj?.parkingZone?.spots[ev.spotIndex]?.carData ?? null;
  }

  updateParkingEvacuation(deltaTime) {
    const ev = this.parkingEvacuation;
    if (ev.phase === "idle") return;

    const viewportWidth = this.lastViewportWidth ?? 1024;

    runInAction(() => {
      switch (ev.phase) {
        case "spawn_delay": {
          ev.spawnDelayRemaining -= deltaTime;
          if (ev.spawnDelayRemaining <= 0) {
            ev.phase = "approaching";
            ev.positionX = viewportWidth + EVACUATOR_SPAWN_MARGIN_PX;
            ev.currentSpeed = randomEvacuatorSpeed(Cars.evacuator);
          }
          break;
        }
        case "approaching": {
          ev.positionX -= ev.currentSpeed * deltaTime;
          ev.wheelRotation =
            (ev.wheelRotation -
              ev.currentSpeed * deltaTime * EVACUATOR_WHEEL_SPIN_FACTOR) %
            360;
          if (ev.positionX <= ev.stopPositionX + EVACUATOR_APPROACH_TOLERANCE_PX) {
            ev.positionX = ev.stopPositionX;
            ev.currentSpeed = 0;
            ev.phase = "loading";
            ev.loadDelayRemaining = PARKING_LOAD_DELAY_SEC;
          }
          break;
        }
        case "loading": {
          ev.loadDelayRemaining -= deltaTime;
          if (ev.loadDelayRemaining <= 0) {
            ev.carOnPlatform = true;
            ev.phase = "loaded";
            ev.loadedSettleRemaining = PARKING_LIFT_SETTLE_SEC;
          }
          break;
        }
        case "loaded": {
          ev.loadedSettleRemaining -= deltaTime;
          if (ev.loadedSettleRemaining <= 0) {
            ev.loadedSettleRemaining = 0;
            if (isParkingEvacuatorDebugHoldAfterLoad()) {
              ev.currentSpeed = 0;
              break;
            }
            ev.phase = "departing";
            ev.currentSpeed = randomEvacuatorSpeed(Cars.evacuator);
          }
          break;
        }
        case "departing": {
          ev.positionX -= ev.currentSpeed * deltaTime;
          ev.wheelRotation =
            (ev.wheelRotation -
              ev.currentSpeed * deltaTime * EVACUATOR_WHEEL_SPIN_FACTOR) %
            360;
          if (ev.positionX < -EVACUATOR_DESPAWN_MARGIN_PX) {
            this.finalizeParkingEvacuation();
          }
          break;
        }
        default:
          break;
      }
    });
  }

  finalizeParkingEvacuation() {
    runInAction(() => {
      const ev = this.parkingEvacuation;

      if (ev.sourceKind === "roadside" && ev.targetUid != null) {
        const breakdownObj = this.activeObjects.find(
          (obj) => obj.uid === ev.targetUid,
        );
        if (breakdownObj?.roadsideBreakdown) {
          breakdownObj.roadsideBreakdown.helped = true;
          breakdownObj.roadsideBreakdown.selected = false;
        }
        this.removeObjectByUid(ev.targetUid);
        this.carStore?.addHelp?.("roadsideHelp");
      } else {
        const zoneObj =
          this.parkingFineTargetZone ??
          this.activeObjects.find((obj) => obj.uid === ev.zoneUid);
        const spotIndex = ev.spotIndex;
        const pz = zoneObj?.parkingZone;

        if (pz != null && spotIndex != null) {
          const spot = pz.spots[spotIndex];
          if (spot) {
            pz.spots[spotIndex] = {
              ...spot,
              fining: false,
              fined: true,
              carData: null,
            };
          }
          pz.pendingSpotIndex = null;
        }

        this.carStore?.addHelp?.("parkingFine");
        this.parkingFineTargetZone = null;
      }

      this.pendingEvacuationTarget = null;
      this.parkingEvacuation = createIdleParkingEvacuation();
    });
  }

  completeParkingEvacuation() {
    this.finalizeParkingEvacuation();
  }

  finishParkingFineQuest() {
    runInAction(() => {
      this.parkingFineTargetZone = null;
      this.pendingEvacuationTarget = null;
      if (this.parkingEvacuation.phase !== "idle") {
        this.parkingEvacuation = createIdleParkingEvacuation();
      }
      for (const obj of this.activeObjects) {
        const pz = obj.parkingZone;
        if (pz?.pendingSpotIndex !== null) {
          pz.pendingSpotIndex = null;
        }
      }
    });
  }

  clearRoadsideBreakdownState(breakdownObj) {
    if (
      this.pendingEvacuationTarget?.kind === "roadside" &&
      this.pendingEvacuationTarget.breakdownUid === breakdownObj?.uid
    ) {
      this.pendingEvacuationTarget = null;
    }
    if (
      this.parkingEvacuation.sourceKind === "roadside" &&
      this.parkingEvacuation.targetUid === breakdownObj?.uid
    ) {
      this.parkingEvacuation = createIdleParkingEvacuation();
    }
    const rb = breakdownObj?.roadsideBreakdown;
    if (rb) {
      rb.selected = false;
    }
  }

  clearParkingFineState(zoneObj) {
    if (this.parkingFineTargetZone?.uid === zoneObj?.uid) {
      this.parkingFineTargetZone = null;
      this.pendingEvacuationTarget = null;
    }
    if (this.parkingEvacuation.zoneUid === zoneObj?.uid) {
      this.parkingEvacuation = createIdleParkingEvacuation();
    }
    const pz = zoneObj?.parkingZone;
    if (pz) {
      pz.pendingSpotIndex = null;
    }
  }

  collectCollectibleCoin(uid) {
    runInAction(() => {
      this.removeObjectByUid(uid);
    });
  }

  removeOffScreenQuestCars(viewportWidth = this.lastViewportWidth) {
    const width = viewportWidth ?? window.innerWidth;
    const minX = -QUEST_CAR_DESPAWN_MARGIN;
    const maxX = width + QUEST_CAR_DESPAWN_MARGIN;

    runInAction(() => {
      this.questCars = this.questCars.filter((car) => {
        if (!car.active) return false;
        if (car.positionX > maxX) return false;
        if (car.enemy && car.positionX < minX) return false;
        return true;
      });
    });
  }

  updateQuestCars(deltaTime) {
    if (this.questCars.length === 0) return;

    const policeSpeed = this.isWorldFrozen ? 0 : this.carStore.currentSpeed;
    const viewportWidth = this.lastViewportWidth ?? window.innerWidth;

    runInAction(() => {
      for (const questCar of this.questCars) {
        if (!questCar.active) continue;

        if (!questCar.enemy && !isNightChaseContext(this)) {
          questCar.updateCivilianTrafficLight(deltaTime, this);
        }

        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
      }

      this.removeOffScreenQuestCars(viewportWidth);
    });
  }

  removeQuestCarByIndex(index) {
    runInAction(() => {
      if (index >= 0 && index < this.questCars.length) {
        this.questCars.splice(index, 1);
        if (this.questCars.length === 0) {
          this.questCarSpawnTimer = this.randomEnemyQuestCarSpawnDelay();
          this.civilianQuestCarSpawnTimer = this.randomCivilianQuestCarSpawnDelay();
        }
      }
    });
  }

  checkQuestCarDistance(questCarStores = this.questCars) {
    const policeScreenX = 30;
    const arrestThreshold = 250;
    const minArrestX = policeScreenX;
    const maxArrestX = policeScreenX + arrestThreshold;

    let closestQuestCar = null;

    for (const questCar of questCarStores) {
      if (!questCar.enemy) continue;

      const questCarScreenX = questCar.positionX;
      if (questCarScreenX >= minArrestX && questCarScreenX <= maxArrestX) {
        if (
          !closestQuestCar ||
          questCarScreenX < closestQuestCar.positionX
        ) {
          closestQuestCar = questCar;
        }
      }
    }

    runInAction(() => {
      this.questCarForArrest = closestQuestCar;
    });
  }

  startQuestArrest() {
    runInAction(() => {
      this.isQuestArrestActive = true;
      this.arrestAnimFinished = false;
    });
  }

  finishQuestArrest() {
    runInAction(() => {
      this.isQuestArrestActive = false;
      this.arrestAnimFinished = false;
      this.questCarForArrest = null;
    });
  }

}

export default MapStore;
