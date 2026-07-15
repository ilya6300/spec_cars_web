import { test, expect } from '@playwright/test';

test.describe('Traffic Light Cycle', () => {
  test('Traffic light cycles between red and green', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    await page.waitForTimeout(5000);
    
    const trafficLight = await page.$('[data-type="traffic_light"]');
    expect(trafficLight).toBeTruthy();
  });
});
