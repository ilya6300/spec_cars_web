import { expect, test } from 'vitest';
import QuestCarStore from './questCarStore';

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

  expect(store.wheelRotation).toBe(250);
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
  expect(store.wheelRotation).toBe(140);

  store.updateWheelRotation(1);
  expect(store.wheelRotation).toBe(280);
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
