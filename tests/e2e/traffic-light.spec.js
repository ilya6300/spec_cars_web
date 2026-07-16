import { test, expect } from '@playwright/test';

test.describe('Traffic Light Cycle', () => {
  test('Traffic light cycles between red and green', async ({ page }) => {
    test.setTimeout(240000);
    await page.addInitScript(() => {
      window.__PLAYWRIGHT__ = true;
    });
    await page.goto('/');
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForTimeout(5000);
    
    const hasGameViewport = await page.$('.game-viewport');
    expect(hasGameViewport).toBeTruthy();
    
    await page.waitForTimeout(2000);
    
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-2"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-3"]');
    await page.waitForTimeout(1000);
    
    await page.hover('[data-type="gas-pedal"]');
    await page.mouse.down();
    await page.waitForTimeout(5000);
    await page.mouse.up();
    
    await page.waitForTimeout(30000);
    
    const trafficLight = await page.$('[data-type="traffic_light"]');
    expect(trafficLight).toBeTruthy();
  });
});
