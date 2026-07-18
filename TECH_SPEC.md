# TECH_SPEC.md — Bugfix: кнопка «Арестовать» для Quest Cars (enemy=true) не появляется

## 📌 Контекст проблемы

`CONCEPT.md`: блок кнопки «Арестовать» в `Game.jsx` должен появляться, когда `enemy=true` машина сравняется с полицейским по X + 250px. Сейчас кнопка **не появляется никогда** (в обычном игровом режиме).

## 🔍 Корневая причина

Две независимые проблемы в условии появления кнопки.

### Проблема 1 — ошибочное условие рендера (главная причина)

`@components/game/Game.jsx` (строка ~147):
```jsx
{activeMapStore.questCarForArrest && activeMapStore.isPedestrianCrossingQuestActive && (
  <button className="arrest-button-quest-car-map" ...>
```
Условие требует `isPedestrianCrossingQuestActive === true` — флаг квеста **пешеходного перехода**, который никак не связан с квестовыми машинами. В обычном режиме (без активного квеста пешехода) этот флаг `false`, поэтому кнопка не рендерится, даже если `questCarForArrest` установлен.

> Вероятный изначальный замысел: скрыть кнопку ареста поверх модалки пешеходного перехода — но пропущен оператор `!`. Корректное условие: `questCarForArrest && !isPedestrianCrossingQuestActive`.

### Проблема 2 — некорректный порог сближения в `checkQuestCarDistance`

`@state/mapStore.jsx` → `checkQuestCarDistance`:
```javascript
const policeScreenX = 30;
const policeWidth = 100;
const policeRightEdge = policeScreenX + policeWidth * 0.5; // = 80
const maxDistance = policeRightEdge + 400;                  // = 480
```
`CONCEPT.md` требует порог **+250px** от X-координаты полицейского (`policeScreenX + 250 = 280`). Текущий порог `480` (на 200px больше) и привязан к `policeRightEdge`, а не к `policeScreenX`.

## 📐 План реализации (минимальные изменения)

### Изменение 1 — `@components/game/Game.jsx` (условие рендера кнопки)

Строка ~147. Заменить:
```jsx
{activeMapStore.questCarForArrest && activeMapStore.isPedestrianCrossingQuestActive && (
```
на:
```jsx
{activeMapStore.questCarForArrest &&
  !activeMapStore.isPedestrianCrossingQuestActive &&
  !activeMapStore.isPoliceQuestActive && (
```
Обоснование: кнопка рендерится, когда `questCarForArrest` установлен (пространственное условие из `checkQuestCarDistance`) И нет активных модальных квестов (чтобы не перекрывать модалки с `z-index: 1000`; у кнопки `z-index: 1003`).

### Изменение 2 — `@state/mapStore.jsx` → `checkQuestCarDistance`

```javascript
checkQuestCarDistance(questCarStores, viewportWidth) {
  const policeScreenX = 30;
  const arrestThreshold = 250; // CONCEPT.md: +250px от X-координаты полицейского
  const minArrestX = policeScreenX;            // = 30 — enemy «сравнялся» с полицейским
  const maxArrestX = policeScreenX + arrestThreshold; // = 280

  let closestQuestCar = null;

  for (const questCar of questCarStores) {
    if (questCar.enemy) {
      try {
        const questCarScreenX = questCar.positionX;
        if (questCarScreenX >= minArrestX && questCarScreenX <= maxArrestX) {
          if (!closestQuestCar || questCarScreenX < closestQuestCar.positionX) {
            closestQuestCar = questCar;
          }
        }
      } catch (error) {
        console.error("Error checking quest car distance:", error);
      }
    }
  }

  this.questCarForArrest = closestQuestCar;
}
```
- Диапазон ареста: `positionX ∈ [30, 280]`.
- `enemy=true` спавнится в `positionX = -200`, движется вправо при `currentSpeed > policeSpeed`, проходит через диапазон `[30, 280]` → `questCarForArrest` устанавливается → кнопка появляется.
- При выходе из диапазона (`positionX > 280`) `questCarForArrest` сбрасывается в `null` → кнопка исчезает.

### Изменение 3 — `@style/quest_car.css` (проверка, без изменений)

Стили `.arrest-button-quest-car-map` корректны:
- `position: fixed` (привязка к viewport);
- `z-index: 1003` (выше модалок `1000`);
- `bottom: 20px; left: 50px; padding: 20px 60px;` — видимая позиция;
- нет `display:none` / `visibility:hidden` / `opacity:0`.

Изменений не требуется. Проверка фиксируется в QA.

### Изменение 4 — `@instructions.md`

Секция «🛑 Кнопка Арестовать (для нарушителя enemy = true)»:
- Условие появления: `questCar.positionX ∈ [policeScreenX, policeScreenX + 250]` (т.е. `[30, 280]`), без привязки к квесту пешеходного перехода.
- Кнопка НЕ показывается поверх активных модальных квестов (пешеходный/полицейский).
- Обновить список действий QA.

### Без изменений
- `questCarStore.jsx` — логика движения корректна (`positionX += relativeSpeed * deltaTime`).
- `QuestCar.jsx` — `screenX = questCarStore.positionX` (исправлено в предыдущей задаче).
- Игровой цикл `requestAnimationFrame` в `Game.jsx` не затрагивается.
- Обработчик `onClick` кнопки — без изменений (уже корректен: `countHelp +1`, `removeQuestCarByIndex`, сброс `questCarForArrest`).

## 🚫 Ограничения
- Новые npm-пакеты: НЕ требуются.
- Сторы: изменяется только тело метода `checkQuestCarDistance` (сигнатура и остальная логика MapStore без изменений).
- Игровой цикл `requestAnimationFrame` не затрагивается.
- Запрещён бойскаутский рефакторинг обработчика `onClick` и других частей `Game.jsx`.

## ✅ Критерии приёмки (DoD)
1. При сближении `enemy=true` машины с полицейским (`positionX ∈ [30, 280]`) кнопка «Арестовать» появляется.
2. Кнопка НЕ появляется поверх модалок квеста пешеходного перехода и полицейского квеста.
3. При выходе машины из диапазона кнопка исчезает.
4. `npm run test` — все существующие unit-тесты зелёные.
5. `npm run build` — без ошибок.
