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

test("CoinsStore: loads zero when no saved data", async () => {
  const { default: coinsStore } = await import("./coinsStore.jsx");
  expect(coinsStore.totalCoins).toBe(0);
});

test("CoinsStore: addCoins persists to localStorage", async () => {
  const { default: coinsStore } = await import("./coinsStore.jsx");
  coinsStore.addCoins(3);
  expect(coinsStore.totalCoins).toBe(3);
  expect(storage.get("spec_cars_total_coins")).toBe("3");

  coinsStore.addCoins(2);
  expect(coinsStore.totalCoins).toBe(5);
});

test("CoinsStore: migrates legacy stars key once", async () => {
  storage.set("spec_cars_total_stars", "7");
  const { default: coinsStore } = await import("./coinsStore.jsx");
  expect(coinsStore.totalCoins).toBe(7);
  expect(storage.get("spec_cars_total_coins")).toBe("7");
});

test("CoinsStore: reload reads persisted total", async () => {
  storage.set("spec_cars_total_coins", "9");
  const { default: coinsStore } = await import("./coinsStore.jsx");
  expect(coinsStore.totalCoins).toBe(9);
});
