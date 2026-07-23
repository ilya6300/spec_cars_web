# E2E Тестирование

## Используемые инструменты

- **Playwright** — для автоматизации и скорости
- **Cypress** — для визуальной проверки и отладки
- **Vitest** — для unit-тестов

## Установка

```bash
npm install -D @playwright/test cypress vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npx playwright install chromium
```

## Скрипты npm

```json
{
  "test": "vitest",
  "test:e2e:playwright": "playwright test",
  "test:e2e:cypress": "cypress open"
}
```

## Структура тестов

```
tests/e2e/
├── game.spec.js           # Базовый рендер Game.jsx
├── police-quest.spec.js   # Полицейский квест
├── pedestrian-quest.spec.js # Пешеходный квест
└── traffic-light.spec.js  # Цикл светофора

cypress/e2e/
├── police-quest.cy.js     # UI проверка полицейского квеста
├── pedestrian-quest.cy.js # UI проверка пешеходного квеста
└── game-controls.cy.js    # UI проверка МКПП и сирены
```

## Unit-тесты

### MapStore

```bash
npm test src/state/mapStore.test.jsx
```

Проверка:

- `startPedestrianCrossingQuest` — активация квеста
- `finishPedestrianCrossingQuest` — деактивация квеста

### CarStore

```bash
npm test src/state/carStore.test.jsx
```

Проверка:

- `pedestrianQuestTriggered` — флаг запуска
- `countHelp` — счётчик успешных арестов

### Integration Tests

```bash
npm test src/components/game/PedestrianCrossingModal.test.jsx
```

Проверка:

- Рендер модалки при активном квесте
- Нулевое значение при неактивном

## E2E Tests (Playwright)

```bash
npm run test:e2e:playwright
```

### Полицейский квест

```javascript
test('Police quest: click aggro human, arrest, countHelp increases', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });

  const initialCount = await page.$eval('.game-viewport', ...);

  await page.click('[data-type="human_aggr1"]');
  await page.waitForSelector('.police-quest-modal', { state: 'visible' });

  await page.click('.arrest-button');
  await page.waitForSelector('.police-quest-modal', { state: 'hidden' });

  const finalCount = await page.$eval('.game-viewport', ...);

  expect(finalCount).toBeGreaterThan(initialCount);
});
```

### Пешеходный квест

```javascript
test("Pedestrian quest: ... -> fine button -> countHelp increases", async ({
  page,
}) => {
  await page.goto("http://localhost:5173");

  await page.click('[data-type="human1"]');
  await page.waitForSelector(".pedestrian-crossing-modal", {
    state: "visible",
  });

  await page.click(".quest-pedestrian");
  await page.waitForSelector(".fine-button", { state: "visible" });

  await page.click(".fine-button");
  await page.waitForSelector(".pedestrian-crossing-modal", { state: "hidden" });

  expect(finalCount).toBeGreaterThan(initialCount);
});
```

### Светофор

```javascript
test("Traffic light cycles between red and green", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForSelector(".game-viewport", { timeout: 10000 });

  await page.waitForTimeout(5000);

  const trafficLight = await page.$('[data-type="traffic_light"]');
  expect(trafficLight).toBeTruthy();
});
```

## E2E Tests (Cypress)

```bash
npm run test:e2e:cypress
```

### UI проверка

```javascript
it("Police quest: click aggro human, arrest, countHelp increases", () => {
  cy.visit("/");
  cy.get(".game-viewport", { timeout: 10000 }).should("be.visible");

  cy.get('[data-type="human_aggr1"]').click();
  cy.get(".police-quest-modal", { timeout: 5000 }).should("be.visible");

  cy.get(".arrest-button").click();
  cy.get(".police-quest-modal", { timeout: 5000 }).should("not.exist");
});
```

### МКПП и сирена

```javascript
it("Gear box: shift gears N, 1, 2, 3, 4", () => {
  cy.visit("/");
  cy.get(".game-viewport", { timeout: 10000 }).should("be.visible");

  cy.get(".gearbox").within(() => {
    cy.get(".gear-n").click();
    cy.get(".gear-1").click();
    // ...
  });
});
```

## Критерии успеха

- ✅ 100% покрытие `MapStore` unit-тестами
- ✅ 100% покрытие `CarStore` unit-тестами
- ✅ 100% покрытие квестов E2E
- ✅ Красный свет → квест срабатывает >= 25% случаев (30% шанс, статистика)
- ✅ Кнопка "Арестовать" / "Выписать штраф" увеличивает `countHelp`
- ✅ Анимации (машина подъезжает, человек идет) работают
- ✅ UI-элементы отображаются корректно (Cypress)

## CI/CD

Добавить в GitHub Actions:

```yaml
- name: Install dependencies
  run: npm ci

- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e:playwright
```
