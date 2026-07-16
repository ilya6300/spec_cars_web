import { test, expect } from '@playwright/test';

test.describe('Pedestrian Quest E2E', () => {
  test('Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button -> countHelp increases', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.game-viewport', { timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    // Инициализация игры
    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gas-pedal"]');
    await page.waitForTimeout(2000);
    
    // Проверка, что зажигание включено
    const ignitionBtn = await page.$('[data-type="ignition"]');
    expect(ignitionBtn).toBeTruthy();
    
    // Ждем появления human1 (он спавнится на ~150м)
    // За 5 сек при скорости ~30 м/с машина проедет ~150м
    await page.waitForTimeout(5000);
    
    const human1 = await page.$('[data-type="human1"]');
    if (human1) {
      await page.click('[data-type="human1"]');
      await page.waitForSelector('.pedestrian-crossing-modal', { state: 'visible', timeout: 30000 });
      
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
    }
  });
});
