import { expect, test, beforeEach, vi } from "vitest";
import { GAME_MODES } from "./modeScoring";

const storage = new Map();

vi.stubGlobal("localStorage", {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => {
    storage.set(key, String(value));
  },
  clear: () => storage.clear(),
});

beforeEach(() => {
  storage.clear();
  vi.resetModules();
});

test("RecordsStore: init with empty records", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  expect(recordsStore.getRecords(GAME_MODES.FREE)).toEqual([]);
  expect(recordsStore.getRecords(GAME_MODES.TIMED)).toEqual([]);
  expect(recordsStore.getRecords(GAME_MODES.CHASE)).toEqual([]);
});

test("RecordsStore: loads persisted records on init", async () => {
  storage.set(
    "spec_cars_records_free",
    JSON.stringify([{ timeSec: 120, km: 1.5, stars: 2 }]),
  );
  const { default: recordsStore } = await import("./recordsStore.jsx");
  expect(recordsStore.getRecords(GAME_MODES.FREE)).toEqual([
    { timeSec: 120, km: 1.5, stars: 2 },
  ]);
});

test("RecordsStore: free sort by timeSec desc", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 60, km: 1, stars: 1 });
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 120, km: 1, stars: 1 });
  expect(recordsStore.getRecords(GAME_MODES.FREE)[0].timeSec).toBe(120);
});

test("RecordsStore: free sort tie-breaker km", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 100, km: 1, stars: 1 });
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 100, km: 2, stars: 1 });
  expect(recordsStore.getRecords(GAME_MODES.FREE)[0].km).toBe(2);
});

test("RecordsStore: free sort tie-breaker stars", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 100, km: 2, stars: 1 });
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 100, km: 2, stars: 3 });
  expect(recordsStore.getRecords(GAME_MODES.FREE)[0].stars).toBe(3);
});

test("RecordsStore: timed sort by score desc", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 5 });
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 12 });
  expect(recordsStore.getRecords(GAME_MODES.TIMED)[0].score).toBe(12);
});

test("RecordsStore: chase sort by timeSec asc", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.CHASE, { timeSec: 90 });
  recordsStore.addRecord(GAME_MODES.CHASE, { timeSec: 45 });
  expect(recordsStore.getRecords(GAME_MODES.CHASE)[0].timeSec).toBe(45);
});

test("RecordsStore: keeps max 3 records", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 1 });
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 2 });
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 3 });
  recordsStore.addRecord(GAME_MODES.TIMED, { score: 4 });
  const records = recordsStore.getRecords(GAME_MODES.TIMED);
  expect(records).toHaveLength(3);
  expect(records.map((r) => r.score)).toEqual([4, 3, 2]);
});

test("RecordsStore: commitSession menu saves free session", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.setLiveSession({
    mode: GAME_MODES.FREE,
    durationSec: 30,
    km: 2.5,
    starsEarned: 3,
    score: 0,
    chaseTimeSec: null,
  });
  recordsStore.commitSession("menu");
  expect(recordsStore.getRecords(GAME_MODES.FREE)).toEqual([
    { timeSec: 30, km: 2.5, stars: 3 },
  ]);
  expect(recordsStore.liveSession).toBeNull();
});

test("RecordsStore: commitSession menu skips short free session", async () => {
  const { default: recordsStore, MIN_FREE_SESSION_SEC } = await import(
    "./recordsStore.jsx"
  );
  recordsStore.setLiveSession({
    mode: GAME_MODES.FREE,
    durationSec: MIN_FREE_SESSION_SEC - 1,
    km: 1,
    starsEarned: 1,
    score: 0,
    chaseTimeSec: null,
  });
  recordsStore.commitSession("menu");
  expect(recordsStore.getRecords(GAME_MODES.FREE)).toEqual([]);
});

test("RecordsStore: commitSession complete saves timed session", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.setLiveSession({
    mode: GAME_MODES.TIMED,
    durationSec: 150,
    km: 0,
    starsEarned: 2,
    score: 18,
    chaseTimeSec: null,
  });
  recordsStore.commitSession("complete");
  expect(recordsStore.getRecords(GAME_MODES.TIMED)).toEqual([{ score: 18 }]);
});

test("RecordsStore: commitSession complete saves chase session", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.setLiveSession({
    mode: GAME_MODES.CHASE,
    durationSec: 80,
    km: 0,
    starsEarned: 3,
    score: 12,
    chaseTimeSec: 55,
  });
  recordsStore.commitSession("complete");
  expect(recordsStore.getRecords(GAME_MODES.CHASE)).toEqual([{ timeSec: 55 }]);
});

test("RecordsStore: double commit is no-op", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.setLiveSession({
    mode: GAME_MODES.TIMED,
    durationSec: 100,
    km: 0,
    starsEarned: 1,
    score: 9,
    chaseTimeSec: null,
  });
  recordsStore.commitSession("complete");
  recordsStore.commitSession("complete");
  expect(recordsStore.getRecords(GAME_MODES.TIMED)).toHaveLength(1);
});

test("RecordsStore: persistence round-trip", async () => {
  const { default: recordsStore } = await import("./recordsStore.jsx");
  recordsStore.addRecord(GAME_MODES.FREE, { timeSec: 200, km: 3.2, stars: 4 });
  vi.resetModules();
  const { default: reloaded } = await import("./recordsStore.jsx");
  expect(reloaded.getRecords(GAME_MODES.FREE)).toEqual([
    { timeSec: 200, km: 3.2, stars: 4 },
  ]);
});
