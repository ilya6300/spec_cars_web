import { makeAutoObservable, runInAction } from "mobx";
import { objectConfigs } from "./objects";
import stateApp from "./state_app";

class MapStore {
  id = 0;
  name = "";
  url = "";

  // Текущее смещение дороги в пикселях (накапливается как distance)
  offsetX = 0;

  // Массив активных объектов на экране
  // Каждый элемент: { uid, typeId, worldX, appeared }
  activeObjects = [];

  // Расстояния до следующего спавна для каждого типа
  nextSpawnDistances = {
    building: 0,
    gas_station: 20000,
    traffic_light: 5000,
    tree1: 350,
    tree2: 450,
    tree3: 750,
    human1: 150,
    human2: 50,
    human3: 350,
    human4: 550,
    human5: 250,
    human6: 180,
    human7: 800,
    human8: 100,
    human9: 50,
    human10: 550,
    human11: 1000,
    human12: 250,
    human13: 80,
    human14: 1950,
    human15: 400,
    human16: 200,
    human_aggr1: 300,
    human_aggr2: 3000,
    human_aggr3: 1500,
  };

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

  constructor(mapData) {
    Object.assign(this, mapData);
    makeAutoObservable(this);
  }

  // Накопление смещения (аналог distance в Game.jsx)
  update(carSpeed, deltaTime) {
    runInAction(() => {
      this.offsetX += carSpeed * deltaTime;
    });
  }

  // Спавн новых объектов справа за экраном
  spawnObjects(viewportWidth) {
    objectConfigs.forEach((config) => {
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
      const configMap = {};
      objectConfigs.forEach((c) => {
        configMap[c.type] = c;
      });

      this.activeObjects = this.activeObjects.filter((obj) => {
        const config = configMap[obj.typeId];
        const screenX = obj.worldX - this.offsetX;
        if (obj.typeId === "traffic_light") {
          // Светофор виден на экране ТОЛЬКО когда его правый край вошёл
          // за правую границу (screenX < viewportWidth) И левый край ещё
          // не ушёл за левую границу (screenX + width > 0)
          this.trafficLightOnTheMap =
            screenX < viewportWidth && screenX + config.width > 0;
        }
        return screenX > -config.width;
      });
      // Корректировка lastObjectEndMeter после удаления ушедших объектов
      const sorted = [...this.activeObjects].sort(
        (a, b) => b.worldX - a.worldX,
      );
      if (sorted.length > 0) {
        const lastConfig = configMap[sorted[0].typeId];
        this.lastObjectEndMeter = sorted[0].worldX + lastConfig.width;
      } else {
        // Нет активных объектов — сбрасываем на текущую позицию
        this.lastObjectEndMeter = this.offsetX;
      }
    });
  }

  // Вызов onAppear для новых объектов
  triggerAppearEvents(carStore) {
    const configMap = {};
    objectConfigs.forEach((c) => {
      configMap[c.type] = c;
    });
    this.activeObjects.forEach((obj) => {
      if (!obj.appeared) {
        const config = configMap[obj.typeId];
        if (config.onAppear) {
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
    if (this.trafficLightTimer) {
      clearInterval(this.trafficLightTimer);
      this.trafficLightTimer = null;
    }
    if (this.refuelInterval) {
      clearInterval(this.refuelInterval);
      this.refuelInterval = null;
    }
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
        const configMap = {};
        objectConfigs.forEach((c) => (configMap[c.type] = c));
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
    });
  }
}

export default MapStore;
