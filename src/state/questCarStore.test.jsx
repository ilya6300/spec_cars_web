import { expect, test } from 'vitest';
import QuestCarStore from './questCarStore';
import Cars from './cars';

test('QuestCarStore: initialization with enemy=false', () => {
  const carData = Cars.otherCars[2];
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
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);

  expect(store.id).toBe(0);
  expect(store.type).toBe('car');
  expect(store.name).toBe('Красный гоночный автомобиль');
  expect(store.enemy).toBe(true);
  expect(store.currentSpeed).toBeGreaterThanOrEqual(store.minSpeed);
  expect(store.currentSpeed).toBeLessThanOrEqual(store.maxSpeed);
  expect(store.active).toBe(true);
});

test('QuestCarStore: spawn method sets position and speed', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);

  store.spawn(100, 50);

  expect(store.positionX).toBe(100);
  expect(store.currentSpeed).toBe(50);
  expect(store.active).toBe(true);
});

test('QuestCarStore: updatePosition for enemy=false (civilian, relative speed)', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(80);
});

test('QuestCarStore: updatePosition for enemy=true (enemy, relative speed)', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: updateWheelRotation', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(100, 50);

  store.updateWheelRotation(1);

  expect(store.wheelRotation).toBe(250);
});

test('QuestCarStore: deactivate method', () => {
  const carData = Cars.otherCars[2];
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
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(80);
});

test('QuestCarStore: direction logic for enemy=true (enemy, relative speed)', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updatePosition(1, 60);

  expect(store.positionX).toBe(120);
});

test('QuestCarStore: direction logic with deltaTime fractions (relative)', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(100, 100);

  store.updatePosition(0.5, 60);

  expect(store.positionX).toBe(80);
});

test('QuestCarStore: direction logic for enemy=true with deltaTime (relative)', () => {
  const carData = Cars.otherCars[0];
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

test('QuestCarStore: lastVisibleTime initialized to null', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility resets lastVisibleTime for enemy=false when visible', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility resets lastVisibleTime for enemy=true when visible', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility does not set lastVisibleTime when still on screen', () => {
  const carData = Cars.otherCars[2];
  const store = new QuestCarStore(carData);
  store.spawn(500, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});
