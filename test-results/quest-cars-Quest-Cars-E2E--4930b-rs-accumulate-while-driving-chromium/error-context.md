# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest-cars.spec.js >> Quest Cars E2E >> Quest cars accumulate while driving
- Location: tests\e2e\quest-cars.spec.js:155:3

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
    - generic [ref=e24]:
      - generic [ref=e26]:
        - generic: 61л
      - generic [ref=e27]:
        - generic [ref=e29]: "0"
        - generic [ref=e36]: "20"
        - generic [ref=e43]: "40"
        - generic [ref=e50]: "60"
        - generic [ref=e55]: "80"
        - generic [ref=e62]: "100"
        - generic [ref=e69]: "120"
        - generic [ref=e74]: "140"
        - generic [ref=e75]:
          - generic:
            - text: "0"
            - generic: км/ч
      - generic [ref=e78]:
        - paragraph [ref=e79]:
          - generic [ref=e80]: 0.441 км
        - generic [ref=e81]:
          - 'generic "Звёзды: 0" [ref=e82]': ☆☆☆
          - generic [ref=e83]:
            - generic "Погоня" [ref=e84]:
              - generic [ref=e86]: "0"
            - generic "Арест" [ref=e87]:
              - generic [ref=e89]: "0"
            - generic "Штраф" [ref=e90]:
              - generic [ref=e92]: "0"
            - generic "Парковка" [ref=e93]:
              - generic [ref=e95]: "0"
    - generic:
      - img "Кузов"
      - img "Колесо"
      - img "Колесо"
  - generic [ref=e96]:
    - img "Зажигание" [ref=e97] [cursor=pointer]
    - generic [ref=e98]:
      - generic [ref=e99]:
        - generic [ref=e100]: МКПП
        - button "N" [ref=e101] [cursor=pointer]
      - generic [ref=e102]:
        - button "1" [ref=e103] [cursor=pointer]
        - button "2" [active] [ref=e104] [cursor=pointer]
        - button "3" [ref=e105] [cursor=pointer]
        - button "4" [ref=e106] [cursor=pointer]
    - img "Педаль газа" [ref=e107] [cursor=pointer]
    - img "Сирена" [ref=e108] [cursor=pointer]
```

# Test source

```ts
  68  |     expect(stats.total).toBeGreaterThan(0);
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
> 168 |     expect(questCarCount).toBeGreaterThan(0);
      |                           ^ Error: expect(received).toBeGreaterThan(expected)
  169 |   });
  170 | });
  171 | 
```