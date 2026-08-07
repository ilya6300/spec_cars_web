import { expect, test, vi } from "vitest";
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

test("CarStore: refuel adds 5000 ml", () => {
  const store = new CarStore({ id: "refuel-add-test", maxFuel: 65000, fuel: 0 });
  store.refuel(5000);
  expect(store.fuel).toBe(5000);
});

test("CarStore: refuel caps at maxFuel", () => {
  const store = new CarStore({ id: "refuel-cap-test", maxFuel: 65000, fuel: 64000 });
  store.refuel(5000);
  expect(store.fuel).toBe(65000);
});

test("CarStore: pressGas does nothing when fuel is 0", () => {
  const store = new CarStore({ id: "press-gas-empty-test", maxFuel: 65000, fuel: 0 });
  store.pressGas();
  expect(store.isGasPressed).toBe(false);
});

test("CarStore: shouldStopForLight false in chase", () => {
  const mapStore = { gameMode: "chase" };
  const store = new CarStore({ id: "stop-light-chase", maxFuel: 100, fuel: 100 });
  store.mapStore = mapStore;
  store.isTrafficLightOnScreen = true;
  store.trafficLightColor = "red";
  expect(store.shouldStopForLight).toBe(false);
});

test("CarStore: checkTrafficLight does not start pedestrian quest in chase", () => {
  const startPedestrianCrossingQuest = vi.fn();
  const mapStore = {
    gameMode: "chase",
    offsetX: 500,
    trafficLightColor: "red",
    isPedestrianCrossingQuestActive: false,
    isPoliceQuestActive: false,
    startPedestrianCrossingQuest,
    activeObjects: [
      {
        typeId: "traffic_light",
        worldX: 900,
      },
    ],
  };
  const store = new CarStore({ id: "ped-chase", maxFuel: 100, fuel: 100 });
  store.sirena = false;

  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

  store.checkTrafficLight(mapStore);

  expect(startPedestrianCrossingQuest).not.toHaveBeenCalled();
  randomSpy.mockRestore();
});
