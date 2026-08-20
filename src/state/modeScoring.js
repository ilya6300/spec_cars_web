import atmosphereStore from "./atmosphereStore";
import { CHASE_RAIN_CHANCE, CHASE_TIME_OF_DAY } from "./event.config";

export const GAME_MODES = {
  FREE: "free",
  TIMED: "timed",
  CHASE: "chase",
};

export const TIMED_DURATION_SEC = 150;

export const HELP_POINTS_BY_MODE = {
  free: {
    criminalArrest: 3,
    pedestrianFine: 1,
    parkingFine: 2,
    roadsideHelp: 2,
    enemyChase: 4,
    orientationMatch: 1,
  },
  timed: {
    criminalArrest: 3,
    pedestrianFine: 2,
    parkingFine: 2,
    roadsideHelp: 2,
    enemyChase: 4,
    orientationMatch: 0,
  },
  chase: {
    criminalArrest: 0,
    pedestrianFine: 0,
    parkingFine: 0,
    roadsideHelp: 0,
    enemyChase: 4,
    orientationMatch: 0,
  },
};

export function getHelpPoints(gameMode) {
  return HELP_POINTS_BY_MODE[gameMode] ?? HELP_POINTS_BY_MODE.free;
}

export function calculateSessionScore(helpCounts, gameMode) {
  const points = getHelpPoints(gameMode);
  return (
    helpCounts.criminalArrest * points.criminalArrest +
    helpCounts.pedestrianFine * points.pedestrianFine +
    (helpCounts.parkingFine ?? 0) * (points.parkingFine ?? 0) +
    (helpCounts.roadsideHelp ?? 0) * (points.roadsideHelp ?? 0) +
    helpCounts.enemyChase * points.enemyChase +
    helpCounts.orientationMatch * points.orientationMatch
  );
}

export function calculateSessionCoins(helpCounts, gameMode) {
  if (gameMode === GAME_MODES.TIMED) {
    const score = calculateSessionScore(helpCounts, gameMode);
    if (score >= 10) return 3;
    if (score >= 5) return 2;
    return 1;
  }

  if (gameMode === GAME_MODES.CHASE) {
    if (helpCounts.enemyChase >= 3) return 3;
    return Math.min(helpCounts.enemyChase, 2);
  }

  const score = calculateSessionScore(helpCounts, gameMode);
  if (score >= 14) return 3;
  if (score >= 8) return 2;
  if (score >= 4) return 1;
  return 0;
}

export function getAtmosphereForMode(gameMode, randomFn = Math.random) {
  if (gameMode === GAME_MODES.CHASE) {
    const isRain =
      CHASE_RAIN_CHANCE >= 1 || randomFn() < CHASE_RAIN_CHANCE;
    return {
      timeOfDay: CHASE_TIME_OF_DAY,
      weather: isRain ? "rain" : "clear",
    };
  }
  return { timeOfDay: "day", weather: "clear" };
}

export function isNightChaseContext(mapStore) {
  return (
    mapStore?.gameMode === GAME_MODES.CHASE || atmosphereStore.isNight
  );
}

export function isPeacefulHumanType(type) {
  return /^human\d+$/.test(type);
}
