import { expect, test } from 'vitest';
import CarStore from './carStore';
import Cars from './cars';

test('CarStore: pedestrianQuestTriggered flag', () => {
  const store = new CarStore(Cars.cars[0]);
  
  expect(store.pedestrianQuestTriggered).toBe(false);
  
  store.pedestrianQuestTriggered = true;
  expect(store.pedestrianQuestTriggered).toBe(true);
});

test('CarStore: countHelp increment', () => {
  const store = new CarStore(Cars.cars[0]);
  
  expect(store.countHelp).toBe(0);
  
  store.countHelp += 1;
  expect(store.countHelp).toBe(1);
});
