# Техническая документация spec_cars_web

> Постоянная документация для разработчиков. Дополняет `.cursor/planner/PROJECT_PRINCIPLES.md`.
> Обновляется **только после завершения задачи** (последнее: TASK-060, 17 авг. 2026).

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
| События / баланс | `event.config.js` | константы, `getEnemyFirstSpawnGateSec`, `random*QuestCarRespawnDelaySec` |

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
| `npm test` | Vitest (unit), 108 тестов |
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

## [TASK-024] Звезда free mode batch-логика

**Дата:** 2026-08-07

### Описание

Спавнер `collectible_star` в свободном режиме переведён с немедленного/циклического спавна на **batch-модель**: одна звезда за цикл при выполнении обоих условий — нет активной звезды на карте и **2 новых квеста** с момента последнего сбора. После порога — задержка **15–25 с**, затем один спавн на правой границе экрана.

### Ключевые поля (`mapStore`)

| Поле | Назначение |
|------|------------|
| `questsAtLastStarEvent` | Baseline `carStore.totalQuestCompletions` на последнем сборе звезды |
| `questsSinceLastStar` (getter) | `totalQuestCompletions - questsAtLastStarEvent` — квесты с последнего сбора |
| `collectibleStarSpawnTimer` | Секунды до спавна одной звезды; `null` = нет активного отсчёта |

Глобальный gate разблокировки: `carStore.isStarCollectionUnlocked` (≥2 квестов за сессию). Счётчик batch сбрасывается на **сборе** (`beginStarPickup`), не на спавне.

### State machine (`updateCollectibleStarSpawner`)

Вызывается каждый кадр из `tickWorld` с `deltaTime` и `viewportWidth`.

1. `gameMode !== "free"` или `!isStarCollectionUnlocked` → return
2. `hasActiveCollectibleStar()` → return
3. `questsSinceLastStar < 2` → `collectibleStarSpawnTimer = null`; return
4. `collectibleStarSpawnTimer === null` → arm timer 15–25 с (`randomCollectibleStarSpawnDelay`); return (**не** спавнить)
5. Countdown: `timer -= deltaTime`; при `timer <= 0` → `spawnCollectibleStar` → `collectibleStarSpawnTimer = null` (без перезапуска цикла)

### Спавн и сбор

- `spawnCollectibleStar`: guard `hasActiveCollectibleStar()`; позиция X:

  `worldX = offsetX + viewportWidth`

  (правая граница viewport при любом `viewportWidth`; Y без изменений — `--player-car-lane-y`)
- `beginStarPickup`: `questsAtLastStarEvent = totalQuestCompletions`; `collectibleStarSpawnTimer = null`
- `dispose`: сброс `questsAtLastStarEvent` и `collectibleStarSpawnTimer`

### Реализация

- `src/state/mapStore.jsx` — batch state machine, поля, `spawnCollectibleStar`, `beginStarPickup`
- `src/state/mapStore.test.jsx` — тесты batch-логики, guard от повторного спавна, `worldX`

### Влияние

- Первая звезда после unlock: таймер 15–25 с, не немедленный spawn
- Пока звезда на карте — новый batch не стартует
- Квесты на карте не ускоряют следующий batch (baseline только на pickup)
- `fuelConsumption` не затронут

---

## [TASK-025] Y квест-авто в модалках, фон criminal, скорость 450

**Дата:** 2026-08-07

### Описание

Квестовые машины в `PoliceQuestModal` и `PedestrianCrossingModal` выровнены по той же Y-полосе, что игрок (`--player-car-lane-y`), по образцу `QuestCar.jsx` + `car.css`. Убрано двойное позиционирование (`typeBody={1}`). В criminal-квесте виден фон `road_1.png` с затемнением. Скорость подъезда полицейской машины увеличена с 300 до **450 px/s**.

### Позиционирование `.quest-car` (модалки)

| Свойство | Значение |
|----------|----------|
| `top` | `var(--player-car-lane-y)` — 62% desktop (`ui-tokens.css`), 66% mobile landscape (`media.css`) |
| `transform` | `translateY(calc(-100% + var(--car-wheel-offset)))` |
| `width` | 250px; 220px при `max-height: 600px` (`media.css`) |
| Удалено | `bottom: %` (inline и CSS) |

`CarModel` в обеих модалках: `typeBody={1}` (nested body, без дубля offset).

### Criminal-фон (`PoliceQuestModal`)

- `.modal-road-background` — `opacity: 1`, `background-size: cover`, ассет `road_1.png`
- `.police-quest-modal` — `background: transparent`
- `::after` — overlay `rgba(0, 0, 0, 0.5)`, `pointer-events: none`, z-index 1001

Pedestrian crossing: только Y-fix; `.modal-background` без изменений.

### Скорость подъезда

`PoliceQuestModal.jsx`: `speed = 450` px/s (было 300). Вращение колёс: `speed * deltaTime * 0.75`.

### Реализация

- `src/components/game/PoliceQuestModal.jsx` — `typeBody={1}`, `carWidth` 250, speed 450
- `src/components/game/PedestrianCrossingModal.jsx` — `typeBody={1}`, убран inline `bottom`
- `src/style/police_quest.css` — lane Y, видимый road, overlay
- `src/style/pedestrian_crossing.css` — lane Y
- `src/style/media.css` — `.quest-car { width: 220px }` при `max-height: 600px`

### Влияние

- z-index модалок (1000–1004) без изменений
- `fuelConsumption` не затронут
- E2E: `police-quest.spec.js`, `pedestrian-quest.spec.js`

---

## [TASK-027] QuestFinishOverlay — finish flow квестовых модалок

**Дата:** 2026-08-07

### Описание

После клика CTA в квест-модалке («Арестовать» / «Выписать штраф») кнопка скрывается, через **1 с** показывается `QuestFinishOverlay` (finish-badge в золотой рамке на glass-подложке, dimmer 60%). Tap по dimmer или «Продолжить» → **отложенные** побочные эффекты (`addHelp`, `removeObject*`, `finishQuest*`). MobX-флаги квеста (`isPoliceQuestActive` и др.) остаются `true` до dismiss — модалка не размонтируется раньше overlay.

Состояние overlay — `finishPhase` в `PoliceQuestModal` / `QuestArrestModal`; pedestrian — `questCrossing.showFinishOverlay` в `mapStore`, рендер в `Game.jsx` (TASK-040). `mapStore` для overlay state не менялся (кроме pedestrian flags).

### Finish flow (фазы)

| Фаза | `finishPhase` | Поведение |
|------|---------------|-----------|
| CTA visible | `'idle'` | Кнопка видна, MobX-флаг active |
| После клика CTA | `'waiting'` | CTA скрыта, `setTimeout(1000)` |
| Overlay | `'overlay'` | Рендер `QuestFinishOverlay` |
| После Continue/dimmer | — | Deferred handler → `finishQuest*` сбрасывает флаг, модалка размонтируется |

Guard: `dismissCalledRef` предотвращает двойной вызов; `clearTimeout` в cleanup при unmount.

### QuestFinishOverlay

**Файл:** `src/components/game/QuestFinishOverlay.jsx`

| Prop | Тип | Назначение |
|------|-----|------------|
| `variant` | `'pedestrian' \| 'criminal' \| 'enemy'` | Ассет и `data-type` на `<img>` |
| `onDismiss` | `() => void` | Dimmer или «Продолжить» |

- Дочерний элемент корня модалки (`position: absolute; inset: 0`)
- z-index: dimmer **1500**, card/continue **1501** (ниже mode-result 2000)
- Не обёрнут в `observer` (нет чтения MobX)
- `role="dialog"`, `aria-modal="true"`

### Интеграция трёх модалок

| Модалка | CTA | variant | Deferred `onDismiss` |
|---------|-----|---------|----------------------|
| `PoliceQuestModal` | `.arrest-button` | `criminal` | `removeObjectByUid`, `addHelp(criminalArrest)`, siren off, `finishQuest()` — только ветка `questTargetObject` |
| Pedestrian crossing (`Game.jsx`, TASK-040) | click human on red | `pedestrian` | dismiss: `finishPedestrianCrossingQuest`, `addHelp("pedestrianFine")` |
| `QuestArrestModal` | `.arrest-button-quest-car-map` | `enemy` | `addHelp("enemyChase")`, `toggleSirena`, `finishQuestArrest()` |

Ветка `questCar` в `PoliceQuestModal.handleArrest` — без изменений (мгновенный finish, вне scope).

### Стили (`quest-finish.css`)

Импорт: `src/main.jsx`.

| Класс | Назначение |
|-------|------------|
| `.quest-finish-overlay` | Flex-центрирование, `inset: 0`, z-index 1501 |
| `.quest-finish-dimmer` | `rgba(0,0,0,0.6)`, z-index 1500 |
| `.quest-finish-card` | Glass (`--ui-glass-*`), `min(420px, 90vw)`, shadow |
| `.quest-finish-frame` | Gold gradient как `.mode-card__frame` (`#ffd86b` → `#f9b931`) |
| `.quest-finish-image` | `aspect-ratio: 16/9`, `object-fit: cover`, radius 10px |
| `.quest-finish-continue` | `--ui-accent`, min 44×44px |

Анимация `questFinishAppear`: scale 0.85→1, opacity 0→1, 0.3s ease-out.  
`prefers-reduced-motion`: только opacity fade; **delay 1 с сохранён**.  
Mobile landscape (`max-width: 900px` + landscape / `max-height: 500px`): card `min(380px, 88vw)`.

### Ассеты (JPEG)

```
src/assets/quest_img/finish-badge-pedestrian.jpeg  (1280×720)
src/assets/quest_img/finish-badge-criminal.jpeg
src/assets/quest_img/finish-badge-enemy.jpeg
```

Все три — `.jpeg` 1280×720, единый формат (TASK-026).

### data-type (E2E)

`quest-finish-overlay`, `quest-finish-dimmer`, `quest-finish-card`, `quest-finish-frame`, `quest-finish-continue`; на image: `quest-finish-badge-{pedestrian|criminal|enemy}`.

### Реализация

- `src/components/game/QuestFinishOverlay.jsx` — компонент overlay
- `src/style/quest-finish.css` — стили, анимация, адаптив
- `src/components/game/PoliceQuestModal.jsx` — `finishPhase`, timer, deferred dismiss
- `src/components/game/PedestrianCrossingModal.jsx` — то же + `stopAnimations` на клике fine
- `src/components/game/QuestArrestModal.jsx` — то же
- `src/main.jsx` — import CSS
- `src/components/game/QuestFinishOverlay.test.jsx` — Vitest (variants, dismiss)
- E2E: `police-quest.spec.js`, `pedestrian-quest.spec.js`, `quest-cars.spec.js` — wait overlay → continue → modal hidden

### Влияние

- Game loop / `deltaTime` — без изменений (overlay вне rAF)
- `fuelConsumption` — не затронут
- Взаимоисключение квестов: пока overlay виден, флаг active `true` — другие квесты не стартуют (ожидаемо)
- `totalQuestCompletions` / star batch (TASK-024): `addHelp` по-прежнему в deferred dismiss

### Ограничения / follow-up

- **Art Director:** JPEG finish-badge ассеты приняты по интеграции, но отмечен **стилевой mismatch** (3D-рендер vs cartoon UI игры). Ассеты подлежат **регенерации** в едином cartoon-стиле (промпты — Art review TASK-026); код и CSS менять не требуется.

---

## [TASK-028] ModeResultModal — анимация, SVG-звёзды, метрики chase/timed

**Дата:** 2026-08-07

### Описание

Модалка результата режима (`timed` / `chase`) при `modeStore.isComplete`: увеличенная glass-карточка, pop-in анимация, растровые звёзды из `collectible-star.svg` со stagger, режим-специфичные метрики. Логика `modeStore` / `modeScoring` **не менялась** — только UI.

Рендер: `Game.jsx` при `isComplete`; `free` — модалка не показывается.

### Карточка и анимация (`mode.css`)

| Элемент | Значение |
|---------|----------|
| Width | `min(520px, 92vw)` |
| Padding | `36px 32px` (desktop); `28px 24px` mobile landscape |
| Title | `2.2rem` → `1.9rem` mobile landscape |
| z-index | **2000** (выше QuestFinishOverlay 1500) |
| Card animation | `mode-result-pop`: scale 0.88→1, opacity 0→1, **0.45s ease-out** |

`prefers-reduced-motion`: карточка — только opacity fade (`mode-result-pop-reduced`); звёзды — без stagger/pop, empty `opacity: 0.35`.

### SVG-звёзды

- Ассет: `src/assets/ui/collectible-star.svg` (импорт как в `StarFlyOverlay`)
- 3 `<img>` с классами `mode-result-star--filled` / `--empty`
- Filled: полная непрозрачность; empty: `opacity: 0.35`, `filter: grayscale(1) brightness(0.7)`
- Размер: **48×48px** (40×40 mobile landscape), `gap: 12px`
- Stagger: `mode-result-star-pop` — scale 0→1, opacity 0→1, **0.35s**; delay **0.15s / 0.30s / 0.45s**
- `data-filled="true"` / `"false"` на каждой звезде; `starsEarned` из `modeStore.completeMode`

### Метрики по режиму

| Режим | Блок | API | Стиль |
|-------|------|-----|-------|
| `timed` | `mode-result-card__score` | `modeStore.getScoreForCarStore(carStore)` | `1.75rem`, weight 800, `--ui-accent`, tabular-nums |
| `chase` | `mode-result-card__chase` | `modeStore.getChaseProgress(carStore)` → `{ current, target: 3 }` | `1.5rem`, weight 700 |
| `free` | — | модалка не рендерится | — |

Текст chase совпадает с HUD (`ModeTimer`): `Поймано: {current} / {target}`.

### data-type (E2E)

`mode-result`, `mode-result-card`, `mode-result-stars`, `mode-result-star`, `mode-result-score`, `mode-result-chase`, `mode-back-to-menu`.

### Реализация

- `src/components/game/ModeResultModal.jsx` — SVG-звёзды, условные метрики, a11y (`role="dialog"`, `aria-labelledby`)
- `src/style/mode.css` — размеры, анимации, reduced-motion, mobile landscape
- `src/components/game/ModeResultModal.test.jsx` — Vitest: null при `!isComplete`, timed score, chase progress, star fill, a11y

### Влияние

- `modeStore`, `modeScoring`, `mapStore`, `fuelConsumption` — без изменений
- Кнопка «В меню» → `appStore.backToMenu()`; `BackToMenuButton` скрыт при `isComplete`

---

## [TASK-030] Records store + LeaderboardPanel

**Дата:** 2026-08-07

### Описание

Локальное хранение **топ-3 рекордов** для каждого режима (`free`, `timed`, `chase`) в `localStorage`, MobX `recordsStore`, отображение в `LeaderboardPanel` под карточкой режима в `StartMenu`. Метрики сессии обновляются в `Game.jsx` через отдельный rAF-цикл; сохранение — при выходе в меню (`free`) или завершении режима (`timed`/`chase`).

### recordsStore API

**Файл:** `src/state/recordsStore.jsx`

| Константа / поле | Значение |
|------------------|----------|
| `MAX_RECORDS` | 3 |
| `MIN_FREE_SESSION_SEC` | 5 (сессии короче не сохраняются) |
| `recordsByMode` | `{ free: [], timed: [], chase: [] }` |
| `liveSession` | snapshot сессии или `null` |

| Метод | Назначение |
|-------|------------|
| `addRecord(mode, record)` | sort → slice(0, 3) → `saveRecords` |
| `getRecords(mode)` | копия массива рекордов |
| `setLiveSession(snapshot)` | обновление из `Game.jsx` rAF |
| `clearLiveSession()` | cleanup при unmount `Game` |
| `commitSession(trigger)` | `'menu'` или `'complete'` → запись + `clearLiveSession` |

### Сортировка и метрики

| Режим | Поля записи | Сортировка | Триггер сохранения |
|-------|-------------|------------|-------------------|
| `free` | `timeSec`, `km`, `stars` | desc `timeSec` → `km` → `stars` | `backToMenu()` (`trigger: "menu"`), если `durationSec ≥ 5` |
| `timed` | `score` | desc `score` | `completeMode()` (`trigger: "complete"`) |
| `chase` | `timeSec` | asc `timeSec` (мин. время до 3 поимок) | `completeMode()` (`trigger: "complete"`) |

`commitSession` — idempotent: после первого вызова `liveSession` очищен, повторный commit no-op.

### Persistence

**Файл:** `src/state/persistence.js`

| Ключ localStorage | Режим |
|-------------------|-------|
| `spec_cars_records_free` | free |
| `spec_cars_records_timed` | timed |
| `spec_cars_records_chase` | chase |

`loadRecords(mode)` — парсинг JSON, валидация per mode (`isValidFreeRecord` / `isValidTimedRecord` / `isValidChaseRecord`), невалидные записи отфильтровываются. `saveRecords(mode, records)` — синхронная запись.

Инициализация: `recordsStore` constructor загружает все три режима через `loadRecords`.

### Session tracking (Game.jsx)

Отдельный `useEffect` с rAF-циклом `trackSession` (не game loop):

| Поле snapshot | Источник |
|---------------|----------|
| `durationSec` | `(performance.now() - sessionStart) / 1000` |
| `km` | `mapStore.offsetX / stateApp.distanceMetersFactor / 1000` |
| `starsEarned` | `starsStore.totalStars - sessionStartStars` |
| `score` | `calculateSessionScore(carStore.helpCounts, gameMode)` |
| `chaseTimeSec` | фиксируется один раз при `enemyChase >= 3` |

Cleanup: `cancelAnimationFrame` + `recordsStore.clearLiveSession()`.

### Точки commit

| Триггер | Файл | Вызов |
|---------|------|-------|
| Выход в меню (free) | `appStore.jsx` → `backToMenu()` | `recordsStore.commitSession("menu")` |
| Завершение timed/chase | `modeStore.jsx` → `completeMode()` | `recordsStore.commitSession("complete")` |

### LeaderboardPanel

**Файлы:** `src/components/menu/LeaderboardPanel.jsx`, `LeaderboardPanel.format.js`

Размещение: `StartMenu` — `.start-menu__mode-column` (flex column, gap 8px) под кнопкой `.mode-card__frame`.

| mode | `data-type` | Отображение |
|------|-------------|-------------|
| `free` | `leaderboard-free` | `{duration} · {km} · ★ {stars}` |
| `timed` | `leaderboard-timed` | `{score} очков` |
| `chase` | `leaderboard-chase` | `{duration}` + подсказка «3 поимки» |

Пустой список: «Пока нет рекордов». Строки: `data-type="leaderboard-row"`, `data-rank="1|2|3"`.

Форматтеры: `formatDuration` (M:SS / H:MM:SS), `formatKm` (`X.XX км`), `formatScore` (целое).

### Стили (`menu.css`)

| Класс | Назначение |
|-------|------------|
| `.leaderboard-panel` | glass-подложка `rgba(255,255,255,0.12)`, border, radius 12px |
| `.leaderboard-panel__empty` | пустое состояние, `clamp(0.75rem, 1.8vw, 0.85rem)` |
| `.leaderboard-panel__row` | tabular-nums, flex baseline |
| `.leaderboard-panel__hint` | подпись chase «3 поимки» |

Mobile landscape (`max-width: 900px` + landscape): `min-width: 110px`, уменьшенный padding и font-size.

### data-type (E2E)

`leaderboard-free`, `leaderboard-timed`, `leaderboard-chase`, `leaderboard-row`, `data-rank`.

### Реализация

- `src/state/recordsStore.jsx` — MobX store, sort, commit
- `src/state/recordsStore.test.jsx` — 14 Vitest (init, load, sort per mode, max 3, commit menu/complete, double commit, persistence)
- `src/state/persistence.js` — `loadRecords`, `saveRecords`, валидация
- `src/state/persistence.test.js` — тесты ключей и round-trip
- `src/state/appStore.jsx` — `commitSession("menu")` в `backToMenu`
- `src/state/modeStore.jsx` — `commitSession("complete")` в `completeMode`
- `src/components/game/Game.jsx` — rAF session tracking
- `src/components/menu/LeaderboardPanel.jsx` — UI панели
- `src/components/menu/LeaderboardPanel.format.js` — форматтеры
- `src/components/menu/StartMenu.jsx` — колонки + панели под карточками
- `src/style/menu.css` — стили leaderboard, адаптив

### Влияние

- `fuelConsumption` — не затронут
- Game loop (`useGameLoop` / `tickGameFrame`) — без изменений; session tracking — отдельный rAF
- E2E: `localStorage.clear()` в init script по-прежнему изолирует рекорды между прогонами
- Vitest: **96** тестов (было 47)

---

## [TASK-031] MenuFuelGauge — fuel gauge в стартовом меню

**Дата:** 2026-08-07

### Описание

Read-only канистра топлива в стартовом меню: показывает сохранённый уровень бака **дефолтной машины** (`getDefaultCar()`) без подключения `carStore`. Канистра и глобальные звёзды объединены в фиксированный HUD-кластер `.start-menu__hud` (канистра слева, звёзды справа). Стили и пороги предупреждений совпадают с in-game `Bensin.jsx`.

### MenuFuelGauge

**Файл:** `src/components/menu/MenuFuelGauge.jsx`

```jsx
MenuFuelGauge({ maxFuel, carId, className? })
```

| Аспект | Значение |
|--------|----------|
| Источник данных | `loadFuel(maxFuel, carId)` из `persistence.js` — **без** `carStore` |
| Fallback | `loadFuel(...) ?? maxFuel` (полный бак при отсутствии ключа) |
| `data-type` | `menu-fuel-gauge` |
| Поведение | read-only, `pointer-events: none` |
| CSS | `.bensin-container`, `.canister`, `.canister--low`, `.canister--warning` (из `interface.css`) |

Логика уровня (как `Bensin.jsx`):

| Порог | Класс / UI |
|-------|------------|
| `< 5%` | `canister--low` + иконка `!` |
| `< 25%` (не low) | `canister--warning` |
| Литры | `Math.floor(fuel / 1000)` + `л` |
| Заполнение | CSS `--fuel-percent`, `data-fuel-percent` |

### getDefaultCar и props

**Файл:** `src/state/cars.jsx` — `getDefaultCar()` → `Cars.cars[0]`.

| Поле | Значение |
|------|----------|
| `id` | `"police-0"` |
| `fuel` | `65000` (передаётся как `maxFuel`) |

`StartMenu` вызывает `getDefaultCar()` один раз и передаёт `maxFuel={defaultCar.fuel}`, `carId={defaultCar.id}`.

### loadFuel

**Файл:** `src/state/persistence.js`

```js
loadFuel(maxFuel, carId) → number | null
```

- Ключ: `spec_cars_fuel_{carId}`
- `null` — ключ отсутствует (UI показывает полный бак)
- Невалидное / вне диапазона `[0, maxFuel]` → `maxFuel`
- Тот же API, что в `carStore` constructor при старте игры; в меню `scheduleFuelSave` не вызывается

### HUD-кластер (`start-menu__hud`)

**Файл:** `src/components/menu/StartMenu.jsx`

```jsx
<div className="start-menu__hud" data-type="start-menu-hud">
  <MenuFuelGauge maxFuel={defaultCar.fuel} carId={defaultCar.id} />
  <GlobalStarsDisplay />
</div>
```

Standalone `GlobalStarsDisplay` с отдельным fixed-позиционированием (`.start-menu__stars`) **удалён** — звёзды только внутри кластера.

### Стили (`menu.css`)

| Класс | Назначение |
|-------|------------|
| `.start-menu__hud` | `position: fixed`, top/right **20px**, flex row, `gap: clamp(8px, 1.2vw, 12px)`, `z-index: 10`, `pointer-events: none` |
| `.start-menu__hud .global-stars` | `border: none` (pill без дублирующей рамки) |
| `[data-type="menu-fuel-gauge"]` | `pointer-events: none` |

Mobile landscape (`max-width: 900px` + landscape / `max-height: 500px`):

| Свойство | Значение |
|----------|----------|
| top / right | `clamp(10px, 2vh, 12px)` |
| gap | `clamp(6px, 1vw, 8px)` |
| `.global-stars` | compact pill: `padding: 4px 10px`, `font-size: 0.85rem` |

### data-type (E2E)

`start-menu-hud`, `menu-fuel-gauge`, `global-stars` (без изменений).

### Реализация

- `src/components/menu/MenuFuelGauge.jsx` — read-only gauge
- `src/components/menu/MenuFuelGauge.test.jsx` — 5 Vitest (data-type, full tank, saved fuel, low, warning)
- `src/components/menu/StartMenu.jsx` — HUD-кластер fuel + stars
- `src/style/menu.css` — `.start-menu__hud`, адаптив, удалён `.start-menu__stars`

### Влияние

- `fuelConsumption` — **не затронут**
- `carStore`, game loop, `Bensin` in-game — без изменений
- Persistence топлива: тот же `loadFuel` / `scheduleFuelSave`; меню только читает
- Vitest: **101** тест (было 96; +5 `MenuFuelGauge.test.jsx`)

---

## [TASK-033] RefuelModal — stub +5л при пустом баке

**Дата:** 2026-08-07

### Описание

Модалка «Бензин кончился!» при нулевом топливе с заведённым двигателем. Stub CTA «Смотреть видео» добавляет **5 литров** (`refuel(5000)` мл) без реального видео. Пока модалка открыта — блокировка газа через `controlsBlocked`. Состояние открытия — локальный React state в `Game.jsx` (без нового MobX store).

### RefuelModal

**Файл:** `src/components/game/RefuelModal.jsx`

| Prop | Тип | Назначение |
|------|-----|------------|
| `carStore` | `CarStore` | Канистра через `Bensin` |
| `onWatchVideo` | `() => void` | CTA «Смотреть видео» |

| Элемент | `data-type` |
|---------|-------------|
| Overlay | `refuel-modal` |
| Канистра | `refuel-canister` |
| CTA | `refuel-watch-video` |

- Title: «Бензин кончился!», subtitle: «Посмотри видео — получишь 5 литров»
- Канистра: `Bensin` при `fuel = 0` → `canister--low`, `--fuel-percent: 0%`, `0л`, иконка `!`
- Закрытие **только** через CTA (нет dismiss по overlay / Esc)
- a11y: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="refuel-modal-title"`

### z-index

| Слой | z-index |
|------|---------|
| RefuelModal overlay | **1800** |
| QuestFinishOverlay | 1500 |
| ModeResultModal | 2000 |

Glass overlay: `rgba(0,0,0,0.55)`, `backdrop-filter: blur(4px)`. Карточка: `min(420px, 92vw)`, CTA gold gradient, `min-height: 44px`.

### Триггеры открытия (`Game.jsx`)

| Триггер | Условие | Действие |
|---------|---------|----------|
| **A** | `useEffect` на `fuel`, `isIgnitionOn` | `fuel <= 0 && isIgnitionOn` → open + `releaseGas()` |
| **B** | `Controllers` gas handler | `fuel <= 0` + ignition on → `onEmptyGasPress()` → open |

### Закрытие

| Условие | Действие |
|---------|----------|
| CTA «Смотреть видео» | `carStore.refuel(5000)` + `setIsRefuelModalOpen(false)` |
| `!isIgnitionOn` | `useEffect` → close (глушение двигателя) |

### `carStore.refuel(amount)`

**Файл:** `src/state/carStore.jsx`

```js
refuel(amount) {
  this.fuel = Math.min(this.maxFuel, this.fuel + amount);
  this.persistFuel();
}
```

Stub CTA: **5000 мл = 5 л**. `pressGas()` при `fuel <= 0` — no-op (`isGasPressed` остаётся `false`).

### `controlsBlocked`

**Файл:** `src/components/controllers/Controllers.jsx`

`Game.jsx` передаёт `controlsBlocked={isRefuelModalOpen}`.

При `controlsBlocked === true`:
- `handlePressGas` / `handleReleaseGas` — early return (нет `pressGas` / `releaseGas`)
- Ignition, сирена, передачи — **не** блокируются

При `controlsBlocked === false` и `fuel <= 0`:
- gas press → `onEmptyGasPress()` (триггер B), не `pressGas()`

### Стили (`refuel-modal.css`)

Импорт: `src/main.jsx`.

| Класс | Назначение |
|-------|------------|
| `.refuel-modal-overlay` | `inset: 0`, z-index 1800, flex-центрирование |
| `.refuel-modal-card` | glass, `gap: 16px` |
| `.refuel-modal__canister` | уменьшенная канистра (72×94px desktop) |
| `.refuel-modal-card__cta` | gold gradient, min-height 44px |

Mobile landscape (`max-width: 900px` + landscape / `max-height: 500px`): канистра 60×78px, уменьшенные title/subtitle/padding.

### Реализация

- `src/components/game/RefuelModal.jsx` — компонент модалки
- `src/style/refuel-modal.css` — overlay, card, адаптив
- `src/components/game/Game.jsx` — `isRefuelModalOpen`, триггеры, handlers
- `src/components/controllers/Controllers.jsx` — `controlsBlocked`, `onEmptyGasPress`
- `src/state/carStore.jsx` — `refuel(amount)`
- `src/components/game/RefuelModal.test.jsx` — 4 Vitest (content, canister--low, CTA, a11y)
- `src/state/carStore.test.jsx` — +3 тесты (`refuel(5000)`, cap, `pressGas` at fuel 0)

### Влияние

- `fuelConsumption` — **не затронут**
- Game loop / `tickGameFrame` — без изменений
- Persistence: `refuel` вызывает `persistFuel()` (тот же throttle, что при обычном расходе)
- Vitest: **108** тестов (было 101; +4 `RefuelModal.test.jsx`, +3 `carStore.test.jsx`)

---

## [TASK-034] Controllers z-index 110 + mobile compact glass

**Дата:** 2026-08-07

### Описание

Панель управления (`.controllers_container`) поднята **выше** `.car-ui` (z-index 100), чтобы луч фар и слой машины не перехватывали тапы по газу, зажиганию и сирене. На mobile landscape — компактная glass-панель: меньше padding/gap, более прозрачный фон и лёгкая тень; touch targets газа и зажигания не уменьшаются ниже минимума.

### z-index

| Слой | z-index | Файл |
|------|---------|------|
| `.car-ui` (HUD машины, фары) | 100 | `car.css` |
| `.controllers_container` | **110** | `gearbox.css` |
| Mode HUD (`mode.css`) | 120–130 | без изменений |

Desktop: визуал панели без изменений, кроме z-index.

### Mobile compact glass

**Breakpoint:** `(max-width: 900px) and (orientation: landscape), (max-height: 500px)` — `media.css`.

| Свойство | Desktop (`gearbox.css`) | Mobile compact |
|----------|-------------------------|----------------|
| `padding` | `15px 25px` | `4px 6px` |
| `gap` | `8px` | `6px` |
| `border-radius` | `var(--ui-glass-radius, 20px)` | `10px` |
| `background` | `rgba(20, 25, 35, 0.65)` | `rgba(20, 25, 35, 0.28)` |
| `backdrop-filter` | `var(--ui-glass-blur, 12px)` | `blur(6px)` |
| `box-shadow` | `0 10px 30px …` | `0 2px 8px rgba(0,0,0,0.18), inset …` |
| `bottom` / `right` | `15px` / `5%` | `5px` / `2%` |

Touch targets (mobile, не ниже SPEC):

| Элемент | Размер |
|---------|--------|
| `.gas_pedal` | `min-width: 45px`, `height: 65px` |
| `.ignition-key`, `.ignition-sirena` | `48×48px` |

МКПП на mobile: компактнее (`gear-btn` 36×36, `gearbox-buttons` padding 4px 6px); передачи остаются тапабельными.

Дополнительно: portrait `max-width: 500px` — `flex-wrap`, панель на всю ширину снизу (`border-radius: 0`).

### Реализация

- `src/style/gearbox.css` — `z-index: 110` на `.controllers_container`
- `src/style/media.css` — compact overrides в mobile landscape media query

### Влияние

- `fuelConsumption` — **не затронут**
- `Controllers.jsx`, game loop, MobX — без изменений
- HUD glass tokens (`--ui-glass-bg`, `--ui-glass-blur`) на mobile landscape по-прежнему ослаблены для всего HUD (см. `media.css` `:root`)
- Vitest: **108** тестов (без новых; CSS-only)

---

## [TASK-035] QuestFinishOverlay polish — siren border, dismiss guard

**Дата:** 2026-08-07

### Описание

Визуальная доработка финишной заставки квеста: равномерная рамка badge (без бокового letterboxing), анимированный siren-gradient border вместо золотой рамки, закрытие **только** кнопкой «Продолжить», стиль кнопки как `.arrest-button-quest-car-map`. Родительские модалки и MobX без изменений.

### Изменения

| Область | Было (TASK-027) | Стало |
|---------|-----------------|-------|
| Frame | Gold gradient (`#ffd86b` → `#f9b931`) | `questFinishSirenBorder`: blue `#0055ff`↔red `#ff0000`, **1.5s** ease-in-out infinite |
| Image | `aspect-ratio: 16/9`, `object-fit: cover` | `width: 100%`, `height: auto`, `max-height: min(68vh, 520px)` |
| Dimmer | `<button onClick={onDismiss}>` | `<div aria-hidden="true">`, `pointer-events: none` |
| Continue | `--ui-accent` gold | `#ff4444`, white `2px` border, hover `#cc0000` (arrest style) |

`prefers-reduced-motion`: frame — static blue gradient, animation off; card pop-in — opacity only.

### Реализация

- `src/components/game/QuestFinishOverlay.jsx` — dimmer без onClick
- `src/style/quest-finish.css` — siren keyframes, arrest button, image sizing
- `src/components/game/QuestFinishOverlay.test.jsx` — dimmer click does NOT call `onDismiss`

### Влияние

- Finish flow (`finishPhase`, deferred `onDismiss`) — без изменений
- Все `data-type` сохранены; E2E specs не менялись
- z-index 1500/1501 — без изменений

---

## [TASK-040] Quest finish overlay — рендер в Game.jsx (PLAN §1)

**Дата:** 2026-08-12

### Описание

Pedestrian `QuestFinishOverlay` вынесен из `.pedestrian-crossing-layer` в корень `Game.jsx` (после `Controllers`), чтобы overlay (z-index 1501) не ограничивался stacking context layer (55). Human остаётся в layer z-index 55 — не перекрывает панель управления (110).

### Реализация

- `PedestrianCrossingLayer.jsx` — только human sprite; overlay и `QuestFinishOverlay` import убраны
- `Game.jsx` — overlay при `pedestrianCrossingTargetObject.questCrossing.showFinishOverlay`; guards: free mode, нет police/arrest quest
- `onDismiss`: `finishPedestrianCrossingQuest()` + `addHelp("pedestrianFine")`
- `PoliceQuestModal` / `QuestArrestModal` — finish overlay без изменений (внутри модалок)

### Влияние

- `data-type="quest-finish-continue"` кликабелен на mobile и desktop
- E2E: `pedestrian-quest.spec.js`

---

## [TASK-041] Police quest — подъезд к human_aggr на desktop (PLAN §2)

**Дата:** 2026-08-12

### Описание

В квесте ареста `human_aggr*` полицейская машина в модалке подъезжает вплотную к цели на desktop.

### Реализация

- `PoliceQuestModal.jsx` — `measureEndPosition()`: desktop gap **18px** (было 60), mobile landscape **20px**; remeasure каждый кадр анимации (`endPosition` обновляется в rAF)

### Влияние

- Скорость подъезда 450 px/s без изменений (TASK-025)
- E2E: `police-quest.spec.js`

---

## [TASK-042] Красный `traffic_light` — стоп и блок газа без сирены (PLAN §3)

**Дата:** 2026-08-12

### Описание

Только обычный `traffic_light`. Без сирены: полиция останавливается на красный; газ заблокирован до зелёного. **`traffic_light_quest_crossing` и pedestrian quest не затронуты.**

### Реализация

- `carStore.jsx`:
  - `shouldStopForLight` — `isTrafficLightOnScreen && trafficLightColor === "red"` (night/chase — false)
  - `pressGas()` — early return при `shouldStopForLight && !sirena`
  - `updatePhysics` — при красном без сирены: блок газа + плавное торможение (TASK-046)
  - `checkTrafficLight` — только `typeId === "traffic_light"` (quest crossing игнорируется)

---

## [TASK-046] Плавная остановка перед `traffic_light` на красный (PLAN §1)

**Дата:** 2026-08-12

### Описание

На передачах 1/2 машина останавливалась ~250–350 px от светофора (зона детекта 300–700 px + мгновенный стоп). Цель: остановка в **50–80 px** с плавным торможением по скорости.

### Реализация

- `carStore.jsx`:
  - `trafficLightDistance` — screen px до светофора
  - `checkTrafficLight` — детект до 700 px (без нижней границы 300 px)
  - `TRAFFIC_LIGHT_STOP_TARGET_PX = 65`, `STOP_MAX = 80`
  - Далеко от цели: удержание скорости (без трения)
  - В зоне торможения: `decel = v²/(2·remaining)`, cap `TRAFFIC_LIGHT_MAX_BRAKE`
  - В зоне 50–80 px: `currentSpeed = 0`

### Влияние

- Pedestrian quest / quest crossing — без изменений
- Сирена — без изменений
- Vitest: `carStore.test.jsx` — smooth brake + distance &lt; 300 px

---

## [TASK-047] Civilian quest-cars — остановка на красный `traffic_light` (PLAN §1)

**Дата:** 2026-08-12

### Описание

Гражданские AI-машины (`enemy=false`) останавливаются на красный обычный `traffic_light` с тем же зазором 80 px что полиция; после зелёного — отложенный старт 0.3–1.5 s. **Не затрагивает** `enemy=true`, chase mode, pedestrian quest и `traffic_light_quest_crossing`.

### Реализация

- `trafficLightConstants.js` — общие константы и `getNearestTrafficLightScreenX`
- `questCarStore.jsx`:
  - `updateCivilianTrafficLight` — brake/accel/delay для civilian
  - `approachRemaining = positionX - lightScreenX + STOP_GAP` (подход сзади на экране)
- `mapStore.updateQuestCars` — вызов только для `!enemy && !isNightChaseContext`
- `carStore.jsx` — импорт констант (логика полиции без изменений)

### Влияние

- Police quest, arrest quest, pedestrian crossing — без изменений
- Enemy quest-cars — без изменений

---

## [TASK-043] Peaceful human spawn ×0.5 (PLAN §4.1)

**Дата:** 2026-08-12

### Описание

Частота спавна `human1`–`human16` снижена в 2×. `human_aggr*` без изменений.

### Реализация

- `subobject.jsx` — `ObjectConfigHuman`: `minDistance` 50→**100**, `maxDistance` 6000→**12000** (интервал в `spawnEnvironmentObjects` удваивается)

### Влияние

- Trees и quest objects — без изменений

---

## [TASK-044] Mutex human_aggr ↔ pedestrian crossing (PLAN §4.2)

**Дата:** 2026-08-12

### Описание

Квесты `human_aggr*` и pedestrian crossing не должны быть на экране одновременно.

### Реализация

- `mapStore.jsx`:
  - `startQuest` — return если `isPedestrianCrossingQuestActive`
  - `spawnEnvironmentObjects` — skip `human_aggr*` при активном pedestrian quest
  - `initQuestCrossing` — blocked при `isPoliceQuestActive`, `isQuestArrestActive`, `hasVisiblePoliceAggroOnScreen()`
  - `hasVisiblePoliceAggroOnScreen(viewportWidth)` — on-screen `human_aggr*` в viewport

### Влияние

- Pedestrian quest logic (red walk, finish overlay) — без изменений

---

## [TASK-045] Enemy quest-car — 30 с + gate активного квеста (PLAN §4.3)

**Дата:** 2026-08-12

### Описание

`enemy: true` quest-cars не спавнятся при активном квесте и не раньше **30 с** от начала сессии.

### Реализация

- `mapStore.jsx`:
  - `sessionElapsedSec` — накопление в `tickWorld`
  - `isEnemyQuestCarSpawnBlocked()` — `isPoliceQuestActive || isPedestrianCrossingQuestActive || isQuestArrestActive || sessionElapsedSec < 30`
  - `spawnQuestCar` — при blocked enemy: перезапуск `questCarSpawnTimer`, без спавна; civilian cars без gate

### Влияние

- Chase mode timer логика spawn — без изменений для civilian pool
- `checkQuestCarDistance` / arrest range — без изменений

---

## [TASK-049] SVG-дождь, мокрый асфальт, мягкая ночь (chase)

**Дата:** 2026-08-13  
**Заменяет визуал TASK-048:** CSS `repeating-linear-gradient` (~105°) → SVG-тайл + три overlay FAR/MID/NEAR. Механика атмосферы (`atmosphereStore`, `getAtmosphereForMode`) без изменений.

**Частично обновлено TASK-050:** независимость NIGHT / RAIN / WET, `HeadlightRoadLayer` (z-index 48), gate дождя только `isRainy`, `.road-wet` только `--rain`. Актуальная иерархия слоёв и `data-type` — в секции TASK-050.

### Описание

Ночная погоня (режим `chase`: `--night` + `--rain`) — отдельные капли поверх машин и под HUD, слабые блики мокрого асфальта **под** машинами, мягкий ночной `filter` только на карте. День (free/timed) без дождя и мокрой дороги.

Чтобы капли крыли спрайт, но не спидометр, **снят stacking context с `.car-ui`**: у контейнера больше нет `z-index` (было 100). Спрайт игрока — 60, дождь — 100, HUD / speed-display — 105.

### Причина

При равном z-index 100 у `.game-rain-container` и `.car-ui` машина оказывалась поверх дождя (Car позже в DOM). `z-index` на `.car-ui` запирал HUD внутри stacking context — панель нельзя было поднять над соседним дождём, не намочив весь `.car-ui`.

### Реализация

| Файл | Что сделано |
|------|-------------|
| `src/assets/effects/rain.svg` | Тайл `viewBox="0 0 360 360"`: группы `rain-small` / `rain-medium` / `rain-large` (~70/25/5), `line` цвет `rgb(210,230,255)`, угол **~12°** от вертикали |
| `src/components/game/RainLayer.jsx` | Vite `import` SVG → `--rain-texture`; слои `--far` / `--mid` / `--near`; gate `isRainy && isNight` → `return null`; `data-type="rain-layer"` |
| `src/style/mode.css` | Удалены gradient-дождь и старые `@keyframes rain-*`; SVG `background-image: var(--rain-texture)`; night filter; reduced-motion = статика, не `opacity: 0` |
| `src/style/car.css` | Удалён `z-index: 100` у `.car-ui` (`position` / `pointer-events: none` сохранены) |
| `src/style/player-car.css` | `z-index: 60` на `.car_container--player.car_container--standalone` |
| `src/style/hud.css` | `.hud-panel`: `position: relative; z-index: 105` |
| `src/style/quest_car.css` | `.speed-display` 51 → **105** |
| `src/components/map/Maps.jsx` | Первый ребёнок `.game-map` — `<div className="road-wet" aria-hidden="true" />` |
| `src/style/road.css` | `.road-wet`: z-index **0** внутри map, токены полосы, radial-блики, gate night+rain |
| `tests/e2e/chase-mode.spec.js` | Слои far/mid/near, нет gradient, z-index HUD > rain > player, free без дождя, reduced-motion, дождь не внутри arrest-модалки |

`Game.jsx` (порядок Maps → AtmosphereOverlay → RainLayer → Car), `Car.jsx`, `atmosphereStore`, `modeScoring`, `gearbox.css` (controllers 110) — без изменений по задаче.

### Слои дождя (`mode.css`)

Видимость капель: только `.game-viewport--night.game-viewport--rain .game-rain`.

| Слой | opacity | duration | delay | `background-size` desktop | mobile landscape |
|------|---------|----------|-------|---------------------------|------------------|
| `--far` | 0.12 | 7.0s | — | 280px | 336px |
| `--mid` | 0.18 | 4.6s | −1.3s | 360px | 432px |
| `--near` | 0.24 | 2.8s | −0.7s | 480px | 576px |

Движение: `translate3d` вдоль угла капель (`rain-drift-*`), `linear infinite`, слои не синхронны.

**Ночь (только `.game-map`):** `filter: brightness(0.78) saturate(0.82) hue-rotate(-8deg)`. Overlay 45 не усилен.

**Reduced-motion:** `animation: none` на `.game-rain`; opacity 0.06 / 0.08 / 0.10 (капли видны, не скрыты); night filter `brightness(0.80) saturate(0.85) hue-rotate(-6deg)`. Wet: `animation: none`.

### Мокрый асфальт (`.road-wet`)

Внутри stacking context `.game-map` (z-index 1 + `transform: translateY(var(--map-shift-y))` + ночной filter) → едет с картой, **под** машинами (Car/QuestCar — siblings карты).

- Геометрия: `top: calc(var(--road-lane-y) - 12%)`; `height: calc(var(--player-car-lane-y) - var(--road-lane-y) + 22%)`
- 3 `radial-gradient` (не `repeating-linear-gradient`), `filter: blur(10px)`, shimmer 16s
- `opacity: 0` по умолчанию; `.game-viewport--night.game-viewport--rain .road-wet { opacity: 1 }`
- Без нового `data-type`

### Влияние

**Game loop / `deltaTime` / spawn / квесты / scoring — не затронуты.** Анимация — CSS overlay, не `worldX`.

**Z-index chase ПОСЛЕ** (stacking context — `.game-viewport`):

```
.map(1) + .road-wet(0 внутри map) + .road-line/objects(1–2)
→ AtmosphereOverlay(45)
→ quest-car(50)
→ player sprite(60)
→ RAIN(100)
→ hud-panel(105) + speed-display(105)
→ controllers(110)
→ mode-hud(120)
→ stars(130)
→ back(300)
→ модалки (1000+) / arrest 1200+ / finish 1500+ / refuel 1800 / mode-result 2000
```

`.car-ui` **больше не имеет z-index 100** (нет stacking context). Nested `CarModel` в модалках (`--nested`) без z-index 60.

Free-only слои без дождя: collectible-star 55, pedestrian layer 55, star-fly 140.

**E2E:** `data-type="rain-layer"` сохранён. Новых кликовых `data-type` нет. Playwright: far/mid/near; `background-image` без `repeating-linear-gradient`; computed z-index HUD > rain > player; free — нет `rain-layer`, `.road-wet` opacity 0; arrest — `rain-layer` в viewport, не внутри `.quest-arrest-modal`; reduced-motion — `animation-name: none`, opacity > 0.

### Ограничения

- **Не** вешать на `.car-ui` `z-index` / `transform` / `filter` / `opacity < 1` / `isolation` — HUD снова окажется под дождём.
- Дождь монтируется и виден **только** night+rain (`isRainy && isNight` + классы viewport).
- `.game-rain-container`, `.game-rain`, `.road-wet` — `pointer-events: none` (клики по объектам карты и контролам не перехватываются).
- Мокрый эффект **не** на `.road-line` и не sibling карты в `Game.jsx` (иначе потеряется `--map-shift-y`).
- HUD, контролы, модалки, кузов вне `.game-map` — без ночного `filter`.
- JSX `Car.jsx` не выносить HUD; AtmosphereOverlay z-index 45 не удалять и не затемнять.

### Адаптивность

| Элемент | ПК | Mobile landscape (`max-width: 900px` + landscape **или** `max-height: 500px`) |
|---------|----|-------------------------------------------------------------------------------|
| Дождь | `inset: 0` на `.game-viewport` (`100vw` × `100dvh`) | то же, без 4-го слоя |
| Плотность капель | background-size 280 / 360 / 480 | **+20%** (336 / 432 / 576) — плотность не выше ПК |
| Мокрый асфальт | токены `--road-lane-y` 53%, `--player-car-lane-y` 63%, `--map-shift-y: 0` | те же токены (media.css: 52% / 78%, `--map-shift-y: -10vh`) |
| HUD / контролы | z-index 105 / 110 | размеры и touch targets из `hud.css` / `media.css` **не менялись** |
| `pointer-events` | none на дожде и wet | none |

Portrait `max-width: 500px` — только контролы; дождь по-прежнему fullscreen.

---

## [TASK-050] Улучшение свечения фар — независимость NIGHT / RAIN / WET

**Дата:** 2026-08-13  
**Контекст:** ui-ux  
**Опирается на:** TASK-049 (SVG-дождь, `.road-wet`, ночной filter карты). MobX `atmosphereStore`, `modeScoring`, scoring, SVG/анимация дождя — **без изменений**.

### Описание

Разделены визуальные состояния **NIGHT** (фары), **RAIN** (дождь) и **WET** (мокрый асфальт / отражение). Убрана связка `night && rain` для дождя и мокрой дороги. Добавлены: два конуса фар на спрайте машины (left/right), слой освещения дороги `HeadlightRoadLayer` между атмосферой и машиной, glow кузова при ночных фарах.

### Независимость состояний

Классы viewport: `--night` от `atmosphereStore.isNight`, `--rain` от `atmosphereStore.isRainy` (`Game.jsx`).

| Состояние | `--night` | `--rain` | Фары (игрок, зажигание on) | RainLayer | `.road-wet` | `headlight-reflection` |
|-----------|-----------|----------|------------------------------|-----------|-------------|------------------------|
| DAY + NO RAIN | нет | нет | нет | нет | opacity 0 | нет |
| DAY + RAIN | нет | да | нет | да | opacity 1 | нет (road layer не рендерится) |
| NIGHT + NO RAIN | да | нет | да (2 конуса + road beam) | нет | opacity 0 | нет |
| NIGHT + RAIN | да | да | да | да | opacity 1 | да (внутри `HeadlightRoadLayer`) |

Фары игрока: `showPlayerHeadlights = isNight && isIgnitionOn` (`Game.jsx`). Квест-машины: `showHeadlights={isNight}` (без зажигания). Chase по умолчанию = NIGHT + RAIN (`modeScoring`).

### HeadlightRoadLayer

**Файл:** `src/components/game/HeadlightRoadLayer.jsx`

| Аспект | Значение |
|--------|----------|
| Назначение | Мягкое освещение полосы дороги перед игроком; отражение фар на мокром асфальте |
| Gate рендера | `atmosphereStore.isNight && carStore.isIgnitionOn` (зеркало `showPlayerHeadlights`) |
| DOM-порядок | После `AtmosphereOverlay`, до quest cars / `Car` (`Game.jsx`) |
| Позиция | `left: 30px` (как player car); вертикаль — зона между `--road-lane-y` и `--player-car-lane-y` |
| z-index | **48** (`mode.css`) — выше overlay (45), ниже quest-car (50) и player (60) |
| MobX | `observer`; `carStore` через props из `Game.jsx` |

Структура:

```jsx
<div className="headlight-road-layer">
  <div className="headlight-road-beam" data-type="headlight-beam" />
  {isRainy && <div className="headlight-road-reflection" data-type="headlight-reflection" />}
</div>
```

`pointer-events: none`. При выключенном зажигании слой не монтируется.

### Конусы фар на CarModel

**Файл:** `src/components/car/CarModel.jsx`

При `showHeadlights` — два элемента вместо одного `.car-headlight-beam`:

| Элемент | Класс | `data-type` |
|---------|-------|-------------|
| Левый конус | `car-headlight-beam--left` | `headlight-beam-left` |
| Правый конус | `car-headlight-beam--right` | `headlight-beam-right` |

DOM-порядок (под кузовом, `z-index: 0`; `car-body` — `z-index: 1`): left → right → sirena → body → wheels.

Стили (`car.css`): left `min(280px, 48vw)`, right `min(380px, 65vw)`; night override градиентов в `mode.css`. Glow кузова: `.game-viewport--night .car_container--headlights .car-body` — `brightness(1.4)` + `drop-shadow` (селектор **без** `--rain`).

Квест-машины используют тот же `CarModel` с `nested`; масштаб через `--traffic-car-width`.

### RainLayer — gate только `isRainy`

**Файл:** `src/components/game/RainLayer.jsx`

```javascript
// Было: if (!isRainy || !isNight) return null;
if (!atmosphereStore.isRainy) return null;
```

Дождь виден при любом времени суток, если `weather === "rain"`. CSS-анимация капель: селектор `.game-viewport--rain` (не `night && rain`) в `mode.css`.

### `.road-wet` — gate только `--rain`

**Файлы:** `src/components/map/Maps.jsx`, `src/style/road.css`

```css
/* Было: .game-viewport--night.game-viewport--rain .road-wet */
.game-viewport--rain .road-wet { opacity: 1; }
```

Отражение фар на мокрой дороге: `.game-viewport--rain .headlight-road-reflection` (`opacity: 0.12`, `blur(10px)`). Геометрия `.road-wet`, shimmer, reduced-motion — без изменений (TASK-049).

### Z-index (обновлённая иерархия chase)

Stacking context — `.game-viewport`:

```
.game-map(1) + .road-wet(0 внутри map) + .road-line/objects(1–2)
→ AtmosphereOverlay(45)
→ .headlight-road-layer(48)          ← TASK-050
→ quest-car(50)
→ collectible-star / pedestrian(55)  [free only]
→ player sprite(60)
→ RAIN(100)
→ hud-panel(105) + speed-display(105)
→ controllers(110)
→ mode-hud(120)
→ stars(130)
→ back(300)
→ модалки (1000+) / arrest 1200+ / finish 1500+ / refuel 1800 / mode-result 2000
```

| Слой | z-index | Файл |
|------|---------|------|
| `.game-map` | 1 | `road.css` |
| `.road-wet` (внутри map) | 0 | `road.css` |
| `.atmosphere-overlay` | 45 | `mode.css` |
| `.headlight-road-layer` | **48** | `mode.css` |
| `.quest-car-other` | 50 | `quest_car.css` |
| player `.car_container--standalone` | 60 | `player-car.css` |
| `.game-rain-container` | 100 | `mode.css` |
| `.hud-panel` | 105 | `hud.css` |

E2E (chase): `zRoadBeam(48) < zPlayer(60) < zRain(100) < zHud(105)`.

### data-type (E2E)

| `data-type` | Элемент |
|-------------|---------|
| `headlight-beam` | Освещение дороги (`.headlight-road-beam` в `HeadlightRoadLayer`) |
| `headlight-beam-left` | Левый конус на машине |
| `headlight-beam-right` | Правый конус на машине |
| `headlight-reflection` | Отражение на мокрой дороге (только night + rain + ignition) |
| `road-wet` | Мокрый асфальт внутри `.game-map` |
| `rain-layer` | Контейнер дождя (без изменений, TASK-049) |

Playwright: `tests/e2e/chase-mode.spec.js` — 4 комбинации day/night × rain/clear через `setAtmosphere`; z-index road beam; reduced-motion rain.

### Реализация

| Файл | Действие |
|------|----------|
| `src/components/game/HeadlightRoadLayer.jsx` | **Создан** — road beam + reflection |
| `src/components/game/Game.jsx` | DOM: Maps → Overlay → HeadlightRoadLayer → QuestCars → Car → RainLayer |
| `src/components/game/RainLayer.jsx` | Gate: только `isRainy` |
| `src/components/car/CarModel.jsx` | Два конуса left/right + `data-type` |
| `src/components/map/Maps.jsx` | `data-type="road-wet"` на `.road-wet` |
| `src/style/car.css` | Конусы `--left` / `--right`, glow кузова |
| `src/style/road.css` | Wet/reflection gate по `--rain` |
| `src/style/mode.css` | `.headlight-road-layer` z-index 48; rain селекторы `--rain` |
| `tests/e2e/chase-mode.spec.js` | 4 состояния атмосферы, headlights, z-index |

### Влияние

- Game loop / `deltaTime` / spawn / квесты / scoring — **не затронуты**
- Ночной `filter` только на `.game-map` — без изменений
- `atmosphereStore`, `modeScoring`, SVG `rain.svg`, `@keyframes rain-drift-*` — без изменений
- Quest cars (z-index 50) выше road beam (48) — glow не перекрывает AI-машины
- `prefers-reduced-motion`: статичные фары; rain/wet reduced-motion из TASK-049 сохранён

### Адаптивность

Позиции через `--road-lane-y`, `--player-car-lane-y`, `--player-car-width`, `--map-shift-y` (`ui-tokens.css`, `media.css`). Road beam: `width: min(625px, calc(var(--player-car-width) * 2.5))`; конусы — `min(…, vw)` как в `car.css`.

### Ограничения

- **Не** возвращать связку `night && rain` для `RainLayer` или `.road-wet`
- **Не** вешать на `.car-ui` `z-index` / `transform` / `filter` / `isolation` (TASK-049)
- Headlight CSS для кузова и конусов — селектор `.game-viewport--night .car_container--headlights` **без** `--rain`
- `HeadlightRoadLayer` не рендерится при выключенном зажигании

---

## [TASK-053] PoliceQuestModal — дождь и свечение фар

**Дата:** 2026-08-14  
**Контекст:** mixed  
**Опирается на:** TASK-051 (`QuestArrestModal` — паттерн rain/headlights в модалке ареста).

### Описание

В `PoliceQuestModal` (квест `human_aggr*`, chase night+rain):

1. SVG-дождь — `<RainLayer />` внутри модалки (`police-quest-modal--rain`).
2. Фары — `showHeadlights={atmosphereStore.isNight}` на полицейской машине.
3. Z-index: road 1001 → overlay 1002 → rain 1003 → target 1004 → quest-car 1005 → CTA 1006.

Отличие от TASK-051: одна машина (полиция подъезжает к human_aggr), не две.

### data-type (E2E)

| data-type | Элемент |
|-----------|---------|
| `rain-layer` | Дождь внутри модалки |
| `atmosphere-overlay` | Ночной overlay |
| `human_aggr1`…`human_aggr3` | Кликабельный объект на карте |

Триггер: клик на `human_aggr*` → `mapStore.startQuest`.

### Реализация

| Файл | Действие |
|------|----------|
| `PoliceQuestModal.jsx` | RainLayer, `--rain`, showHeadlights |
| `police_quest.css` | rain z-index, headlight gradient, z-index cars/CTA |
| `PoliceQuestModal.test.jsx` | Vitest night+rain / day |
| `chase-mode.spec.js` | E2E `startQuest` hook + rain/headlights |

---

## [TASK-051] QuestArrestModal — дождь, фары и вращение колёс

**Дата:** 2026-08-13  
**Контекст:** mixed  
**Опирается на:** TASK-050 (`RainLayer`, `CarModel` + `showHeadlights`). Viewport rain/headlights — без изменений.

### Описание

В `QuestArrestModal` (chase, night+rain) во время CSS-подъезда (3 s / 2.5 s):

1. SVG-дождь — отдельный `<RainLayer />` внутри модалки (`--rain`).
2. Фары — `showHeadlights={atmosphereStore.isNight}` на обеих машинах.
3. Колёса — rAF + `deltaTime`, `WHEEL_SPEED=450`, `×0.75` до `arrestAnimFinished`.
4. CTA — `.quest-arrest-cta`, `data-type="arrest-modal-button"`, z-index 1210, touch ≥48 px.

### Z-index внутри `.quest-arrest-modal`

| Слой | z-index | pointer-events |
|------|---------|------------------|
| Фон | 0 | none |
| Root | 1200 | — |
| Overlay | 1201 | none |
| Дождь | 1203 | none |
| Target car | 1204 | none |
| Police car | 1205 | none |
| CTA | 1210 | auto |
| Finish overlay | 1501 | auto |

### data-type (E2E)

| data-type | Элемент |
|-----------|---------|
| `rain-layer` | Дождь внутри модалки |
| `arrest-modal-button` | CTA «Арестовать» |
| `atmosphere-overlay` | Ночной overlay |

Триггер: `[data-type="arrest-button"]` («Блокировать») в viewport.

### Реализация

| Файл | Действие |
|------|----------|
| `QuestArrestModal.jsx` | RainLayer, showHeadlights, rAF wheels, CTA |
| `quest_arrest.css` | z-index, rain override, headlight gradient, CTA, mobile landscape `top: 58%` |
| `QuestArrestModal.test.jsx` | Vitest 3 кейса |
| `chase-mode.spec.js` | rain/headlights/CTA в modal |

### Тесты

Vitest 3/3; Playwright chase-mode 6/6. Полный `npm test`: 151/152 (RefuelModal pre-existing).

---

## [TASK-052] Free mode — динамический дождь

**Дата:** 2026-08-13  
**Контекст:** logic  
**Опирается на:** TASK-049 (`RainLayer`, wet road, `game-viewport--rain`)

### Описание

В свободном режиме (`GAME_MODES.FREE`) погода управляется планировщиком в `atmosphereStore`:

| Правило | Значение |
|---|---|
| Старт free | 10% шанс дождя сразу |
| Длительность дождя | 2–6 мин (случайно) |
| Без дождя | каждые 60 с — roll 10% на новый дождь |
| Время суток | всегда `day` в free |

Chase/timed — фиксированная атмосфера через `getAtmosphereForMode` без изменений.

### Константы

- `FREE_RAIN_START_CHANCE = 0.1`
- `FREE_RAIN_CHECK_INTERVAL_SEC = 60`
- `FREE_RAIN_DURATION_MIN_SEC = 120`
- `FREE_RAIN_DURATION_MAX_SEC = 360`

### API

| Метод | Назначение |
|---|---|
| `initFreeWeather()` | Старт планировщика (из `appStore.startGame(FREE)`) |
| `stopFreeWeather()` | Остановка (backToMenu / chase/timed start) |
| `tick(deltaTime, gameMode)` | Тик из `tickGameFrame` |
| `shouldStartFreeRain`, `pickFreeRainDurationSec` | Pure helpers для Vitest |

### Test hooks

- `window.__WEATHER_TEST__` — `{ randomValues, rainDurationSec }` (Playwright `addInitScript`)
- `__TEST_STATE__`: `getAtmosphere`, `reinitFreeWeather`, `advanceFreeWeather`, `setFreeWeatherRandomSequence`, `setFreeRainDurationSec`, `stopFreeWeather`

### Реализация

| Файл | Действие |
|------|----------|
| `atmosphereStore.jsx` | Планировщик free weather |
| `atmosphereStore.test.js` | Vitest 10 кейсов |
| `gameSession.js` | `atmosphereStore.tick` |
| `appStore.jsx` | Ветвление free vs chase/timed |
| `Game.jsx` | Расширен `__TEST_STATE__` |
| `helpers.js` | Weather E2E helpers |
| `chase-mode.spec.js` | Fix flaky + 5 free weather cases |

### Тесты

Vitest 10/10; Playwright chase-mode 11/11.

---

## [TASK-055] `event.config.js` — централизация констант событий

**Дата:** 2026-08-16  
**Контекст:** logic

### Описание

Единый модуль баланса и таймингов событий. Константы вынесены из `mapStore`, `atmosphereStore`, `modeScoring`, `objects.jsx`; `questCrossingConstants.js` реэкспортирует `CROSS_ON_RED_CHANCE`.

### API

**Файл:** `src/state/event.config.js`

| Группа | Константы / функции |
|--------|---------------------|
| Enemy quest-car gate | `ENEMY_FIRST_SPAWN_GATE_SEC_FREE/TIMED` = 30, `CHASE` = 20; `getEnemyFirstSpawnGateSec(gameMode)` |
| Quest-car respawn | `randomEnemyQuestCarRespawnDelaySec`, `randomCivilianQuestCarRespawnDelaySec`; initial timers 10 / 5 с |
| Pedestrian quest | `PEDESTRIAN_QUEST_SPAWN_CHANCE` = 1, `CROSS_ON_RED_CHANCE` = 0.3 |
| Free weather | `FREE_RAIN_START_CHANCE`, `FREE_RAIN_CHECK_INTERVAL_SEC`, `FREE_RAIN_DURATION_*` (см. TASK-052) |
| Chase atmosphere | `CHASE_TIME_OF_DAY`, `CHASE_RAIN_CHANCE` → `getAtmosphereForMode` |
| Traffic light | `TRAFFIC_LIGHT_CYCLE_MS` = 10000 |

### Реализация

| Файл | Импорт из `event.config` |
|------|---------------------------|
| `mapStore.jsx` | gates, respawn delays, traffic light cycle |
| `atmosphereStore.jsx` | free rain constants |
| `modeScoring.js` | chase time/rain |
| `objects.jsx` | pedestrian spawn chance |
| `questCrossingConstants.js` | re-export `CROSS_ON_RED_CHANCE` |

### Влияние

Поведение игры без изменений — только перенос magic numbers. Баланс правится в одном файле.

---

## [TASK-056] Управление с клавиатуры (ПК)

**Дата:** 2026-08-16  
**Контекст:** logic

### Описание

Дублирование on-screen контролов с клавиатуры в `Controllers.jsx`. Чистые хелперы КПП — в отдельном модуле.

### keyboardControls

**Файл:** `src/components/controllers/keyboardControls.js`

| Функция | Назначение |
|---------|------------|
| `mapKeyCodeToGear(code)` | `KeyN`/`Digit0` → N; `Digit1`–`Digit4` → 1–4; иначе `null` |
| `shiftGearUp(currentGear)` | N→1→2→3→4; на 4-й — без изменений |

### Привязки (`Controllers.jsx`, `window` keydown/keyup)

| Клавиша | Действие |
|---------|----------|
| `Space` (hold) | `pressGas` / `releaseGas`; при `fuel <= 0` — `onEmptyGasPress` |
| `ControlLeft` | `toggleIgnition` |
| `KeyC` | `toggleSirena` |
| `ShiftLeft` / `ShiftRight` | `shiftGearUp` |
| `N`, `0`–`4` | `shiftGear(gear)` |

`repeat` игнорируется (кроме Space). При `controlsBlocked` — early return.

### `controlsBlocked` (composite, `Game.jsx`)

```js
isRefuelModalOpen ||
modeStore.isComplete ||
activeMapStore.isPoliceQuestActive ||
activeMapStore.isQuestArrestActive
```

Газ, зажигание, сирена и передачи блокируются одинаково. В меню слушателей клавиатуры нет.

### Реализация

- `src/components/controllers/Controllers.jsx` — listeners + интеграция
- `src/components/controllers/keyboardControls.test.js` — Vitest

### Влияние

Touch/mouse контролы без изменений. Game loop / MobX — без изменений.

---

## [TASK-057] Меню «Настройки» и модалка «Управление»

**Дата:** 2026-08-16  
**Контекст:** ui-ux  
**Зависимости:** TASK-056 (список клавиш)

### Описание

Кнопка «Настройки» в `StartMenu` → glass-модалка со списком → пункт «Управление» → `ControlsHelpModal` с текстом про мышь/сенсор, зажигание, МКПП, сирену и таблицу клавиш ПК.

### appStore API

**Файл:** `src/state/appStore.jsx`

| Поле / метод | Назначение |
|--------------|------------|
| `isSettingsModalOpen` | видимость `SettingsModal` |
| `isControlsHelpOpen` | видимость `ControlsHelpModal` |
| `openSettings()` / `closeSettings()` | открыть / закрыть (help сбрасывается) |
| `openControlsHelp()` / `backFromControlsHelp()` | вложенный help / назад в настройки |
| `startGame()` | закрывает обе модалки |

### Модалки

| Компонент | Файл | z-index |
|-----------|------|---------|
| `SettingsModal` | `src/components/menu/SettingsModal.jsx` | overlay **1100** |
| `ControlsHelpModal` | `src/components/menu/ControlsHelpModal.jsx` | overlay 1100, card **1101** |

Закрытие: backdrop, CTA «Закрыть», `Escape` (`StartMenu` — help → settings → close). a11y: `role="dialog"`, `aria-modal`, `aria-labelledby`.

### data-type (E2E)

`open-settings`, `settings-modal`, `settings-modal-backdrop`, `settings-modal-card`, `settings-controls-item`, `settings-modal-close`, `controls-help-modal`, `controls-help-back`, `controls-help-close`, секции `controls-help-section-*`, `controls-help-table`.

### Реализация

- `src/components/menu/StartMenu.jsx` — кнопка, Escape, рендер модалок
- `src/style/settings-modal.css`, `src/style/controls-help-modal.css` — glass, `min(420–480px, 92vw)`, `max-height: 92dvh` у help
- `src/main.jsx` — импорт CSS
- Vitest: `SettingsModal.test.jsx`, `ControlsHelpModal.test.jsx`, `appStore.test.js`

### Влияние

Mode-cards и game loop без изменений. Клавиатура в игре не активна при открытых модалках (listeners только в `Controllers` на экране `game`). HUD z-index (10) ниже модалок (1100+).

---

## [TASK-060] Mobile perf: portrait rain + статичный road-wet

**Дата:** 2026-08-17  
**Контекст:** mixed (реализация — только CSS)  
**Зависимости:** extends TASK-058 (HUD/layout-блок `mode.css:383-444` не менялся); опирается на TASK-049/050 (rain/wet gates, z-index)  
**Out of scope:** TASK-061 (React fiber churn в `Maps.jsx` per-frame rerender)

### Описание

CSS-only оптимизация атмосферы на смартфонах (`viewport width ≤ 900px`, portrait **и** landscape): один статичный far-слой дождя вместо трёх GPU-анимированных; упрощённый `.road-wet` без shimmer и тяжёлого blur. Desktop (`>900px`) — без регрессии: 3 слоя rain + drift, 3 градиента wet + `blur(10px)` + shimmer. JS (`RainLayer.jsx`, `Maps.jsx`, MobX) **не менялся**.

### Root cause (evidence)

1. **Portrait gap TASK-058.** TASK-058 снизил rain до 1 статичного слоя только в query `(max-width: 900px) and (orientation: landscape), (max-height: 500px)` (`mode.css:383-384`). Portrait iPhone ~390×844: `max-width: 900px` ✓, `orientation: landscape` ✗, `max-height: 500px` ✗ (844 > 500) → применялись **desktop** rain rules (`mode.css:294-308`): 3 слоя с `rain-drift-*` и `translate3d` keyframes → лаги 1–2 мин при rain.

2. **Road-wet — тяжёлый CSS на всех mobile.** До TASK-060 `.road-wet` (`road.css:43-71`) на любом viewport: 3 `radial-gradient`, `filter: blur(10px)`, `animation: road-wet-shimmer 16s` — без mobile override. Усиливает paint/composite cost и heap retention (`CSSRadialGradientValue`, PLAN §1).

3. **React fiber (вторичный фактор).** `__reactFiber` на `<div class="road-wet">` из-за per-frame rerender `Maps.jsx` — **не** устраняется TASK-060; paint cost wet-слоя снижен, полное устранение — **TASK-061**.

### Mobile perf zone

| Параметр | Значение |
|----------|----------|
| Breakpoint | `@media (max-width: 900px)` — **отдельный** блок, не смешивается с HUD query TASK-058 |
| Охват | portrait + landscape ≤900px (единая perf-зона) |
| Файлы | `mode.css:446-462` (rain), `road.css:93-113` (road-wet) |
| HUD-блок TASK-058 | `mode.css:383-444` — только mode-hud, stars, back button, mode-result; rain-правила **перенесены** из этого блока |

### Rain — mobile (`max-width: 900px`)

| Свойство | Значение | Desktop reference |
|----------|----------|-------------------|
| Видимые слои | только `.game-rain--far` | FAR/MID/NEAR + drift |
| `.game-rain--mid`, `.game-rain--near` | `display: none` (DOM сохранён, `RainLayer.jsx`) | видимы |
| Opacity far | **`0.16`** (`--rain-far-opacity-mobile`) | 0.12 |
| `background-size` | **`240px`** (`--rain-far-size-mobile`) | 280px |
| `animation` | **`none`** | `rain-drift-far` 7s |
| `.game-rain-container` | `contain: strict` | — |

Modal rain (PoliceQuest, QuestArrest) наследует global `.game-rain` rules.

**`prefers-reduced-motion`:** блок `mode.css:338-357` сохранён. На mobile perf-зоне mid/near скрыты; far — `animation: none`, opacity **0.16** (не понижается до 0.06, иначе единственный слой почти невидим).

### Road-wet — mobile (`max-width: 900px`)

| Свойство | Значение | Desktop reference |
|----------|----------|-------------------|
| Градиенты | **2** radial-gradient | 3 шт. `road.css:52-67` |
| `filter` | **`blur(3px)`** (`--road-wet-blur-mobile`) | `blur(10px)` |
| `animation` | **`none`** | `road-wet-shimmer 16s` |
| Opacity при `--rain` | **`0.88`** (`--road-wet-opacity-mobile`) | `opacity: 1` |
| Gate | `.game-viewport--rain .road-wet` (TASK-050) | без изменений |
| `data-type` | `"road-wet"` | без изменений |

Геометрия без изменений: `top: calc(var(--road-lane-y) - 12%)`, `height: calc(var(--player-car-lane-y) - var(--road-lane-y) + 22%)`.

### CSS tokens (`ui-tokens.css`)

```css
--rain-far-opacity-mobile: 0.16;
--rain-far-size-mobile: 240px;
--road-wet-blur-mobile: 3px;
--road-wet-opacity-mobile: 0.88;
--road-wet-highlight-1-mobile: rgba(210, 230, 255, 0.14);
--road-wet-highlight-2-mobile: rgba(200, 222, 255, 0.12);
```

### Desktop — без регрессии

| Элемент | Поведение (`>900px`) |
|---------|----------------------|
| Rain | 3 слоя FAR/MID/NEAR, `rain-drift-*`, opacity 0.12/0.18/0.24 |
| Road-wet | 3 gradient, `blur(10px)`, shimmer, opacity 1 при `--rain` |
| E2E desktop | `chase-mode.spec.js` — 3 `.game-rain` в DOM, z-index HUD > rain > player |

### E2E — mobile portrait

**Файл:** `tests/e2e/chase-mode.spec.js` — тест `chase: mobile portrait — static rain and simplified road-wet`.

| Шаг | Assertion |
|-----|-----------|
| Viewport | **390×844** |
| Rain far | `animationName: none`, `opacity ≈ 0.16`, `backgroundSize` содержит `240px` |
| Rain mid/near | `display: none` (элементы в DOM) |
| Road-wet | `opacity ≈ 0.88`, `filter` содержит `blur(3px)`, `animationName: none`, **2** `radial-gradient` |

Desktop-тесты chase-mode (3 rain layers, z-index, 4 атмосферных состояния) — без регрессии.

### Адаптивность (viewport)

| Viewport | Rain | Road-wet |
|----------|------|----------|
| Desktop >900px | 3 слоя + drift | 3 gradient + blur 10px + shimmer |
| Mobile ≤900px portrait (390×844) | 1 far static, opacity 0.16 | 2 gradient + blur 3px static |
| Mobile ≤900px landscape (844×390) | 1 far static (было 0.14 в TASK-058 → **0.16**) | 2 gradient + blur 3px static |

Lane/HUD tokens (`media.css`, `--road-lane-y`, `--map-shift-y`) — без изменений TASK-060.

### Реализация

| Файл | Действие |
|------|----------|
| `src/style/ui-tokens.css` | 6 mobile perf tokens (TASK-060 block) |
| `src/style/mode.css` | Новый `@media (max-width: 900px)` rain perf; rain-правила удалены из landscape HUD-блока TASK-058 |
| `src/style/road.css` | Mobile road-wet: 2 gradients, blur 3px, static, opacity token |
| `tests/e2e/chase-mode.spec.js` | Mobile portrait test 390×844 |

**Без изменений:** `RainLayer.jsx`, `Maps.jsx`, `Game.jsx`, `media.css`, MobX-сторы.

### Влияние

- Game loop / `deltaTime` / spawn / квесты / scoring — **не затронуты**
- Z-index и gates TASK-049/050 — без изменений
- Снижен GPU/paint cost rain и wet на mobile portrait (закрыт gap TASK-058)
- React fiber churn на `.road-wet` **остаётся** → TASK-061

### Связь с TASK-061

TASK-060 снижает **CSS paint/composite** cost wet-слоя и rain на mobile. Полное устранение heap retention через `Maps.jsx` inline style churn и `__reactFiber` на `.road-wet` — **out of scope**, отдельная задача TASK-061.

### Ограничения

- **Не** расширять landscape HUD-query (`mode.css:383-384`) perf-правилами rain — иначе HUD-правила применятся к portrait некорректно
- **Не** возвращать gate `night && rain` для `.road-wet` или `RainLayer`
- **Не** вешать на `.car-ui` stacking context (TASK-049)

---
