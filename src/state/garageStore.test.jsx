import { expect, test, beforeEach, vi } from "vitest";

const storage = new Map();

vi.stubGlobal("localStorage", {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => {
    storage.set(key, String(value));
  },
  clear: () => storage.clear(),
});

beforeEach(() => {
  storage.clear();
  vi.resetModules();
});

test("garageStore: defaults active skin and wheel", async () => {
  const { default: garageStore } = await import("./garageStore.jsx");
  expect(garageStore.activeSkinId).toBe("default");
  expect(garageStore.activeWheelId).toBe("shell_1");
});

test("garageStore: selectWheel persists choice", async () => {
  const { default: garageStore } = await import("./garageStore.jsx");
  garageStore.selectWheel("whell_new_3");
  expect(garageStore.activeWheelId).toBe("whell_new_3");
  expect(storage.get("spec_cars_active_wheel")).toBe("whell_new_3");
});

test("garageStore: getResolvedPlayerCar merges skin and wheel", async () => {
  const { default: garageStore } = await import("./garageStore.jsx");
  garageStore.selectWheel("whell_new_5");
  const resolved = garageStore.getResolvedPlayerCar(1200, 800);
  expect(resolved.urlShell).toBeTruthy();
  expect(resolved.urlBody).toBeTruthy();
  expect(resolved.layoutTokens.width).toBe("250px");
});

test("garageStore: mobile merge width 220px", async () => {
  const { default: garageStore } = await import("./garageStore.jsx");
  const resolved = garageStore.getResolvedPlayerCar(800, 500);
  expect(resolved.layoutTokens.width).toBe("220px");
});

test("garageStore: getPreviewCarStore returns static preview state", async () => {
  const { default: garageStore } = await import("./garageStore.jsx");
  const preview = garageStore.getPreviewCarStore(1200, 800);
  expect(preview.wheelRotation).toBe(0);
  expect(preview.sirena).toBe(false);
  expect(preview.urlShell).toBeTruthy();
});
