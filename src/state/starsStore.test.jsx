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

test("StarsStore: loads zero when no saved data", async () => {
  const { default: starsStore } = await import("./starsStore.jsx");
  expect(starsStore.totalStars).toBe(0);
});

test("StarsStore: addStars persists to localStorage", async () => {
  const { default: starsStore } = await import("./starsStore.jsx");
  starsStore.addStars(3);
  expect(starsStore.totalStars).toBe(3);
  expect(storage.get("spec_cars_total_stars")).toBe("3");

  starsStore.addStars(2);
  expect(starsStore.totalStars).toBe(5);
});

test("StarsStore: reload reads persisted total", async () => {
  storage.set("spec_cars_total_stars", "7");
  const { default: starsStore } = await import("./starsStore.jsx");
  expect(starsStore.totalStars).toBe(7);
});
