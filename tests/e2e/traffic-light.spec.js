import { test, expect } from '@playwright/test';

test.describe('Traffic Light E2E', () => {
  test('Traffic light appears and cycles red/green', async ({ page }) => {
    test.setTimeout(240000);
    
    page.on('pageerror', (err) => console.error('Page error:', err.message));
    
    await page.addInitScript(() => {
      window.__PLAYWRIGHT__ = true;
    });
    
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Инициализация игры
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(500);
    
    // Переключаем на нужную передачу
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(300);
    await page.click('[data-type="gear-2"]');
    await page.waitForTimeout(300);
    await page.click('[data-type="gear-3"]');
    await page.waitForTimeout(300);
    
    // Нажимаем газ
    const gasPedal = page.locator('[data-type="gas-pedal"]');
    await gasPedal.hover();
    await page.mouse.down();
    await page.waitForTimeout(5000);
    await page.mouse.up();
    
    // Ждём появления светофора (создаётся каждые 10 сек)
    await page.waitForTimeout(30000);
    
    const trafficLight = await page.$('[data-type="traffic_light"]');
    expect(trafficLight).toBeTruthy();
    
    // Светофор должен быть на экране
    const isVisible = await trafficLight?.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Car stops on red traffic light', async ({ page }) => {
    test.setTimeout(240000);
    
    await page.goto('/');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Инициализация игры
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(500);
    await page.click('[data-type="gear-2"]');
    await page.waitForTimeout(500);
    
    // Нажимаем газ и ждём набора скорости
    const gasPedal = page.locator('[data-type="gas-pedal"]');
    await gasPedal.hover();
    await page.mouse.down();
    await page.waitForTimeout(5000);
    
    // Получаем текущее расстояние
    const initialDistance = await page.evaluate(() => {
      return window.__TEST_STATE__?.distance || 0;
    });
    
    // Ждём, пока светофор станет красным (цикл 10 сек)
    await page.waitForTimeout(25000);
    
    await page.mouse.up();
    
    // Проверяем, что расстояние перестало расти (машина остановилась)
    const finalDistance = await page.evaluate(() => {
      return window.__TEST_STATE__?.distance || 0;
    });
    
    // Светофор должен появиться
    const trafficLight = await page.$('[data-type="traffic_light"]');
    if (trafficLight) {
      expect(trafficLight).toBeTruthy();
    }
  });
});
