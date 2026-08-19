export const ROADSIDE_BREAKDOWN_TYPE = "roadside_breakdown";

/** 175–400 игровых м = 3500–8000 world px */
export const ROADSIDE_BREAKDOWN_MIN_DISTANCE = 3500;
export const ROADSIDE_BREAKDOWN_MAX_DISTANCE = 8000;
export const ROADSIDE_BREAKDOWN_INITIAL_SPAWN_DISTANCE = 5000;

export const ROADSIDE_BREAKDOWN_Z_INDEX = 2;
export const ROADSIDE_BREAKDOWN_WIDTH = 250;
export const ROADSIDE_BREAKDOWN_HEIGHT = 100;

export function isRoadsideBreakdownType(type) {
  return type === ROADSIDE_BREAKDOWN_TYPE;
}
