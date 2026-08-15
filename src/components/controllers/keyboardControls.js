const GEAR_SEQUENCE = ["N", "1", "2", "3", "4"];

export function mapKeyCodeToGear(code) {
  switch (code) {
    case "KeyN":
    case "Digit0":
      return "N";
    case "Digit1":
      return "1";
    case "Digit2":
      return "2";
    case "Digit3":
      return "3";
    case "Digit4":
      return "4";
    default:
      return null;
  }
}

export function shiftGearUp(currentGear) {
  const index = GEAR_SEQUENCE.indexOf(currentGear);
  if (index === -1 || index >= GEAR_SEQUENCE.length - 1) {
    return currentGear;
  }
  return GEAR_SEQUENCE[index + 1];
}
