import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { runInAction } from 'mobx';
import MapStore from './mapStore';
import atmosphereStore from './atmosphereStore';
import ratioStore from './ratioStore';
import { buildInitialNextSpawnDistances } from './objects';
import {
  DISPATCH_CONFLICT_MESSAGE,
  DISPATCH_ORIENTATION_ALREADY_MESSAGE,
  DISPATCH_QUIET_MESSAGE,
  DISPATCH_RESPONSE_DELAY_SEC,
  EVACUATION_RATIO_MESSAGE,
} from './ratioConstants';
import { DISPATCH_ORIENTATION_CONFLICT_CHANCE } from './event.config';
import { createIdleParkingEvacuation } from './parkingZoneConstants';
import QuestCarStore from './questCarStore';

beforeEach(() => {
  atmosphereStore.setAtmosphere({ timeOfDay: 'day', weather: 'clear' });
});

afterEach(() => {
  ratioStore.dispose();
  vi.restoreAllMocks();
});
test('buildInitialNextSpawnDistances includes all object types', () => {
  const distances = buildInitialNextSpawnDistances();
  expect(distances.building).toBe(0);
  expect(distances.gas_station).toBe(30000);
  expect(distances.human_aggr1).toBe(17700);
  expect(distances.human1).toBe(150);
});

test('MapStore: nextSpawnDistances initialized from objectConfigs', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  expect(store.nextSpawnDistances.human_aggr2).toBe(25000);
  expect(store.nextSpawnDistances.traffic_light).toBe(8000);
});

test('MapStore: initQuestCrossing', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 5000;

  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  expect(store.pedestrianCrossingTargetObject).toBeNull();

  const obj = {
    uid: 'crossing_uid',
    typeId: 'traffic_light_quest_crossing',
    worldX: 5500,
    appeared: false,
  };
  store.activeObjects = [obj];

  window.__PLAYWRIGHT__ = true;
  store.__forcePedestrianCrossOnRed = true;
  expect(store.initQuestCrossing(obj)).toBe(true);
  delete window.__PLAYWRIGHT__;

  expect(store.isPedestrianCrossingQuestActive).toBe(true);
  expect(store.pedestrianCrossingTargetObject?.uid).toBe(obj.uid);
  expect(store.pedestrianCrossingTargetObject?.questCrossing).toBeTruthy();
  expect(store.pedestrianCrossingTargetObject?.questCrossing.crossesOnRed).toBe(true);
  expect(store.pedestrianCrossingTargetObject?.questCrossing.phase).toBe('waiting_red');
  expect(store.pedestrianCrossingTargetObject?.questCrossing.humanWorldX).toBe(
    5500 + 230 * 0.78,
  );
  expect(store.pedestrianCrossingTargetObject?.questCrossing.stopWorldX).toBe(
    5500 + 230 * 0.78 - 230 * 0.84,
  );
  expect(store.pedestrianCrossingTargetObject?.questCrossing.redWalkTimer).toBeNull();
  expect(store.pedestrianCrossingTargetObject?.questCrossing.greenSwitchTimer).toBeNull();
});

test('MapStore: finishPedestrianCrossingQuest', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const obj = {
    uid: 'crossing_uid',
    typeId: 'traffic_light_quest_crossing',
    worldX: 5500,
    appeared: true,
    questCrossing: {
      humanType: 'human1',
      crossesOnRed: true,
      phase: 'stopped',
      humanWorldX: 5400,
      trafficLightGreen: false,
      greenSwitchTimer: 0,
      stopWorldX: 5400,
      showFinishOverlay: true,
    },
  };
  store.activeObjects = [obj];
  store.isPedestrianCrossingQuestActive = true;
  store.pedestrianCrossingTargetObject = obj;

  const target = store.pedestrianCrossingTargetObject;
  store.finishPedestrianCrossingQuest();

  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  expect(store.pedestrianCrossingTargetObject).toBeNull();
  expect(target?.questCrossing.phase).toBe('finished');
  expect(target?.questCrossing.showFinishOverlay).toBe(false);
});

test('MapStore: handlePedestrianCrossingClick shows finish overlay', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const obj = {
    uid: 'crossing_uid',
    typeId: 'traffic_light_quest_crossing',
    worldX: 5500,
    appeared: true,
    questCrossing: {
      humanType: 'human1',
      crossesOnRed: true,
      phase: 'walking',
      humanWorldX: 5400,
      trafficLightGreen: false,
      greenSwitchTimer: 0,
      stopWorldX: 5400,
      showFinishOverlay: false,
    },
  };

  store.handlePedestrianCrossingClick(obj);

  expect(obj.questCrossing.phase).toBe('stopped');
  expect(obj.questCrossing.showFinishOverlay).toBe(true);
});

test('MapStore: questCarSpawnTimer initialized to 10', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarSpawnTimer).toBe(10);
  expect(store.civilianQuestCarSpawnTimer).toBe(5);
});

test('MapStore: removeQuestCarByIndex removes car and resets timer when array empty', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.questCars = [{ id: 1, deactivate: () => {} }, { id: 2, deactivate: () => {} }];
  
  store.removeQuestCarByIndex(0);
  expect(store.questCars.length).toBe(1);
  
  store.removeQuestCarByIndex(0);
  expect(store.questCars.length).toBe(0);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(10);
  expect(store.questCarSpawnTimer).toBeLessThanOrEqual(30);
  expect(store.civilianQuestCarSpawnTimer).toBeGreaterThanOrEqual(5);
  expect(store.civilianQuestCarSpawnTimer).toBeLessThanOrEqual(15);
});

test('MapStore: questCarActive field does not exist', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarActive).toBeUndefined();
});

test('MapStore: removeOffScreenQuestCars drops cars outside viewport', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.questCars = [
    { active: true, positionX: -300, uid: 'a', enemy: true },
    { active: true, positionX: 500, uid: 'b', enemy: false },
    { active: true, positionX: 1300, uid: 'c', enemy: false },
  ];

  store.removeOffScreenQuestCars(1024);

  expect(store.questCars.length).toBe(1);
  expect(store.questCars[0].uid).toBe('b');
});

test('MapStore: removeOffScreenQuestCars keeps civilian behind left edge', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.questCars = [
    { active: true, positionX: -400, uid: 'civilian-behind', enemy: false },
    { active: true, positionX: 500, uid: 'civilian-visible', enemy: false },
  ];

  store.removeOffScreenQuestCars(1024);

  expect(store.questCars.length).toBe(2);
  expect(store.questCars.map((c) => c.uid)).toContain('civilian-behind');
});

test('MapStore: spawnCivilianQuestCar creates civilian car', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.sessionElapsedSec = 30;
  
  const originalInnerWidth = window.innerWidth;
  window.innerWidth = 1024;
  
  store.spawnCivilianQuestCar();
  
  expect(store.questCars.length).toBe(1);
  expect(store.questCars[0].enemy).toBe(false);
  expect(store.civilianQuestCarSpawnTimer).toBeGreaterThanOrEqual(5);
  expect(store.civilianQuestCarSpawnTimer).toBeLessThanOrEqual(15);
  
  store.spawnCivilianQuestCar();
  expect(store.questCars.length).toBe(2);
  
  window.innerWidth = originalInnerWidth;
});

test('MapStore: spawnEnemyQuestCar creates enemy when spawn gates pass', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.sessionElapsedSec = 30;
  
  store.spawnEnemyQuestCar();
  
  expect(store.questCars.length).toBe(1);
  expect(store.questCars[0].enemy).toBe(true);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(10);
  expect(store.questCarSpawnTimer).toBeLessThanOrEqual(30);
});

test('MapStore: spawnEnemyQuestCar blocks enemy during active police quest', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.sessionElapsedSec = 30;
  store.isPoliceQuestActive = true;

  store.spawnEnemyQuestCar();

  expect(store.questCars.length).toBe(0);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(10);
});

test('MapStore: spawnEnemyQuestCar blocks enemy before 30s session', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.sessionElapsedSec = 5;

  store.spawnEnemyQuestCar();

  expect(store.questCars.length).toBe(0);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(10);
});

test('MapStore: spawnEnemyQuestCar blocks enemy before 20s in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.gameMode = 'chase';
  store.sessionElapsedSec = 14;

  store.spawnEnemyQuestCar();

  expect(store.questCars.length).toBe(0);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(8);
  expect(store.questCarSpawnTimer).toBeLessThanOrEqual(15);
});

test('MapStore: spawnEnemyQuestCar allows enemy at 20s in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.gameMode = 'chase';
  store.sessionElapsedSec = 20;

  store.spawnEnemyQuestCar();

  expect(store.questCars.length).toBe(1);
  expect(store.questCars[0].enemy).toBe(true);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(8);
  expect(store.questCarSpawnTimer).toBeLessThanOrEqual(15);
});

test('MapStore: spawnCivilianQuestCar allows civilian during active quest', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  store.isPoliceQuestActive = true;
  store.sessionElapsedSec = 30;

  store.spawnCivilianQuestCar();

  expect(store.questCars.length).toBe(1);
  expect(store.questCars[0].enemy).toBe(false);
});

test('MapStore: tickWorld accumulates sessionElapsedSec', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = {
    currentSpeed: 0,
    isStarCollectionUnlocked: false,
    totalQuestCompletions: 0,
  };

  store.tickWorld(store.carStore, 0.5, 1024);

  expect(store.sessionElapsedSec).toBe(0.5);
});

test('MapStore: spawnEnvironmentObjects skips human_aggr when pedestrian quest active', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.isPedestrianCrossingQuestActive = true;
  store.offsetX = 20000;
  store.nextSpawnDistances.human_aggr1 = 0;

  store.spawnEnvironmentObjects(1024);

  const policeAggro = store.activeObjects.filter((obj) =>
    /^human_aggr\d+$/.test(obj.typeId),
  );
  expect(policeAggro.length).toBe(0);
});

test('MapStore: initQuestCrossing blocked when human_aggr visible on screen', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 1000;
  const obj = {
    uid: 'crossing_uid',
    typeId: 'traffic_light_quest_crossing',
    worldX: 5500,
    appeared: false,
  };
  store.activeObjects = [
    { uid: 'aggr', typeId: 'human_aggr1', worldX: 1100, appeared: true },
    obj,
  ];

  expect(store.initQuestCrossing(obj)).toBe(false);
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  expect(store.pedestrianCrossingTargetObject).toBeNull();
});

test('MapStore: triggerAppearEvents keeps appeared false when quest crossing init blocked', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 1000;
  const obj = {
    uid: 'crossing_uid',
    typeId: 'traffic_light_quest_crossing',
    worldX: 5500,
    appeared: false,
  };
  store.activeObjects = [
    { uid: 'aggr', typeId: 'human_aggr1', worldX: 1100, appeared: true },
    obj,
  ];

  store.triggerAppearEvents(null);

  expect(obj.appeared).toBe(false);
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
});

test('MapStore: triggerAppearEvents starts quest crossing and marks appeared', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 5000;
  store.activeObjects = [
    {
      uid: 'crossing_uid',
      typeId: 'traffic_light_quest_crossing',
      worldX: 5500,
      appeared: false,
    },
  ];
  const crossing = store.activeObjects[0];

  store.triggerAppearEvents(null);

  expect(crossing.appeared).toBe(true);
  expect(store.isPedestrianCrossingQuestActive).toBe(true);
  expect(store.pedestrianCrossingTargetObject?.uid).toBe(crossing.uid);
});

test('MapStore: startQuest blocked when pedestrian quest active', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.isPedestrianCrossingQuestActive = true;
  const target = { uid: 'aggr', typeId: 'human_aggr1', worldX: 1200 };

  store.startQuest(target);

  expect(store.isPoliceQuestActive).toBe(false);
  expect(store.questTargetObject).toBeNull();
});

test('MapStore: hasVisiblePoliceAggroOnScreen detects on-screen human_aggr', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 1000;
  store.activeObjects = [
    { uid: 'aggr', typeId: 'human_aggr1', worldX: 1100, appeared: true },
  ];

  expect(store.hasVisiblePoliceAggroOnScreen()).toBe(true);

  store.activeObjects[0].worldX = 3000;
  expect(store.hasVisiblePoliceAggroOnScreen()).toBe(false);
});

test('MapStore: updateQuestCars does not filter or remove cars', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { currentSpeed: 60 };
  
  // Добавляем машины вручную
  const mockCar1 = {
    enemy: true,
    active: true,
    updatePosition: (dt, speed) => { mockCar1.positionX = (mockCar1.positionX || 0) + (mockCar1.currentSpeed - speed) * dt; },
    updateWheelRotation: () => {},
    currentSpeed: 80,
    positionX: 100,
  };
  const mockCar2 = {
    enemy: true,
    active: true,
    updatePosition: (dt, speed) => { mockCar2.positionX = (mockCar2.positionX || 0) + (mockCar2.currentSpeed - speed) * dt; },
    updateWheelRotation: () => {},
    currentSpeed: 50,
    positionX: 200,
  };
  
  store.questCars = [mockCar1, mockCar2];
  
  store.updateQuestCars(1);
  
  // Обе машины остались в массиве
  expect(store.questCars.length).toBe(2);
  // Позиции обновились
  expect(mockCar1.positionX).toBe(120); // 100 + (80-60)*1 = 120
  expect(mockCar2.positionX).toBe(190); // 200 + (50-60)*1 = 190
});

test('MapStore: checkQuestCarDistance sets questCarForArrest for enemy in [30, 280] range', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });

  const enemyInRange = { enemy: true, positionX: 150 };
  const enemyOutOfRange = { enemy: true, positionX: 400 };
  const civilian = { enemy: false, positionX: 100 };

  store.checkQuestCarDistance([enemyInRange, enemyOutOfRange, civilian]);

  expect(store.questCarForArrest).not.toBeNull();
  expect(store.questCarForArrest.positionX).toBe(150);
});

test('MapStore: checkQuestCarDistance clears questCarForArrest when no enemy in range', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.questCarForArrest = { enemy: true, positionX: 150 };

  const enemyOutOfRange = { enemy: true, positionX: 300 };
  store.checkQuestCarDistance([enemyOutOfRange]);

  expect(store.questCarForArrest).toBeNull();
});

test('MapStore: checkQuestCarDistance ignores non-enemy cars', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });

  const civilian = { enemy: false, positionX: 100 };
  store.checkQuestCarDistance([civilian]);

  expect(store.questCarForArrest).toBeNull();
});

test('MapStore: spawnEnvironmentObjects skips peaceful humans in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.gameMode = 'chase';
  store.offsetX = 10000;
  store.nextSpawnDistances.human1 = 0;

  store.spawnEnvironmentObjects(1024);

  const peacefulHumans = store.activeObjects.filter((obj) =>
    /^human\d+$/.test(obj.typeId),
  );
  expect(peacefulHumans.length).toBe(0);
});

test('MapStore: initParkingZone creates 4-8 spots with civilian cars only', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const obj = {
    uid: 'parking_uid',
    typeId: 'parking_zone',
    worldX: 16000,
    appeared: false,
    parkingSpotCount: 6,
  };
  store.activeObjects = [obj];

  const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

  window.__PLAYWRIGHT__ = true;
  store.__forceParkingIllegal = true;
  expect(store.initParkingZone(obj)).toBe(true);
  delete window.__PLAYWRIGHT__;
  randomSpy.mockRestore();

  expect(obj.parkingZone.spotCount).toBe(6);
  expect(obj.parkingZone.spots.length).toBe(6);
  expect(obj.parkingZone.totalWidth).toBe(6 * 382);

  const occupied = obj.parkingZone.spots.filter((spot) => spot.status !== 'empty');
  expect(occupied.length).toBe(6);
  occupied.forEach((spot) => {
    expect(spot.status).toBe('illegal');
    expect(['left', 'bottom', 'crooked']).toContain(spot.violationType);
    expect(spot.carData).toBeTruthy();
    expect(spot.carData.sirena).toBe(false);
  });
});

test('MapStore: initParkingZone illegal rate about 20% among occupied', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  let illegalCount = 0;
  let occupiedCount = 0;
  const trials = 200;

  for (let i = 0; i < trials; i += 1) {
    const obj = {
      uid: `parking_uid_${i}`,
      typeId: 'parking_zone',
      worldX: 16000 + i,
      appeared: false,
      parkingSpotCount: 8,
    };
    store.activeObjects = [obj];
    store.initParkingZone(obj);

    obj.parkingZone.spots.forEach((spot) => {
      if (spot.status === 'empty') return;
      occupiedCount += 1;
      if (spot.status === 'illegal') illegalCount += 1;
      if (spot.carData) {
        const civilian = store.getCivilianCars().some(
          (car) => car.urlBody === spot.carData.urlBody,
        );
        expect(civilian).toBe(true);
      }
    });
  }

  const illegalRate = illegalCount / occupiedCount;
  expect(illegalRate).toBeGreaterThan(0.12);
  expect(illegalRate).toBeLessThan(0.3);
});

test('MapStore: two-step parking evacuation flow', () => {
  vi.useFakeTimers();
  ratioStore.dispose();
  globalThis.__PARKING_EVAC_DEBUG_HOLD__ = false;
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 16000;
  let gasReleased = false;
  let helpType = null;
  store.carStore = {
    releaseGas: () => {
      gasReleased = true;
    },
    isGasPressed: false,
    currentSpeed: 50,
    addHelp: (type) => {
      helpType = type;
    },
  };

  const zoneObj = {
    uid: 'parking_uid',
    typeId: 'parking_zone',
    worldX: 16000,
    appeared: true,
    parkingZone: {
      spotCount: 1,
      spotWidth: 382,
      spotHeight: 122,
      totalWidth: 382,
      spots: [
        {
          index: 0,
          status: 'illegal',
          violationType: 'crooked',
          carData: store.createParkingCarStore(store.getCivilianCars()[0]),
          fined: false,
          fining: false,
        },
      ],
      pendingSpotIndex: null,
    },
  };
  store.activeObjects = [zoneObj];

  store.isPoliceQuestActive = true;
  store.selectParkingViolationTarget(zoneObj, 0);
  expect(store.parkingEvacuation.phase).toBe('idle');

  store.isPoliceQuestActive = false;
  store.selectParkingViolationTarget(zoneObj, 0);
  const spotsRef = store.parkingFineTargetZone.parkingZone.spots;
  expect(zoneObj.parkingZone.spots[0].fining).toBe(true);
  expect(zoneObj.parkingZone.pendingSpotIndex).toBe(0);
  expect(store.hasPendingEvacuationTarget()).toBe(true);
  expect(store.parkingEvacuation.phase).toBe('idle');
  expect(gasReleased).toBe(true);
  expect(store.carStore.currentSpeed).toBe(0);

  store.selectParkingViolationTarget(zoneObj, 0);
  expect(zoneObj.parkingZone.pendingSpotIndex).toBe(0);

  store.confirmParkingEvacuationViaRadio();
  expect(ratioStore.message).toBe(EVACUATION_RATIO_MESSAGE);
  expect(store.parkingEvacuation.phase).toBe('idle');

  ratioStore.onRatioDismiss();
  expect(store.parkingEvacuation.phase).toBe('spawn_delay');

  store.parkingEvacuation.spawnDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  expect(store.parkingEvacuation.phase).toBe('approaching');
  expect(store.parkingEvacuation.positionX).toBe(1024 + 200);

  const stopX = store.parkingEvacuation.stopPositionX;
  store.parkingEvacuation.positionX = stopX + 10;
  store.parkingEvacuation.currentSpeed = 500;
  store.updateParkingEvacuation(0.1);
  expect(store.parkingEvacuation.phase).toBe('loading');

  store.parkingEvacuation.loadDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  expect(store.parkingEvacuation.carOnPlatform).toBe(true);
  expect(store.parkingEvacuation.phase).toBe('loaded');

  store.parkingEvacuation.loadedSettleRemaining = 0;
  store.updateParkingEvacuation(0);
  expect(store.parkingEvacuation.phase).toBe('departing');

  store.parkingEvacuation.positionX = -500;
  store.parkingEvacuation.phase = 'departing';
  store.updateParkingEvacuation(0);
  expect(store.parkingEvacuation.phase).toBe('idle');
  expect(helpType).toBe('parkingFine');
  expect(spotsRef[0].fined).toBe(true);
  expect(spotsRef[0].carData).toBeNull();
  expect(store.parkingFineTargetZone).toBeNull();
  vi.useRealTimers();
});

test('MapStore: finalizeParkingEvacuation marks spot fined', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  let helpType = null;
  store.carStore = { addHelp: (type) => { helpType = type; } };

  const zoneObj = {
    uid: 'parking_uid',
    parkingZone: {
      spots: [{ fined: false, fining: true, carData: { urlBody: 'x' } }],
      pendingSpotIndex: 0,
    },
  };

  runInAction(() => {
    store.parkingFineTargetZone = zoneObj;
    store.parkingEvacuation = {
      ...store.parkingEvacuation,
      zoneUid: zoneObj.uid,
      spotIndex: 0,
      phase: 'departing',
    };
  });
  const spotsRef = store.parkingFineTargetZone.parkingZone.spots;
  store.finalizeParkingEvacuation();

  expect(helpType).toBe('parkingFine');
  expect(spotsRef[0].fined).toBe(true);
  expect(spotsRef[0].carData).toBeNull();
});

test('MapStore: two-step roadside breakdown evacuation flow', () => {
  vi.useFakeTimers();
  ratioStore.dispose();
  globalThis.__PARKING_EVAC_DEBUG_HOLD__ = false;
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 16000;
  let helpType = null;
  store.carStore = {
    releaseGas: () => {},
    isGasPressed: false,
    currentSpeed: 50,
    addHelp: (type) => {
      helpType = type;
    },
  };

  const breakdownObj = {
    uid: 'breakdown_uid',
    typeId: 'roadside_breakdown',
    worldX: 16000,
    appeared: true,
    roadsideBreakdown: {
      carData: store.createParkingCarStore(store.getCivilianCars()[0]),
      selected: false,
      helped: false,
    },
  };
  store.activeObjects = [breakdownObj];

  store.selectRoadsideBreakdownTarget(breakdownObj);
  expect(breakdownObj.roadsideBreakdown.selected).toBe(true);
  expect(store.hasPendingEvacuationTarget()).toBe(true);
  expect(store.parkingEvacuation.phase).toBe('idle');

  store.confirmParkingEvacuationViaRadio();
  expect(ratioStore.message).toBe(EVACUATION_RATIO_MESSAGE);

  ratioStore.onRatioDismiss();
  expect(store.parkingEvacuation.phase).toBe('spawn_delay');
  expect(store.parkingEvacuation.sourceKind).toBe('roadside');

  store.parkingEvacuation.spawnDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  const stopX = store.parkingEvacuation.stopPositionX;
  store.parkingEvacuation.positionX = stopX + 10;
  store.parkingEvacuation.currentSpeed = 500;
  store.updateParkingEvacuation(0.1);
  store.parkingEvacuation.loadDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  store.parkingEvacuation.loadedSettleRemaining = 0;
  store.updateParkingEvacuation(0);
  store.parkingEvacuation.positionX = -500;
  store.parkingEvacuation.phase = 'departing';
  store.updateParkingEvacuation(0);

  expect(helpType).toBe('roadsideHelp');
  expect(store.activeObjects.some((obj) => obj.uid === 'breakdown_uid')).toBe(
    false,
  );
  vi.useRealTimers();
});

test('MapStore: startQuest allowed after roadside evacuation completes', () => {
  vi.useFakeTimers();
  ratioStore.dispose();
  globalThis.__PARKING_EVAC_DEBUG_HOLD__ = false;

  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.lastViewportWidth = 1024;
  store.offsetX = 16000;
  store.carStore = {
    releaseGas: () => {},
    isGasPressed: false,
    currentSpeed: 0,
    addHelp: () => {},
  };

  const breakdownObj = {
    uid: 'breakdown_uid',
    typeId: 'roadside_breakdown',
    worldX: 16000,
    appeared: true,
    roadsideBreakdown: {
      carData: store.createParkingCarStore(store.getCivilianCars()[0]),
      selected: false,
      helped: false,
    },
  };
  store.activeObjects = [breakdownObj];

  store.selectRoadsideBreakdownTarget(breakdownObj);
  store.confirmParkingEvacuationViaRadio();
  ratioStore.onRatioDismiss();
  store.parkingEvacuation.spawnDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  store.parkingEvacuation.positionX = store.parkingEvacuation.stopPositionX;
  store.parkingEvacuation.phase = 'loading';
  store.parkingEvacuation.loadDelayRemaining = 0;
  store.updateParkingEvacuation(0);
  store.parkingEvacuation.loadedSettleRemaining = 0;
  store.updateParkingEvacuation(0);
  store.parkingEvacuation.positionX = -500;
  store.parkingEvacuation.phase = 'departing';
  store.updateParkingEvacuation(0);

  expect(store.isParkingFineActive()).toBe(false);
  expect(store.hasPendingEvacuationTarget()).toBe(false);

  const aggrTarget = { uid: 'aggr_uid', typeId: 'human_aggr1', worldX: 17000 };
  store.startQuest(aggrTarget);
  expect(store.isPoliceQuestActive).toBe(true);
  expect(store.questTargetObject?.uid).toBe('aggr_uid');

  vi.useRealTimers();
});

test('MapStore: second roadside breakdown can be selected after first evacuation', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = {
    releaseGas: () => {},
    isGasPressed: false,
    currentSpeed: 0,
  };

  const secondBreakdown = {
    uid: 'breakdown_uid_2',
    typeId: 'roadside_breakdown',
    worldX: 18000,
    appeared: true,
    roadsideBreakdown: {
      carData: store.createParkingCarStore(store.getCivilianCars()[0]),
      selected: false,
      helped: false,
    },
  };
  store.activeObjects = [secondBreakdown];

  store.selectRoadsideBreakdownTarget(secondBreakdown);
  expect(secondBreakdown.roadsideBreakdown.selected).toBe(true);
  expect(store.hasPendingEvacuationTarget()).toBe(true);
});

test('MapStore: frozen world keeps quest cars moving forward', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { currentSpeed: 200 };
  store.parkingEvacuation = { ...createIdleParkingEvacuation(), phase: 'approaching' };

  const questCar = new QuestCarStore(store.getCivilianCars()[0]);
  questCar.positionX = 400;
  questCar.currentSpeed = 80;
  store.questCars = [questCar];

  store.updateQuestCars(1);

  expect(questCar.positionX).toBeGreaterThan(400);
});

test('MapStore: spawnEnvironmentObjects skips roadside_breakdown in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.gameMode = 'chase';
  store.offsetX = 20000;
  store.nextSpawnDistances.roadside_breakdown = 0;

  store.spawnEnvironmentObjects(1024);

  const breakdowns = store.activeObjects.filter(
    (obj) => obj.typeId === 'roadside_breakdown',
  );
  expect(breakdowns.length).toBe(0);
});

test('MapStore: spawnEnvironmentObjects skips parking_zone in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.gameMode = 'chase';
  store.offsetX = 20000;
  store.nextSpawnDistances.parking_zone = 0;

  store.spawnEnvironmentObjects(1024);

  const parkingZones = store.activeObjects.filter(
    (obj) => obj.typeId === 'parking_zone',
  );
  expect(parkingZones.length).toBe(0);
});

test('MapStore: startTrafficLightTimer no-op in chase', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.gameMode = 'chase';
  store.startTrafficLightTimer();
  expect(store.trafficLightTimer).toBeNull();
});

test('MapStore: updateRoadMarkings spawns segments to the right of viewport', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const viewportWidth = 1024;

  store.updateRoadMarkings(viewportWidth);

  expect(store.roadMarkings.length).toBeGreaterThan(0);
  expect(store.roadMarkings[0].worldX).toBe(-180);
  const lastMark = store.roadMarkings[store.roadMarkings.length - 1];
  expect(lastMark.worldX + 180).toBeGreaterThanOrEqual(viewportWidth);
});

test('MapStore: updateRoadMarkings despawns segments past left edge + 100px', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const viewportWidth = 1024;

  store.updateRoadMarkings(viewportWidth);

  runInAction(() => {
    store.offsetX = 500;
  });
  store.updateRoadMarkings(viewportWidth);

  expect(store.roadMarkings.length).toBeGreaterThan(0);
  expect(store.roadMarkings[0].worldX).toBe(360);
  expect(store.roadMarkings.some((mark) => mark.worldX < 360)).toBe(false);

  runInAction(() => {
    store.offsetX = 2000;
  });
  store.updateRoadMarkings(viewportWidth);

  expect(store.roadMarkings.every((mark) => mark.worldX + 180 > 1900)).toBe(
    true,
  );
});

function advanceDispatchRequestToResponse() {
  ratioStore.onRatioDismiss();
  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);
}

test('MapStore: dispatch conflict spawns orientation target', () => {
  vi.useFakeTimers();
  ratioStore.dispose();

  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.offsetX = 5000;
  store.gameMode = 'free';

  const randomSpy = vi.spyOn(Math, 'random');
  randomSpy.mockReturnValueOnce(0);
  randomSpy.mockReturnValueOnce(DISPATCH_ORIENTATION_CONFLICT_CHANCE - 0.01);
  randomSpy.mockReturnValueOnce(0);

  store.handleRatioPress();
  expect(ratioStore.message).toBeTruthy();
  advanceDispatchRequestToResponse();

  expect(ratioStore.message).toBe(DISPATCH_CONFLICT_MESSAGE);
  ratioStore.onRatioDismiss();
  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);

  expect(store.orientationQuest.active).toBe(true);
  expect(store.activeObjects.some((obj) => obj.orientationSpawn)).toBe(true);

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test('MapStore: dispatch quiet path does not spawn orientation target', () => {
  vi.useFakeTimers();
  ratioStore.dispose();

  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.offsetX = 5000;
  store.gameMode = 'free';

  const randomSpy = vi.spyOn(Math, 'random');
  randomSpy.mockReturnValueOnce(0);
  randomSpy.mockReturnValueOnce(DISPATCH_ORIENTATION_CONFLICT_CHANCE + 0.5);

  store.handleRatioPress();
  advanceDispatchRequestToResponse();

  expect(ratioStore.message).toBe(DISPATCH_QUIET_MESSAGE);
  expect(store.orientationQuest.active).toBe(false);
  expect(store.activeObjects.some((obj) => obj.orientationSpawn)).toBe(false);

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test('MapStore: active orientation radio shows already message without roll', () => {
  vi.useFakeTimers();
  ratioStore.dispose();

  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.gameMode = 'free';
  store.orientationQuest = {
    active: true,
    targetUid: 'orientation_uid',
    targetWorldX: 7000,
  };

  const randomSpy = vi.spyOn(Math, 'random');
  store.handleRatioPress();

  expect(randomSpy).not.toHaveBeenCalled();
  expect(ratioStore.message).toBe(DISPATCH_ORIENTATION_ALREADY_MESSAGE);
  expect(store.activeObjects.some((obj) => obj.orientationSpawn)).toBe(false);

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test('MapStore: finishQuest clears orientation quest for orientation target', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  const target = {
    uid: 'orientation_uid',
    typeId: 'human_aggr1',
    orientationSpawn: true,
  };

  runInAction(() => {
    store.isPoliceQuestActive = true;
    store.questTargetObject = target;
    store.orientationQuest = {
      active: true,
      targetUid: target.uid,
      targetWorldX: 7000,
    };
  });

  store.finishQuest();

  expect(store.orientationQuest.active).toBe(false);
  expect(store.isPoliceQuestActive).toBe(false);
});
