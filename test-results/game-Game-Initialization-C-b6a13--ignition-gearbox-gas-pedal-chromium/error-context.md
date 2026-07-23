# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game Initialization >> Controllers are visible: ignition, gearbox, gas pedal
- Location: tests\e2e\game.spec.js:17:3

# Error details

```
Error: page.$$: Unknown engine "data-type" while parsing selector data-type=gear-btn
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic: 65л
      - generic:
        - paragraph: "Скорость: 0 км/ч"
        - paragraph: "Пройдено: 0.000 км"
        - paragraph: "Счётчик помощи: 0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e8]:
    - img "Зажигание" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: МКПП
        - button "N" [ref=e13] [cursor=pointer]
      - generic [ref=e14]:
        - button "1" [ref=e15] [cursor=pointer]
        - button "2" [ref=e16] [cursor=pointer]
        - button "3" [ref=e17] [cursor=pointer]
        - button "4" [ref=e18] [cursor=pointer]
    - img "Педаль газа" [ref=e19] [cursor=pointer]
    - img "Сирена" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Game Initialization', () => {
  4   |   test('Game renders and game-viewport is visible', async ({ page }) => {
  5   |     test.setTimeout(240000);
  6   |     
  7   |     page.on('pageerror', (err) => console.error('Page error:', err.message));
  8   |     
  9   |     await page.goto('/');
  10  |     await page.waitForSelector('#root', { timeout: 10000 });
  11  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  12  |     
  13  |     const gameViewport = await page.$('.game-viewport');
  14  |     expect(gameViewport).toBeTruthy();
  15  |   });
  16  | 
  17  |   test('Controllers are visible: ignition, gearbox, gas pedal', async ({ page }) => {
  18  |     test.setTimeout(240000);
  19  |     
  20  |     await page.goto('/');
  21  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  22  |     await page.waitForTimeout(2000);
  23  |     
  24  |     // Проверяем наличие контроллеров
  25  |     const ignition = await page.$('[data-type="ignition"]');
  26  |     expect(ignition).toBeTruthy();
  27  |     
  28  |     const gasPedal = await page.$('[data-type="gas-pedal"]');
  29  |     expect(gasPedal).toBeTruthy();
  30  |     
> 31  |     const gearButtons = await page.$$('data-type=gear-btn');
      |                                    ^ Error: page.$$: Unknown engine "data-type" while parsing selector data-type=gear-btn
  32  |     expect(gearButtons.length).toBeGreaterThan(0);
  33  |   });
  34  | 
  35  |   test('Ignition toggle works', async ({ page }) => {
  36  |     test.setTimeout(240000);
  37  |     
  38  |     await page.goto('/');
  39  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  40  |     await page.waitForTimeout(2000);
  41  |     
  42  |     const ignitionBtn = page.locator('[data-type="ignition"]');
  43  |     
  44  |     // Проверяем начальное состояние (выключено)
  45  |     const initialSrc = await ignitionBtn.getAttribute('src');
  46  |     expect(initialSrc).toBeTruthy();
  47  |     
  48  |     // Включаем зажигание
  49  |     await ignitionBtn.click();
  50  |     await page.waitForTimeout(500);
  51  |     
  52  |     // Проверяем, что src изменился (активное состояние)
  53  |     const afterClickSrc = await ignitionBtn.getAttribute('src');
  54  |     expect(afterClickSrc).toBeTruthy();
  55  |   });
  56  | 
  57  |   test('Gear shifting works', async ({ page }) => {
  58  |     test.setTimeout(240000);
  59  |     
  60  |     await page.goto('/');
  61  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  62  |     await page.waitForTimeout(2000);
  63  |     
  64  |     await page.click('[data-type="ignition"]');
  65  |     await page.waitForTimeout(500);
  66  |     
  67  |     // Переключаем передачи
  68  |     await page.click('[data-type="gear-1"]');
  69  |     await page.waitForTimeout(300);
  70  |     
  71  |     const gear1Active = await page.$('[data-type="gear-1"].active');
  72  |     expect(gear1Active).toBeTruthy();
  73  |     
  74  |     await page.click('[data-type="gear-2"]');
  75  |     await page.waitForTimeout(300);
  76  |     
  77  |     const gear2Active = await page.$('[data-type="gear-2"].active');
  78  |     expect(gear2Active).toBeTruthy();
  79  |     
  80  |     const gear1Inactive = await page.$('[data-type="gear-1"].active');
  81  |     expect(gear1Inactive).toBeFalsy();
  82  |   });
  83  | 
  84  |   test('Game loop runs without crashing', async ({ page }) => {
  85  |     test.setTimeout(240000);
  86  |     
  87  |     const errors = [];
  88  |     page.on('pageerror', (err) => errors.push(err.message));
  89  |     page.on('console', (msg) => {
  90  |       if (msg.type() === 'error') {
  91  |         errors.push(msg.text());
  92  |       }
  93  |     });
  94  |     
  95  |     await page.goto('/');
  96  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  97  |     await page.waitForTimeout(5000);
  98  |     
  99  |     await page.click('[data-type="ignition"]');
  100 |     await page.waitForTimeout(500);
  101 |     await page.click('[data-type="gear-1"]');
  102 |     await page.waitForTimeout(500);
  103 |     
  104 |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  105 |     await gasPedal.hover();
  106 |     await page.mouse.down();
  107 |     await page.waitForTimeout(3000);
  108 |     await page.mouse.up();
  109 |     
  110 |     await page.waitForTimeout(5000);
  111 |     
  112 |     // Игра не должна выдать ошибок
  113 |     expect(errors.length).toBe(0);
  114 |     
  115 |     // Game viewport должен оставаться видимым
  116 |     const gameViewport = await page.$('.game-viewport');
  117 |     expect(gameViewport).toBeTruthy();
  118 |   });
  119 | });
  120 | 
```