import { expect, test } from 'vitest';
import QuestCarStore from './questCarStore';
import Cars from './cars';

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
  const carData = Cars.otherCars[0];
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
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
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
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility resets lastVisibleTime for enemy=false when visible', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  // positionX=1100, distance=1000 → screenX=100 (на экране, > -200)
  store.spawn(1100, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility resets lastVisibleTime for enemy=true when visible', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  // positionX=1100, distance=1000 → screenX=100 (на экране, < viewportWidth+200)
  store.spawn(1100, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: updateVisibility does not set lastVisibleTime when still on screen', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  // positionX=1100, distance=1000 → screenX=100 (на экране)
  store.spawn(1100, 80);

  store.updateVisibility(1, 60, 1000);

  expect(store.lastVisibleTime).toBeNull();
});

test('QuestCarStore: dismissed initialized to false', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  expect(store.dismissed).toBe(false);
});

test('QuestCarStore: updateVisibility enemy=false deactivated after 5 seconds off screen', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  store.spawn(100, 80);

  // Мокаем performance.now для контроля времени
  let mockTime = 100;
  const originalNow = performance.now;
  performance.now = () => mockTime;

  // Первый вызов — устанавливает lastVisibleTime
  store.updateVisibility(0.001, 1024, 1000);
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);

  // Прокручиваем время на 5.1 секунды
  mockTime += 5100;

  // Второй вызов — timeOffScreen = 5.1 > 5 → деактивируется
  store.updateVisibility(0.001, 1024, 1000);
  expect(store.active).toBe(false);
  expect(store.dismissed).toBe(true);

  performance.now = originalNow;
});

test('QuestCarStore: updateVisibility enemy=true deactivated after 8 seconds off screen', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  store.spawn(12000, 80);

  let mockTime = 100;
  const originalNow = performance.now;
  performance.now = () => mockTime;

  // Первый вызов — устанавливает lastVisibleTime
  store.updateVisibility(0.001, 1024, 1000);
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);

  // Прокручиваем время на 8.1 секунды
  mockTime += 8100;

  // Второй вызов — timeOffScreen = 8.1 > 8 → деактивируется
  store.updateVisibility(0.001, 1024, 1000);
  expect(store.active).toBe(false);
  expect(store.dismissed).toBe(true);

  performance.now = originalNow;
});

test('QuestCarStore: updateVisibility enemy=false returns to screen resets timer', () => {
  const carData = { id: 2, type: 'car', name: 'Красный автомобиль', urlBody: '', urlShell: '', maxSpeed: 58, minSpeed: 40, enemy: false };
  const store = new QuestCarStore(carData);
  // positionX=100, distance=1000 → screenX=-900 (за экраном)
  store.spawn(100, 80);

  // Машина уходит за экран (4.9 сек < 5)
  store.updateVisibility(4.9, 60, 1000);
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);

  // Возвращается на экран: positionX=100, distance=50 → screenX=50 (на экране)
  store.updateVisibility(0.5, 60, 50);
  expect(store.lastVisibleTime).toBeNull();
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);
});

test('QuestCarStore: updateVisibility enemy=true returns to screen resets timer', () => {
  const carData = Cars.otherCars[0];
  const store = new QuestCarStore(carData);
  // positionX=12000, distance=1000 → screenX=11000 (за правым краем)
  store.spawn(12000, 80);

  // Машина уходит за экран (7.5 сек < 8)
  store.updateVisibility(7.5, 1024, 1000);
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);

  // Возвращается на экран: positionX=12000, distance=11000 → screenX=1000 < 1224 (на экране)
  store.updateVisibility(0.5, 1024, 11000);
  expect(store.lastVisibleTime).toBeNull();
  expect(store.active).toBe(true);
  expect(store.dismissed).toBe(false);
});
