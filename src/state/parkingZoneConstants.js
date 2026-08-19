import unitParkingImg from "../assets/objects/police_quest/unit_parking.png";
import { RATIO_DISPLAY_SEC } from "./ratioConstants";

export const PARKING_ZONE_TYPE = "parking_zone";

export const PARKING_SPOT_MIN = 4;
export const PARKING_SPOT_MAX = 8;

/** Natural PNG dimensions (382×122) */
export const PARKING_SPOT_IMAGE_WIDTH = 382;
export const PARKING_SPOT_IMAGE_HEIGHT = 122;

/** Layout width/height per spot in world pixels */
export const PARKING_SPOT_WIDTH = PARKING_SPOT_IMAGE_WIDTH;
export const PARKING_SPOT_HEIGHT = PARKING_SPOT_IMAGE_HEIGHT;

export const PARKING_OCCUPIED_CHANCE = 0.5;
export const PARKING_ILLEGAL_CHANCE = 0.2;
export const PARKING_ZONE_Z_INDEX = 2;

/** Стили нелегальной парковки (PLAN.md п. 1.2 — случайный выбор одного) */
export const PARKING_ILLEGAL_VIOLATION_LEFT = "left";
export const PARKING_ILLEGAL_VIOLATION_BOTTOM = "bottom";
export const PARKING_ILLEGAL_VIOLATION_CROOKED = "crooked";

export const PARKING_ILLEGAL_VIOLATIONS = [
  PARKING_ILLEGAL_VIOLATION_LEFT,
  PARKING_ILLEGAL_VIOLATION_BOTTOM,
  PARKING_ILLEGAL_VIOLATION_CROOKED,
];

export const PARKING_ILLEGAL_CLASS_BY_VIOLATION = {
  [PARKING_ILLEGAL_VIOLATION_LEFT]: "parking-zone-car--illegal-left",
  [PARKING_ILLEGAL_VIOLATION_BOTTOM]: "parking-zone-car--illegal-bottom",
  [PARKING_ILLEGAL_VIOLATION_CROOKED]: "parking-zone-car--illegal-crooked",
};

export const PARKING_SPAWN_DELAY_MIN_MS = RATIO_DISPLAY_SEC * 1000;
export const PARKING_SPAWN_DELAY_MAX_MS = RATIO_DISPLAY_SEC * 1000;
export const PARKING_LOAD_DELAY_SEC = 1;
export const PARKING_LIFT_SETTLE_SEC = 0.7;

/**
 * DEBUG: удержать сцену после погрузки (эвакуатор не уезжает, звезда не засчитывается).
 * В консоли: window.__PARKING_EVAC_DEBUG_HOLD__ = false — снова включить уезд.
 * Перед релизом: вернуть false.
 */
export const PARKING_EVACUATOR_DEBUG_HOLD_AFTER_LOAD = false;

export function isParkingEvacuatorDebugHoldAfterLoad() {
  if (typeof window !== "undefined") {
    if (window.__PARKING_EVAC_DEBUG_HOLD__ === false) return false;
    if (window.__PARKING_EVAC_DEBUG_HOLD__ === true) return true;
  }
  return PARKING_EVACUATOR_DEBUG_HOLD_AFTER_LOAD;
}

export const EVACUATOR_WIDTH_PX = 370;
/** Смещение от левого края эвакуатора до центра платформы */
export const EVACUATOR_PLATFORM_OFFSET_X = 98;
export const EVACUATOR_SPAWN_MARGIN_PX = 200;
export const EVACUATOR_DESPAWN_MARGIN_PX = 420;
export const EVACUATOR_WHEEL_SPIN_FACTOR = 2.5;
export const EVACUATOR_APPROACH_TOLERANCE_PX = 4;

export const PARKING_UNIT_IMAGE = unitParkingImg;

export function isParkingZoneType(type) {
  return type === PARKING_ZONE_TYPE;
}

export function randomParkingSpotCount(randomFn = Math.random) {
  const range = PARKING_SPOT_MAX - PARKING_SPOT_MIN + 1;
  return PARKING_SPOT_MIN + Math.floor(randomFn() * range);
}

export function randomParkingIllegalViolation(randomFn = Math.random) {
  const index = Math.floor(randomFn() * PARKING_ILLEGAL_VIOLATIONS.length);
  return PARKING_ILLEGAL_VIOLATIONS[index];
}

export function getParkingIllegalClass(violationType) {
  return PARKING_ILLEGAL_CLASS_BY_VIOLATION[violationType] ?? "";
}

export function randomEvacuatorSpawnDelaySec(randomFn = Math.random) {
  const ms =
    PARKING_SPAWN_DELAY_MIN_MS +
    randomFn() * (PARKING_SPAWN_DELAY_MAX_MS - PARKING_SPAWN_DELAY_MIN_MS);
  return ms / 1000;
}

export function randomEvacuatorSpeed(evacuatorData, randomFn = Math.random) {
  const { minSpeed, maxSpeed, speedMultiplier } = evacuatorData;
  return (
    (minSpeed + randomFn() * (maxSpeed - minSpeed)) * (speedMultiplier ?? 1)
  );
}

export function computeParkingCarScreenX(zoneScreenX, spotIndex, spotWidth) {
  return zoneScreenX + spotIndex * spotWidth + spotWidth * 0.5;
}

export function computeEvacuatorStopX(carCenterScreenX) {
  return carCenterScreenX - EVACUATOR_PLATFORM_OFFSET_X;
}

export function createIdleParkingEvacuation() {
  return {
    phase: "idle",
    sourceKind: null,
    targetUid: null,
    zoneUid: null,
    spotIndex: null,
    targetScreenX: 0,
    stopPositionX: 0,
    positionX: 0,
    currentSpeed: 0,
    wheelRotation: 0,
    spawnDelayRemaining: 0,
    loadDelayRemaining: 0,
    loadedSettleRemaining: 0,
    carOnPlatform: false,
  };
}
