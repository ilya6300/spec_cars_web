import { expect, test, beforeEach } from "vitest";
import atmosphereStore, {
  pickFreeRainDurationSec,
  shouldStartFreeRain,
} from "./atmosphereStore";
import {
  FREE_RAIN_CHECK_INTERVAL_SEC,
  FREE_RAIN_DURATION_MAX_SEC,
  FREE_RAIN_DURATION_MIN_SEC,
} from "./event.config";
import { GAME_MODES } from "./modeScoring";

beforeEach(() => {
  atmosphereStore.stopFreeWeather();
  atmosphereStore.setAtmosphere({ timeOfDay: "day", weather: "clear" });
  atmosphereStore.setRandomFn(() => Math.random());
});

test("shouldStartFreeRain: below chance starts rain", () => {
  expect(shouldStartFreeRain(0.05)).toBe(true);
  expect(shouldStartFreeRain(0.09)).toBe(true);
});

test("shouldStartFreeRain: at or above chance stays clear", () => {
  expect(shouldStartFreeRain(0.1)).toBe(false);
  expect(shouldStartFreeRain(0.99)).toBe(false);
});

test("pickFreeRainDurationSec: maps 0 to min and 1 to max", () => {
  expect(
    pickFreeRainDurationSec(
      0,
      FREE_RAIN_DURATION_MIN_SEC,
      FREE_RAIN_DURATION_MAX_SEC,
    ),
  ).toBe(FREE_RAIN_DURATION_MIN_SEC);
  expect(
    pickFreeRainDurationSec(
      1,
      FREE_RAIN_DURATION_MIN_SEC,
      FREE_RAIN_DURATION_MAX_SEC,
    ),
  ).toBe(FREE_RAIN_DURATION_MAX_SEC);
});

test("pickFreeRainDurationSec: midpoint", () => {
  const mid = pickFreeRainDurationSec(
    0.5,
    FREE_RAIN_DURATION_MIN_SEC,
    FREE_RAIN_DURATION_MAX_SEC,
  );
  expect(mid).toBe(
    FREE_RAIN_DURATION_MIN_SEC +
      0.5 * (FREE_RAIN_DURATION_MAX_SEC - FREE_RAIN_DURATION_MIN_SEC),
  );
});

test("initFreeWeather: clear when random above chance", () => {
  atmosphereStore.setRandomFn(() => 0.99);
  atmosphereStore.initFreeWeather();
  expect(atmosphereStore.weather).toBe("clear");
  expect(atmosphereStore.timeOfDay).toBe("day");
  expect(atmosphereStore.freeWeatherActive).toBe(true);
});

test("initFreeWeather: rain when random below chance", () => {
  atmosphereStore.setRandomFn(() => 0.05);
  atmosphereStore.setTestRainDurationSec(120);
  atmosphereStore.initFreeWeather();
  expect(atmosphereStore.weather).toBe("rain");
  expect(atmosphereStore.timeOfDay).toBe("day");
  expect(atmosphereStore.rainRemainingSec).toBe(120);
});

test("tick: rain ends after duration", () => {
  atmosphereStore.setRandomFn(() => 0.05);
  atmosphereStore.setTestRainDurationSec(2);
  atmosphereStore.initFreeWeather();
  atmosphereStore.tick(2.1, GAME_MODES.FREE);
  expect(atmosphereStore.weather).toBe("clear");
  expect(atmosphereStore.rainRemainingSec).toBe(0);
});

test("tick: periodic rain start after 60s clear", () => {
  atmosphereStore.setFreeWeatherRandomSequence([0.99, 0.05]);
  atmosphereStore.setTestRainDurationSec(120);
  atmosphereStore.initFreeWeather();
  expect(atmosphereStore.weather).toBe("clear");
  atmosphereStore.tick(FREE_RAIN_CHECK_INTERVAL_SEC, GAME_MODES.FREE);
  expect(atmosphereStore.weather).toBe("rain");
});

test("stopFreeWeather: disables planner", () => {
  atmosphereStore.setRandomFn(() => 0.05);
  atmosphereStore.initFreeWeather();
  atmosphereStore.stopFreeWeather();
  atmosphereStore.tick(120, GAME_MODES.FREE);
  expect(atmosphereStore.freeWeatherActive).toBe(false);
  expect(atmosphereStore.weather).toBe("rain");
});

test("tick: no-op for chase mode", () => {
  atmosphereStore.setRandomFn(() => 0.05);
  atmosphereStore.setTestRainDurationSec(120);
  atmosphereStore.initFreeWeather();
  atmosphereStore.tick(5, GAME_MODES.CHASE);
  expect(atmosphereStore.rainRemainingSec).toBe(120);
});
