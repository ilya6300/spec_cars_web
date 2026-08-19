import { expect, test, vi } from "vitest";
import { TutorialStore } from "./tutorialStore";
import CarStore from "./carStore";

function createCarStore(overrides = {}) {
  const store = new CarStore({ id: "tutorial-test", maxFuel: 65000, fuel: 65000 });
  Object.assign(store, overrides);
  return store;
}

function createMapStore(overrides = {}) {
  return {
    offsetX: 1000,
    isPoliceQuestActive: false,
    isPedestrianCrossingQuestActive: false,
    isQuestArrestActive: false,
    isRefueling: false,
    questCars: [],
    activeObjects: [],
    ...overrides,
  };
}

test("TutorialStore: block A idle triggers ignition step", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore();
  const mapStore = createMapStore();

  for (let i = 0; i < 6; i += 1) {
    tutorial.tick(1, carStore, mapStore, 1024);
  }

  expect(tutorial.currentStep).toBe("ignition");
  expect(tutorial.blockADone).toBe(false);
});

test("TutorialStore: block B completes without global done", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore({ sirena: false, gear: "1" });
  const mapStore = createMapStore({
    questCars: [{ enemy: true, active: true }],
  });

  tutorial.blockADone = true;
  tutorial.currentStep = "siren";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  carStore.sirena = true;
  tutorial.tick(0.1, carStore, mapStore, 1024);
  expect(tutorial.currentStep).toBe("gear-4");

  carStore.gear = "4";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.enemyBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
  expect(tutorial.isTutorialComplete).toBe(false);
});

test("TutorialStore: block C gas_station visible shows gas-station step after block A", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const mapStore = createMapStore({
    activeObjects: [{ typeId: "gas_station", worldX: 1500 }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.currentStep).toBe("gas-station");
  expect(tutorial.refuelBlockDone).toBe(false);
});

test("TutorialStore: block C does not override block A gas-pedal step", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore();
  const mapStore = createMapStore({
    activeObjects: [{ typeId: "gas_station", worldX: 1500 }],
  });

  tutorial.currentStep = "gas-pedal";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.currentStep).toBe("gas-pedal");
});

test("TutorialStore: block C completes when refueling starts", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const mapStore = createMapStore({
    isRefueling: true,
    activeObjects: [{ typeId: "gas_station", worldX: 1500 }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.refuelBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
});

test("TutorialStore: block D bandit in engage range releases gas once and shows pointer after block A", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  carStore.pressGas();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const mapStore = createMapStore({
    activeObjects: [{ typeId: "human_aggr3", worldX: 1200 }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).toHaveBeenCalledTimes(1);
  expect(tutorial.currentStep).toBe("roadside-bandit");
  expect(tutorial.banditTargetTypeId).toBe("human_aggr3");
  expect(tutorial.banditTargetSelector).toBe('[data-type="human_aggr3"]');

  releaseGasSpy.mockClear();
  carStore.pressGas();
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(carStore.isGasPressed).toBe(true);
  expect(tutorial.currentStep).toBe("roadside-bandit");
});

test("TutorialStore: block D bandit works during active block B without siren", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.currentStep = "siren";
  tutorial.enemyBlockDone = false;
  const carStore = createCarStore({ sirena: false });
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const mapStore = createMapStore({
    activeObjects: [{ typeId: "human_aggr3", worldX: 1200 }],
    questCars: [{ enemy: true, active: true }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.currentStep).toBe("roadside-bandit");
  expect(tutorial.banditTargetTypeId).toBe("human_aggr3");
  expect(tutorial.highlightTarget).toBe("roadside-bandit");
  expect(releaseGasSpy).toHaveBeenCalledTimes(1);

  releaseGasSpy.mockClear();
  carStore.pressGas();
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(carStore.isGasPressed).toBe(true);
});

test("TutorialStore: block D does not override block A gas-pedal step", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const mapStore = createMapStore({
    activeObjects: [{ typeId: "human_aggr3", worldX: 1200 }],
  });

  tutorial.currentStep = "gas-pedal";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(tutorial.currentStep).toBe("gas-pedal");
});

test("TutorialStore: block D bandit far on screen does not release gas", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  carStore.pressGas();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const mapStore = createMapStore({
    activeObjects: [{ typeId: "human_aggr3", worldX: 2100 }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(tutorial.currentStep).not.toBe("roadside-bandit");
});

test("TutorialStore: block D bandit too close on left does not release gas", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const mapStore = createMapStore({
    offsetX: 1000,
    activeObjects: [{ typeId: "human_aggr3", worldX: 1080 }],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(tutorial.currentStep).not.toBe("roadside-bandit");
});

test("TutorialStore: suppresses driving blocks while bandit visible", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;

  const mapStore = createMapStore({
    activeObjects: [{ typeId: "human_aggr1", worldX: 1800 }],
  });

  expect(tutorial.shouldSuppressDrivingBlocks(mapStore, 1024)).toBe(true);

  tutorial.banditBlockDone = true;
  expect(tutorial.shouldSuppressDrivingBlocks(mapStore, 1024)).toBe(false);
});

test("TutorialStore: block D completes on police quest click", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const mapStore = createMapStore({
    isPoliceQuestActive: true,
    activeObjects: [{ typeId: "human_aggr1", worldX: 1200 }],
  });

  tutorial.currentStep = "roadside-bandit";
  tutorial.banditTargetTypeId = "human_aggr1";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.banditBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
  expect(tutorial.banditTargetTypeId).toBeNull();
});

test("TutorialStore: block E violator quest stops gas immediately on waiting_red after block A", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  carStore.pressGas();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const questCrossing = {
    crossesOnRed: true,
    phase: "waiting_red",
    trafficLightGreen: false,
    showFinishOverlay: false,
  };
  const mapStore = createMapStore({
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: {
      worldX: 1200,
      questCrossing,
    },
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).toHaveBeenCalledTimes(1);
  expect(tutorial.currentStep).not.toBe("pedestrian-human");

  releaseGasSpy.mockClear();
  carStore.pressGas();
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(carStore.isGasPressed).toBe(true);
});

test("TutorialStore: block E violator quest does not release gas far from crossing", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  carStore.pressGas();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const questCrossing = {
    crossesOnRed: true,
    phase: "waiting_red",
    trafficLightGreen: false,
    showFinishOverlay: false,
  };
  const mapStore = createMapStore({
    offsetX: 1000,
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: {
      worldX: 2500,
      questCrossing,
    },
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).not.toHaveBeenCalled();
  expect(carStore.isGasPressed).toBe(true);
});

test("TutorialStore: block E pedestrian walking on red shows pointer after block A", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  carStore.pressGas();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");

  const questCrossing = {
    crossesOnRed: true,
    phase: "walking",
    trafficLightGreen: false,
    showFinishOverlay: false,
  };
  const mapStore = createMapStore({
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: {
      worldX: 1200,
      questCrossing,
    },
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(releaseGasSpy).toHaveBeenCalledTimes(1);
  expect(tutorial.currentStep).toBe("pedestrian-human");
});

test("TutorialStore: block E completes after pedestrian fine overlay", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();

  const questCrossing = {
    crossesOnRed: true,
    phase: "stopped",
    trafficLightGreen: false,
    showFinishOverlay: true,
  };
  const mapStore = createMapStore({
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: { worldX: 1200, questCrossing },
  });

  tutorial.currentStep = "pedestrian-human";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.pedestrianBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
});

test("TutorialStore: pedestrian block runs during pedestrian quest after block A", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();

  const questCrossing = {
    crossesOnRed: true,
    phase: "walking",
    trafficLightGreen: false,
    showFinishOverlay: false,
  };
  const mapStore = createMapStore({
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: { worldX: 1200, questCrossing },
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.currentStep).toBe("pedestrian-human");
});

test("TutorialStore: gas-pedal completes while pedestrian quest releases gas", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore();
  carStore.pressGas();

  const questCrossing = {
    crossesOnRed: true,
    phase: "waiting_red",
    trafficLightGreen: false,
    showFinishOverlay: false,
  };
  const mapStore = createMapStore({
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: { questCrossing },
  });

  tutorial.currentStep = "gas-pedal";
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.blockADone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
});

test("TutorialStore: highlightTarget hidden during police quest modal", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.currentStep = "gas-station";
  tutorial.modalBlocking = true;

  expect(tutorial.highlightTarget).toBeNull();
});

test("TutorialStore: block A does not repeat after driving and stopping idle", () => {
  const tutorial = new TutorialStore();
  const carStore = createCarStore();
  const mapStore = createMapStore();

  tutorial.currentStep = "gas-pedal";
  carStore.pressGas();
  mapStore.offsetX = 1400;
  tutorial.tick(0.1, carStore, mapStore, 1024);

  expect(tutorial.blockADone).toBe(true);
  expect(tutorial.currentStep).toBeNull();

  carStore.releaseGas();
  carStore.currentSpeed = 0;

  for (let i = 0; i < 6; i += 1) {
    tutorial.tick(1, carStore, mapStore, 1024);
  }

  expect(tutorial.currentStep).not.toBe("gear-2");
  expect(tutorial.currentStep).not.toBe("gas-pedal");
  expect(tutorial.currentStep).not.toBe("ignition");
});

test("TutorialStore: isTutorialComplete when all blocks done", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.enemyBlockDone = true;
  tutorial.refuelBlockDone = true;
  tutorial.banditBlockDone = true;
  tutorial.pedestrianBlockDone = true;
  tutorial.parkingBlockDone = true;
  tutorial.roadsideBlockDone = true;

  expect(tutorial.isTutorialComplete).toBe(true);
  expect(tutorial.highlightTarget).toBeNull();
});

test("TutorialStore: parking tutorial flow", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const releaseGasSpy = vi.spyOn(carStore, "releaseGas");
  const mapStore = createMapStore({
    activeObjects: [
      {
        uid: "parking_zone_uid",
        typeId: "parking_zone",
        worldX: 1500,
        parkingZone: {
          spots: [
            {
              index: 0,
              status: "illegal",
              fined: false,
              fining: false,
            },
          ],
        },
      },
    ],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);
  expect(tutorial.currentStep).toBe("parking-violation");
  expect(tutorial.parkingTutorialZoneUid).toBe("parking_zone_uid");
  expect(tutorial.parkingTutorialSpotIndex).toBe(0);
  expect(tutorial.parkingViolationSelector).toBe(
    '[data-type="parking-violation-car"][data-zone-uid="parking_zone_uid"][data-spot-index="0"]',
  );
  expect(releaseGasSpy).toHaveBeenCalled();

  tutorial.onParkingViolationClicked();
  expect(tutorial.currentStep).toBe("ratio-after-parking");

  tutorial.onRatioClicked();
  expect(tutorial.parkingBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
});

test("TutorialStore: roadside tutorial waits for parking priority", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  const carStore = createCarStore();
  const mapStore = createMapStore({
    activeObjects: [
      {
        typeId: "parking_zone",
        worldX: 1500,
        parkingZone: {
          spots: [{ status: "illegal", fined: false, fining: false }],
        },
      },
      {
        typeId: "roadside_breakdown",
        worldX: 1600,
        roadsideBreakdown: { helped: false, selected: false },
      },
    ],
  });

  tutorial.tick(0.1, carStore, mapStore, 1024);
  expect(tutorial.currentStep).toBe("parking-violation");

  tutorial.parkingBlockDone = true;
  tutorial.currentStep = null;
  tutorial.tick(0.1, carStore, mapStore, 1024);
  expect(tutorial.currentStep).toBe("roadside-breakdown");
});

test("TutorialStore: roadside tutorial ratio step completes block", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.currentStep = "roadside-breakdown";

  tutorial.onRoadsideBreakdownClicked();
  expect(tutorial.currentStep).toBe("ratio-after-breakdown");

  tutorial.onRatioClicked();
  expect(tutorial.roadsideBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
});

test("TutorialStore: siren timeout skips block B without gear-4", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.currentStep = "siren";
  const carStore = createCarStore({ sirena: false });

  tutorial.tick(4.1, carStore, createMapStore(), 1024);

  expect(tutorial.enemyBlockDone).toBe(true);
  expect(tutorial.currentStep).toBeNull();
  expect(tutorial.currentStep).not.toBe("gear-4");
});

test("TutorialStore: siren pressed within timeout advances to gear-4", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.currentStep = "siren";
  const carStore = createCarStore({ sirena: false });

  tutorial.tick(2, carStore, createMapStore(), 1024);
  expect(tutorial.currentStep).toBe("siren");

  carStore.sirena = true;
  tutorial.tick(0.1, carStore, createMapStore(), 1024);
  expect(tutorial.currentStep).toBe("gear-4");
});

test("TutorialStore: isTutorialComplete requires parking and roadside blocks", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.enemyBlockDone = true;
  tutorial.refuelBlockDone = true;
  tutorial.banditBlockDone = true;
  tutorial.pedestrianBlockDone = true;

  expect(tutorial.isTutorialComplete).toBe(false);
});

test("TutorialStore: reset clears all block flags", () => {
  const tutorial = new TutorialStore();
  tutorial.blockADone = true;
  tutorial.enemyBlockDone = true;
  tutorial.refuelBlockDone = true;
  tutorial.banditBlockDone = true;
  tutorial.pedestrianBlockDone = true;
  tutorial.banditTargetTypeId = "human_aggr1";
  tutorial.currentStep = "gas-station";

  tutorial.reset();

  expect(tutorial.blockADone).toBe(false);
  expect(tutorial.enemyBlockDone).toBe(false);
  expect(tutorial.refuelBlockDone).toBe(false);
  expect(tutorial.banditBlockDone).toBe(false);
  expect(tutorial.pedestrianBlockDone).toBe(false);
  expect(tutorial.parkingBlockDone).toBe(false);
  expect(tutorial.roadsideBlockDone).toBe(false);
  expect(tutorial.sirenStepSeconds).toBe(0);
  expect(tutorial.banditTargetTypeId).toBeNull();
  expect(tutorial.currentStep).toBeNull();
});
