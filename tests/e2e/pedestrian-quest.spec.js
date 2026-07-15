import { test, expect } from '@playwright/test';

test.describe('Pedestrian Quest E2E', () => {
  test('Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button -> countHelp increases', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    await page.waitForTimeout(5000);
    
    await page.click('[data-type="human1"]');
    await page.waitForSelector('.pedestrian-crossing-modal', { state: 'visible' });
    
    await page.click('.quest-pedestrian');
    
    await page.waitForSelector('.quest-car', { state: 'visible' });
    
    await page.waitForSelector('.fine-button', { state: 'visible' });
    
    const initialCount = await page.$eval('.game-viewport', (el) => {
      const stores = Object.values(el).find(v => v?.countHelp !== undefined);
      return stores?.countHelp || 0;
    });
    
    await page.click('.fine-button');
    await page.waitForSelector('.pedestrian-crossing-modal', { state: 'hidden' });
    
    const finalCount = await page.$eval('.game-viewport', (el) => {
      const stores = Object.values(el).find(v => v?.countHelp !== undefined);
      return stores?.countHelp || 0;
    });
    
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
