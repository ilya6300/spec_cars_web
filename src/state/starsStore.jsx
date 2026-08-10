import { makeAutoObservable, runInAction } from "mobx";
import { loadTotalStars, saveTotalStars } from "./persistence";

class StarsStore {
  totalStars = 0;

  constructor() {
    makeAutoObservable(this);
    this.totalStars = loadTotalStars();
  }

  addStars(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    runInAction(() => {
      this.totalStars += Math.floor(amount);
      saveTotalStars(this.totalStars);
    });
  }
}

const starsStore = new StarsStore();
export default starsStore;
