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

  constructor() {
    makeAutoObservable(this);
  }

  startGame(mode = GAME_MODES.FREE) {
    const atmosphere = getAtmosphereForMode(mode);
    runInAction(() => {
      this.selectedMode = mode;
      this.screen = "game";
      this.gameSessionKey += 1;
    });
    atmosphereStore.setAtmosphere(atmosphere);
    modeStore.init(mode);
  }

  backToMenu() {
    flushPendingFuelSave();
    recordsStore.commitSession("menu");
    runInAction(() => {
      this.screen = "menu";
    });
    atmosphereStore.setAtmosphere({ timeOfDay: "day", weather: "clear" });
    modeStore.init(GAME_MODES.FREE);
  }
}

const appStore = new AppStore();
export default appStore;
