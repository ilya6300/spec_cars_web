import { makeAutoObservable, runInAction } from "mobx";
import {
  getDefaultCar,
  getEffectiveLayoutTokens,
  getSkinById,
  getWheelById,
  PLAYER_LAYOUT_TOKENS,
} from "./cars";
import {
  loadActiveSkin,
  loadActiveWheel,
  saveActiveSkin,
  saveActiveWheel,
} from "./persistence";

class GarageStore {
  activeSkinId = "default";
  activeWheelId = "shell_1";

  constructor() {
    makeAutoObservable(this);
    this.activeSkinId = loadActiveSkin();
    this.activeWheelId = loadActiveWheel();
  }

  selectSkin(skinId) {
    const car = getDefaultCar();
    const skin = getSkinById(car, skinId);
    if (!skin || !skin.open) return;

    runInAction(() => {
      this.activeSkinId = skinId;
      saveActiveSkin(skinId);
    });
  }

  selectWheel(wheelId) {
    const wheel = getWheelById(wheelId);
    if (!wheel || !wheel.open) return;

    runInAction(() => {
      this.activeWheelId = wheelId;
      saveActiveWheel(wheelId);
    });
  }

  getResolvedPlayerCar(
    viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024,
    viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768,
  ) {
    const car = getDefaultCar();
    const skin =
      getSkinById(car, this.activeSkinId) ?? getSkinById(car, "default");
    const wheel =
      getWheelById(this.activeWheelId) ?? getWheelById("shell_1");
    const layoutTokens = getEffectiveLayoutTokens(
      car.layoutTokens ?? PLAYER_LAYOUT_TOKENS,
      viewportWidth,
      viewportHeight,
    );

    return {
      ...car,
      urlBody: skin.urlBody,
      urlShell: wheel.src,
      layoutTokens,
    };
  }

  getPreviewCarStore(
    viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024,
    viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768,
  ) {
    const resolved = this.getResolvedPlayerCar(viewportWidth, viewportHeight);
    return {
      urlBody: resolved.urlBody,
      urlShell: resolved.urlShell,
      wheelRotation: 0,
      sirena: false,
      layoutTokens: resolved.layoutTokens,
    };
  }
}

const garageStore = new GarageStore();
export default garageStore;
