import { expect, test } from 'vitest';
import MapStore from './mapStore';

test('MapStore: startPedestrianCrossingQuest', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  expect(store.pedestrianCrossingTargetObject).toBeNull();
  expect(store.pedestrianCarPosition).toBe(-150);
  expect(store.pedestrianState).toBe('waiting');
  
  const targetObj = { uid: 'test_uid', typeId: 'human1' };
  store.startPedestrianCrossingQuest(targetObj);
  
  expect(store.isPedestrianCrossingQuestActive).toBe(true);
  expect(store.pedestrianCrossingTargetObject).toEqual(targetObj);
  expect(store.pedestrianCarPosition).toBe(-150);
  expect(store.pedestrianState).toBe('waiting');
});

test('MapStore: finishPedestrianCrossingQuest', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  store.startPedestrianCrossingQuest({ uid: 'test_uid', typeId: 'human1' });
  expect(store.isPedestrianCrossingQuestActive).toBe(true);
  
  store.finishPedestrianCrossingQuest();
  
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  expect(store.pedestrianCrossingTargetObject).toBeNull();
  expect(store.pedestrianCarPosition).toBe(-150);
  expect(store.pedestrianState).toBe('waiting');
});

test('MapStore: questCarSpawnTimer initialized to 10', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarSpawnTimer).toBe(10);
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
});

test('MapStore: questCarActive field does not exist', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarActive).toBeUndefined();
});

test('MapStore: spawnQuestCar creates car without blocking checks', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { gear: 'N', currentSpeed: 0 };
  
  // Мокаем window.innerWidth
  const originalInnerWidth = window.innerWidth;
  window.innerWidth = 1024;
  
  store.spawnQuestCar();
  
  expect(store.questCars.length).toBe(1);
  expect(store.questCarSpawnTimer).toBeGreaterThanOrEqual(10);
  expect(store.questCarSpawnTimer).toBeLessThanOrEqual(30);
  
  // Второй спавн — тоже создаёт машину
  store.spawnQuestCar();
  expect(store.questCars.length).toBe(2);
  
  window.innerWidth = originalInnerWidth;
});

test('MapStore: updateQuestCars does not filter or remove cars', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.carStore = { currentSpeed: 60 };
  
  // Добавляем машины вручную
  const mockCar1 = {
    active: true,
    updatePosition: (dt, speed) => { mockCar1.positionX = (mockCar1.positionX || 0) + (mockCar1.currentSpeed - speed) * dt; },
    updateWheelRotation: () => {},
    currentSpeed: 80,
    positionX: 100,
  };
  const mockCar2 = {
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

  store.checkQuestCarDistance([enemyInRange, enemyOutOfRange, civilian], 1024);

  expect(store.questCarForArrest).not.toBeNull();
  expect(store.questCarForArrest.positionX).toBe(150);
});

test('MapStore: checkQuestCarDistance clears questCarForArrest when no enemy in range', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.questCarForArrest = { enemy: true, positionX: 150 };

  const enemyOutOfRange = { enemy: true, positionX: 300 };
  store.checkQuestCarDistance([enemyOutOfRange], 1024);

  expect(store.questCarForArrest).toBeNull();
});

test('MapStore: checkQuestCarDistance ignores non-enemy cars', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });

  const civilian = { enemy: false, positionX: 100 };
  store.checkQuestCarDistance([civilian], 1024);

  expect(store.questCarForArrest).toBeNull();
});
