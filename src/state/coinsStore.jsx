import { makeAutoObservable, runInAction } from "mobx";
import { loadTotalCoins, saveTotalCoins } from "./persistence";

class CoinsStore {
  totalCoins = 0;

  constructor() {
    makeAutoObservable(this);
    this.totalCoins = loadTotalCoins();
  }

  addCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    runInAction(() => {
      this.totalCoins += Math.floor(amount);
      saveTotalCoins(this.totalCoins);
    });
  }
}

const coinsStore = new CoinsStore();
export default coinsStore;
