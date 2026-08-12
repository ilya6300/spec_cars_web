/** Зазор от переднего края машины до левого края traffic_light при остановке */
export const TRAFFIC_LIGHT_STOP_GAP_PX = 80;
export const TRAFFIC_LIGHT_STOP_TOLERANCE_PX = 8;
/** Начинать контроль торможения, когда зазор меньше */
export const TRAFFIC_LIGHT_DETECT_GAP_PX = 560;
export const TRAFFIC_LIGHT_MAX_BRAKE = 640;
export const TRAFFIC_LIGHT_GREEN_RESUME_MIN = 0.3;
export const TRAFFIC_LIGHT_GREEN_RESUME_MAX = 1.5;
/** Ускорение полицейского авто (gear 2 профиль) */
export const POLICE_GEAR2_ACCELERATION = 400;
export const TRAFFIC_CAR_WIDTH_DESKTOP_PX = 250;
export const TRAFFIC_CAR_WIDTH_MOBILE_PX = 220;

export function getTrafficCarWidthPx(viewportWidth = 1024) {
  return viewportWidth <= 900
    ? TRAFFIC_CAR_WIDTH_MOBILE_PX
    : TRAFFIC_CAR_WIDTH_DESKTOP_PX;
}

/** Передний край quest-car (кузов смотрит вправо, как у полиции) */
export function getQuestCarFrontEdgePx(positionX, viewportWidth = 1024) {
  return positionX + getTrafficCarWidthPx(viewportWidth);
}

export function getTrafficLightGapToStop(
  lightScreenX,
  carFrontEdgePx,
  stopGapPx = TRAFFIC_LIGHT_STOP_GAP_PX,
) {
  return lightScreenX - carFrontEdgePx - stopGapPx;
}

export function randomGreenResumeDelay() {
  return (
    TRAFFIC_LIGHT_GREEN_RESUME_MIN +
    Math.random() *
      (TRAFFIC_LIGHT_GREEN_RESUME_MAX - TRAFFIC_LIGHT_GREEN_RESUME_MIN)
  );
}

/** Ближайший обычный traffic_light на экране (не quest crossing) */
export function getNearestTrafficLightScreenX(mapStore) {
  let nearestDistance = Infinity;

  for (const obj of mapStore.activeObjects) {
    if (obj.typeId !== "traffic_light") continue;
    const distance = obj.worldX - mapStore.offsetX;
    if (distance < -80) continue;
    if (distance < nearestDistance) {
      nearestDistance = distance;
    }
  }

  if (nearestDistance === Infinity) {
    return null;
  }

  return nearestDistance;
}
