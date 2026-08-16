import unitParkingImg from "../assets/objects/police_quest/unit_parking.png";

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
export const PARKING_FINE_DELAY_MS = 1000;
export const PARKING_ZONE_Z_INDEX = 2;

export const PARKING_VIOLATION_TYPES = ["line_cross", "crooked", "on_road"];

export const PARKING_UNIT_IMAGE = unitParkingImg;

export function isParkingZoneType(type) {
  return type === PARKING_ZONE_TYPE;
}

export function randomParkingSpotCount(randomFn = Math.random) {
  const range = PARKING_SPOT_MAX - PARKING_SPOT_MIN + 1;
  return PARKING_SPOT_MIN + Math.floor(randomFn() * range);
}

export function buildParkingViolationTransform(violationType, randomFn = Math.random) {
  const sign = randomFn() < 0.5 ? -1 : 1;

  switch (violationType) {
    case "line_cross": {
      const px = 8 + randomFn() * 7;
      return `translateX(${sign * px}px)`;
    }
    case "crooked": {
      const deg = 12 + randomFn() * 13;
      return `rotate(${sign * deg}deg)`;
    }
    case "on_road": {
      const py = 10 + randomFn() * 12;
      return `translateY(${py}px)`;
    }
    default:
      return "";
  }
}
