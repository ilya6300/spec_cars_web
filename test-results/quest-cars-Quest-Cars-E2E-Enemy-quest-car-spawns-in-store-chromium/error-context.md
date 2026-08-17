# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest-cars.spec.js >> Quest Cars E2E >> Enemy quest car spawns in store
- Location: tests\e2e\quest-cars.spec.js:50:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - button "В меню" [ref=e5] [cursor=pointer]:
    - img [ref=e6]
  - 'generic "Всего звёзд: 0"':
    - generic: ★
    - generic: "0"
  - generic:
    - generic [ref=e20]:
      - generic [ref=e22]:
        - generic: 58л
      - generic [ref=e23]:
        - generic [ref=e25]: "0"
        - generic [ref=e32]: "20"
        - generic [ref=e39]: "40"
        - generic [ref=e46]: "60"
        - generic [ref=e51]: "80"
        - generic [ref=e58]: "100"
        - generic [ref=e65]: "120"
        - generic [ref=e70]: "140"
        - generic [ref=e71]:
          - generic:
            - text: "0"
            - generic: км/ч
      - generic [ref=e74]:
        - paragraph [ref=e75]:
          - generic [ref=e76]: 0.440 км
        - generic [ref=e77]:
          - 'generic "Звёзды: 0" [ref=e78]': ☆☆☆
          - generic [ref=e79]:
            - generic "Погоня" [ref=e80]:
              - generic [ref=e82]: "0"
            - generic "Арест" [ref=e83]:
              - generic [ref=e85]: "0"
            - generic "Штраф" [ref=e86]:
              - generic [ref=e88]: "0"
            - generic "Парковка" [ref=e89]:
              - generic [ref=e91]: "0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e92]:
    - img "Зажигание" [ref=e93] [cursor=pointer]
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]: МКПП
        - button "N" [ref=e97] [cursor=pointer]
      - generic [ref=e98]:
        - button "1" [ref=e99] [cursor=pointer]
        - button "2" [active] [ref=e100] [cursor=pointer]
        - button "3" [ref=e101] [cursor=pointer]
        - button "4" [ref=e102] [cursor=pointer]
    - img "Педаль газа" [ref=e103] [cursor=pointer]
    - img "Сирена" [ref=e104] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { enablePlaywrightTestState, startDriving, holdGasFor, navigateToFreeMode } from "./helpers.js";
  3   | 
  4   | async function waitForQuestCarsSpawned(page, timeout = 20000) {
  5   |   await page.waitForFunction(
  6   |     () => (window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0) > 0,
  7   |     { timeout },
  8   |   );
  9   | }
  10  | 
  11  | test.describe("Quest Cars E2E", () => {
  12  |   test.beforeEach(async ({ page }) => {
  13  |     await enablePlaywrightTestState(page);
  14  |   });
  15  | 
  16  |   test("Quest Cars spawn in store", async ({ page }) => {
  17  |     test.setTimeout(240000);
  18  | 
  19  |     await page.goto("/");
  20  |     await navigateToFreeMode(page);
  21  |     await page.waitForTimeout(1000);
  22  | 
  23  |     await startDriving(page, { gear: "2", gasMs: 0 });
  24  |     await holdGasFor(page, 12000);
  25  | 
  26  |     const questCarCount = await page.evaluate(
  27  |       () => window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0,
  28  |     );
  29  |     expect(questCarCount).toBeGreaterThan(0);
  30  |   });
  31  | 
  32  |   test("SpeedDisplay shows quest car speed when visible", async ({ page }) => {
  33  |     test.setTimeout(240000);
  34  | 
  35  |     await page.goto("/");
  36  |     await navigateToFreeMode(page);
  37  |     await page.waitForTimeout(1000);
  38  | 
  39  |     await startDriving(page, { gear: "3", gasMs: 0 });
  40  |     await waitForQuestCarsSpawned(page);
  41  |     await holdGasFor(page, 40000);
  42  | 
  43  |     const speedDisplay = await page.$('[data-type="speed-display"]');
  44  |     if (speedDisplay) {
  45  |       const speedText = await speedDisplay.textContent();
  46  |       expect(speedText).toBeTruthy();
  47  |     }
  48  |   });
  49  | 
  50  |   test("Enemy quest car spawns in store", async ({ page }, testInfo) => {
  51  |     test.setTimeout(240000);
  52  | 
  53  |     await page.goto("/");
  54  |     await navigateToFreeMode(page);
  55  |     await page.waitForTimeout(1000);
  56  | 
  57  |     await startDriving(page, { gear: "2", gasMs: 0 });
  58  |     await holdGasFor(page, 75000);
  59  | 
  60  |     const stats = await page.evaluate(() => {
  61  |       const cars = window.__TEST_STATE__?.activeMapStore?.questCars ?? [];
  62  |       return {
  63  |         total: cars.length,
  64  |         hasEnemy: cars.some((car) => car.enemy),
  65  |       };
  66  |     });
  67  | 
> 68  |     expect(stats.total).toBeGreaterThan(0);
      |                         ^ Error: expect(received).toBeGreaterThan(expected)
  69  |     if (!stats.hasEnemy) {
  70  |       testInfo.skip(true, "Enemy car not spawned in random window");
  71  |       return;
  72  |     }
  73  |     expect(stats.hasEnemy).toBeTruthy();
  74  |   });
  75  | 
  76  |   test("Arrest button appears when enemy car is in arrest range", async ({
  77  |     page,
  78  |   }) => {
  79  |     test.setTimeout(240000);
  80  | 
  81  |     await page.goto("/");
  82  |     await navigateToFreeMode(page);
  83  |     await page.waitForTimeout(1000);
  84  | 
  85  |     await startDriving(page, { gear: "2", gasMs: 0 });
  86  |     await holdGasFor(page, 30000);
  87  | 
  88  |     let arrestButtonFound = false;
  89  |     for (let i = 0; i < 5; i++) {
  90  |       const arrestButton = await page.$('[data-type="arrest-button"]');
  91  |       if (arrestButton) {
  92  |         arrestButtonFound = true;
  93  |         break;
  94  |       }
  95  |       await page.waitForTimeout(3000);
  96  |     }
  97  | 
  98  |     if (arrestButtonFound) {
  99  |       await expect(page.locator('[data-type="arrest-button"]')).toBeVisible();
  100 |     }
  101 |   });
  102 | 
  103 |   test("Enemy arrest: open modal, arrest, finish overlay, quest closed", async ({
  104 |     page,
  105 |   }, testInfo) => {
  106 |     test.setTimeout(240000);
  107 | 
  108 |     await page.goto("/");
  109 |     await navigateToFreeMode(page);
  110 |     await page.waitForTimeout(1000);
  111 | 
  112 |     await startDriving(page, { gear: "2", gasMs: 0 });
  113 |     await holdGasFor(page, 30000);
  114 | 
  115 |     let arrestButtonFound = false;
  116 |     for (let i = 0; i < 5; i++) {
  117 |       const arrestButton = await page.$('[data-type="arrest-button"]');
  118 |       if (arrestButton) {
  119 |         arrestButtonFound = true;
  120 |         break;
  121 |       }
  122 |       await page.waitForTimeout(3000);
  123 |     }
  124 | 
  125 |     if (!arrestButtonFound) {
  126 |       testInfo.skip(true, "Arrest button not found in random window");
  127 |       return;
  128 |     }
  129 | 
  130 |     await page.click('[data-type="arrest-button"]');
  131 |     await page.waitForSelector(".quest-arrest-modal", {
  132 |       state: "visible",
  133 |       timeout: 30000,
  134 |     });
  135 | 
  136 |     await page.waitForSelector('[data-type="arrest-modal-button"]', {
  137 |       state: "visible",
  138 |       timeout: 5000,
  139 |     });
  140 | 
  141 |     await page.click('[data-type="arrest-modal-button"]');
  142 |     await page.waitForSelector('[data-type="quest-finish-overlay"]', {
  143 |       timeout: 5000,
  144 |     });
  145 |     await page.click('[data-type="quest-finish-continue"]');
  146 | 
  147 |     await page.waitForSelector(".quest-arrest-modal", { state: "hidden" });
  148 | 
  149 |     const isQuestArrestActive = await page.evaluate(
  150 |       () => window.__TEST_STATE__?.activeMapStore?.isQuestArrestActive ?? true,
  151 |     );
  152 |     expect(isQuestArrestActive).toBe(false);
  153 |   });
  154 | 
  155 |   test("Quest cars accumulate while driving", async ({ page }) => {
  156 |     test.setTimeout(240000);
  157 | 
  158 |     await page.goto("/");
  159 |     await navigateToFreeMode(page);
  160 |     await page.waitForTimeout(1000);
  161 | 
  162 |     await startDriving(page, { gear: "2", gasMs: 0 });
  163 |     await holdGasFor(page, 35000);
  164 | 
  165 |     const questCarCount = await page.evaluate(
  166 |       () => window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0,
  167 |     );
  168 |     expect(questCarCount).toBeGreaterThan(0);
```