# TECH_SPEC.md — Bugfix: спавн и относительная скорость Quest Cars

## 📌 Контекст проблемы

`CONCEPT.md` фиксирует два бага квестовых машин:
1. `enemy=false` не появляются справа при движении игрока.
2. `SpeedDisplay` показывает 108 км/ч, полицейский едет 105 км/ч и догоняет `enemy=true` (хотя нарушитель быстрее).

## 🔍 Корневая причина

`QuestCarStore.positionX` — **экранная координата**:
- Спавн: `positionX = viewportWidth + 200` (enemy=false) / `-200` (enemy=true) — смещения относительно экрана.
- Обновление: `positionX += relativeSpeed * deltaTime`, где `relativeSpeed = currentSpeed - policeSpeed` — относительная скорость уже учитывает `policeSpeed`.

Однако UI-слой **повторно вычитает `distance`** (смещение камеры, накапливающее `policeSpeed * deltaTime` каждый кадр):
- `QuestCar.jsx`: `screenX = positionX - distance`
- `Game.jsx` (фильтр рендера и SpeedDisplay, 2 места): `car.positionX - distance`
- `mapStore.checkQuestCarDistance()`: `questCarScreenX = questCar.positionX - distance + 200`

Итоговая скорость экранного смещения: `d(screenX)/dt = currentSpeed - 2 * policeSpeed` — двойной учёт.

Следствия:
- **Баг 1:** спавн `enemy=false` в мировой точке `viewportWidth + 200` рендерится по `positionX - distance`. При `distance > viewportWidth + 350` (~2.5 сек езды) спавн уходит за левый край → машина никогда не видна.
- **Баг 2:** `d(screenX)/dt` сильно отрицательно → более быстрый `enemy=true` движется назад (влево) и «догоняется» более медленной полицией.

## 🧠 Модель координат (утверждённая)

- `positionX` — **экранная координата** квестовой машины (не мировая).
- Камера (фон дороги) движется отдельно через `distance`/`offsetX` и НЕ применяется к квестовым машинам.
- Формула обновления (одинаковая для обеих категорий, уже реализована в `questCarStore.updatePosition`):
  ```javascript
  const relativeSpeed = this.currentSpeed - policeSpeed;
  this.positionX += relativeSpeed * deltaTime;
  ```
- **Физическая проверка:**
  - `enemy=false` (спавн справа, медленнее полиции): `relativeSpeed < 0` → `positionX` уменьшается → движется влево → полицейский догоняет. ✅
  - `enemy=false` быстрее полиции: `relativeSpeed > 0` → движется вправо (уходит вперёд). ✅
  - `enemy=true` (спавн слева, быстрее полиции): `relativeSpeed > 0` → движется вправо → обгоняет. ✅
  - `enemy=true` медленнее полиции: `relativeSpeed < 0` → движется влево (отстаёт) → полиция НЕ догоняет. ✅ (исправляет баг 2)

> ⚠️ Документация (`ARCHITECTURE.md`, `instructions.md`) ранее указывала `-=` для `enemy=false` — это физически некорректно (машина уходит вправо за экран вместо догоняния). Исправляется в рамках задачи.

## 📐 План реализации (минимальные изменения)

### Изменение 1 — `src/components/game/QuestCar.jsx`
- Убрать проп `distance`.
- `const screenX = questCarStore.positionX;` (вместо `positionX - distance`).

### Изменение 2 — `src/components/game/Game.jsx`
- В фильтре рендера `questCars` (строки ~121-122): `car.positionX > -150 && car.positionX < viewportWidthRef.current`.
- В фильтре `visibleCars` для `SpeedDisplay` (строки ~136-137): то же самое.
- Убрать `distance={distance}` из `<QuestCar />`.
- В вызове `activeMapStore.checkQuestCarDistance(...)` убрать третий аргумент `activeMapStore.offsetX` (параметр `distance` более не нужен).

### Изменение 3 — `src/state/mapStore.jsx` → `checkQuestCarDistance`
- Сигнатура: `checkQuestCarDistance(questCarStores, viewportWidth)` (убрать параметр `distance`).
- `const questCarScreenX = questCar.positionX;` (вместо `positionX - distance + 200`).
- Сравнение ближайшей: `questCarScreenX < closestQuestCar.positionX` (вместо `closestQuestCar.positionX - distance`).
- Удалить закомментированную строку `// const questCarScreenX = questCar.positionX - distance;`.

### Изменение 4 — `ARCHITECTURE.md`
- Секция «Quest Cars: Относительное движение»: заменить `-=` для enemy=false на `+=` для обеих категорий; указать, что `positionX` — экранная координата; явно запретить вычитание `distance` в UI.
- Таблица контракта `QuestCarStore.updatePosition`: обновить описание.
- Примеры: пересчитать направления (enemy=false медленнее → влево).

### Изменение 5 — `instructions.md`
- Таблица «Примеры расчётов» и сценарии 1, 2, 8: привести к `+=` для обеих категорий.

### Без изменений
- `questCarStore.jsx` — логика корректна, unit-тесты подтверждают `+=` для обеих категорий.
- `SpeedDisplay.jsx` — показывает абсолютную `currentSpeed / 6.43`, корректно.
- Логика ареста (`questCarForArrest`, кнопка) — вне рамок баг-репорта.

## 🚫 Ограничения
- Новые npm-пакеты: НЕ требуются.
- Сторы (`CarStore`, `MapStore`, `QuestCarStore`) — без изменения логики/методов (только сигнатура `checkQuestCarDistance` теряет неиспользуемый параметр `distance`).
- Игровой цикл `requestAnimationFrame` в `Game.jsx` не затрагивается.

## ✅ Критерии приёмки (DoD)
1. `enemy=false` спавнится у правого края и движется влево к полицейскому при меньшей скорости (виден на экране).
2. `enemy=true` спавнится у левого края и обгоняет полицейского при большей скорости; при меньшей — отстаёт (полиция не догоняет).
3. `npm run test` — все существующие unit-тесты зелёные.
4. `npm run build` — без ошибок.
