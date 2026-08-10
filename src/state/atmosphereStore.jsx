import { makeAutoObservable, runInAction } from "mobx";

class AtmosphereStore {
  timeOfDay = "day";
  weather = "clear";

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
}

const atmosphereStore = new AtmosphereStore();
export default atmosphereStore;
