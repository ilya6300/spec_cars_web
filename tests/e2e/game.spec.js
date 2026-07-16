import { test, expect } from '@playwright/test';

test('Game renders', async ({ page }) => {
  page.on('pageerror', err => console.log('Page error:', err.message));
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  await page.goto('http://localhost:5173/spec_cars_web/');
  
  // Ждем загрузки корня
  await page.waitForSelector('#root', { timeout: 10000 });
  
  // Проверяем, что React отрисовался
  await page.waitForTimeout(5000);
  
  const gameViewport = await page.$('.game-viewport');
  console.log('Game viewport found:', !!gameViewport);
  
  // Получаем консоль браузера
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));
  
  await page.waitForTimeout(1000);
  console.log('Console logs:', consoleLogs);
  
  const rootInner = await page.$eval('#root', el => el.innerHTML);
  console.log('Root innerHTML:', rootInner);
  
  expect(gameViewport).toBeTruthy();
});

test('Game loop starts', async ({ page }) => {
  await page.goto('http://localhost:5173/spec_cars_web/');
  await page.waitForSelector('.game-viewport');
  const viewport = await page.$('.game-viewport');
  expect(viewport).toBeTruthy();
});
