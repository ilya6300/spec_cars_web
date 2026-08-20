export const WALK_SPEED = 40;
export const GREEN_SWITCH_MIN = 3;
export const GREEN_SWITCH_MAX = 4;
export const RED_WALK_DELAY_MIN = 3;
export const RED_WALK_DELAY_MAX = 5;
export { CROSS_ON_RED_CHANCE } from "./event.config";
export const QUEST_CROSSING_TYPE = "traffic_light_quest_crossing";
export const QUEST_CROSSING_WIDTH_DESKTOP = 230;
export const QUEST_CROSSING_HEIGHT_DESKTOP = 445;
export const QUEST_CROSSING_WIDTH_MOBILE = 200;
export const QUEST_CROSSING_HEIGHT_MOBILE = 255;
export const QUEST_CROSSING_BOTTOM = "53%";
export const QUEST_CROSSING_Z_INDEX = 2;
export const QUEST_CROSSING_HUMAN_WIDTH = 60;
/** Правая граница зебры — старт human */
export const CROSSWALK_START_RATIO = 0.78;
/** Базовая доля ширины перехода (до удлинения ×1.5) */
export const CROSSWALK_BASE_PATH_RATIO = 0.56;
/** Длина пути human справа налево (×1.5 от базовой) */
export const CROSSWALK_PATH_RATIO = CROSSWALK_BASE_PATH_RATIO * 1.5;
export const QUEST_ENGAGE_RIGHT_INSET = 240;
export const QUEST_ENGAGE_LEFT_MARGIN = 60;

export const MOBILE_QUEST_CROSSING_MEDIA =
  "(max-width: 900px) and (orientation: landscape), (max-height: 500px)";

export function isQuestCrossingType(typeId) {
  return typeId === QUEST_CROSSING_TYPE;
}

export function isMobileQuestCrossingLayout(viewportWidth = 1024) {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia(MOBILE_QUEST_CROSSING_MEDIA).matches;
  }
  return viewportWidth <= 900;
}

export function getQuestCrossingLayout(viewportWidth = 1024) {
  const mobile = isMobileQuestCrossingLayout(viewportWidth);
  return {
    width: mobile ? QUEST_CROSSING_WIDTH_MOBILE : QUEST_CROSSING_WIDTH_DESKTOP,
    height: mobile ? QUEST_CROSSING_HEIGHT_MOBILE : QUEST_CROSSING_HEIGHT_DESKTOP,
  };
}

export function isQuestCrossingEngaged(screenX, crossingWidth, viewportWidth) {
  return (
    screenX < viewportWidth - QUEST_ENGAGE_RIGHT_INSET &&
    screenX + crossingWidth > QUEST_ENGAGE_LEFT_MARGIN
  );
}

export function getCrosswalkStartX(objWorldX, crossingWidth) {
  return objWorldX + crossingWidth * CROSSWALK_START_RATIO;
}

export function getCrosswalkStopX(objWorldX, crossingWidth) {
  return getCrosswalkStartX(objWorldX, crossingWidth) - crossingWidth * CROSSWALK_PATH_RATIO;
}

export function randomGreenSwitchDelay() {
  return GREEN_SWITCH_MIN + Math.random() * (GREEN_SWITCH_MAX - GREEN_SWITCH_MIN);
}

export function randomRedWalkDelay() {
  return RED_WALK_DELAY_MIN + Math.random() * (RED_WALK_DELAY_MAX - RED_WALK_DELAY_MIN);
}

export function getQuestCrossingZoneBounds(obj, viewportWidth = 1024) {
  const layout = getQuestCrossingLayout(viewportWidth);
  const width = obj.questCrossing?.crossingWidth ?? layout.width;
  return {
    left: obj.worldX,
    right: obj.worldX + width,
  };
}

export function isPeacefulHumanOverlappingQuestCrossing(worldX, humanWidth, zone) {
  return worldX + humanWidth > zone.left && worldX < zone.right;
}

export function clampPeacefulWorldXOutsideQuestCrossing(
  worldX,
  humanWidth,
  zone,
  previousWorldX,
) {
  if (!isPeacefulHumanOverlappingQuestCrossing(worldX, humanWidth, zone)) {
    return worldX;
  }

  const approachingFromRight = previousWorldX >= zone.right;
  const approachingFromLeft = previousWorldX + humanWidth <= zone.left;

  if (approachingFromRight) {
    return zone.right;
  }
  if (approachingFromLeft) {
    return zone.left - humanWidth;
  }

  const outsideRight = zone.right;
  const outsideLeft = zone.left - humanWidth;
  return Math.abs(worldX - outsideRight) <= Math.abs(worldX - outsideLeft)
    ? outsideRight
    : outsideLeft;
}

export function getVisibleQuestCrossingExclusionZones(
  activeObjects,
  offsetX,
  viewportWidth,
) {
  const zones = [];
  for (const obj of activeObjects) {
    if (!isQuestCrossingType(obj.typeId)) continue;
    const { left, right } = getQuestCrossingZoneBounds(obj, viewportWidth);
    const screenX = left - offsetX;
    if (screenX + (right - left) < 0 || screenX > viewportWidth) {
      continue;
    }
    zones.push({ left, right });
  }
  return zones;
}

export function clampPeacefulWorldXOutsideAllQuestCrossings(
  worldX,
  humanWidth,
  zones,
  previousWorldX,
) {
  let result = worldX;
  let prev = previousWorldX;
  for (const zone of zones) {
    const clamped = clampPeacefulWorldXOutsideQuestCrossing(
      result,
      humanWidth,
      zone,
      prev,
    );
    prev = result;
    result = clamped;
  }
  return result;
}
