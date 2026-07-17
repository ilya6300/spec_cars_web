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

test('MapStore: questCarActive initialized to false', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarActive).toBe(false);
});

test('MapStore: questCarSpawnTimer initialized to 3', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  
  expect(store.questCarSpawnTimer).toBe(3);
});

test('MapStore: removeQuestCarByIndex resets questCarActive when array empty', () => {
  const store = new MapStore({ id: 1, name: 'Test', url: 'test.png' });
  store.questCars = [{ id: 1, deactivate: () => {} }, { id: 2, deactivate: () => {} }];
  store.questCarActive = true;
  
  store.removeQuestCarByIndex(0);
  expect(store.questCarActive).toBe(true);
  expect(store.questCars.length).toBe(1);
  
  store.removeQuestCarByIndex(0);
  expect(store.questCarActive).toBe(false);
  expect(store.questCars.length).toBe(0);
});
