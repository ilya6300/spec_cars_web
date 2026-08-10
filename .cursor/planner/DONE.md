# Завершённые задачи spec_cars_web

> Orchestrator переносит сюда задачи со статусом `DONE` из `TASKS.md`.

**Волна 0+1 закрыта:** 5 авг. 2026  
**Волна 2 (TASK-013…015) закрыта:** 5 авг. 2026  
**UI wave (TASK-016…022) закрыта:** 5 авг. 2026  
**PLAN wave (TASK-024+):** TASK-024…028 закрыты 7 авг. 2026  
**Pedestrian quest rework:** TASK-039 закрыта 10 авг. 2026  
**Проверка:** `npm test` 108/108  
**Источник UI wave:** `UI_UX_DRAFT.md`

---

## TASK-039: Map-based pedestrian crossing quest

**Статус:** DONE  
**Закрыто:** 10 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| Квест на карте (`traffic_light_quest_crossing`) | ✅ |
| 30% illegal / 70% green ветки | ✅ |
| Квестовый красный не тормозит полицию | ✅ |
| Размер объекта 230×445, bottom 53% | ✅ |
| Задержка human 3–5 с на красном (после появления на экране) | ✅ |
| Vitest | ✅ 108/108 |
| E2E | ✅ `pedestrian-quest.spec.js` |

### Чекпоинты

- [x] Архитектура / SPEC готовы
- [x] Реализация готова
- [x] Фиксы размера и тайминга human
- [x] Тесты пройдены

---

## TASK-038: Timed mode HUD layout (PLAN §4)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| HUD без фона, top center | ✅ `.mode-hud--timed` |
| Таймер + очки в строку | ✅ row + separator |
| CHASE HUD без регрессии | ✅ |
| Vitest | ✅ 103/103 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Реализация готова
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-037: Leaderboard light blue background (PLAN §3)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| Лёгкий синий фон панели | ✅ `menu.css` |
| Читаемость текста | ✅ |
| Vitest | ✅ 103/103 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Реализация готова
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-036: Night chase mode fixes (PLAN §2)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| QuestArrestModal night overlay | ✅ |
| Pedestrian quest off in chase | ✅ |
| Yellow traffic lights | ✅ |
| No peaceful humans in chase | ✅ |
| Vitest | ✅ 103/103 |
| E2E | ✅ `chase-mode.spec.js` добавлен |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Art direction готов
- [x] Реализация готова
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Art приёмка пройдена
- [x] Документация готова

---

## TASK-035: Quest finish overlay polish (PLAN §1)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| Siren border animation | ✅ |
| No dimmer dismiss | ✅ |
| Arrest-style Continue | ✅ |
| Badge frame sizing fix | ✅ |
| Vitest | ✅ 108/108 |
| Review | ✅ APPROVED |
| UI/UX приёмка | ✅ ACCEPTED |
| Документация | ✅ PROJECT_DOCS § TASK-035 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Реализация готова
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-034: Mobile z-index + controller (п.10)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| controllers z-index 110 | ✅ |
| Mobile compact glass panel | ✅ |
| Touch targets preserved | ✅ |
| Vitest | ✅ 108/108 |
| Review | ✅ APPROVED |
| UI/UX приёмка | ✅ ACCEPTED |
| Документация | ✅ PROJECT_DOCS § TASK-034 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Z-index исправлен
- [x] Контроллер компактнее на mobile
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-033: RefuelModal stub +5л (п.8.5)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| RefuelModal.jsx + refuel-modal.css | ✅ |
| Триггеры fuel=0 + ignition / empty gas | ✅ |
| Stub refuel(5000) + close | ✅ |
| z-index 1800, controlsBlocked | ✅ |
| Vitest | ✅ 108/108 (+7) |
| Review | ✅ APPROVED (RefuelModal scope) |
| UI/UX приёмка | ✅ ACCEPTED |
| Документация | ✅ PROJECT_DOCS § TASK-033 |

### Чекпоинты

- [x] UI/UX дизайн готов (TASK-032)
- [x] Архитектура готова
- [x] RefuelModal реализован
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-032: Дизайн RefuelModal (п.8.4)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| Glass modal spec | ✅ |
| Empty canister + gold CTA | ✅ |
| z-index 1800, data-type | ✅ |
| Deliverable SPEC § UI/UX | ✅ |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Deliverable: спека для TASK-033

---

## TASK-031: Fuel gauge в меню (п.7)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| MenuFuelGauge.jsx read-only | ✅ |
| start-menu__hud fuel + stars | ✅ |
| loadFuel без carStore | ✅ |
| canister--low при пустом баке | ✅ |
| Vitest | ✅ 101/101 (+5 MenuFuelGauge) |
| Review | ✅ APPROVED (MenuFuelGauge scope) |
| UI/UX приёмка | ✅ ACCEPTED |
| Документация | ✅ PROJECT_DOCS § TASK-031 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Gauge в меню desktop + mobile
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-030: Records store + LeaderboardPanel (п.6.2–6.3)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| recordsStore + persistence keys | ✅ |
| LeaderboardPanel под mode-cards | ✅ |
| commitSession menu/complete | ✅ |
| Game.jsx session tracking | ✅ |
| Vitest | ✅ 96/96 (+19 records) |
| Review | ✅ APPROVED |
| UI/UX приёмка | ✅ ACCEPTED (mobile CSS fix) |
| Документация | ✅ PROJECT_DOCS § TASK-030 |

### Чекпоинты

- [x] UI/UX дизайн готов (TASK-029)
- [x] Архитектура готова
- [x] Records store + UI
- [x] Unit-тесты recordsStore
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-029: Дизайн leaderboard (п.6.1)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| Layout: панель под mode-card | ✅ |
| Светлый стиль без blur/засвета | ✅ |
| Метрики per mode | ✅ |
| Deliverable SPEC § UI/UX | ✅ |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Deliverable: макет/спека для TASK-030

---

## TASK-028: ModeResultModal анимация (п.4)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** ui-ux

| Критерий | Результат |
|---|---|
| Карточка min(520px, 92vw) + mode-result-pop | ✅ |
| SVG звёзды collectible-star.svg + stagger | ✅ |
| Метрики timed/chase крупнее | ✅ |
| prefers-reduced-motion | ✅ |
| z-index 2000 | ✅ |
| Vitest | ✅ 77/77 (+5 ModeResultModal) |
| Review / UI/UX | ✅ APPROVED / ACCEPTED |
| Документация | ✅ PROJECT_DOCS § TASK-028 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Документация готова

---

## TASK-027: QuestFinishOverlay (п.5.2–5.3)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1 (Reviewer → E2E fix)

| Критерий | Результат |
|---|---|
| QuestFinishOverlay.jsx + quest-finish.css | ✅ |
| Интеграция 3 модалок | ✅ deferred finish, 1s delay |
| data-type, reduced-motion | ✅ |
| Vitest | ✅ 72/72 (+5 overlay tests) |
| E2E | ✅ police, pedestrian, enemy overlay flow |
| UI/UX приёмка | ✅ ACCEPTED |
| Art приёмка | ⚠️ код/CSS ✅; JPEG ассеты — доработка стиля (3D vs cartoon, промпты в Art review) |
| Документация | ✅ PROJECT_DOCS § TASK-027 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Art direction готов
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Art приёмка (интеграция; ассеты — follow-up)
- [x] Документация готова

---

## TASK-026: Дизайн finish-badge frame (п.5.4)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| UI/UX требования | ✅ золотая рамка mode-card + glass, min(420px, 90vw), overlay 0.6 |
| Art Direction | ✅ 3 finish-badge ассета, CSS-спека, JPEG унификация |
| Deliverable | ✅ `SPEC.md` — разделы для TASK-027 |
| Developer TASK-027 | ⏸ не запущен (gate TASK-026) |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Art direction готов

---

## TASK-025: Y квест-авто + фон criminal + скорость ×1.5 (п.2–3)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| Y квест-авто | ✅ `--player-car-lane-y`, `typeBody={1}` |
| Criminal фон | ✅ `road_1.png` opacity 1 + overlay 50% |
| Скорость | ✅ 450 px/s |
| Тесты | ✅ 67/67 |
| Документация | ✅ `PROJECT_DOCS.md` § TASK-025 |

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура готова
- [x] Art direction готов
- [x] Review одобрен
- [x] UI/UX приёмка пройдена
- [x] Art приёмка пройдена
- [x] Документация готова

---

## TASK-024: Звезда free mode batch-логика (п.1)

**Статус:** DONE  
**Закрыто:** 7 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Batch-модель (2 квеста + нет активной звезды) | ✅ `questsAtLastStarEvent`, state machine в `mapStore` |
| Задержка 15–25 с после порога | ✅ `randomCollectibleStarSpawnDelay`, без immediate spawn |
| Одна звезда за batch | ✅ guard `hasActiveCollectibleStar`, timer → null после spawn |
| `worldX = offsetX + viewportWidth` | ✅ без random / lastObjectEndMeter |
| Baseline на pickup | ✅ `beginStarPickup` |
| Тесты | ✅ `mapStore.test.jsx` — 24 теста, 67/67 total |
| Документация | ✅ `PROJECT_DOCS.md` § TASK-024 |

### Чекпоинты

- [x] Архитектура готова
- [x] Разработка завершена
- [x] Review одобрен
- [x] Документация готова

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
