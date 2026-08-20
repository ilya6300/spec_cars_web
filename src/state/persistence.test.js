import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  flushPendingFuelSave,
  loadFuel,
  loadRecords,
  saveRecords,
  scheduleFuelSave,
} from "./persistence";

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

test("flushPendingFuelSave: writes immediately without waiting for throttle", () => {
  scheduleFuelSave(42000, "police-0");
  expect(localStorage.getItem("spec_cars_fuel_police-0")).toBeNull();

  flushPendingFuelSave();
  expect(localStorage.getItem("spec_cars_fuel_police-0")).toBe("42000");
});

test("flushPendingFuelSave: can write explicit value on exit", () => {
  flushPendingFuelSave(38000, "police-0");
  expect(localStorage.getItem("spec_cars_fuel_police-0")).toBe("38000");
});

test("loadRecords: empty when key missing", () => {
  expect(loadRecords("free")).toEqual([]);
});

test("loadRecords: validates free records", () => {
  localStorage.setItem(
    "spec_cars_records_free",
    JSON.stringify([
      { timeSec: 60, km: 1.2, stars: 2 },
      { timeSec: -1, km: 1, stars: 1 },
      { timeSec: 30, km: "bad", stars: 1 },
    ]),
  );
  expect(loadRecords("free")).toEqual([{ timeSec: 60, km: 1.2, coins: 2 }]);
});

test("loadRecords: validates timed records", () => {
  localStorage.setItem(
    "spec_cars_records_timed",
    JSON.stringify([{ score: 10 }, { score: -3 }, null]),
  );
  expect(loadRecords("timed")).toEqual([{ score: 10 }]);
});

test("loadRecords: validates chase records", () => {
  localStorage.setItem(
    "spec_cars_records_chase",
    JSON.stringify([{ timeSec: 45 }, { timeSec: "slow" }]),
  );
  expect(loadRecords("chase")).toEqual([{ timeSec: 45 }]);
});

test("saveRecords and loadRecords round-trip", () => {
  const records = [
    { timeSec: 120, km: 2.5, coins: 3 },
    { timeSec: 90, km: 1.1, coins: 1 },
  ];
  saveRecords("free", records);
  expect(loadRecords("free")).toEqual(records);
  expect(localStorage.getItem("spec_cars_records_free")).toBe(
    JSON.stringify(records),
  );
});
