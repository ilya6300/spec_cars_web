import { makeAutoObservable, runInAction } from "mobx";
import { loadRecords, saveRecords } from "./persistence";
import { GAME_MODES } from "./modeScoring";

export const MAX_RECORDS = 3;
export const MIN_FREE_SESSION_SEC = 5;

const RECORD_MODES = [GAME_MODES.FREE, GAME_MODES.TIMED, GAME_MODES.CHASE];

function sortRecords(mode, records) {
  const sorted = [...records];

  if (mode === GAME_MODES.FREE) {
    sorted.sort((a, b) => {
      if (b.timeSec !== a.timeSec) return b.timeSec - a.timeSec;
      if (b.km !== a.km) return b.km - a.km;
      return b.stars - a.stars;
    });
    return sorted;
  }

  if (mode === GAME_MODES.TIMED) {
    sorted.sort((a, b) => b.score - a.score);
    return sorted;
  }

  if (mode === GAME_MODES.CHASE) {
    sorted.sort((a, b) => a.timeSec - b.timeSec);
    return sorted;
  }

  return sorted;
}

class RecordsStore {
  recordsByMode = {
    [GAME_MODES.FREE]: [],
    [GAME_MODES.TIMED]: [],
    [GAME_MODES.CHASE]: [],
  };

  liveSession = null;

  constructor() {
    makeAutoObservable(this);
    for (const mode of RECORD_MODES) {
      this.recordsByMode[mode] = loadRecords(mode);
    }
  }

  addRecord(mode, record) {
    if (!RECORD_MODES.includes(mode) || !record) return;

    runInAction(() => {
      const next = sortRecords(mode, [...this.recordsByMode[mode], record]).slice(
        0,
        MAX_RECORDS,
      );
      this.recordsByMode[mode] = next;
      saveRecords(mode, next);
    });
  }

  getRecords(mode) {
    return [...(this.recordsByMode[mode] ?? [])];
  }

  setLiveSession(snapshot) {
    runInAction(() => {
      this.liveSession = snapshot;
    });
  }

  clearLiveSession() {
    runInAction(() => {
      this.liveSession = null;
    });
  }

  commitSession(trigger) {
    const session = this.liveSession;
    if (!session) return;

    const mode = session.mode;
    let record = null;

    if (mode === GAME_MODES.FREE && trigger === "menu") {
      if (session.durationSec >= MIN_FREE_SESSION_SEC) {
        record = {
          timeSec: session.durationSec,
          km: session.km,
          stars: session.starsEarned,
        };
      }
    } else if (mode === GAME_MODES.TIMED && trigger === "complete") {
      record = { score: session.score };
    } else if (mode === GAME_MODES.CHASE && trigger === "complete") {
      const timeSec = session.chaseTimeSec ?? session.durationSec;
      if (Number.isFinite(timeSec) && timeSec >= 0) {
        record = { timeSec };
      }
    }

    this.clearLiveSession();

    if (record) {
      this.addRecord(mode, record);
    }
  }
}

const recordsStore = new RecordsStore();
export default recordsStore;
