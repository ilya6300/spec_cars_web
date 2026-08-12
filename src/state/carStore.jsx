import { makeAutoObservable, runInAction } from "mobx";
import carStartSound from "../assets/audio/effects/car_start.mp3";
import theEngineIsRunning from "../assets/audio/effects/the_engine_is_running.wav";
import sirenaPolice from "../assets/audio/effects/police_siren.wav";
import stateApp from "./state_app";
import { flushPendingFuelSave, loadFuel, scheduleFuelSave } from "./persistence";
import {
  calculateSessionScore,
  calculateSessionStars,
  GAME_MODES,
  isNightChaseContext,
} from "./modeScoring";
import { getPlayerCarRightEdgePx } from "./mapStore";
import {
  TRAFFIC_LIGHT_DETECT_GAP_PX,
  TRAFFIC_LIGHT_MAX_BRAKE,
  TRAFFIC_LIGHT_STOP_GAP_PX,
  TRAFFIC_LIGHT_STOP_TOLERANCE_PX,
} from "./trafficLightConstants";

class CarStore {
  id = 0;
  type = "";
  name = "";
  urlBody = "";
  urlShell = "";
  // Ссылка на MapStore (устанавливается в Game.jsx)
  mapStore = null;

  disposed = false;

  audioCtx = null;
  engineSource = null;
  startSound = null;
  engineBuffer = null;

  helpCounts = {
    criminalArrest: 0,
    pedestrianFine: 0,
    enemyChase: 0,
    orientationMatch: 0,
  };

  gameMode = GAME_MODES.FREE;

  static HELP_POINTS = {
    criminalArrest: 3,
    pedestrianFine: 1,
    enemyChase: 4,
    orientationMatch: 1,
  };

  maxSpeed = 0;
  currentSpeed = 0;
  acceleration = 120;
  friction = 160;

  // ИСПРАВЛЕНО: Явно объявляем свойство, чтобы MobX взял его на контроль
  wheelRotation = 0;

  fuel = 65000;
  maxFuel = 65000;
  fuelConsumption = 0.5;

  isGasPressed = false;

  // Зажигание (заведён двигатель или нет)
  isIgnitionOn = false;

  // Хранилища для объектов аудио
  audioStart = null;
  audioEngine = null;
  ignitionTimeoutId = null; // Для отмены таймера, если зажигание выключили до старта мотора

  // Пройденное расстояние в метрах
  distanceMeters = 0;

  // Состояние светофора
  isTrafficLightOnScreen = false;
  trafficLightColor = null; // 'red' | 'green' | null
  trafficLightDistance = null; // screen px левого края traffic_light
  trafficLightGap = null; // зазор: traffic_light left − правый край машины
  trafficLightStopReleased = false;

  // Передача (МКПП)
  gear = "N"; // 'N' | '1' | '2' | '3' | '4'

  // Сирена
  sirena = false;
  sirenaBuffer = null;
  sirenaSource = null;

  constructor(carData) {
    Object.assign(this, carData);
    makeAutoObservable(this);

    const savedFuel = loadFuel(this.maxFuel, this.id);
    if (savedFuel !== null) {
      this.fuel = savedFuel;
    }
  }

  persistFuel() {
    if (this.disposed) return;
    scheduleFuelSave(this.fuel, this.id);
  }

  get sessionScore() {
    return calculateSessionScore(this.helpCounts, this.gameMode);
  }

  get sessionStars() {
    return calculateSessionStars(this.helpCounts, this.gameMode);
  }

  get totalQuestCompletions() {
    const { criminalArrest, pedestrianFine, enemyChase } = this.helpCounts;
    return criminalArrest + pedestrianFine + enemyChase;
  }

  get isStarCollectionUnlocked() {
    return this.totalQuestCompletions >= 2;
  }

  resetSessionHelp() {
    runInAction(() => {
      this.helpCounts = {
        criminalArrest: 0,
        pedestrianFine: 0,
        enemyChase: 0,
        orientationMatch: 0,
      };
    });
  }

  addHelp(type) {
    if (this.disposed || !(type in this.helpCounts)) return;
    runInAction(() => {
      this.helpCounts[type] += 1;
    });
  }

  stopEngineSource() {
    if (this.engineSource) {
      try {
        this.engineSource.stop();
      } catch (e) {
        /* already stopped */
      }
      this.engineSource.disconnect();
      this.engineSource = null;
    }
  }

  stopSirenaSource() {
    if (this.sirenaSource) {
      try {
        this.sirenaSource.stop();
      } catch (e) {
        /* already stopped */
      }
      this.sirenaSource.disconnect();
      this.sirenaSource = null;
    }
  }

  dispose() {
    if (this.disposed) return;
    flushPendingFuelSave(this.fuel, this.id);
    this.disposed = true;

    if (this.ignitionTimeoutId) {
      clearTimeout(this.ignitionTimeoutId);
      this.ignitionTimeoutId = null;
    }

    this.stopEngineSource();
    this.stopSirenaSource();

    if (this.sirena) {
      this.sirena = false;
    }

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  reattach() {
    this.disposed = false;
  }

  // Функция-помощник для скачивания аудиофайла в Web Audio буфер
  async loadSound(url) {
    if (!this.audioCtx) return null;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("Ошибка загрузки звука игры:", e);
      return null;
    }
  }

  async toggleSirena() {
    if (this.disposed) return;

    const turnOn = !this.sirena;
    runInAction(() => {
      this.sirena = turnOn;
    });

    if (turnOn) {
      // Инициализация AudioContext если нет
      if (!this.audioCtx) {
        this.audioCtx = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      // Загрузка звука если нет буфера
      if (!this.sirenaBuffer) {
        this.sirenaBuffer = await this.loadSound(sirenaPolice);
      }

      if (this.sirenaBuffer) {
        this.sirenaSource = this.audioCtx.createBufferSource();
        this.sirenaSource.buffer = this.sirenaBuffer;
        this.sirenaSource.loop = true;
        this.sirenaSource.connect(this.audioCtx.destination);
        this.sirenaSource.start(0);
      }
    } else {
      this.stopSirenaSource();
    }
  }

  async toggleIgnition() {
    if (this.disposed) return;

    runInAction(() => {
      this.isIgnitionOn = !this.isIgnitionOn;
    });

    // 1. Инициализируем аудиоконтекст при первом запуске (требование браузеров)
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Предзагружаем оба файла в память (укажите ваши переменные импорта)
      this.startSound = await this.loadSound(carStartSound);
      this.engineBuffer = await this.loadSound(theEngineIsRunning);
    }

    if (this.isIgnitionOn) {
      // Включаем контекст (если он заснул)
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      // ---- ИГРАЕМ ЗВУК СТАРТЕРА ----
      if (this.startSound) {
        const startNode = this.audioCtx.createBufferSource();
        startNode.buffer = this.startSound;
        startNode.connect(this.audioCtx.destination);
        startNode.start(0);
      }

      // ---- ПЛАНИРУЕМ БЕСШОВНЫЙ МОТОР ЧЕРЕЗ 1 СЕКУНДУ ----
      this.ignitionTimeoutId = setTimeout(() => {
        if (this.disposed || !this.isIgnitionOn || !this.engineBuffer) return;

        this.engineSource = this.audioCtx.createBufferSource();
        this.engineSource.buffer = this.engineBuffer;

        // МЕГА-КЛЮЧЕВОЙ МОМЕНТ: Аппаратное зацикливание Web Audio API без микропауз
        this.engineSource.loop = true;

        // Подключаем к динамикам и запускаем
        this.engineSource.connect(this.audioCtx.destination);
        this.engineSource.start(0);
      }, 1000);
    } else {
      // ---- ВЫКЛЮЧЕНИЕ ЗАЖИГАНИЯ ----
      if (this.ignitionTimeoutId) {
        clearTimeout(this.ignitionTimeoutId);
        this.ignitionTimeoutId = null;
      }

      this.stopEngineSource();

      this.isGasPressed = false;
    }
  }

  pressGas() {
    if (this.shouldStopForLight && !this.sirena) {
      return;
    }
    if (this.fuel > 0) {
      this.fuelConsumption = 1.5;
      this.isGasPressed = true;
    }
  }

  releaseGas() {
    this.fuelConsumption = 0.5;
    this.isGasPressed = false;
  }

  refuel(amount) {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
    this.persistFuel();
  }

  // Принудительная остановка (сброс скорости, двигатель не глушим)
  forceStop() {
    runInAction(() => {
      if (!this.sirena) {
        this.isGasPressed = false;
      }
    });
  }

  // Переключение передачи
  shiftGear(newGear) {
    runInAction(() => {
      const validGears = ["N", "1", "2", "3", "4"];
      if (!validGears.includes(newGear)) return;

      // Безопасность: блокировка при высокой скорости
      if (newGear === "N" && this.currentSpeed > 120) return;
      if (newGear === "1" && this.currentSpeed > 200) return;

      this.gear = newGear;
    });
  }

  // Передаточное отношение
  get gearRatio() {
    switch (this.gear) {
      case "N":
        return 0; // Нейтралка — скорость 0
      case "1":
        return 4; // Делим на 4
      case "2":
        return 2; // Делим на 3
      case "3":
        return 1.333333; // Делим на 2
      case "4":
        return 1; // Прямая передача
      default:
        return 1;
    }
  }

  // Обновление состояния светофора из mapStore
  // Отслеживает ближайший traffic_light впереди (зазор от правого края машины)
  checkTrafficLight(mapStore) {
    let nearestLight = null;
    let nearestDistance = Infinity;

    for (const obj of mapStore.activeObjects) {
      if (obj.typeId !== "traffic_light") continue;
      const distance = obj.worldX - mapStore.offsetX;
      if (distance < -80) continue;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestLight = obj;
      }
    }

    if (!nearestLight) {
      runInAction(() => {
        this.isTrafficLightOnScreen = false;
        this.trafficLightColor = null;
        this.trafficLightDistance = null;
        this.trafficLightGap = null;
      });
      return;
    }

    const lightScreenX = nearestDistance;
    const carRight = getPlayerCarRightEdgePx(mapStore.lastViewportWidth);
    const gapToLight = lightScreenX - carRight;

    runInAction(() => {
      if (gapToLight > -80 && gapToLight <= TRAFFIC_LIGHT_DETECT_GAP_PX) {
        this.isTrafficLightOnScreen = true;
        this.trafficLightColor = mapStore.trafficLightColor;
        this.trafficLightDistance = lightScreenX;
        this.trafficLightGap = gapToLight;
      } else {
        this.isTrafficLightOnScreen = false;
        this.trafficLightColor = null;
        this.trafficLightDistance = null;
        this.trafficLightGap = null;
      }
    });
  }

  getTrafficLightGapToStop() {
    if (this.trafficLightGap !== null) {
      return this.trafficLightGap;
    }
    if (this.trafficLightDistance === null || !this.mapStore) {
      return null;
    }
    return (
      this.trafficLightDistance -
      getPlayerCarRightEdgePx(this.mapStore.lastViewportWidth)
    );
  }

  // Готовый признак: нужно ли останавливаться из-за светофора
  get shouldStopForLight() {
    if (isNightChaseContext(this.mapStore)) return false;
    return this.isTrafficLightOnScreen && this.trafficLightColor === "red";
  }

  // ОДИН МЕТОД ДЛЯ ВНЕШНЕГО ОБЩИТЫВАНИЯ ФИЗИКИ
  updatePhysics(deltaTime, options = {}) {
    const { suppressDrivingBlocks = false } = options;

    runInAction(() => {
      // 1. Логика расхода топлива
      if (this.isIgnitionOn && this.fuel > 0) {
        this.fuel -= this.fuelConsumption;

        if (this.fuel <= 0) {
          this.fuel = 0;
          this.isGasPressed = false;
        }
        this.persistFuel();
      }

      // 1.5. Красный светофор: блок газа и плавное торможение до 50–80 px (сирена — без блокировки)
      const shouldStopForRedLight =
        this.shouldStopForLight && !suppressDrivingBlocks;

      if (shouldStopForRedLight && !this.sirena) {
        this.isGasPressed = false;
      } else if (!shouldStopForRedLight) {
        this.trafficLightStopReleased = false;
      }

      // 2. Логика разгона и торможения с учётом передачи
      const speedMultiplier =
        this.speedMultiplier !== undefined ? this.speedMultiplier : 1;
      const effectiveMaxSpeed =
        this.gear === "N"
          ? 0
          : (this.maxSpeed / this.gearRatio) * speedMultiplier;
      const realSpeed = effectiveMaxSpeed;
      if (this.isGasPressed && this.fuel > 0 && this.isIgnitionOn) {
        this.currentSpeed = Math.min(
          effectiveMaxSpeed,
          this.currentSpeed + this.acceleration * deltaTime,
        );
      } else {
        let deceleration = this.mapStore?.questCarForArrest
          ? this.friction / 4
          : this.friction;
        let holdSpeed = false;

        if (
          shouldStopForRedLight &&
          !this.sirena &&
          this.trafficLightDistance !== null
        ) {
          const gapToLight = this.getTrafficLightGapToStop();
          if (gapToLight === null) {
            // fallback
          } else if (gapToLight <= TRAFFIC_LIGHT_STOP_GAP_PX + TRAFFIC_LIGHT_STOP_TOLERANCE_PX) {
            this.currentSpeed = 0;
            holdSpeed = true;
          } else if (this.currentSpeed > 0) {
            const remaining = gapToLight - TRAFFIC_LIGHT_STOP_GAP_PX;
            const brakingDistance =
              (this.currentSpeed * this.currentSpeed) /
              (2 * TRAFFIC_LIGHT_MAX_BRAKE);
            const brakeMargin = 35;
            if (remaining > brakingDistance + brakeMargin) {
              holdSpeed = true;
            } else {
              const requiredDecel =
                (this.currentSpeed * this.currentSpeed) / (2 * remaining);
              deceleration = Math.min(requiredDecel, TRAFFIC_LIGHT_MAX_BRAKE);
            }
          }
        }

        if (!holdSpeed) {
          this.currentSpeed = Math.max(
            0,
            this.currentSpeed - deceleration * deltaTime,
          );
        }
      }
      // 3. НОВОЕ: Расчет угла вращения колес
      // Коэффициент 2.5 — скорость вращения колес уменьшена в 2 раза
      this.wheelRotation += this.currentSpeed * deltaTime * 2.5;

      // Зацикливаем угол в пределах 360 градусов, чтобы число не росло до бесконечности
      this.wheelRotation %= 360;

      // 4. Накопление пройденного расстояния (только при нажатом газе)
      if (this.isGasPressed) {
        this.distanceMeters +=
          (realSpeed * deltaTime) / stateApp.distanceMetersFactor;
      }
    });
  }
}

export default CarStore;
