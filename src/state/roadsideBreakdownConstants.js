export const ROADSIDE_BREAKDOWN_TYPE = "roadside_breakdown";

/** 350–800 игровых м = 7000–16000 world px (в 2× реже после первого спавна) */
export const ROADSIDE_BREAKDOWN_MIN_DISTANCE = 7000;
export const ROADSIDE_BREAKDOWN_MAX_DISTANCE = 16000;
export const ROADSIDE_BREAKDOWN_INITIAL_SPAWN_DISTANCE = 5000;

export const ROADSIDE_BREAKDOWN_Z_INDEX = 2;
export const ROADSIDE_BREAKDOWN_WIDTH = 250;
export const ROADSIDE_BREAKDOWN_HEIGHT = 100;

export function isRoadsideBreakdownType(type) {
  return type === ROADSIDE_BREAKDOWN_TYPE;
}

/** Центр машины на экране (worldX — левый край объекта в world px) */
export function computeRoadsideBreakdownCarScreenX(worldX, offsetX) {
  return worldX + ROADSIDE_BREAKDOWN_WIDTH / 2 - offsetX;
}
