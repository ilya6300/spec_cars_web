# 🧪 ФАЗА 4: ИНСПЕКТОР КАЧЕСТВА (QA / REVIEWER) - Автоматизация UI-тестирования через Playwright

## 🎨 Q2: UI-тестирование (QA Tester)

**Цель:** Автоматизация проверки UI-поведения модальных окон через Playwright (e2e-тесты).

---

### 📋 Обязанности QA-инспектора Q2

**Входные данные:**
- Реализованный код из Фазы 3 (Разработчик).
- Спецификация `@TECH_SPEC.md`.
- Декомпозиция из `@TODO.md`.

**Инструмент:** Playwright (e2e-тесты в `tests/e2e/`).

**Чек-лист автоматизированного UI-тестирования:**

#### 1️⃣ Модальное окно квеста полиции (`PoliceQuestModal`)

**Проверяемые сценарии (в `police-quest.spec.js`):**
- [ ] Клик по агрессивному пешеходу (`human_aggr1`/`human_aggr2`/`human_aggr3`) → открытие модалки.
- [ ] Анимация машины: слева за экраном → движение к пешеходу (координата `questCarPosition` увеличивается).
- [ ] При остановке машины возле цели появляется кнопка "Арестовать".
- [ ] Клик по кнопке "Арестовать" → сирена выключается, модалка закрывается, `countHelp` увеличивается на +1.
- [ ] `questCarPosition` сбрасывается в `-150` после завершения квеста.

#### 2️⃣ Модальное окно пешеходного перехода (`PedestrianCrossingModal`)

**Проверяемые сценарии (в `pedestrian-quest.spec.js`):**
- [ ] Клик по пешеходу (`human1`...`human16`) при красном свете → открытие модалки.
- [ ] Анимация хумана: начинается через 1-3 секунды, имитирует ходьбу (класс `.walking`).
- [ ] Клик по пешеходу во время анимации → остановка (класс `.walking` удаляется).
- [ ] Кнопка "Выписать штраф" появляется через 1-3 секунды.
- [ ] Клик по "Выписать штраф" → модалка закрывается, сирена включается, `countHelp` увеличивается.

#### 3️⃣ Квест с другими автомобилями (`QuestCar` + `SpeedDisplay`)

**Проверяемые сценарии (в `quest-cars.spec.js`):**
- [ ] Квестовые машины (`questCar`) появляются только если `!isPedestrianCrossingQuestActive && !questCarActive`.
- [ ] `enemy=false`: машина спавнится справа (`positionX > viewportWidth`), движется справа налево (полицейский догоняет при меньшей скорости машины).
- [ ] `enemy=true`: машина спавнится слева (`positionX < 0`), движется слева направо (обгоняет при большей скорости машины).
- [ ] При сближении `questCar` с полицейской машиной (дистанция `< 50px`) → появляется кнопка "Арестовать".
- [ ] При аресте `questCar` → `countHelp +1`, `questCar` удаляется из `questCars`, `questCarActive = false`.
- [ ] `SpeedDisplay` показывает скорость (`questCar.currentSpeed`).
- [ ] При `currentSpeed > 60` → красный цвет + анимация `scale(1.2)`.

---

### 🧩 Структура e2e-тестов

**Имя файла:** `tests/e2e/quest-cars.spec.js` (новый файл для квеста с машинами).

**Тесты:**
```javascript
import { test, expect } from '@playwright/test';

test.describe('Quest Cars E2E', () => {
  test('Quest Car spawn: only if !isPedestrianCrossingQuestActive && !questCarActive', async ({ page }) => {
    // Проверка, что questCar не спавнится во время пешеходного квеста.
  });

  test('Quest Car movement: enemy=false (right to left)', async ({ page }) => {
    // Проверка, что civilian questCar движется справа налево.
  });

  test('Quest Car movement: enemy=true (left to right)', async ({ page }) => {
    // Проверка, что enemy questCar движется слева направо.
  });

  test('Quest Car arrest: button appears when distance < 50px', async ({ page }) => {
    // Проверка появления кнопки "Арестовать" при сближении с полицейской машиной.
  });

  test('Quest Car arrest: countHelp +1, questCar removed, questCarActive = false', async ({ page }) => {
    // Проверка ареста questCar и обновления состояния.
  });

  test('SpeedDisplay: critical speed > 60', async ({ page }) => {
    // Проверка анимации скорости при превышении 60 km/h.
  });
});
```

---

### 🚀 Автоматизация запуска (команды в `package.json`)

**Существующая команда:**
```json
{
  "scripts": {
    "test:playwright": "playwright test tests/e2e"
  }
}
```

**QA-инспектор запускает тесты:**
```bash
npm run test:playwright
# Или для конкретного файла:
npx playwright test tests/e2e/quest-cars.spec.js
```

**При ошибке:** Трейс сохраняется в `playwright-report/`, логи в `test-results/`.

---

### 📝 Выходные данные Q2

**🟢 Если всё ок:**
- Статус `[APPROVED]`.
- Ссылка на отчёт Playwright (`playwright-report/index.html`).
- Тикет в `TODO.md` помечается как `[x]`.

**🔴 Если ошибки:**
- Конкретный баг (например, "кнопка не появляется при дистанции < 50px").
- Возврат кода Разработчику (Фаза 3) с описанием проблемы.

---

## 🔍 Q1: Проверка кода (Code Reviewer)

**См. предыдущий раздел** — проверка:
- Z-Index слоёв (`questCar: z-index=50`, `policeCar: z-index=100`).
- MobX-контракта (только `action`-методы, `observer` у компонентов).
- Очистки ресурсов (`cancelAnimationFrame` в `useEffect`).

---

## 📌 Заметки

**Почему Playwright?**
- Проверка реального DOM (не моки).
- Визуальная валидация (видимость элементов, анимации).
- Интеграционное тестирование (взаимодействие всех компонентов).

**Что НЕ тестируется в Q2:**
- Логика сторов (это unit-тесты в `unit-tests/`).
- Математика координат (это unit-тесты `questCarStore.test.jsx`).
- Генерация случайных скоростей (это unit-тесты).

**Q2 фокусируется на:**
- UI-поведении (клик → анимация → кнопка → результат).
- Визуальной иерархии (z-index, позиционирование).
- Интеграции компонентов (как `QuestCar` рендерится в `Game.jsx`).
