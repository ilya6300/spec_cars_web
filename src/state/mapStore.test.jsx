import { expect, test } from 'vitest';
import MapStore from './mapStore.jsx';

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
