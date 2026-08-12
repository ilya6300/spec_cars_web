# Техническая документация spec_cars_web

> Постоянная документация для разработчиков. Дополняет `.cursor/planner/PROJECT_PRINCIPLES.md`.
> Обновляется **только после завершения задачи** (последнее: TASK-045, 12 авг. 2026).

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
