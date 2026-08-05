# Техническая документация spec_cars_web

> Постоянная документация для разработчиков. Дополняет `.cursor/planner/PROJECT_PRINCIPLES.md`.
> Обновляется **только после завершения задачи** (TASK-015, 5 авг. 2026).

---

## Назначение

Здесь фиксируются конкретные изменения по завершённым задачам: что сделано, почему, где в коде, какое влияние на игру.

Базовая архитектура (React, MobX, game loop, квесты, слои) — в `PROJECT_PRINCIPLES.md`, не дублировать.

---

## [Волна 0+1] Game loop, persistence, help, tutorial

**Дата:** 2026-08-05

### Описание

Рефакторинг игрового цикла, устранение утечек, bootstrap по `carId`/`mapId`, persistence топлива, система очков помощи, контекстный туториал.

### Реализация

- `src/state/gameSession.js` — единый `tickGameFrame()`
- `src/hooks/useGameLoop.js` — rAF с флагом `running`
- `src/state/gameBootstrap.js` — `createGameStores({ carId, mapId })`
- `src/state/persistence.js` — `getFuel`/`setFuel`, throttle, `beforeunload`
- `src/state/carStore.jsx` — `dispose()`, `helpCounts`, `addHelp()`, `sessionScore`, fuel load/save
- `src/components/car/HelpBadges.jsx` — HUD иконки + звёзды
- `src/state/tutorialStore.js`, `TutorialOverlay.jsx` — сессионный туториал
- `src/components/game/Game.jsx` — props `carId`, `mapId`, `gameMode`, cleanup dispose

### Влияние

- `mapStore.offsetX` — единственный источник смещения карты
- E2E: `window.__PLAYWRIGHT__` + `window.__TEST_STATE__`
- Счётчик `countHelp` заменён на `helpCounts` + веса очков

### Ограничения

- Режим только `free`; меню (TASK-004/011) отложено
- MobX: мутации через `runInAction` в сторах

---

## [TASK-013] Расширяемость контента

**Дата:** 2026-08-05

### Описание

Автоинициализация спавна объектов, фабрика police quest NPC, wiring `quests.jsx`, схема `skins[]`, удаление мёртвого кода.

### Реализация

- `src/state/objects.jsx` — `initialSpawnDistance`, `buildInitialNextSpawnDistances()`, `createPoliceAggroConfig()`
- `src/state/subobject.jsx` — `initialSpawnDistance` для деревьев и пешеходов
- `src/state/mapStore.jsx` — `nextSpawnDistances` из `objectConfigs` в конструкторе
- `src/state/cars.jsx` — `skins: [{ id, urlBody, urlShell }]`
- `src/components/game/PoliceQuestModal.jsx` — `getHelpTypeForPoliceObject`, `objectConfigByType`
- Удалены: `PedestrianQuestModal.jsx`, `QuestCarArrestButton.jsx`

### Влияние

Добавление нового типа объекта: задать config с `initialSpawnDistance` в `objects.jsx` / `subobject.jsx` — без правки `mapStore`.

---

## [TASK-014] E2E Playwright

**Дата:** 2026-08-05

### Описание

Установка Chromium, миграция квестовых E2E на `helpCounts`, общие хелперы.

### Реализация

- `package.json` — `test:playwright:install`
- `tests/e2e/helpers.js` — `enablePlaywrightTestState`, `getHelpCounts`, `startDriving`, `holdGasFor`
- `police-quest.spec.js`, `pedestrian-quest.spec.js`, `integration.spec.js` — assertions на `helpCounts`
- `localStorage.clear()` в init script E2E (изоляция persistence)

### Влияние

Перед E2E: `npm run test:playwright:install` (один раз). Запуск: `npm run test:playwright`.

---

## Реестры (точки расширения)

| Реестр | Файл | API |
|--------|------|-----|
| Машины | `cars.jsx` | `getCarById`, `getDefaultCar`, `getCarsByService` |
| Карты | `maps.jsx` | `getMapById`, `getDefaultMap` |
| Объекты | `objects.jsx` | `objectConfigs`, `objectConfigByType`, `buildInitialNextSpawnDistances` |
| Квесты | `quests.jsx` | `getQuestsForService`, `getHelpTypeForPoliceObject` |
| Bootstrap | `gameBootstrap.js` | `createGameStores({ carId, mapId })` |

---

## Система очков помощи (сессия)

| Тип | Вес | Иконка HUD |
|-----|-----|------------|
| `enemyChase` | +4 | help-badge-enemy |
| `criminalArrest` | +3 | help-badge-criminal |
| `pedestrianFine` | +1 | help-badge-pedestrian |

Звёзды по `sessionScore`: 1★ ≥4, 2★ ≥8, 3★ ≥14. Сброс при входе в режим (`resetSessionHelp` в bootstrap).

---

## Тесты

| Команда | Назначение |
|---------|------------|
| `npm test` | Vitest (unit), 47 тестов |
| `npm run test:playwright:install` | Chromium для E2E |
| `npm run test:playwright` | E2E Playwright |

---

## [UI wave] HUD glass и дизайн-система (TASK-016…022)

**Дата:** 2026-08-05  
**Источник:** `UI_UX_DRAFT.md`

### Описание

Единая glass HUD-панель, цветовая система UI, консолидация CSS controls, улучшенная канистра топлива, SVG-иконки help badges, микроанимации, новый ассет пальца туториала.

### Реализация

- `src/style/ui-tokens.css` — `--ui-accent`, `--ui-warning`, `--ui-danger`, glass tokens
- `src/style/hud.css` — `.hud-panel`, спидометр (без inline styles)
- `src/components/car/Car.jsx` — glass HUD, убран дубль «Скорость»
- `src/style/control.css` — только tutorial overlay
- `src/components/car/Bensin.jsx` — `--fuel-percent`, low/warning states
- `src/assets/ui/help-badge-*.svg` — иконки badges
- `src/assets/ui/tutorial_finger_pointer.svg` — палец туториала
- `src/components/controllers/Controllers.jsx` — ignition flash animation

### Влияние

- HUD и controls визуально из одной glass-семьи
- z-index HUD 100 без изменений
- `data-type` на HUD и badges сохранены
- `prefers-reduced-motion` для анимаций

---
