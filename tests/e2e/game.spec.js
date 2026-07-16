import { test, expect } from '@playwright/test';

test('Game renders', async ({ page }) => {
  page.on('pageerror', err => console.error('Page error:', err.message));

  await page.goto('/');

  await page.waitForSelector('#root', { timeout: 10000 });
  await page.waitForTimeout(5000);

  const gameViewport = await page.$('.game-viewport');
  expect(gameViewport).toBeTruthy();
});

test('Game loop starts', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.game-viewport');
  const viewport = await page.$('.game-viewport');
  expect(viewport).toBeTruthy();
});
