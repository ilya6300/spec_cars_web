import { expect, test } from 'vitest';
import QuestCarStore from './questCarStore';
import {
  TRAFFIC_LIGHT_GREEN_RESUME_MAX,
  TRAFFIC_LIGHT_GREEN_RESUME_MIN,
  TRAFFIC_CAR_WIDTH_DESKTOP_PX,
} from './trafficLightConstants';

const civilianCarData = {
  id: 2,
  type: 'car',
  name: 'Красный автомобиль',
  urlBody: '',
  urlShell: '',
  maxSpeed: 58,
  minSpeed: 40,
  enemy: false,
};

const enemyCarData = {
  id: 0,
  type: 'car',
  name: 'Красный гоночный автомобиль',
  urlBody: '',
  urlShell: '',
  maxSpeed: 130,
  minSpeed: 105,
  enemy: true,
  speedMultiplier: 6.43,
};

function makeTrafficMapStore({
  offsetX = 1000,
  trafficLightColor = 'red',
  lightWorldX = 1380,
  trafficLightOnTheMap = true,
  activeObjects = [{ typeId: 'traffic_light', worldX: lightWorldX }],
} = {}) {
  return {
    offsetX,
    trafficLightColor,
    trafficLightOnTheMap,
    activeObjects,
  };
}

test('QuestCarStore: initialization with enemy=false', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);

  expect(store.id).toBe(2);
  expect(store.type).toBe('car');
  expect(store.name).toBe('Красный автомобиль');
  expect(store.enemy).toBe(false);
  expect(store.currentSpeed).toBeGreaterThanOrEqual(store.minSpeed);
  expect(store.currentSpeed).toBeLessThanOrEqual(store.maxSpeed);
  expect(store.active).toBe(true);
  expect(store.wheelRotation).toBe(0);
});

test('QuestCarStore: initialization with enemy=true', () => {
  const carData = { id: 0, type: 'car', name: 'Красный гоночный автомобиль', urlBody: '', urlShell: '', maxSpeed: 130, minSpeed: 105, enemy: true, speedMultiplier: 6.43 };
  const store = new QuestCarStore(carData);

  expect(store.id).toBe(0);
  expect(store.type).toBe('car');
  expect(store.name).toBe('Красный гоночный автомобиль');
  expect(store.enemy).toBe(true);
  // currentSpeed умножается на speedMultiplier (6.43), поэтому выходит за рамки maxSpeed
  expect(store.currentSpeed).toBeGreaterThan(0);
  expect(store.active).toBe(true);
});

test('QuestCarStore: spawn method sets position and speed', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);

  store.spawn(100, 50);

  expect(store.positionX).toBe(100);
  expect(store.currentSpeed).toBe(50);
  expect(store.active).toBe(true);
});

test('QuestCarStore: updatePosition for enemy=false (civilian, relative speed)', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  // relativeSpeed = 80 - 60 = 20, positionX = 100 + 20 = 120
  expect(store.positionX).toBe(120);
});

test('QuestCarStore: updatePosition for enemy=true (enemy, relative speed)', () => {
  const carData = { id: 0, type: 'car', name: 'Красный гоночный автомобиль', urlBody: '', urlShell: '', maxSpeed: 130, minSpeed: 105, enemy: true, speedMultiplier: 6.43 };
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: updateWheelRotation', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 50);

  store.updateWheelRotation(1);

  expect(store.wheelRotation).toBe(125);
});

test('QuestCarStore: deactivate method', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 50);

  store.deactivate();

  expect(store.active).toBe(false);
});

test('QuestCarStore: wheel rotation cycles at 360 degrees', () => {
  const carData = { id: 99, type: 'test', name: 'Test', urlBody: '', urlShell: '', maxSpeed: 100, minSpeed: 100, enemy: false };
  const store = new QuestCarStore(carData);
  
  expect(store.currentSpeed).toBeGreaterThanOrEqual(100);
  expect(store.currentSpeed).toBeLessThanOrEqual(100);

  store.spawn(100, 100);
  expect(store.currentSpeed).toBeGreaterThanOrEqual(100);
  expect(store.currentSpeed).toBeLessThanOrEqual(100);
  expect(store.wheelRotation).toBe(0);

  store.updateWheelRotation(1);
  expect(store.wheelRotation).toBe(250);

  store.updateWheelRotation(1);
  expect(store.wheelRotation).toBe(140);
});

test('QuestCarStore: direction logic for enemy=false (civilian, relative speed)', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  // relativeSpeed = 80 - 60 = 20, positionX = 100 + 20 = 120
  store.updatePosition(1, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: direction logic for enemy=true (enemy, relative speed)', () => {
  const carData = { id: 0, type: 'car', name: 'Красный гоночный автомобиль', urlBody: '', urlShell: '', maxSpeed: 130, minSpeed: 105, enemy: true, speedMultiplier: 6.43 };
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: direction logic with deltaTime fractions (relative)', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 100);

  // relativeSpeed = 100 - 60 = 40, deltaTime = 0.5, delta = 20, positionX = 100 + 20 = 120
  store.updatePosition(0.5, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: direction logic for enemy=true with deltaTime (relative)', () => {
  const carData = { id: 0, type: 'car', name: 'Красный гоночный автомобиль', urlBody: '', urlShell: '', maxSpeed: 130, minSpeed: 105, enemy: true, speedMultiplier: 6.43 };
  const store = new QuestCarStore(carData);
  store.spawn(100, 100);

  store.updatePosition(0.5, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: currentSpeed is randomized in constructor', () => {
  const carData = { id: 99, type: 'test', name: 'Test', urlBody: '', urlShell: '', maxSpeed: 100, minSpeed: 50, enemy: false };
  const store1 = new QuestCarStore(carData);
  const store2 = new QuestCarStore(carData);

  expect(store1.currentSpeed).toBeGreaterThanOrEqual(50);
  expect(store1.currentSpeed).toBeLessThanOrEqual(100);
  expect(store2.currentSpeed).toBeGreaterThanOrEqual(50);
  expect(store2.currentSpeed).toBeLessThanOrEqual(100);
});

test('QuestCarStore: constructor does not contain removal-related fields', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);

  expect(store.lastVisibleTime).toBeUndefined();
  expect(store.dismissed).toBeUndefined();
  expect(typeof store.updateVisibility).toBe('undefined');
});

test('QuestCarStore: multiple cars can exist simultaneously', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const car1 = new QuestCarStore(carData);
  const car2 = new QuestCarStore(carData);
  const car3 = new QuestCarStore(carData);

  car1.spawn(100, 50);
  car2.spawn(200, 60);
  car3.spawn(300, 70);

  expect(car1.active).toBe(true);
  expect(car2.active).toBe(true);
  expect(car3.active).toBe(true);
  expect(car1.positionX).toBe(100);
  expect(car2.positionX).toBe(200);
  expect(car3.positionX).toBe(300);
});

test('QuestCarStore: cars are not removed after going off screen', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(-10000, 80);

  // Машина далеко за экраном, но active остаётся true
  expect(store.active).toBe(true);

  // Обновление позиции не меняет active
  store.updatePosition(1, 60);
  expect(store.active).toBe(true);
});

test('QuestCarStore: updatePosition works identically for all cars', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const car1 = new QuestCarStore(carData);
  const car2 = new QuestCarStore(carData);

  car1.spawn(100, 80);
  car2.spawn(200, 80);

  car1.updatePosition(1, 60);
  car2.updatePosition(1, 60);

  // relativeSpeed = 80 - 60 = 20
  expect(car1.positionX).toBe(120);
  expect(car2.positionX).toBe(220);
});

test('QuestCarStore: civilian smooth brake stops 80px before traffic light', () => {
  const store = new QuestCarStore(civilianCarData);
  store.spawn(50, 80);
  store.targetSpeed = 80;

  const mapStore = makeTrafficMapStore({
    lightWorldX: 1380,
    offsetX: 1000,
  });
  const lightScreenX = 380;
  const carWidth = TRAFFIC_CAR_WIDTH_DESKTOP_PX;
  let gapToLight = 350;

  for (let i = 0; i < 800; i++) {
    store.positionX = lightScreenX - carWidth - gapToLight;
    store.updateCivilianTrafficLight(0.016, mapStore);
    if (store.currentSpeed > 0) {
      gapToLight -= store.currentSpeed * 0.016;
    }
    if (store.currentSpeed === 0) break;
  }

  expect(store.currentSpeed).toBe(0);
  expect(gapToLight).toBeGreaterThanOrEqual(72);
  expect(gapToLight).toBeLessThanOrEqual(88);
  expect(store.stoppedAtRedLight).toBe(true);
});

test('QuestCarStore: enemy=true ignores traffic light braking', () => {
  const store = new QuestCarStore(enemyCarData);
  store.spawn(900, 200);

  const mapStore = makeTrafficMapStore();
  const speedBefore = store.currentSpeed;

  store.updateCivilianTrafficLight(0.016, mapStore);

  expect(store.currentSpeed).toBe(speedBefore);
});

test('QuestCarStore: civilian ignores quest crossing traffic light', () => {
  const store = new QuestCarStore(civilianCarData);
  store.spawn(900, 80);

  const mapStore = makeTrafficMapStore({
    activeObjects: [{ typeId: 'traffic_light_quest_crossing', worldX: 1380 }],
  });

  store.updateCivilianTrafficLight(0.016, mapStore);

  expect(store.currentSpeed).toBe(80);
  expect(store.stoppedAtRedLight).toBe(false);
});

test('QuestCarStore: civilian waits random delay after green before moving', () => {
  const store = new QuestCarStore(civilianCarData);
  store.spawn(50, 0);
  store.stoppedAtRedLight = true;
  store.targetSpeed = 80;

  const mapStore = makeTrafficMapStore({
    trafficLightColor: 'green',
    lightWorldX: 1380,
    offsetX: 1000,
    lastViewportWidth: 1024,
  });
  mapStore.lastViewportWidth = 1024;

  store.updateCivilianTrafficLight(0.016, mapStore);

  expect(typeof store.greenResumeDelay).toBe('number');
  expect(store.greenResumeDelay).toBeGreaterThanOrEqual(TRAFFIC_LIGHT_GREEN_RESUME_MIN);
  expect(store.greenResumeDelay).toBeLessThanOrEqual(TRAFFIC_LIGHT_GREEN_RESUME_MAX);
  expect(store.currentSpeed).toBe(0);
});

test('QuestCarStore: civilian accelerates after green resume delay', () => {
  const store = new QuestCarStore(civilianCarData);
  store.spawn(50, 0);
  store.stoppedAtRedLight = true;
  store.targetSpeed = 80;
  store.greenResumeDelay = 0;

  const mapStore = makeTrafficMapStore({
    trafficLightColor: 'green',
    lightWorldX: 1380,
    offsetX: 1000,
  });
  mapStore.lastViewportWidth = 1024;

  store.updateCivilianTrafficLight(0.016, mapStore);

  expect(store.stoppedAtRedLight).toBe(false);
  expect(store.trafficLightResuming).toBe(true);
  expect(store.currentSpeed).toBeGreaterThan(0);
});

test('QuestCarStore: green without prior stop has no resume delay', () => {
  const store = new QuestCarStore(civilianCarData);
  store.spawn(900, 80);
  store.stoppedAtRedLight = false;

  const mapStore = makeTrafficMapStore({ trafficLightColor: 'green' });

  store.updateCivilianTrafficLight(0.016, mapStore);

  expect(store.greenResumeDelay).toBeNull();
  expect(store.currentSpeed).toBe(80);
});
