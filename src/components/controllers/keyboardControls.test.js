import { describe, it, expect } from "vitest";
import { mapKeyCodeToGear, shiftGearUp } from "./keyboardControls";

describe("mapKeyCodeToGear", () => {
  it("maps N and 0 to neutral", () => {
    expect(mapKeyCodeToGear("KeyN")).toBe("N");
    expect(mapKeyCodeToGear("Digit0")).toBe("N");
  });

  it("maps digit keys 1–4 to gears", () => {
    expect(mapKeyCodeToGear("Digit1")).toBe("1");
    expect(mapKeyCodeToGear("Digit2")).toBe("2");
    expect(mapKeyCodeToGear("Digit3")).toBe("3");
    expect(mapKeyCodeToGear("Digit4")).toBe("4");
  });

  it("returns null for unrelated keys", () => {
    expect(mapKeyCodeToGear("Space")).toBeNull();
    expect(mapKeyCodeToGear("ControlLeft")).toBeNull();
  });
});

describe("shiftGearUp", () => {
  it("advances through gear sequence", () => {
    expect(shiftGearUp("N")).toBe("1");
    expect(shiftGearUp("1")).toBe("2");
    expect(shiftGearUp("2")).toBe("3");
    expect(shiftGearUp("3")).toBe("4");
  });

  it("stays on 4 as no-op", () => {
    expect(shiftGearUp("4")).toBe("4");
  });

  it("returns current gear for unknown value", () => {
    expect(shiftGearUp("X")).toBe("X");
  });
});
