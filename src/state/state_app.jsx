import { makeAutoObservable, runInAction } from "mobx";
class stateApp {
  constructor() {
    makeAutoObservable(this);
  }
  distanceMetersFactor = 20;
}
export default new stateApp();
