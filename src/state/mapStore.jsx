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
  };

  // Состояние светофора
  trafficLightColor = "red";
  trafficLightTimer = null;
  trafficLightOnTheMap = false;

  // Состояние заправки
  isRefueling = false;
  refuelInterval = null;

  // Ссылка на carStore для заправки
  carStore = null;

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
        const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;
        // Мировая координата X — объект впереди, за правым краем экрана
        const worldX = this.offsetX + viewportWidth + Math.random() * 100;

        runInAction(() => {
          this.activeObjects.push({
            uid,
            typeId: config.type,
            worldX,
            appeared: false,
          });
        });

        this.nextSpawnDistances[config.type] =
          nextSpawn +
          config.minDistance +
          Math.random() * (config.maxDistance - config.minDistance);
      }
    });
  }

  // Удаление объектов, ушедших за левый край экрана
  despawnObjects() {
    runInAction(() => {
      const configMap = {};
      objectConfigs.forEach((c) => {
        configMap[c.type] = c;
      });

      this.activeObjects = this.activeObjects.filter((obj) => {
        const config = configMap[obj.typeId];
        const screenX = obj.worldX - this.offsetX;
        if (obj.typeId === "traffic_light" && screenX <= -config.width) {
          this.trafficLightOnTheMap = false;
        }
        return screenX > -config.width;
      });
    });
  }

  // Вызов onAppear для новых объектов
  triggerAppearEvents(carStore) {
    const configMap = {};
    objectConfigs.forEach((c) => {
      configMap[c.type] = c;
    });
    // typeId traffic_light
    this.activeObjects.forEach((obj) => {
      if (!obj.appeared) {
        if (obj.typeId === "traffic_light") {
          this.trafficLightOnTheMap = true;
        }
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
            this.carStore.fuel + 1,
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
}

export default MapStore;
