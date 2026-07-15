import { test, expect } from '@playwright/test';

test.describe('Police Quest E2E', () => {
  test('Police quest: click aggro human, arrest, countHelp increases', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    const initialCount = await page.$eval('.game-viewport', (el) => {
      const stores = Object.values(el).find(v => v?.countHelp !== undefined);
      return stores?.countHelp || 0;
    });
    
    await page.click('[data-type="human_aggr1"]');
    await page.waitForSelector('.police-quest-modal', { state: 'visible' });
    
    await page.click('.arrest-button');
    await page.waitForSelector('.police-quest-modal', { state: 'hidden' });
    
    const finalCount = await page.$eval('.game-viewport', (el) => {
      const stores = Object.values(el).find(v => v?.countHelp !== undefined);
      return stores?.countHelp || 0;
    });
    
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
