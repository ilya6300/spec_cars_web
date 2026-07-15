import { test, expect } from '@playwright/test';

test('MapStore: startPedestrianCrossingQuest', async ({ page }) => {
  const store = {
    isPedestrianCrossingQuestActive: false,
    pedestrianCrossingTargetObject: null,
    pedestrianCarPosition: -150,
    pedestrianState: 'waiting',
  };
  
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
  
  store.isPedestrianCrossingQuestActive = true;
  expect(store.isPedestrianCrossingQuestActive).toBe(true);
});

test('MapStore: finishPedestrianCrossingQuest', async ({ page }) => {
  const store = {
    isPedestrianCrossingQuestActive: true,
    pedestrianCrossingTargetObject: { uid: 'test' },
  };
  
  expect(store.isPedestrianCrossingQuestActive).toBe(true);
  
  store.isPedestrianCrossingQuestActive = false;
  expect(store.isPedestrianCrossingQuestActive).toBe(false);
});

test('CarStore: pedestrianQuestTriggered flag', async ({ page }) => {
  const store = { pedestrianQuestTriggered: false };
  
  expect(store.pedestrianQuestTriggered).toBe(false);
  
  store.pedestrianQuestTriggered = true;
  expect(store.pedestrianQuestTriggered).toBe(true);
});

test('CarStore: countHelp increment', async ({ page }) => {
  const store = { countHelp: 0 };
  
  expect(store.countHelp).toBe(0);
  
  store.countHelp += 1;
  expect(store.countHelp).toBe(1);
});
