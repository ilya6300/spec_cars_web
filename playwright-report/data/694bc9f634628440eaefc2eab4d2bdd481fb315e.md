# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: traffic-light.spec.js >> Traffic Light E2E >> Traffic light appears and cycles red/green
- Location: tests\e2e\traffic-light.spec.js:4:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: null
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic: 63л
      - generic:
        - paragraph: "Скорость: 0 км/ч"
        - paragraph: "Пройдено: 0.169 км"
        - paragraph: "Счётчик помощи: 0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e33]:
    - img "Зажигание" [ref=e34] [cursor=pointer]
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]: МКПП
        - button "N" [ref=e38] [cursor=pointer]
      - generic [ref=e39]:
        - button "1" [ref=e40] [cursor=pointer]
        - button "2" [ref=e41] [cursor=pointer]
        - button "3" [ref=e42] [cursor=pointer]
        - button "4" [ref=e43] [cursor=pointer]
    - img "Педаль газа" [ref=e44] [cursor=pointer]
    - img "Сирена" [ref=e45] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Traffic Light E2E', () => {
  4  |   test('Traffic light appears and cycles red/green', async ({ page }) => {
  5  |     test.setTimeout(240000);
  6  |     
  7  |     page.on('pageerror', (err) => console.error('Page error:', err.message));
  8  |     
  9  |     await page.addInitScript(() => {
  10 |       window.__PLAYWRIGHT__ = true;
  11 |     });
  12 |     
  13 |     await page.goto('/');
  14 |     await page.waitForSelector('#root', { timeout: 10000 });
  15 |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  16 |     await page.waitForTimeout(3000);
  17 |     
  18 |     // Инициализация игры
  19 |     await page.click('[data-type="ignition"]');
  20 |     await page.waitForTimeout(500);
  21 |     
  22 |     // Переключаем на нужную передачу
  23 |     await page.click('[data-type="gear-1"]');
  24 |     await page.waitForTimeout(300);
  25 |     await page.click('[data-type="gear-2"]');
  26 |     await page.waitForTimeout(300);
  27 |     await page.click('[data-type="gear-3"]');
  28 |     await page.waitForTimeout(300);
  29 |     
  30 |     // Нажимаем газ
  31 |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  32 |     await gasPedal.hover();
  33 |     await page.mouse.down();
  34 |     await page.waitForTimeout(5000);
  35 |     await page.mouse.up();
  36 |     
  37 |     // Ждём появления светофора (создаётся каждые 10 сек)
  38 |     await page.waitForTimeout(30000);
  39 |     
  40 |     const trafficLight = await page.$('[data-type="traffic_light"]');
> 41 |     expect(trafficLight).toBeTruthy();
     |                          ^ Error: expect(received).toBeTruthy()
  42 |     
  43 |     // Светофор должен быть на экране
  44 |     const isVisible = await trafficLight?.isVisible();
  45 |     expect(isVisible).toBeTruthy();
  46 |   });
  47 | 
  48 |   test('Car stops on red traffic light', async ({ page }) => {
  49 |     test.setTimeout(240000);
  50 |     
  51 |     await page.goto('/');
  52 |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  53 |     await page.waitForTimeout(2000);
  54 |     
  55 |     // Инициализация игры
  56 |     await page.click('[data-type="ignition"]');
  57 |     await page.waitForTimeout(500);
  58 |     await page.click('[data-type="gear-2"]');
  59 |     await page.waitForTimeout(500);
  60 |     
  61 |     // Нажимаем газ и ждём набора скорости
  62 |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  63 |     await gasPedal.hover();
  64 |     await page.mouse.down();
  65 |     await page.waitForTimeout(5000);
  66 |     
  67 |     // Получаем текущее расстояние
  68 |     const initialDistance = await page.evaluate(() => {
  69 |       return window.__TEST_STATE__?.distance || 0;
  70 |     });
  71 |     
  72 |     // Ждём, пока светофор станет красным (цикл 10 сек)
  73 |     await page.waitForTimeout(25000);
  74 |     
  75 |     await page.mouse.up();
  76 |     
  77 |     // Проверяем, что расстояние перестало расти (машина остановилась)
  78 |     const finalDistance = await page.evaluate(() => {
  79 |       return window.__TEST_STATE__?.distance || 0;
  80 |     });
  81 |     
  82 |     // Светофор должен появиться
  83 |     const trafficLight = await page.$('[data-type="traffic_light"]');
  84 |     if (trafficLight) {
  85 |       expect(trafficLight).toBeTruthy();
  86 |     }
  87 |   });
  88 | });
  89 | 
```