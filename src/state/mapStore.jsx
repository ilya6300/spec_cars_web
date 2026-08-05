import { makeAutoObservable, runInAction } from "mobx";
import {
  objectConfigs,
  objectConfigByType,
  buildInitialNextSpawnDistances,
} from "./objects";
import QuestCarStore from "./questCarStore";
import Cars from "./cars";

const QUEST_CAR_VISIBLE_MARGIN = 150;

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
  pedestrianCarPosition = -150;
  pedestrianState = "waiting"; // "waiting" | "walking" | "stopped"
  pedestrianIsCarArrived = false;

  // Quest Cars state
  questCars = [];
  questCarSpawnTimer = 10;
  questCarForArrest = null;

  // Quest Arrest modal state
  isQuestArrestActive = false;
  arrestAnimFinished = false;

  gameMode = "free";

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
    this.updateQuestCarSpawner(deltaTime);
    this.spawnEnvironmentObjects(viewportWidth);
    this.despawnObjects(viewportWidth);
    this.triggerAppearEvents(carStore);
    this.updateQuestCars(deltaTime);
    this.checkQuestCarDistance();
  }

  updateQuestCarSpawner(deltaTime) {
    this.questCarSpawnTimer -= deltaTime;
    if (this.questCarSpawnTimer <= 0) {
      this.spawnQuestCar();
    }
  }

  getVisibleQuestCars(viewportWidth, margin = QUEST_CAR_VISIBLE_MARGIN) {
    const minX = -margin;
    const maxX = viewportWidth;
    return this.questCars.filter(
      (car) => car.positionX > minX && car.positionX < maxX,
    );
  }

  // Спавн объектов окружения справа за экраном
  spawnEnvironmentObjects(viewportWidth) {
    objectConfigs.forEach((config) => {
      if (config.type === "collectible_star" && this.gameMode !== "free") {
        return;
      }

      const nextSpawn = this.nextSpawnDistances[config.type];

      if (this.offsetX >= nextSpawn) {
        // Ключевое изменение: worldX не может быть меньше lastObjectEndMeter
        // Это предотвращает наложение объектов друг на друга
        const worldX =
          Math.max(this.offsetX + viewportWidth, this.lastObjectEndMeter) +
          Math.random() * 100;

        const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;

        runInAction(() => {
          this.activeObjects.push({
            uid,
            typeId: config.type,
            worldX,
            appeared: false,
          });
          // Обновляем метр конца последнего объекта
          this.lastObjectEndMeter = worldX + config.width;
        });

        this.nextSpawnDistances[config.type] =
          nextSpawn +
          config.minDistance +
          Math.random() * (config.maxDistance - config.minDistance);
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
        const lastConfig = objectConfigByType[sorted[0].typeId];
        this.lastObjectEndMeter = sorted[0].worldX + lastConfig.width;
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
        if (config?.onAppear) {
          config.onAppear({ ...obj, config }, this, carStore);
        }
        runInAction(() => {
          obj.appeared = true;
        });
      }
    });
  }

  // Глобальный таймер светофора (10 секунд)
  startTrafficLightTimer() {
    if (this.trafficLightTimer) {
      clearInterval(this.trafficLightTimer);
    }

    this.trafficLightTimer = setInterval(() => {
      runInAction(() => {
        this.trafficLightColor =
          this.trafficLightColor === "red" ? "green" : "red";
      });
    }, 10000);
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
  }

  // Готовый признак: светофор на экране И красный
  get isTrafficLightRed() {
    return this.trafficLightOnTheMap && this.trafficLightColor === "red";
  }

  startQuest(targetObj) {
    runInAction(() => {
      this.isPoliceQuestActive = true;
      this.questTargetObject = targetObj;
      this.questCarPosition = -150;
    });
  }

  finishQuest() {
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
          const lastConfig = configMap[sorted[0].typeId];
          this.lastObjectEndMeter = sorted[0].worldX + lastConfig.width;
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

  updatePedestrianCarPosition(newPosition) {
    runInAction(() => {
      this.pedestrianCarPosition = newPosition;
    });
  }

  spawnQuestCar() {
    let pool = Cars.otherCars;
    if (this.gameMode === "chase") {
      pool = Cars.otherCars.filter((car) => car.enemy);
    }

    if (pool.length === 0) return;

    const randomCarData = pool[Math.floor(Math.random() * pool.length)];

    const questCar = new QuestCarStore(randomCarData);

    const viewportWidth = window.innerWidth;
    let positionX;
    let speed = questCar.currentSpeed;

    if (questCar.enemy) {
      positionX = -200;
    } else {
      positionX = viewportWidth + 200;
    }

    questCar.spawn(positionX, speed);

    runInAction(() => {
      this.questCars.push(questCar);
      if (this.gameMode === "chase") {
        this.questCarSpawnTimer = 8 + Math.random() * 7;
      } else {
        this.questCarSpawnTimer = 10 + Math.random() * 20;
      }
    });
  }

  collectCollectibleStar(uid) {
    runInAction(() => {
      this.removeObjectByUid(uid);
    });
  }

  updateQuestCars(deltaTime) {
    if (this.questCars.length === 0) return;

    const policeSpeed = this.carStore.currentSpeed;

    runInAction(() => {
      for (const questCar of this.questCars) {
        if (questCar.active) {
          questCar.updatePosition(deltaTime, policeSpeed);
          questCar.updateWheelRotation(deltaTime);
        }
      }
    });
  }

  removeQuestCarByIndex(index) {
    runInAction(() => {
      if (index >= 0 && index < this.questCars.length) {
        this.questCars.splice(index, 1);
        if (this.questCars.length === 0) {
          this.questCarSpawnTimer = 10 + Math.random() * 20;
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

  // Pedestrian Crossing Quest methods
  startPedestrianCrossingQuest(targetObj) {
    runInAction(() => {
      this.isPedestrianCrossingQuestActive = true;
      this.pedestrianCrossingTargetObject = targetObj;
      this.pedestrianCarPosition = -150;
      this.pedestrianState = "waiting";
      this.pedestrianIsCarArrived = false;
    });
  }

  finishPedestrianCrossingQuest() {
    runInAction(() => {
      this.isPedestrianCrossingQuestActive = false;
      this.pedestrianCrossingTargetObject = null;
      this.pedestrianCarPosition = -150;
      this.pedestrianState = "waiting";
      this.pedestrianIsCarArrived = false;

      // После квеста — зелёный, чтобы не зависать на красном
      this.trafficLightColor = "green";

      if (this.carStore) {
        this.carStore.pedestrianQuestTriggered = false;
        this.carStore.trafficLightRedChecked = true;
        if (this.carStore.isTrafficLightOnScreen) {
          this.carStore.trafficLightColor = "green";
        }
      }

      if (!this.trafficLightTimer) {
        this.startTrafficLightTimer();
      }
    });
  }
}

export default MapStore;
