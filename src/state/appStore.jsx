import { makeAutoObservable, runInAction } from "mobx";
import { GAME_MODES, getAtmosphereForMode } from "./modeScoring";
import atmosphereStore from "./atmosphereStore";
import modeStore from "./modeStore";
import recordsStore from "./recordsStore";
import { flushPendingFuelSave } from "./persistence";

class AppStore {
  screen = "menu";
  selectedMode = GAME_MODES.FREE;
  gameSessionKey = 0;
  isSettingsModalOpen = false;
  isControlsHelpOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  openSettings() {
    runInAction(() => {
      this.isSettingsModalOpen = true;
    });
  }

  closeSettings() {
    runInAction(() => {
      this.isSettingsModalOpen = false;
      this.isControlsHelpOpen = false;
    });
  }

  openControlsHelp() {
    runInAction(() => {
      this.isControlsHelpOpen = true;
    });
  }

  closeControlsHelp() {
    runInAction(() => {
      this.isControlsHelpOpen = false;
    });
  }

  backFromControlsHelp() {
    this.closeControlsHelp();
  }

  startGame(mode = GAME_MODES.FREE) {
    runInAction(() => {
      this.isSettingsModalOpen = false;
      this.isControlsHelpOpen = false;
      this.selectedMode = mode;
      this.screen = "game";
      this.gameSessionKey += 1;
    });
    if (mode === GAME_MODES.FREE) {
      atmosphereStore.initFreeWeather();
    } else {
      atmosphereStore.stopFreeWeather();
      atmosphereStore.setAtmosphere(getAtmosphereForMode(mode));
    }
    modeStore.init(mode);
  }

  openUiTest() {
    runInAction(() => {
      this.screen = "ui-test";
    });
  }

  backToMenu() {
    flushPendingFuelSave();
    recordsStore.commitSession("menu");
    runInAction(() => {
      this.screen = "menu";
    });
    atmosphereStore.stopFreeWeather();
    atmosphereStore.setAtmosphere({ timeOfDay: "day", weather: "clear" });
    modeStore.init(GAME_MODES.FREE);
  }
}

const appStore = new AppStore();
export default appStore;
