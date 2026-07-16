import { test, expect } from '@playwright/test';

test.describe('Police Quest E2E', () => {
  test('Police quest: click aggro human, arrest, countHelp increases', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gas-pedal"]');
    await page.waitForTimeout(2000);
    
    await page.waitForTimeout(8000);
    
    const humanAggr1 = await page.$('[data-type="human_aggr1"]');
    if (humanAggr1) {
      await page.click('[data-type="human_aggr1"]');
      await page.waitForSelector('.police-quest-modal', { state: 'visible', timeout: 30000 });
      
      await page.click('.arrest-button');
      await page.waitForSelector('.police-quest-modal', { state: 'hidden' });
      
      const finalCount = await page.$eval('.game-viewport', (el) => {
        const stores = Object.values(el).find(v => v?.countHelp !== undefined);
        return stores?.countHelp || 0;
      });
      
      expect(finalCount).toBeGreaterThan(0);
    }
  });
});
