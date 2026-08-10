# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chase-mode.spec.js >> Chase mode night fixes >> chase: QuestArrestModal shows night overlay
- Location: tests\e2e\chase-mode.spec.js:41:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-type="arrest-button"]') to be visible

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
    - generic: "Поймано: 0 / 3"
  - generic:
    - generic [ref=e15]:
      - generic [ref=e17]:
        - generic: 63л
      - generic [ref=e18]:
        - generic [ref=e20]: "0"
        - generic [ref=e27]: "40"
        - generic [ref=e34]: "80"
        - generic [ref=e41]: "120"
        - generic [ref=e43]:
          - generic:
            - text: "0"
            - generic: км/ч
      - generic [ref=e46]:
        - paragraph [ref=e47]:
          - generic [ref=e48]: 0.113 км
        - generic [ref=e49]:
          - 'generic "Звёзды: 0" [ref=e50]': ☆☆☆
          - generic [ref=e51]:
            - generic "Погоня" [ref=e52]:
              - generic [ref=e54]: "0"
            - generic "Арест" [ref=e55]:
              - generic [ref=e57]: "0"
            - generic "Штраф" [ref=e58]:
              - generic [ref=e60]: "0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e61]:
    - img "Зажигание" [ref=e62] [cursor=pointer]
    - generic [ref=e63]:
      - generic [ref=e64]:
        - generic [ref=e65]: МКПП
        - button "N" [ref=e66] [cursor=pointer]
      - generic [ref=e67]:
        - button "1" [ref=e68] [cursor=pointer]
        - button "2" [ref=e69] [cursor=pointer]
        - button "3" [ref=e70] [cursor=pointer]
        - button "4" [ref=e71] [cursor=pointer]
    - img "Педаль газа" [ref=e72] [cursor=pointer]
    - img "Сирена" [ref=e73] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import {
  3  |   enablePlaywrightTestState,
  4  |   navigateToGameMode,
  5  |   startDriving,
  6  | } from "./helpers.js";
  7  | 
  8  | test.describe("Chase mode night fixes", () => {
  9  |   test("chase: night overlay, no pedestrian modal, yellow traffic lights", async ({
  10 |     page,
  11 |   }) => {
  12 |     await enablePlaywrightTestState(page);
  13 |     await page.goto("/");
  14 |     await navigateToGameMode(page, "mode-chase");
  15 | 
  16 |     await expect(page.locator(".game-viewport--night")).toBeVisible();
  17 |     await expect(
  18 |       page.locator('[data-type="atmosphere-overlay"]'),
  19 |     ).toBeVisible();
  20 | 
  21 |     await startDriving(page, { gear: "2", gasMs: 3000 });
  22 |     await page.waitForTimeout(15000);
  23 | 
  24 |     await expect(page.locator(".pedestrian-crossing-layer")).toHaveCount(0);
  25 | 
  26 |     const trafficLight = page.locator('[data-type="traffic_light"]').first();
  27 |     if ((await trafficLight.count()) > 0) {
  28 |       const bg = await trafficLight.evaluate((el) =>
  29 |         getComputedStyle(el).backgroundImage,
  30 |       );
  31 |       expect(bg).toMatch(/traffic_light_yellow/i);
  32 |     }
  33 | 
  34 |     const humans = await page.locator('[data-type^="human"]').all();
  35 |     for (const h of humans) {
  36 |       const type = await h.getAttribute("data-type");
  37 |       expect(type).not.toMatch(/^human\d+$/);
  38 |     }
  39 |   });
  40 | 
  41 |   test("chase: QuestArrestModal shows night overlay", async ({ page }) => {
  42 |     await enablePlaywrightTestState(page);
  43 |     await page.goto("/");
  44 |     await navigateToGameMode(page, "mode-chase");
  45 |     await startDriving(page, { gear: "2", gasMs: 5000 });
  46 | 
  47 |     const arrestBtn = page.locator('[data-type="arrest-button"]');
> 48 |     await arrestBtn.waitFor({ state: "visible", timeout: 60000 });
     |                     ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  49 |     await arrestBtn.click();
  50 | 
  51 |     await expect(page.locator(".quest-arrest-modal--night")).toBeVisible();
  52 |     await expect(
  53 |       page.locator(".quest-arrest-modal [data-type='atmosphere-overlay']"),
  54 |     ).toBeVisible();
  55 |   });
  56 | });
  57 | 
```