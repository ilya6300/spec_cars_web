import { expect, test } from "vitest";
import {
  calculateSessionScore,
  calculateSessionStars,
  GAME_MODES,
  TIMED_DURATION_SEC,
} from "./modeScoring";

test("modeScoring timed: thresholds 10/5/1 guaranteed", () => {
  const empty = {
    criminalArrest: 0,
    pedestrianFine: 0,
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
