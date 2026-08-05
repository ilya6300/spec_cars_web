# Завершённые задачи spec_cars_web

> Orchestrator переносит сюда задачи со статусом `DONE` из `TASKS.md`.

**Волна 0+1 закрыта:** 5 авг. 2026  
**Волна 2 (TASK-013…015) закрыта:** 5 авг. 2026  
**UI wave (TASK-016…022) закрыта:** 5 авг. 2026  
**Проверка:** `npm test` 47/47  
**Источник UI wave:** `UI_UX_DRAFT.md`

---

## TASK-001: Lifecycle cleanup и устранение утечек памяти

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `CarStore.dispose()` | ✅ `carStore.jsx` — stop/disconnect audio, clearTimeout, audioCtx.close, `disposed` guard |
| `Game.jsx` cleanup | ✅ `dispose()` car + map в useEffect return |
| `PedestrianCrossingModal` teardown | ✅ unified cleanup carRaf/pedRaf/timerRef |
| rAF race guard | ✅ `useGameLoop.js` — флаг `running` |
| `mapStore.dispose()` | ✅ `stopRefueling()`, `isRefueling = false` |
| `Maps.jsx` longPress | ✅ clear timeout при despawn |
| `npm test` | ✅ 45/45 |
| `npm run test:playwright` | ⚠️ не проверено (нет chromium в окружении) |

### Чекпоинты

- [x] Разработка завершена
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-002: Clean code compliance pass

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `App.jsx` импорты | ✅ только `Game` |
| phantom `questCarActive` | ✅ убран из `PoliceQuestModal` |
| дедупликация `visibleQuestCars` | ✅ через `mapStore.getVisibleQuestCars()` |
| `npm test` | ✅ 45/45 |

### Остаток (вне scope TASK-002)

- Мёртвый код: `PedestrianQuestModal.jsx`, `QuestCarArrestButton.jsx` (ссылаются на `countHelp`) — → TASK-013

### Чекпоинты

- [x] Разработка завершена
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-003: Модуль persistence (localStorage)

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `src/state/persistence.js` | ✅ `getFuel`/`setFuel` |
| валидация `[0, maxFuel]` | ✅ fallback на maxFuel |
| throttle ~1–2 с | ✅ |
| `persistence.test.js` | ✅ 3 теста |
| CarStore не менялся на этапе TASK-003 | ✅ (интеграция — TASK-010) |

### Чекпоинты

- [x] Разработка завершена
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-005: Game bootstrap и реестры контента

**Статус:** DONE (разработка, частично)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `getCarById`, `getMapById`, defaults | ✅ `cars.jsx`, `maps.jsx`, `gameBootstrap.js` |
| `Game.jsx` без `[0]` | ✅ props `carId`, `mapId`, `gameMode` |
| `gameMode='free'` | ✅ tutorial только в free |
| `window.__TEST_STATE__` | ✅ `Game.jsx` |
| `nextSpawnDistances` auto-init | ❌ ~25 ключей вручную в `mapStore.jsx` → TASK-013 |
| E2E | ⚠️ не проверено |

### Чекпоинты

- [x] Разработка завершена (основной scope)
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-006: Car schema и extensibility

**Статус:** DONE (разработка, частично)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `id: 'police-0'`, `service: 'police'` | ✅ |
| `getCarsByService`, `getDefaultCar` | ✅ |
| `cars.test.js` | ✅ 2 теста |
| поле `skins[]` | ❌ не добавлено → TASK-013 |
| игра стартует с полицией | ✅ |

### Чекпоинты

- [x] Разработка завершена (основной scope)
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-008: Quest registry и object factory

**Статус:** DONE (разработка, частично)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `src/state/quests.jsx` | ✅ 3 квеста police, `getHelpTypeForPoliceObject` |
| `human_aggr*` factory (DRY) | ❌ три дубля в `objects.jsx` → TASK-013 |
| wiring quests → mapStore/objects | ❌ `PoliceQuestModal` хардкод typeId → TASK-013 |
| Quest E2E | ⚠️ не проверено |

### Чекпоинты

- [x] Разработка завершена (реестр создан)
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-010: Fuel persistence integration

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| load по `carId` | ✅ конструктор `CarStore` |
| throttled save + beforeunload | ✅ `persistFuel()` |
| первый визит — полный бак | ✅ fallback в persistence |
| невалидное значение → maxFuel | ✅ |
| Vitest | ✅ `carStore.test.jsx` |

### Чекпоинты

- [x] Разработка завершена
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-012: Help badges, веса очков и звёзды

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `helpCounts` + веса +4/+3/+1 | ✅ `carStore.jsx` |
| `addHelp(type)`, сброс сессии | ✅ `resetSessionHelp()` в bootstrap |
| модалки → `addHelp` | ✅ PoliceQuest, PedestrianCrossing, QuestArrest |
| HUD `HelpBadges.jsx` | ✅ 3 badge + stars, `data-type` |
| `sessionScore` / `sessionStars` | ✅ пороги 4/8/14 |
| Vitest | ✅ `carStore.test.jsx` |
| E2E | ⚠️ тесты ещё ищут `countHelp` → TASK-014 |
| UI/UX приёмка | ❌ не проводилась |

### Чекпоинты

- [x] Разработка завершена
- [ ] Review одобрен
- [ ] UI/UX приёмка пройдена
- [ ] Документация готова

---

## TASK-009: Контекстный туториал (idle + enemy)

**Статус:** DONE (разработка)  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `tutorialStore.js` | ✅ idle, цепочка ignition→gear-2→gas, enemy→siren→gear-4 |
| `TutorialOverlay.jsx` | ✅ pulse, `data-type="tutorial-overlay"`, `pointer-events: none` |
| интеграция в `Game.jsx` | ✅ только `gameMode === 'free'` |
| CSS `control.css` | ✅ pulse + `prefers-reduced-motion` |
| скрытие при модалке | ✅ через tutorialStore |
| UI/UX приёмка | ✅ TASK-015 |
| E2E | ✅ game.spec.js, force click |

### Чекпоинты

- [x] Разработка завершена
- [x] Review одобрен (TASK-015)
- [x] UI/UX приёмка пройдена (TASK-015)
- [x] Документация готова

---

## TASK-013: Остаток расширяемости (wave 0 cleanup)

**Статус:** DONE  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `nextSpawnDistances` auto-init | ✅ `buildInitialNextSpawnDistances()` |
| `skins[]` | ✅ `cars.jsx` |
| factory `human_aggr*` | ✅ `createPoliceAggroConfig` |
| `PoliceQuestModal` → `quests.jsx` | ✅ |
| dead code удалён | ✅ |
| `npm test` | ✅ 47/47 |

---

## TASK-014: E2E — Playwright и helpCounts

**Статус:** DONE  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| `test:playwright:install` | ✅ |
| E2E `helpCounts` | ✅ |
| `npm run test:playwright` | ✅ 14 passed, 2 skipped |

---

## TASK-015: Code Review + документация

**Статус:** DONE  
**Закрыто:** 5 авг. 2026

### Проверено

| Критерий | Результат |
|---|---|
| Review | ✅ |
| UI/UX TASK-009/012 | ✅ |
| `PROJECT_DOCS.md` | ✅ |

---

## UI wave (TASK-016…022) — HUD и дизайн-система

**Статус:** DONE  
**Закрыто:** 5 авг. 2026  
**Источник:** `UI_UX_DRAFT.md`

| ID | Задача | Результат |
|----|--------|-----------|
| TASK-018 | Цветовая система | `ui-tokens.css` — CSS variables |
| TASK-016 | HUD glass | `hud.css`, `Car.jsx` без inline styles |
| TASK-017 | CSS consolidation | `control.css` — только tutorial |
| TASK-019 | Канистра | `Bensin.jsx` 52×68, low fuel pulse + «!» |
| TASK-021 | Badge icons | SVG в `src/assets/ui/`, `HelpBadges.jsx` |
| TASK-020 | Микроанимации | gear pulse, ignition flash, badge bounce |
| TASK-022 | Tutorial finger | `tutorial_finger_pointer.svg` |

**Проверка:** `npm test` 47/47

---

## TASK-023: Mobile lane, HUD transparency, help icons

**Статус:** DONE  
**Закрыто:** 5 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| Mobile lane tokens | ✅ `--car-lane-y: 58%`, `--player-car-lane-y: 66%` в `media.css` |
| Mobile glass HUD | ✅ `--ui-glass-bg: 0.38`, blur 8px, убран override 0.8 |
| Help badges A+B | ✅ action-SVG + подписи «Погоня/Арест/Штраф» |
| Desktop regression | ✅ lane/glass tokens без изменений на desktop |

---
