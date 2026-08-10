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

test("CarStore: red light releases gas once without blocking re-press", () => {
  const store = new CarStore({ id: "red-light-once", maxFuel: 100, fuel: 100 });
  store.isIgnitionOn = true;
  store.isTrafficLightOnScreen = true;
  store.trafficLightColor = "red";
  store.pressGas();

  store.updatePhysics(0.016);
  expect(store.isGasPressed).toBe(false);

  store.pressGas();
  store.updatePhysics(0.016);
  expect(store.isGasPressed).toBe(true);
});

test("CarStore: red light does not release gas with siren", () => {
  const store = new CarStore({ id: "red-light-siren", maxFuel: 100, fuel: 100 });
  store.isIgnitionOn = true;
  store.isTrafficLightOnScreen = true;
  store.trafficLightColor = "red";
  store.sirena = true;
  store.pressGas();

  store.updatePhysics(0.016);
  expect(store.isGasPressed).toBe(true);
});

test("CarStore: checkTrafficLight tracks only regular traffic lights", () => {
  const mapStore = {
    offsetX: 500,
    trafficLightColor: "red",
    activeObjects: [
      {
        typeId: "traffic_light_quest_crossing",
        worldX: 900,
      },
    ],
  };
  const store = new CarStore({ id: "quest-crossing-light", maxFuel: 100, fuel: 100 });

  store.checkTrafficLight(mapStore);

  expect(store.isTrafficLightOnScreen).toBe(false);
  expect(store.trafficLightColor).toBeNull();
});
