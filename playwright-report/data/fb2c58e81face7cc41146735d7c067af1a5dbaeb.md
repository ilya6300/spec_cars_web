# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest-cars.spec.js >> Quest Cars E2E >> Quest Cars spawn on screen
- Location: tests\e2e\quest-cars.spec.js:4:3

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
          - generic: 64л
      - generic:
        - paragraph: "Скорость: 68 км/ч"
        - paragraph: "Пройдено: 0.034 км"
        - paragraph: "Счётчик помощи: 0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e21]:
    - img "Зажигание" [ref=e22] [cursor=pointer]
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: МКПП
        - button "N" [ref=e26] [cursor=pointer]
      - generic [ref=e27]:
        - button "1" [ref=e28] [cursor=pointer]
        - button "2" [ref=e29] [cursor=pointer]
        - button "3" [ref=e30] [cursor=pointer]
        - button "4" [ref=e31] [cursor=pointer]
    - img "Педаль газа" [ref=e32] [cursor=pointer]
    - img "Сирена" [ref=e33] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Quest Cars E2E', () => {
  4   |   test('Quest Cars spawn on screen', async ({ page }) => {
  5   |     test.setTimeout(240000);
  6   |     
  7   |     await page.goto('/');
  8   |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  9   |     await page.waitForTimeout(2000);
  10  |     
  11  |     // Инициализация игры: зажигание + передача + газ
  12  |     await page.click('[data-type="ignition"]');
  13  |     await page.waitForTimeout(500);
  14  |     await page.click('[data-type="gear-2"]');
  15  |     await page.waitForTimeout(500);
  16  |     
  17  |     // Зажимаем газ
  18  |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  19  |     await gasPedal.hover();
  20  |     await page.mouse.down();
  21  |     await page.waitForTimeout(1500);
  22  |     await page.mouse.up();
  23  |     
  24  |     // Quest Cars спавнятся каждые 5-15 секунд
  25  |     // Ждём появления первой квестовой машины
  26  |     const questCar = await page.$('[data-type="quest-car"]');
> 27  |     expect(questCar).toBeTruthy();
      |                      ^ Error: expect(received).toBeTruthy()
  28  |   });
  29  | 
  30  |   test('SpeedDisplay shows quest car speed', async ({ page }) => {
  31  |     test.setTimeout(240000);
  32  |     
  33  |     await page.goto('/');
  34  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  35  |     await page.waitForTimeout(2000);
  36  |     
  37  |     // Инициализация игры
  38  |     await page.click('[data-type="ignition"]');
  39  |     await page.waitForTimeout(500);
  40  |     await page.click('[data-type="gear-2"]');
  41  |     await page.waitForTimeout(500);
  42  |     
  43  |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  44  |     await gasPedal.hover();
  45  |     await page.mouse.down();
  46  |     await page.waitForTimeout(1500);
  47  |     await page.mouse.up();
  48  |     
  49  |     // Ждём появления SpeedDisplay
  50  |     await page.waitForSelector('[data-type="speed-display"]', { timeout: 20000 });
  51  |     
  52  |     const speedText = await page.$eval('[data-type="speed-display"]', (el) => el.textContent);
  53  |     expect(speedText).toBeTruthy();
  54  |   });
  55  | 
  56  |   test('Enemy quest car spawns from left side', async ({ page }) => {
  57  |     test.setTimeout(240000);
  58  |     
  59  |     await page.goto('/');
  60  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  61  |     await page.waitForTimeout(2000);
  62  |     
  63  |     // Инициализация игры
  64  |     await page.click('[data-type="ignition"]');
  65  |     await page.waitForTimeout(500);
  66  |     await page.click('[data-type="gear-2"]');
  67  |     await page.waitForTimeout(500);
  68  |     
  69  |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  70  |     await gasPedal.hover();
  71  |     await page.mouse.down();
  72  |     await page.waitForTimeout(1500);
  73  |     await page.mouse.up();
  74  |     
  75  |     // Ждём появления enemy машины (спавн слева)
  76  |     await page.waitForSelector('[data-type="quest-car"][data-enemy="true"]', { timeout: 20000 });
  77  |     
  78  |     const enemyCar = page.locator('[data-type="quest-car"][data-enemy="true"]');
  79  |     await expect(enemyCar).toBeVisible();
  80  |   });
  81  | 
  82  |   test('Arrest button appears when enemy car is in arrest range', async ({ page }) => {
  83  |     test.setTimeout(240000);
  84  |     
  85  |     await page.goto('/');
  86  |     await page.waitForSelector('.game-viewport', { timeout: 10000 });
  87  |     await page.waitForTimeout(2000);
  88  |     
  89  |     // Инициализация игры
  90  |     await page.click('[data-type="ignition"]');
  91  |     await page.waitForTimeout(500);
  92  |     await page.click('[data-type="gear-2"]');
  93  |     await page.waitForTimeout(500);
  94  |     
  95  |     const gasPedal = page.locator('[data-type="gas-pedal"]');
  96  |     await gasPedal.hover();
  97  |     await page.mouse.down();
  98  |     await page.waitForTimeout(2000);
  99  |     await page.mouse.up();
  100 |     
  101 |     // Ждём появления enemy машины и кнопки ареста
  102 |     // Enemy машина движется справа налево (если policeSpeed > questCarSpeed)
  103 |     // или слева направо (если questCarSpeed > policeSpeed)
  104 |     // В любом случае, когда она попадает в диапазон [30, 280], кнопка появляется
  105 |     
  106 |     // Пробуем несколько раз, так как спавн и сближение занимают время
  107 |     let arrestButtonFound = false;
  108 |     for (let i = 0; i < 5; i++) {
  109 |       const arrestButton = await page.$('[data-type="arrest-button"]');
  110 |       if (arrestButton) {
  111 |         arrestButtonFound = true;
  112 |         break;
  113 |       }
  114 |       await page.waitForTimeout(3000);
  115 |     }
  116 |     
  117 |     // Кнопка может появиться, если enemy машина оказалась в диапазоне
  118 |     // Это вероятностное событие, поэтому тест может быть flaky
  119 |     if (arrestButtonFound) {
  120 |       await expect(page.locator('[data-type="arrest-button"]')).toBeVisible();
  121 |     }
  122 |   });
  123 | 
  124 |   test('Quest cars can be multiple on screen', async ({ page }) => {
  125 |     test.setTimeout(240000);
  126 |     
  127 |     await page.goto('/');
```