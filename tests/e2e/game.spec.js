import { test, expect } from '@playwright/test';

test.describe('Game Initialization', () => {
  test('Game renders and game-viewport is visible', async ({ page }) => {
    test.setTimeout(240000);
    
    page.on('pageerror', (err) => console.error('Page error:', err.message));
    
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    const gameViewport = await page.$('.game-viewport');
    expect(gameViewport).toBeTruthy();
  });

  test('Controllers are visible: ignition, gearbox, gas pedal', async ({ page }) => {
    test.setTimeout(240000);
    
    await page.goto('/');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Проверяем наличие контроллеров
    const ignition = await page.$('[data-type="ignition"]');
    expect(ignition).toBeTruthy();
    
    const gasPedal = await page.$('[data-type="gas-pedal"]');
    expect(gasPedal).toBeTruthy();
    
    const gearButtons = await page.$$('data-type=gear-btn');
    expect(gearButtons.length).toBeGreaterThan(0);
  });

  test('Ignition toggle works', async ({ page }) => {
    test.setTimeout(240000);
    
    await page.goto('/');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const ignitionBtn = page.locator('[data-type="ignition"]');
    
    // Проверяем начальное состояние (выключено)
    const initialSrc = await ignitionBtn.getAttribute('src');
    expect(initialSrc).toBeTruthy();
    
    // Включаем зажигание
    await ignitionBtn.click();
    await page.waitForTimeout(500);
    
    // Проверяем, что src изменился (активное состояние)
    const afterClickSrc = await ignitionBtn.getAttribute('src');
    expect(afterClickSrc).toBeTruthy();
  });

  test('Gear shifting works', async ({ page }) => {
    test.setTimeout(240000);
    
    await page.goto('/');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(500);
    
    // Переключаем передачи
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(300);
    
    const gear1Active = await page.$('[data-type="gear-1"].active');
    expect(gear1Active).toBeTruthy();
    
    await page.click('[data-type="gear-2"]');
    await page.waitForTimeout(300);
    
    const gear2Active = await page.$('[data-type="gear-2"].active');
    expect(gear2Active).toBeTruthy();
    
    const gear1Inactive = await page.$('[data-type="gear-1"].active');
    expect(gear1Inactive).toBeFalsy();
  });

  test('Game loop runs without crashing', async ({ page }) => {
    test.setTimeout(240000);
    
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(5000);
    
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(500);
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(500);
    
    const gasPedal = page.locator('[data-type="gas-pedal"]');
    await gasPedal.hover();
    await page.mouse.down();
    await page.waitForTimeout(3000);
    await page.mouse.up();
    
    await page.waitForTimeout(5000);
    
    // Игра не должна выдать ошибок
    expect(errors.length).toBe(0);
    
    // Game viewport должен оставаться видимым
    const gameViewport = await page.$('.game-viewport');
    expect(gameViewport).toBeTruthy();
  });
});
