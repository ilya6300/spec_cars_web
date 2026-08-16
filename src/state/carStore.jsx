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
  // ╨б╤Б╤Л╨╗╨║╨░ ╨╜╨░ MapStore (╤Г╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╤В╤Б╤П ╨▓ Game.jsx)
  mapStore = null;

  disposed = false;

  audioCtx = null;
  engineSource = null;
  startSound = null;
  engineBuffer = null;

  helpCounts = {
    criminalArrest: 0,
    pedestrianFine: 0,
    parkingFine: 0,
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

  // ╨Ш╨б╨Я╨а╨Р╨Т╨Ы╨Х╨Э╨Ю: ╨п╨▓╨╜╨╛ ╨╛╨▒╤К╤П╨▓╨╗╤П╨╡╨╝ ╤Б╨▓╨╛╨╣╤Б╤В╨▓╨╛, ╤З╤В╨╛╨▒╤Л MobX ╨▓╨╖╤П╨╗ ╨╡╨│╨╛ ╨╜╨░ ╨║╨╛╨╜╤В╤А╨╛╨╗╤М
  wheelRotation = 0;

  fuel = 65000;
  maxFuel = 65000;
  fuelConsumption = 0.5;

  isGasPressed = false;

  // ╨Ч╨░╨╢╨╕╨│╨░╨╜╨╕╨╡ (╨╖╨░╨▓╨╡╨┤╤С╨╜ ╨┤╨▓╨╕╨│╨░╤В╨╡╨╗╤М ╨╕╨╗╨╕ ╨╜╨╡╤В)
  isIgnitionOn = false;

  // ╨е╤А╨░╨╜╨╕╨╗╨╕╤Й╨░ ╨┤╨╗╤П ╨╛╨▒╤К╨╡╨║╤В╨╛╨▓ ╨░╤Г╨┤╨╕╨╛
  audioStart = null;
  audioEngine = null;
  ignitionTimeoutId = null; // ╨Ф╨╗╤П ╨╛╤В╨╝╨╡╨╜╤Л ╤В╨░╨╣╨╝╨╡╤А╨░, ╨╡╤Б╨╗╨╕ ╨╖╨░╨╢╨╕╨│╨░╨╜╨╕╨╡ ╨▓╤Л╨║╨╗╤О╤З╨╕╨╗╨╕ ╨┤╨╛ ╤Б╤В╨░╤А╤В╨░ ╨╝╨╛╤В╨╛╤А╨░

  // ╨Я╤А╨╛╨╣╨┤╨╡╨╜╨╜╨╛╨╡ ╤А╨░╤Б╤Б╤В╨╛╤П╨╜╨╕╨╡ ╨▓ ╨╝╨╡╤В╤А╨░╤Е
  distanceMeters = 0;

  // ╨б╨╛╤Б╤В╨╛╤П╨╜╨╕╨╡ ╤Б╨▓╨╡╤В╨╛╤Д╨╛╤А╨░
  isTrafficLightOnScreen = false;
  trafficLightColor = null; // 'red' | 'green' | null
  trafficLightDistance = null; // screen px левого края traffic_light
  trafficLightGap = null; // зазор: traffic_light left − правый край машины
  trafficLightStopReleased = false;

  // ╨Я╨╡╤А╨╡╨┤╨░╤З╨░ (╨Ь╨Ъ╨Я╨Я)
  gear = "N"; // 'N' | '1' | '2' | '3' | '4'

  // ╨б╨╕╤А╨╡╨╜╨░
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
    const { criminalArrest, pedestrianFine, parkingFine, enemyChase } =
      this.helpCounts;
    return criminalArrest + pedestrianFine + parkingFine + enemyChase;
  }

  get isStarCollectionUnlocked() {
    return this.totalQuestCompletions >= 2;
  }

  resetSessionHelp() {
    runInAction(() => {
      this.helpCounts = {
        criminalArrest: 0,
        pedestrianFine: 0,
        parkingFine: 0,
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

  // ╨д╤Г╨╜╨║╤Ж╨╕╤П-╨┐╨╛╨╝╨╛╤Й╨╜╨╕╨║ ╨┤╨╗╤П ╤Б╨║╨░╤З╨╕╨▓╨░╨╜╨╕╤П ╨░╤Г╨┤╨╕╨╛╤Д╨░╨╣╨╗╨░ ╨▓ Web Audio ╨▒╤Г╤Д╨╡╤А
  async loadSound(url) {
    if (!this.audioCtx) return null;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("╨Ю╤И╨╕╨▒╨║╨░ ╨╖╨░╨│╤А╤Г╨╖╨║╨╕ ╨╖╨▓╤Г╨║╨░ ╨╕╨│╤А╤Л:", e);
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
      // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨░╤Ж╨╕╤П AudioContext ╨╡╤Б╨╗╨╕ ╨╜╨╡╤В
      if (!this.audioCtx) {
        this.audioCtx = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      // ╨Ч╨░╨│╤А╤Г╨╖╨║╨░ ╨╖╨▓╤Г╨║╨░ ╨╡╤Б╨╗╨╕ ╨╜╨╡╤В ╨▒╤Г╤Д╨╡╤А╨░
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

    // 1. ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╨░╤Г╨┤╨╕╨╛╨║╨╛╨╜╤В╨╡╨║╤Б╤В ╨┐╤А╨╕ ╨┐╨╡╤А╨▓╨╛╨╝ ╨╖╨░╨┐╤Г╤Б╨║╨╡ (╤В╤А╨╡╨▒╨╛╨▓╨░╨╜╨╕╨╡ ╨▒╤А╨░╤Г╨╖╨╡╤А╨╛╨▓)
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // ╨Я╤А╨╡╨┤╨╖╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨╛╨▒╨░ ╤Д╨░╨╣╨╗╨░ ╨▓ ╨┐╨░╨╝╤П╤В╤М (╤Г╨║╨░╨╢╨╕╤В╨╡ ╨▓╨░╤И╨╕ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╤Л╨╡ ╨╕╨╝╨┐╨╛╤А╤В╨░)
      this.startSound = await this.loadSound(carStartSound);
      this.engineBuffer = await this.loadSound(theEngineIsRunning);
    }

    if (this.isIgnitionOn) {
      // ╨Т╨║╨╗╤О╤З╨░╨╡╨╝ ╨║╨╛╨╜╤В╨╡╨║╤Б╤В (╨╡╤Б╨╗╨╕ ╨╛╨╜ ╨╖╨░╤Б╨╜╤Г╨╗)
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      // ---- ╨Ш╨У╨а╨Р╨Х╨Ь ╨Ч╨Т╨г╨Ъ ╨б╨в╨Р╨а╨в╨Х╨а╨Р ----
      if (this.startSound) {
        const startNode = this.audioCtx.createBufferSource();
        startNode.buffer = this.startSound;
        startNode.connect(this.audioCtx.destination);
        startNode.start(0);
      }

      // ---- ╨Я╨Ы╨Р╨Э╨Ш╨а╨г╨Х╨Ь ╨С╨Х╨б╨и╨Ю╨Т╨Э╨л╨Щ ╨Ь╨Ю╨в╨Ю╨а ╨з╨Х╨а╨Х╨Ч 1 ╨б╨Х╨Ъ╨г╨Э╨Ф╨г ----
      this.ignitionTimeoutId = setTimeout(() => {
        if (this.disposed || !this.isIgnitionOn || !this.engineBuffer) return;

        this.engineSource = this.audioCtx.createBufferSource();
        this.engineSource.buffer = this.engineBuffer;

        // ╨Ь╨Х╨У╨Р-╨Ъ╨Ы╨о╨з╨Х╨Т╨Ю╨Щ ╨Ь╨Ю╨Ь╨Х╨Э╨в: ╨Р╨┐╨┐╨░╤А╨░╤В╨╜╨╛╨╡ ╨╖╨░╤Ж╨╕╨║╨╗╨╕╨▓╨░╨╜╨╕╨╡ Web Audio API ╨▒╨╡╨╖ ╨╝╨╕╨║╤А╨╛╨┐╨░╤Г╨╖
        this.engineSource.loop = true;

        // ╨Я╨╛╨┤╨║╨╗╤О╤З╨░╨╡╨╝ ╨║ ╨┤╨╕╨╜╨░╨╝╨╕╨║╨░╨╝ ╨╕ ╨╖╨░╨┐╤Г╤Б╨║╨░╨╡╨╝
        this.engineSource.connect(this.audioCtx.destination);
        this.engineSource.start(0);
      }, 1000);
    } else {
      // ---- ╨Т╨л╨Ъ╨Ы╨о╨з╨Х╨Э╨Ш╨Х ╨Ч╨Р╨Ц╨Ш╨У╨Р╨Э╨Ш╨п ----
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

  // ╨Я╤А╨╕╨╜╤Г╨┤╨╕╤В╨╡╨╗╤М╨╜╨░╤П ╨╛╤Б╤В╨░╨╜╨╛╨▓╨║╨░ (╤Б╨▒╤А╨╛╤Б ╤Б╨║╨╛╤А╨╛╤Б╤В╨╕, ╨┤╨▓╨╕╨│╨░╤В╨╡╨╗╤М ╨╜╨╡ ╨│╨╗╤Г╤И╨╕╨╝)
  forceStop() {
    runInAction(() => {
      if (!this.sirena) {
        this.isGasPressed = false;
      }
    });
  }

  // ╨Я╨╡╤А╨╡╨║╨╗╤О╤З╨╡╨╜╨╕╨╡ ╨┐╨╡╤А╨╡╨┤╨░╤З╨╕
  shiftGear(newGear) {
    runInAction(() => {
      const validGears = ["N", "1", "2", "3", "4"];
      if (!validGears.includes(newGear)) return;

      // ╨С╨╡╨╖╨╛╨┐╨░╤Б╨╜╨╛╤Б╤В╤М: ╨▒╨╗╨╛╨║╨╕╤А╨╛╨▓╨║╨░ ╨┐╤А╨╕ ╨▓╤Л╤Б╨╛╨║╨╛╨╣ ╤Б╨║╨╛╤А╨╛╤Б╤В╨╕
      if (newGear === "N" && this.currentSpeed > 120) return;
      if (newGear === "1" && this.currentSpeed > 200) return;

      this.gear = newGear;
    });
  }

  // ╨Я╨╡╤А╨╡╨┤╨░╤В╨╛╤З╨╜╨╛╨╡ ╨╛╤В╨╜╨╛╤И╨╡╨╜╨╕╨╡
  get gearRatio() {
    switch (this.gear) {
      case "N":
        return 0; // ╨Э╨╡╨╣╤В╤А╨░╨╗╨║╨░ тАФ ╤Б╨║╨╛╤А╨╛╤Б╤В╤М 0
      case "1":
        return 4; // ╨Ф╨╡╨╗╨╕╨╝ ╨╜╨░ 4
      case "2":
        return 2; // ╨Ф╨╡╨╗╨╕╨╝ ╨╜╨░ 3
      case "3":
        return 1.333333; // ╨Ф╨╡╨╗╨╕╨╝ ╨╜╨░ 2
      case "4":
        return 1; // ╨Я╤А╤П╨╝╨░╤П ╨┐╨╡╤А╨╡╨┤╨░╤З╨░
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

  // ╨Ю╨Ф╨Ш╨Э ╨Ь╨Х╨в╨Ю╨Ф ╨Ф╨Ы╨п ╨Т╨Э╨Х╨и╨Э╨Х╨У╨Ю ╨Ю╨С╨й╨Ш╨в╨л╨Т╨Р╨Э╨Ш╨п ╨д╨Ш╨Ч╨Ш╨Ъ╨Ш
  updatePhysics(deltaTime, options = {}) {
    const { suppressDrivingBlocks = false } = options;

    runInAction(() => {
      // 1. ╨Ы╨╛╨│╨╕╨║╨░ ╤А╨░╤Б╤Е╨╛╨┤╨░ ╤В╨╛╨┐╨╗╨╕╨▓╨░
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

      // 2. ╨Ы╨╛╨│╨╕╨║╨░ ╤А╨░╨╖╨│╨╛╨╜╨░ ╨╕ ╤В╨╛╤А╨╝╨╛╨╢╨╡╨╜╨╕╤П ╤Б ╤Г╤З╤С╤В╨╛╨╝ ╨┐╨╡╤А╨╡╨┤╨░╤З╨╕
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
      // 3. ╨Э╨Ю╨Т╨Ю╨Х: ╨а╨░╤Б╤З╨╡╤В ╤Г╨│╨╗╨░ ╨▓╤А╨░╤Й╨╡╨╜╨╕╤П ╨║╨╛╨╗╨╡╤Б
      // ╨Ъ╨╛╤Н╤Д╤Д╨╕╤Ж╨╕╨╡╨╜╤В 2.5 тАФ ╤Б╨║╨╛╤А╨╛╤Б╤В╤М ╨▓╤А╨░╤Й╨╡╨╜╨╕╤П ╨║╨╛╨╗╨╡╤Б ╤Г╨╝╨╡╨╜╤М╤И╨╡╨╜╨░ ╨▓ 2 ╤А╨░╨╖╨░
      this.wheelRotation += this.currentSpeed * deltaTime * 2.5;

      // ╨Ч╨░╤Ж╨╕╨║╨╗╨╕╨▓╨░╨╡╨╝ ╤Г╨│╨╛╨╗ ╨▓ ╨┐╤А╨╡╨┤╨╡╨╗╨░╤Е 360 ╨│╤А╨░╨┤╤Г╤Б╨╛╨▓, ╤З╤В╨╛╨▒╤Л ╤З╨╕╤Б╨╗╨╛ ╨╜╨╡ ╤А╨╛╤Б╨╗╨╛ ╨┤╨╛ ╨▒╨╡╤Б╨║╨╛╨╜╨╡╤З╨╜╨╛╤Б╤В╨╕
      this.wheelRotation %= 360;

      // 4. ╨Э╨░╨║╨╛╨┐╨╗╨╡╨╜╨╕╨╡ ╨┐╤А╨╛╨╣╨┤╨╡╨╜╨╜╨╛╨│╨╛ ╤А╨░╤Б╤Б╤В╨╛╤П╨╜╨╕╤П (╤В╨╛╨╗╤М╨║╨╛ ╨┐╤А╨╕ ╨╜╨░╨╢╨░╤В╨╛╨╝ ╨│╨░╨╖╨╡)
      if (this.isGasPressed) {
        this.distanceMeters +=
          (realSpeed * deltaTime) / stateApp.distanceMetersFactor;
      }
    });
  }
}

export default CarStore;
