import { makeAutoObservable, runInAction } from "mobx";
import {
  isQuestCrossingEngaged,
  QUEST_CROSSING_WIDTH_DESKTOP,
} from "./questCrossingConstants";

const IDLE_THRESHOLD_SEC = 5;
const SPEED_IDLE_EPS = 1;
/** Минимальный пробег (world px), после которого Block A больше не повторяется */
const MIN_DRIVE_OFFSET_TO_SKIP_BLOCK_A = 300;
const BANDIT_TYPES = ["human_aggr1", "human_aggr2", "human_aggr3"];
const BLOCK_A_STEPS = new Set(["ignition", "gear-2", "gas-pedal"]);
const BLOCK_B_STEPS = new Set(["siren", "gear-4"]);
/** Зона подъезда к human_aggr: рядом с машиной игрока (~30px слева) */
const BANDIT_ENGAGE_MIN_SCREEN_X = 100;
const BANDIT_ENGAGE_MAX_SCREEN_X = 360;

function getObjectScreenX(mapStore, obj) {
  return obj.worldX - mapStore.offsetX;
}

function findFirstVisibleObject(mapStore, viewportWidth, typeIds) {
  const types = Array.isArray(typeIds) ? typeIds : [typeIds];
  let nearest = null;
  let nearestWorldX = Infinity;

  for (const obj of mapStore.activeObjects) {
    if (!types.includes(obj.typeId)) continue;
    const screenX = getObjectScreenX(mapStore, obj);
    if (screenX < 0 || screenX > viewportWidth) continue;
    if (obj.worldX < nearestWorldX) {
      nearest = obj;
      nearestWorldX = obj.worldX;
    }
  }

  return nearest;
}

function findBanditInEngageRange(mapStore, viewportWidth) {
  const bandit = findFirstVisibleObject(mapStore, viewportWidth, BANDIT_TYPES);
  if (!bandit) return null;
  const screenX = getObjectScreenX(mapStore, bandit);
  if (
    screenX < BANDIT_ENGAGE_MIN_SCREEN_X ||
    screenX > BANDIT_ENGAGE_MAX_SCREEN_X
  ) {
    return null;
  }
  return bandit;
}

function findVisibleBandit(mapStore, viewportWidth) {
  return findFirstVisibleObject(mapStore, viewportWidth, BANDIT_TYPES);
}

export class TutorialStore {
  currentStep = null;
  idleSeconds = 0;
  blockADone = false;
  enemyBlockDone = false;
  enemyQueued = false;
  refuelBlockDone = false;
  banditBlockDone = false;
  pedestrianBlockDone = false;
  banditTargetTypeId = null;
  banditEngageReleased = false;
  pedestrianEngageReleased = false;
  modalBlocking = false;
  hasEverMoved = false;
  sessionStartOffset = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isBlockAActive() {
    return (
      !this.blockADone &&
      this.currentStep !== null &&
      BLOCK_A_STEPS.has(this.currentStep)
    );
  }

  get isBlockBActive() {
    return (
      this.blockADone &&
      !this.enemyBlockDone &&
      this.currentStep !== null &&
      BLOCK_B_STEPS.has(this.currentStep)
    );
  }

  /** Контекстные шаги (заправка, бандит, пешеход) — только после Block A и вне Block B */
  get canShowContextualSteps() {
    return this.blockADone && !this.isBlockBActive;
  }

  get highlightTarget() {
    if (this.isTutorialComplete || this.modalBlocking) return null;
    return this.currentStep;
  }

  get isTutorialComplete() {
    return (
      this.blockADone &&
      this.enemyBlockDone &&
      this.refuelBlockDone &&
      this.banditBlockDone &&
      this.pedestrianBlockDone
    );
  }

  get banditTargetSelector() {
    if (!this.banditTargetTypeId) return null;
    return `[data-type="${this.banditTargetTypeId}"]`;
  }

  get isQuestModalBlocking() {
    return this.modalBlocking;
  }

  /** Пока human_aggr на экране и блок D не пройден — не блокировать газ (светофор / пешеход) */
  shouldSuppressDrivingBlocks(mapStore, viewportWidth = 1024) {
    if (!this.blockADone || this.banditBlockDone) return false;
    return findVisibleBandit(mapStore, viewportWidth) !== null;
  }

  tick(deltaTime, carStore, mapStore, viewportWidth = 1024) {
    if (this.isTutorialComplete) return;

    runInAction(() => {
      this.modalBlocking =
        mapStore.isPoliceQuestActive || mapStore.isQuestArrestActive;
    });

    const questBlocksIdle =
      mapStore.isPoliceQuestActive || mapStore.isQuestArrestActive;

    this.detectDriving(carStore, mapStore);
    this.completeBlockAIfAlreadyDriving(carStore, mapStore);

    if (!this.blockADone && !questBlocksIdle) {
      const isIdle =
        carStore.currentSpeed < SPEED_IDLE_EPS && !carStore.isGasPressed;

      if (isIdle) {
        this.idleSeconds += deltaTime;
      } else if (this.currentStep === null) {
        this.idleSeconds = 0;
      }

      if (this.currentStep === null && this.idleSeconds >= IDLE_THRESHOLD_SEC) {
        runInAction(() => {
          this.currentStep = "ignition";
        });
      }
    }

    // Block A/B advancement всегда — иначе шаг «газ» зависает при параллельных квестах
    this.advanceBlockA(carStore);

    if (!questBlocksIdle) {
      this.trackEnemy(mapStore);
      this.advanceBlockB(carStore);
    }

    // Бандит — приоритетный контекстный шаг; не блокируется Block B и модалкой квеста
    if (this.blockADone) {
      this.trackBandit(carStore, mapStore, viewportWidth);
    }

    if (this.canShowContextualSteps) {
      this.trackRefuel(mapStore, viewportWidth);
      this.trackPedestrian(carStore, mapStore, viewportWidth);
    } else if (this.blockADone) {
      this.trackPedestrianAutoStopOnly(carStore, mapStore, viewportWidth);
    }
  }

  detectDriving(carStore, mapStore) {
    if (this.hasEverMoved) return;

    if (this.sessionStartOffset === null) {
      runInAction(() => {
        this.sessionStartOffset = mapStore.offsetX;
      });
    }

    const distanceTraveled = mapStore.offsetX - this.sessionStartOffset;
    const isMoving =
      carStore.currentSpeed > SPEED_IDLE_EPS ||
      distanceTraveled >= MIN_DRIVE_OFFSET_TO_SKIP_BLOCK_A;

    if (isMoving) {
      runInAction(() => {
        this.hasEverMoved = true;
      });
    }
  }

  completeBlockAIfAlreadyDriving(carStore, mapStore) {
    if (this.blockADone || !this.hasEverMoved) return;

    runInAction(() => {
      this.blockADone = true;
      this.idleSeconds = 0;
      if (BLOCK_A_STEPS.has(this.currentStep)) {
        if (this.enemyQueued && !this.enemyBlockDone) {
          this.currentStep = "siren";
        } else {
          this.currentStep = null;
        }
      }
    });
  }

  advanceBlockA(carStore) {
    if (this.blockADone) return;

    if (this.currentStep === "ignition" && carStore.isIgnitionOn) {
      runInAction(() => {
        this.currentStep = "gear-2";
      });
    }
    if (this.currentStep === "gear-2" && carStore.gear === "2") {
      runInAction(() => {
        this.currentStep = "gas-pedal";
      });
    }
    if (
      this.currentStep === "gas-pedal" &&
      (carStore.isGasPressed || carStore.currentSpeed > SPEED_IDLE_EPS)
    ) {
      runInAction(() => {
        this.blockADone = true;
        if (this.enemyQueued && !this.enemyBlockDone) {
          this.currentStep = "siren";
        } else if (!this.enemyQueued) {
          this.currentStep = null;
        }
      });
    }
  }

  trackEnemy(mapStore) {
    if (this.enemyBlockDone) return;

    const hasEnemy = mapStore.questCars.some((car) => car.enemy && car.active);
    if (!hasEnemy) return;

    runInAction(() => {
      if (!this.blockADone && this.currentStep) {
        this.enemyQueued = true;
      } else if (
        (this.blockADone || this.currentStep === null) &&
        this.currentStep !== "roadside-bandit"
      ) {
        this.currentStep = "siren";
      }
    });
  }

  advanceBlockB(carStore) {
    if (this.enemyBlockDone) return;

    if (this.currentStep === "siren" && carStore.sirena) {
      runInAction(() => {
        this.currentStep = "gear-4";
      });
    }
    if (this.currentStep === "gear-4" && carStore.gear === "4") {
      runInAction(() => {
        this.enemyBlockDone = true;
        this.currentStep = null;
      });
    }
  }

  trackRefuel(mapStore, viewportWidth) {
    if (this.refuelBlockDone || this.currentStep === "roadside-bandit") return;

    const gasStation = findFirstVisibleObject(
      mapStore,
      viewportWidth,
      "gas_station",
    );

    if (gasStation) {
      runInAction(() => {
        this.currentStep = "gas-station";
      });
    }

    if (mapStore.isRefueling) {
      runInAction(() => {
        this.refuelBlockDone = true;
        if (this.currentStep === "gas-station") {
          this.currentStep = null;
        }
      });
    }
  }

  trackBandit(carStore, mapStore, viewportWidth) {
    if (this.banditBlockDone) return;

    const visibleBandit = findVisibleBandit(mapStore, viewportWidth);
    const bandit = findBanditInEngageRange(mapStore, viewportWidth);

    if (bandit) {
      if (!this.banditEngageReleased) {
        carStore.releaseGas();
        runInAction(() => {
          this.banditEngageReleased = true;
        });
      }
      runInAction(() => {
        this.banditTargetTypeId = bandit.typeId;
        this.currentStep = "roadside-bandit";
      });
    }

    const banditLeftScreen =
      this.currentStep === "roadside-bandit" && !visibleBandit;

    if (mapStore.isPoliceQuestActive || banditLeftScreen) {
      runInAction(() => {
        this.banditBlockDone = true;
        if (this.currentStep === "roadside-bandit") {
          this.currentStep = null;
        }
        this.banditTargetTypeId = null;
        this.banditEngageReleased = false;
      });
    }
  }

  getViolatorCrossingState(mapStore) {
    const target = mapStore.pedestrianCrossingTargetObject;
    const qc = target?.questCrossing;
    if (!mapStore.isPedestrianCrossingQuestActive || !qc?.crossesOnRed) {
      return null;
    }
    return qc;
  }

  trackPedestrianAutoStopOnly(carStore, mapStore, viewportWidth = 1024) {
    if (
      this.currentStep === "roadside-bandit" ||
      this.shouldSuppressDrivingBlocks(mapStore, viewportWidth)
    ) {
      return;
    }

    const qc = this.getViolatorCrossingState(mapStore);
    if (!qc) {
      if (this.pedestrianEngageReleased) {
        runInAction(() => {
          this.pedestrianEngageReleased = false;
        });
      }
      return;
    }

    const target = mapStore.pedestrianCrossingTargetObject;
    if (!target) return;

    const screenX = getObjectScreenX(mapStore, target);
    const crossingWidth = qc.crossingWidth ?? QUEST_CROSSING_WIDTH_DESKTOP;
    const engaged = isQuestCrossingEngaged(
      screenX,
      crossingWidth,
      viewportWidth,
    );

    if (!engaged) return;

    const isViolatorQuestActive =
      !qc.trafficLightGreen && qc.phase !== "finished";

    if (isViolatorQuestActive && !this.pedestrianEngageReleased) {
      carStore.releaseGas();
      runInAction(() => {
        this.pedestrianEngageReleased = true;
      });
    }
  }

  trackPedestrian(carStore, mapStore, viewportWidth = 1024) {
    if (this.pedestrianBlockDone) return;

    const qc = this.getViolatorCrossingState(mapStore);
    if (!qc) return;

    this.trackPedestrianAutoStopOnly(carStore, mapStore, viewportWidth);

    if (this.currentStep === "roadside-bandit") return;

    if (qc.phase === "walking" && !qc.trafficLightGreen) {
      runInAction(() => {
        this.currentStep = "pedestrian-human";
      });
    }

    if (qc.showFinishOverlay || qc.phase === "finished") {
      runInAction(() => {
        this.pedestrianBlockDone = true;
        this.pedestrianEngageReleased = false;
        if (this.currentStep === "pedestrian-human") {
          this.currentStep = null;
        }
      });
    }
  }

  reset() {
    runInAction(() => {
      this.currentStep = null;
      this.idleSeconds = 0;
      this.blockADone = false;
      this.enemyBlockDone = false;
      this.enemyQueued = false;
      this.refuelBlockDone = false;
      this.banditBlockDone = false;
      this.pedestrianBlockDone = false;
      this.banditTargetTypeId = null;
      this.banditEngageReleased = false;
      this.pedestrianEngageReleased = false;
      this.modalBlocking = false;
      this.hasEverMoved = false;
      this.sessionStartOffset = null;
    });
  }
}
