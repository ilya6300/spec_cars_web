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
    enemyChase: 4,
    orientationMatch: 1,
  },
  timed: {
    criminalArrest: 3,
    pedestrianFine: 2,
    enemyChase: 4,
    orientationMatch: 0,
  },
  chase: {
    criminalArrest: 0,
    pedestrianFine: 0,
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
    helpCounts.enemyChase * points.enemyChase +
    helpCounts.orientationMatch * points.orientationMatch
  );
}

export function calculateSessionStars(helpCounts, gameMode) {
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

export function getAtmosphereForMode(gameMode) {
  if (gameMode === GAME_MODES.CHASE) {
    return { timeOfDay: "night", weather: "clear" };
  }
  return { timeOfDay: "day", weather: "clear" };
}
