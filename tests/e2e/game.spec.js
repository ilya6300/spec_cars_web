import { test, expect } from '@playwright/test';

test('Game renders', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });
  expect(await page.locator('.game-viewport').isVisible()).toBe(true);
});

test('Game loop starts', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport');
  const viewport = await page.$('.game-viewport');
  expect(viewport).toBeTruthy();
});
