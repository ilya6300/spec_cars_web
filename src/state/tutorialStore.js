import { makeAutoObservable, runInAction } from "mobx";

const IDLE_THRESHOLD_SEC = 5;
const SPEED_IDLE_EPS = 1;

export class TutorialStore {
  currentStep = null;
  idleSeconds = 0;
  blockADone = false;
  enemyBlockDone = false;
  enemyQueued = false;

  constructor() {
    makeAutoObservable(this);
  }

  get highlightTarget() {
    if (this.currentStep === "done") return null;
    return this.currentStep;
  }

  get isQuestModalBlocking() {
    return false;
  }

  tick(deltaTime, carStore, mapStore) {
    if (this.currentStep === "done") return;

    const questActive =
      mapStore.isPoliceQuestActive ||
      mapStore.isPedestrianCrossingQuestActive ||
      mapStore.isQuestArrestActive;

    if (questActive) return;

    const isIdle =
      carStore.currentSpeed < SPEED_IDLE_EPS && !carStore.isGasPressed;

    if (!this.blockADone && isIdle) {
      this.idleSeconds += deltaTime;
    } else if (!this.blockADone && this.currentStep === null) {
      this.idleSeconds = 0;
    }

    if (!this.blockADone && this.currentStep === null && this.idleSeconds >= IDLE_THRESHOLD_SEC) {
      runInAction(() => {
        this.currentStep = "ignition";
      });
    }

    this.advanceBlockA(carStore);
    this.trackEnemy(mapStore);
    this.advanceBlockB(carStore);
  }

  advanceBlockA(carStore) {
    if (this.blockADone) return;

    if (this.currentStep === "ignition" && carStore.isIgnitionOn) {
      runInAction(() => {
        this.currentStep = "gear-2";
      });
    }
    if (this.currentStep === "gear-2" && carStore.gear === "2") {
      runInAction(() => {
        this.currentStep = "gas-pedal";
      });
    }
    if (
      this.currentStep === "gas-pedal" &&
      (carStore.isGasPressed || carStore.currentSpeed > SPEED_IDLE_EPS)
    ) {
      runInAction(() => {
        this.blockADone = true;
        if (this.enemyQueued && !this.enemyBlockDone) {
          this.currentStep = "siren";
        } else if (!this.enemyQueued) {
          this.currentStep = null;
        }
      });
    }
  }

  trackEnemy(mapStore) {
    if (this.enemyBlockDone) return;

    const hasEnemy = mapStore.questCars.some((car) => car.enemy && car.active);
    if (!hasEnemy) return;

    runInAction(() => {
      if (!this.blockADone && this.currentStep && this.currentStep !== "done") {
        this.enemyQueued = true;
      } else if (this.blockADone || this.currentStep === null) {
        this.currentStep = "siren";
      }
    });
  }

  advanceBlockB(carStore) {
    if (this.enemyBlockDone) return;

    if (this.currentStep === "siren" && carStore.sirena) {
      runInAction(() => {
        this.currentStep = "gear-4";
      });
    }
    if (this.currentStep === "gear-4" && carStore.gear === "4") {
      runInAction(() => {
        this.enemyBlockDone = true;
        this.currentStep = "done";
      });
    }
  }

  reset() {
    runInAction(() => {
      this.currentStep = null;
      this.idleSeconds = 0;
      this.blockADone = false;
      this.enemyBlockDone = false;
      this.enemyQueued = false;
    });
  }
}
