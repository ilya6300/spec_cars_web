import { expect, test } from "vitest";
import CarStore from "./carStore";

test("CarStore: addHelp increments helpCounts and sessionScore", () => {
  const store = new CarStore({ id: "test", maxFuel: 100, fuel: 100 });

  expect(store.sessionScore).toBe(0);
  expect(store.sessionStars).toBe(0);

  store.addHelp("enemyChase");
  expect(store.helpCounts.enemyChase).toBe(1);
  expect(store.sessionScore).toBe(4);
  expect(store.sessionStars).toBe(1);

  store.addHelp("criminalArrest");
  store.addHelp("pedestrianFine");
  expect(store.sessionScore).toBe(8);
  expect(store.sessionStars).toBe(2);
});

test("CarStore: resetSessionHelp clears counters", () => {
  const store = new CarStore({ id: "test", maxFuel: 100, fuel: 100 });
  store.addHelp("enemyChase");
  store.resetSessionHelp();
  expect(store.sessionScore).toBe(0);
});

test("CarStore: dispose prevents addHelp", () => {
  const store = new CarStore({ id: "test", maxFuel: 100, fuel: 100 });
  store.dispose();
  store.addHelp("enemyChase");
  expect(store.helpCounts.enemyChase).toBe(0);
});
