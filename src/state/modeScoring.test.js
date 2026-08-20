import { expect, test } from "vitest";
import {
  calculateSessionScore,
  calculateSessionStars,
  GAME_MODES,
  TIMED_DURATION_SEC,
  getAtmosphereForMode,
  isNightChaseContext,
} from "./modeScoring";
import atmosphereStore from "./atmosphereStore";

test("modeScoring: roadsideHelp awards 2 points in free/timed", () => {
  const counts = {
    criminalArrest: 0,
    pedestrianFine: 0,
    parkingFine: 0,
    roadsideHelp: 1,
    enemyChase: 0,
    orientationMatch: 0,
  };
  expect(calculateSessionScore(counts, GAME_MODES.FREE)).toBe(2);
  expect(calculateSessionScore(counts, GAME_MODES.TIMED)).toBe(2);
  expect(calculateSessionScore(counts, GAME_MODES.CHASE)).toBe(0);
});

test("modeScoring: parkingFine awards 2 points in free/timed", () => {
  const counts = {
    criminalArrest: 0,
    pedestrianFine: 0,
    parkingFine: 1,
    enemyChase: 0,
    orientationMatch: 0,
  };
  expect(calculateSessionScore(counts, GAME_MODES.FREE)).toBe(2);
  expect(calculateSessionScore(counts, GAME_MODES.TIMED)).toBe(2);
  expect(calculateSessionScore(counts, GAME_MODES.CHASE)).toBe(0);
});

test("modeScoring timed: thresholds 10/5/1 guaranteed", () => {
  const empty = {
    criminalArrest: 0,
    pedestrianFine: 0,
    parkingFine: 0,
    enemyChase: 0,
    orientationMatch: 0,
  };
  expect(calculateSessionStars(empty, GAME_MODES.TIMED)).toBe(1);

  const twoStars = { ...empty, enemyChase: 1, pedestrianFine: 1 };
  expect(calculateSessionScore(twoStars, GAME_MODES.TIMED)).toBe(6);
  expect(calculateSessionStars(twoStars, GAME_MODES.TIMED)).toBe(2);

  const threeStars = { ...empty, enemyChase: 2, pedestrianFine: 1 };
  expect(calculateSessionScore(threeStars, GAME_MODES.TIMED)).toBe(10);
  expect(calculateSessionStars(threeStars, GAME_MODES.TIMED)).toBe(3);
});

test("modeScoring chase: 3 enemies = 3 stars", () => {
  const counts = {
    criminalArrest: 0,
    pedestrianFine: 0,
    enemyChase: 3,
    orientationMatch: 0,
  };
  expect(calculateSessionStars(counts, GAME_MODES.CHASE)).toBe(3);
});

test("TIMED_DURATION_SEC is 150 (2:30)", () => {
  expect(TIMED_DURATION_SEC).toBe(150);
});

test("isNightChaseContext: chase mode", () => {
  const mapStore = { gameMode: GAME_MODES.CHASE };
  expect(isNightChaseContext(mapStore)).toBe(true);
});

test("isNightChaseContext: free + day atmosphere", () => {
  atmosphereStore.setAtmosphere({ timeOfDay: "day" });
  const mapStore = { gameMode: GAME_MODES.FREE };
  expect(isNightChaseContext(mapStore)).toBe(false);
});

test("isNightChaseContext: free + night atmosphere", () => {
  atmosphereStore.setAtmosphere({ timeOfDay: "night" });
  const mapStore = { gameMode: GAME_MODES.FREE };
  expect(isNightChaseContext(mapStore)).toBe(true);
  atmosphereStore.setAtmosphere({ timeOfDay: "day" });
});

test("getAtmosphereForMode: chase returns night and rain", () => {
  expect(getAtmosphereForMode(GAME_MODES.CHASE)).toEqual({
    timeOfDay: "night",
    weather: "rain",
  });
});

test("atmosphereStore.isRainy: true when weather is rain", () => {
  atmosphereStore.setAtmosphere({ timeOfDay: "night", weather: "rain" });
  expect(atmosphereStore.isRainy).toBe(true);
  atmosphereStore.setAtmosphere({ timeOfDay: "day", weather: "clear" });
  expect(atmosphereStore.isRainy).toBe(false);
});
