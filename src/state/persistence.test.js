import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { loadFuel, scheduleFuelSave } from "./persistence";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("loadFuel: null when key missing", () => {
  expect(loadFuel(65000, "police-0")).toBeNull();
});

test("loadFuel: validates range", () => {
  localStorage.setItem("spec_cars_fuel_police-0", "50000");
  expect(loadFuel(65000, "police-0")).toBe(50000);

  localStorage.setItem("spec_cars_fuel_police-0", "999999");
  expect(loadFuel(65000, "police-0")).toBe(65000);
});

test("scheduleFuelSave: writes after throttle", () => {
  scheduleFuelSave(42000, "police-0");
  expect(localStorage.getItem("spec_cars_fuel_police-0")).toBeNull();

  vi.advanceTimersByTime(1500);
  expect(localStorage.getItem("spec_cars_fuel_police-0")).toBe("42000");
});
