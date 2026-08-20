import { expect, test } from "vitest";
import CarStore from "./carStore";

test("CarStore: addHelp increments helpCounts and sessionScore", () => {
  const store = new CarStore({ id: "test", maxFuel: 100, fuel: 100 });

  expect(store.sessionScore).toBe(0);
  expect(store.sessionCoins).toBe(0);

  store.addHelp("enemyChase");
  expect(store.helpCounts.enemyChase).toBe(1);
  expect(store.sessionScore).toBe(4);
  expect(store.sessionCoins).toBe(1);

  store.addHelp("criminalArrest");
  store.addHelp("pedestrianFine");
  expect(store.sessionScore).toBe(8);
  expect(store.sessionCoins).toBe(2);
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

test("CarStore: red light blocks gas until green", () => {
  const store = new CarStore({ id: "red-light-block", maxFuel: 100, fuel: 100 });
  store.mapStore = { lastViewportWidth: 1024 };
  store.isIgnitionOn = true;
  store.isTrafficLightOnScreen = true;
  store.trafficLightColor = "red";
  store.trafficLightDistance = 360;
  store.trafficLightGap = 80;
  store.pressGas();

  store.updatePhysics(0.016);
  expect(store.isGasPressed).toBe(false);
  expect(store.currentSpeed).toBe(0);

  store.pressGas();
  expect(store.isGasPressed).toBe(false);

  store.trafficLightColor = "green";
  store.pressGas();
  expect(store.isGasPressed).toBe(true);
});

test("CarStore: red light smooth brake stops 80px after car right edge", () => {
  const store = new CarStore({
    id: "red-light-smooth",
    maxFuel: 100,
    fuel: 100,
    friction: 160,
    maxSpeed: 400,
  });
  store.mapStore = { lastViewportWidth: 1024 };
  const carRight = 280;
  store.isIgnitionOn = true;
  store.gear = "2";
  store.isTrafficLightOnScreen = true;
  store.trafficLightColor = "red";
  store.trafficLightDistance = carRight + 350;
  store.trafficLightGap = 350;
  store.currentSpeed = 80;

  for (let i = 0; i < 800; i++) {
    store.updatePhysics(0.016);
    if (store.currentSpeed > 0) {
      store.trafficLightDistance -= store.currentSpeed * 0.016;
      store.trafficLightGap = store.trafficLightDistance - carRight;
    }
    if (store.currentSpeed === 0) break;
  }

  expect(store.currentSpeed).toBe(0);
  expect(store.trafficLightGap).toBeGreaterThanOrEqual(72);
  expect(store.trafficLightGap).toBeLessThanOrEqual(88);
});

test("CarStore: checkTrafficLight tracks gap below 300px ahead of car", () => {
  const mapStore = {
    offsetX: 1000,
    lastViewportWidth: 1024,
    trafficLightColor: "red",
    activeObjects: [{ typeId: "traffic_light", worldX: 1380 }],
  };
  const store = new CarStore({ id: "light-near", maxFuel: 100, fuel: 100 });

  store.checkTrafficLight(mapStore);

  expect(store.isTrafficLightOnScreen).toBe(true);
  expect(store.trafficLightDistance).toBe(380);
  expect(store.trafficLightGap).toBe(100);
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
