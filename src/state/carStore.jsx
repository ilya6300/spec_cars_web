import { makeAutoObservable, runInAction } from "mobx";
import carStartSound from "../assets/audio/effects/car_start.mp3";
import theEngineIsRunning from "../assets/audio/effects/the_engine_is_running.wav";
import sirenaPolice from "../assets/audio/effects/police_siren.wav";
import stateApp from "./state_app";

class CarStore {
  id = 0;
  type = "";
  name = "";
  urlBody = "";
  urlShell = "";
  countHelp = 0;

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
  pedestrianQuestTriggered = false;

  // Передача (МКПП)
  gear = "N"; // 'N' | '1' | '2' | '3' | '4'

  // Сирена
  sirena = false;
  sirenaBuffer = null;
  sirenaSource = null;

  // Ссылка на MapStore (устанавливается в Game.jsx)
  mapStore = null;

  constructor(carData) {
    Object.assign(this, carData);
    makeAutoObservable(this);
  }

  // МЕТОДЫ УПРАВЛЕНИЯ
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
    this.sirena = !this.sirena;

    if (this.sirena) {
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
      // Остановка сирены
      if (this.sirenaSource) {
        try {
          this.sirenaSource.stop();
        } catch (e) {}
        this.sirenaSource.disconnect();
        this.sirenaSource = null;
      }
    }
  }

  async toggleIgnition() {
    this.isIgnitionOn = !this.isIgnitionOn;

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
        if (!this.isIgnitionOn || !this.engineBuffer) return;

        // Создаем узел источника звука
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

      // Плавно или мгновенно останавливаем зацикленный мотор
      if (this.engineSource) {
        try {
          this.engineSource.stop();
        } catch (e) {}
        this.engineSource.disconnect();
        this.engineSource = null;
      }

      this.isGasPressed = false;
    }
  }

  pressGas() {
    if (this.fuel > 0) {
      this.fuelConsumption = 1.5
      this.isGasPressed = true;
    }
  }

  releaseGas() {
    this.fuelConsumption = 0.5
    this.isGasPressed = false;
  }

  refuel(amount) {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
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
  // Срабатывает только когда расстояние до светофора <= 200px
  checkTrafficLight(mapStore) {
    const trafficLight = mapStore.activeObjects.find(
      (obj) => obj.typeId === "traffic_light",
    );

    if (!trafficLight) {
      runInAction(() => {
        this.isTrafficLightOnScreen = false;
        this.trafficLightColor = null;
        this.pedestrianQuestTriggered = false;
      });
      return;
    }

    const distance = trafficLight.worldX - mapStore.offsetX;

    runInAction(() => {
      if (distance <= 700 && distance > 300) {
        this.isTrafficLightOnScreen = true;
        this.trafficLightColor = mapStore.trafficLightColor;
      } else {
        this.isTrafficLightOnScreen = false;
        this.trafficLightColor = null;
        this.pedestrianQuestTriggered = false;
      }
    });

    // Запуск квеста пешеходного перехода при остановке на красном светофоре (50% шанс)
    if (
      this.isTrafficLightOnScreen &&
      this.trafficLightColor === "red" &&
      !this.pedestrianQuestTriggered &&
      !mapStore.isPedestrianCrossingQuestActive &&
      !mapStore.isPoliceQuestActive && !this.sirena
    ) {
      if (Math.random() < 0.5) {
        const humanTypes = [
          "human1",
          "human2",
          "human3",
          "human4",
          "human5",
          "human6",
          "human7",
          "human8",
          "human9",
          "human10",
          "human11",
          "human12",
          "human13",
          "human14",
          "human15",
          "human16",
        ];
        const randomType =
          humanTypes[Math.floor(Math.random() * humanTypes.length)];
        const targetObj = {
          uid: `pedestrian_quest_${Date.now()}_${Math.random()}`,
          typeId: randomType,
        };
        mapStore.startPedestrianCrossingQuest(targetObj);
        this.pedestrianQuestTriggered = true;
      }
    }
  }

  // Готовый признак: нужно ли останавливаться из-за светофора
  get shouldStopForLight() {
    return this.isTrafficLightOnScreen && this.trafficLightColor === "red";
  }

  // ОДИН МЕТОД ДЛЯ ВНЕШНЕГО ОБЩИТЫВАНИЯ ФИЗИКИ
  updatePhysics(deltaTime) {
    runInAction(() => {
      // 1. Логика расхода топлива
      if (
        this.isIgnitionOn &&
        this.fuel > 0       
      ) {
        this.fuel -= this.fuelConsumption;

        if (this.fuel <= 0) {
          this.fuel = 0;
          this.isGasPressed = false;
        }
      }

      // 1.5. Остановка на красном светофоре
      if (this.trafficLightColor === "red") {
        this.forceStop();
      }

      // 2. Логика разгона и торможения с учётом передачи
      const speedMultiplier = this.speedMultiplier !== undefined ? this.speedMultiplier : 1;
      const effectiveMaxSpeed =
        this.gear === "N" ? 0 : (this.maxSpeed / this.gearRatio) * speedMultiplier;
      const realSpeed = effectiveMaxSpeed;
      if (this.isGasPressed && this.fuel > 0 && this.isIgnitionOn) {
        this.currentSpeed = Math.min(
          effectiveMaxSpeed,
          this.currentSpeed + this.acceleration * deltaTime,
        );
      } else {
        if (!this.mapStore?.questCarForArrest) {
          this.currentSpeed = Math.max(
            0,
            this.currentSpeed - this.friction * deltaTime,
          );
        } else {
          this.currentSpeed = Math.max(
            0,
            this.currentSpeed - this.friction / 4 * deltaTime,
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
