// Enemy quest-car: первый спавн (gate)
export const ENEMY_FIRST_SPAWN_GATE_SEC_FREE = 30;
export const ENEMY_FIRST_SPAWN_GATE_SEC_TIMED = 20;
export const ENEMY_FIRST_SPAWN_GATE_SEC_CHASE = 15;

// Pedestrian crossing quest
export const PEDESTRIAN_QUEST_SPAWN_CHANCE = 1; // 100%
export const CROSS_ON_RED_CHANCE = 0.3; // 30%

// Погода: free mode
export const FREE_RAIN_START_CHANCE = 0.1;
export const FREE_RAIN_CHECK_INTERVAL_SEC = 60;
export const FREE_RAIN_DURATION_MIN_SEC = 120;
export const FREE_RAIN_DURATION_MAX_SEC = 360;

// Погода: chase mode
export const CHASE_TIME_OF_DAY = "night";
export const CHASE_RAIN_CHANCE = 0; // 100%

// Quest-car respawn
export const ENEMY_QUEST_CAR_RESPAWN_MIN_SEC = 10;
export const ENEMY_QUEST_CAR_RESPAWN_MAX_SEC = 30;
export const ENEMY_QUEST_CAR_RESPAWN_MIN_SEC_CHASE = 8;
export const ENEMY_QUEST_CAR_RESPAWN_MAX_SEC_CHASE = 15;
export const CIVILIAN_QUEST_CAR_RESPAWN_MIN_SEC = 5;
export const CIVILIAN_QUEST_CAR_RESPAWN_MAX_SEC = 15;
export const ENEMY_QUEST_CAR_INITIAL_TIMER_SEC = 10;
export const CIVILIAN_QUEST_CAR_INITIAL_TIMER_SEC = 5;

// Глобальный светофор
export const TRAFFIC_LIGHT_CYCLE_MS = 10000;

export function getEnemyFirstSpawnGateSec(gameMode) {
  if (gameMode === "chase") {
    return ENEMY_FIRST_SPAWN_GATE_SEC_CHASE;
  }
  if (gameMode === "timed") {
    return ENEMY_FIRST_SPAWN_GATE_SEC_TIMED;
  }
  return ENEMY_FIRST_SPAWN_GATE_SEC_FREE;
}

export function randomEnemyQuestCarRespawnDelaySec(gameMode) {
  if (gameMode === "chase") {
    return (
      ENEMY_QUEST_CAR_RESPAWN_MIN_SEC_CHASE +
      Math.random() *
        (ENEMY_QUEST_CAR_RESPAWN_MAX_SEC_CHASE -
          ENEMY_QUEST_CAR_RESPAWN_MIN_SEC_CHASE)
    );
  }
  return (
    ENEMY_QUEST_CAR_RESPAWN_MIN_SEC +
    Math.random() *
      (ENEMY_QUEST_CAR_RESPAWN_MAX_SEC - ENEMY_QUEST_CAR_RESPAWN_MIN_SEC)
  );
}

export function randomCivilianQuestCarRespawnDelaySec() {
  return (
    CIVILIAN_QUEST_CAR_RESPAWN_MIN_SEC +
    Math.random() *
      (CIVILIAN_QUEST_CAR_RESPAWN_MAX_SEC - CIVILIAN_QUEST_CAR_RESPAWN_MIN_SEC)
  );
}
