import { makeAutoObservable, runInAction } from "mobx";
import { GAME_MODES } from "./modeScoring";

export const FREE_RAIN_START_CHANCE = 0.1;
export const FREE_RAIN_CHECK_INTERVAL_SEC = 60;
export const FREE_RAIN_DURATION_MIN_SEC = 120;
export const FREE_RAIN_DURATION_MAX_SEC = 360;

export function shouldStartFreeRain(
  randomValue,
  chance = FREE_RAIN_START_CHANCE,
) {
  return randomValue < chance;
}

export function pickFreeRainDurationSec(randomValue, minSec, maxSec) {
  return minSec + randomValue * (maxSec - minSec);
}

class AtmosphereStore {
  timeOfDay = "day";
  weather = "clear";
  freeWeatherActive = false;
  rainRemainingSec = 0;
  clearElapsedSec = 0;

  _randomFn = () => Math.random();
  _randomValues = [];
  _randomValueIndex = 0;
  _testRainDurationSec = null;

  constructor() {
    makeAutoObservable(this);
  }

  setAtmosphere({ timeOfDay = "day", weather = "clear" } = {}) {
    runInAction(() => {
      this.timeOfDay = timeOfDay;
      this.weather = weather;
    });
  }

  get isNight() {
    return this.timeOfDay === "night";
  }

  get isRainy() {
    return this.weather === "rain";
  }

  getRandom() {
    if (typeof window !== "undefined" && window.__WEATHER_TEST__?.randomValues) {
      const vals = window.__WEATHER_TEST__.randomValues;
      const idx = window.__WEATHER_TEST__._idx ?? 0;
      if (idx < vals.length) {
        window.__WEATHER_TEST__._idx = idx + 1;
        return vals[idx];
      }
    }
    if (
      this._randomValues.length > 0 &&
      this._randomValueIndex < this._randomValues.length
    ) {
      return this._randomValues[this._randomValueIndex++];
    }
    return this._randomFn();
  }

  getRainDurationSec() {
    if (this._testRainDurationSec != null) {
      return this._testRainDurationSec;
    }
    if (
      typeof window !== "undefined" &&
      window.__WEATHER_TEST__?.rainDurationSec != null
    ) {
      return window.__WEATHER_TEST__.rainDurationSec;
    }
    return pickFreeRainDurationSec(
      this.getRandom(),
      FREE_RAIN_DURATION_MIN_SEC,
      FREE_RAIN_DURATION_MAX_SEC,
    );
  }

  startFreeRain() {
    this.weather = "rain";
    this.rainRemainingSec = this.getRainDurationSec();
    this.clearElapsedSec = 0;
  }

  initFreeWeather() {
    runInAction(() => {
      this.freeWeatherActive = true;
      this.clearElapsedSec = 0;
      this.rainRemainingSec = 0;
      this.timeOfDay = "day";

      if (shouldStartFreeRain(this.getRandom())) {
        this.startFreeRain();
      } else {
        this.weather = "clear";
      }
    });
  }

  stopFreeWeather() {
    runInAction(() => {
      this.freeWeatherActive = false;
      this.rainRemainingSec = 0;
      this.clearElapsedSec = 0;
      this._testRainDurationSec = null;
      this._randomValues = [];
      this._randomValueIndex = 0;
    });
  }

  tick(deltaTime, gameMode) {
    if (!this.freeWeatherActive || gameMode !== GAME_MODES.FREE) return;

    runInAction(() => {
      if (this.weather === "rain") {
        this.rainRemainingSec -= deltaTime;
        if (this.rainRemainingSec <= 0) {
          this.weather = "clear";
          this.rainRemainingSec = 0;
          this.clearElapsedSec = 0;
        }
      } else {
        this.clearElapsedSec += deltaTime;
        while (this.clearElapsedSec >= FREE_RAIN_CHECK_INTERVAL_SEC) {
          this.clearElapsedSec -= FREE_RAIN_CHECK_INTERVAL_SEC;
          if (shouldStartFreeRain(this.getRandom())) {
            this.startFreeRain();
            break;
          }
        }
      }
      this.timeOfDay = "day";
    });
  }

  setRandomFn(fn) {
    this._randomFn = fn;
    this._randomValues = [];
    this._randomValueIndex = 0;
  }

  setFreeWeatherRandomSequence(values) {
    this._randomValues = [...values];
    this._randomValueIndex = 0;
  }

  setTestRainDurationSec(sec) {
    this._testRainDurationSec = sec;
  }

  reinitFreeWeather() {
    if (typeof window !== "undefined" && window.__WEATHER_TEST__) {
      window.__WEATHER_TEST__._idx = 0;
    }
    this._randomValueIndex = 0;
    this.initFreeWeather();
  }
}

const atmosphereStore = new AtmosphereStore();
export default atmosphereStore;
