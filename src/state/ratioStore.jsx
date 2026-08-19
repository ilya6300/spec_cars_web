import { makeAutoObservable, runInAction } from "mobx";
import { DISPATCH_RESPONSE_DELAY_SEC } from "./ratioConstants";

class RatioStore {
  phase = "idle";
  message = null;
  sessionId = 0;
  playSoundOnShow = true;

  _timers = [];
  _onDismissComplete = null;
  _responseDelaySec = DISPATCH_RESPONSE_DELAY_SEC;

  constructor() {
    makeAutoObservable(this);
  }

  get isFlowActive() {
    return this.phase !== "idle";
  }

  clearRatioTimers() {
    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
  }

  scheduleTimer(callback, delayMs) {
    const sessionAtSchedule = this.sessionId;
    const id = setTimeout(() => {
      if (this.sessionId !== sessionAtSchedule) return;
      callback();
    }, delayMs);
    this._timers.push(id);
    return id;
  }

  showMessage(message, options = {}) {
    const {
      playSound = true,
      onComplete = null,
      responseDelaySec = DISPATCH_RESPONSE_DELAY_SEC,
    } = options;
    runInAction(() => {
      this.clearRatioTimers();
      this.sessionId += 1;
      this.phase = "showing";
      this.message = message;
      this.playSoundOnShow = playSound;
      this._onDismissComplete = onComplete;
      this._responseDelaySec = responseDelaySec;
    });
  }

  onRatioDismiss() {
    const onComplete = this._onDismissComplete;
    runInAction(() => {
      this.message = null;
      this._onDismissComplete = null;
      if (!onComplete) {
        this.phase = "idle";
      }
    });

    if (onComplete) {
      if (this._responseDelaySec === 0) {
        onComplete();
        runInAction(() => {
          this.phase = "idle";
        });
      } else {
        this.scheduleAfterDismiss(onComplete, this._responseDelaySec);
      }
    }
  }

  scheduleAfterDismiss(callback, delaySec = DISPATCH_RESPONSE_DELAY_SEC) {
    runInAction(() => {
      this.phase = "dispatch_wait";
    });

    this.scheduleTimer(() => {
      runInAction(() => {
        callback();
        if (this.phase === "dispatch_wait") {
          this.phase = "idle";
        }
      });
    }, delaySec * 1000);
  }

  showDispatchResult(message, options = {}) {
    const {
      playSound = true,
      onComplete = null,
      responseDelaySec = DISPATCH_RESPONSE_DELAY_SEC,
    } = options;
    runInAction(() => {
      this.clearRatioTimers();
      this.phase = "dispatch_result";
      this.message = message;
      this.playSoundOnShow = playSound;
      this._onDismissComplete = onComplete;
      this._responseDelaySec = responseDelaySec;
    });
  }

  dispose() {
    this.clearRatioTimers();
    runInAction(() => {
      this.phase = "idle";
      this.message = null;
      this.playSoundOnShow = true;
      this._onDismissComplete = null;
      this.sessionId = 0;
    });
  }
}

const ratioStore = new RatioStore();
export default ratioStore;
