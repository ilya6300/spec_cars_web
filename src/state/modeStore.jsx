import { makeAutoObservable, runInAction } from "mobx";
import {
  GAME_MODES,
  TIMED_DURATION_SEC,
  calculateSessionScore,
  calculateSessionCoins,
} from "./modeScoring";
import coinsStore from "./coinsStore";
import recordsStore from "./recordsStore";

class ModeStore {
  gameMode = GAME_MODES.FREE;
  timeRemainingSec = TIMED_DURATION_SEC;
  isPaused = false;
  isComplete = false;
  coinsEarned = 0;

  constructor() {
    makeAutoObservable(this);
  }

  init(mode) {
    runInAction(() => {
      this.gameMode = mode;
      this.timeRemainingSec = TIMED_DURATION_SEC;
      this.isPaused = false;
      this.isComplete = false;
      this.coinsEarned = 0;
    });
  }

  tick(deltaTime, carStore) {
    if (this.isPaused || this.isComplete) return;

    if (this.gameMode === GAME_MODES.TIMED) {
      this.timeRemainingSec -= deltaTime;
      if (this.timeRemainingSec <= 0) {
        this.timeRemainingSec = 0;
        this.completeMode(carStore);
      }
      return;
    }

    if (this.gameMode === GAME_MODES.CHASE && carStore) {
      if (carStore.helpCounts.enemyChase >= 3) {
        this.completeMode(carStore);
      }
    }
  }

  completeMode(carStore) {
    if (this.isComplete) return;

    const coins = calculateSessionCoins(carStore.helpCounts, this.gameMode);
    runInAction(() => {
      this.isComplete = true;
      this.isPaused = true;
      this.coinsEarned = coins;
    });
    coinsStore.addCoins(coins);
    recordsStore.commitSession("complete");
  }

  get sessionScore() {
    return null;
  }

  getScoreForCarStore(carStore) {
    if (!carStore) return 0;
    return calculateSessionScore(carStore.helpCounts, this.gameMode);
  }

  getCoinsForCarStore(carStore) {
    if (!carStore) return 0;
    if (this.isComplete) return this.coinsEarned;
    return calculateSessionCoins(carStore.helpCounts, this.gameMode);
  }

  get chaseProgress() {
    return { current: 0, target: 3 };
  }

  getChaseProgress(carStore) {
    return {
      current: carStore?.helpCounts.enemyChase ?? 0,
      target: 3,
    };
  }
}

const modeStore = new ModeStore();
export default modeStore;
