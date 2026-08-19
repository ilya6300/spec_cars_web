# SPEC: TASK-062 — ratioConstants + ratioStore (централизация Ratio)

**Задача:** TASK-062  
**Контекст:** logic  
**Приоритет:** Normal  
**Зависимости:** —  
**Волна:** Radio Quest System (шаг 1)  
**Исполнитель:** Developer

---

## 1. Цель и scope

### Цель

Централизовать показ модалки рации (`Ratio`) через MobX-стор с state machine, `sessionId` и очисткой таймеров. Убрать разрозненный рендер Ratio в `Game.jsx` (кроме free-mode intro). Подготовить константы и API для последующих задач волны (двухшаговая парковка, диспетчерский запрос, Controllers).

### In scope

| # | Что |
|---|-----|
| 1 | `src/state/ratioConstants.js` — тексты, тайминги, дистанции ориентировки |
| 2 | `src/state/ratioStore.jsx` — MobX store: фазы, `sessionId`, `setTimeout`-цепочка, `dispose()` |
| 3 | `Game.jsx` — единый рендер `<Ratio>` из `ratioStore`; cleanup при unmount |
| 4 | `Ratio.jsx` — импорт `RATIO_DISPLAY_SEC` из `ratioConstants` |
| 5 | `parkingZoneConstants.js` — `RATIO_DISPLAY_SEC` из `ratioConstants` (re-export / import) |
| 6 | `src/state/ratioStore.test.js` — unit-тесты стора |

### Out of scope (явно не делать в TASK-062)

| # | Что | Задача |
|---|-----|--------|
| 1 | Двухшаговый флоу парковки (`selectParkingViolationTarget`, `confirmParkingEvacuationViaRadio`) | TASK-063 |
| 2 | Убрать `playRatioSound` / прямой старт эвакуации в `ParkingZoneLayer.jsx` | TASK-063 |
| 3 | `onClick` рации в `Controllers.jsx`, видимость free/timed | TASK-064 |
| 4 | `DISPATCH_ORIENTATION_CONFLICT_CHANCE` в `event.config.js` | TASK-065 |
| 5 | `handleRatioPress`, `orientationQuest`, `spawnOrientationTarget`, `OrientationDistanceHud` | TASK-065 |
| 6 | Ветвление conflict/quiet, HUD «{N} м» | TASK-065 |
| 7 | `mapStore.dispose()` — сброс orientation / ratio timers | TASK-065 |
| 8 | C2 roadside, туториал, E2E parking two-step | TASK-066–068 |
| 9 | Изменения CSS / адаптивного layout рации | — (существующий `control.css`) |

---

## 2. Текущее состояние (evidence)

| Что | Где | Проблема |
|-----|-----|----------|
| Ratio при free-mode intro | `Game.jsx:60–66`, `225–229` | Локальный `showFreeModeRatio` — **оставить** |
| Ratio при `spawn_delay` | `Game.jsx:231–233` | Авто-показ без рации — **убрать** |
| `Ratio` компонент | `Ratio.jsx:7–44` | Собственный `setTimeout` + `clearTimeout` в cleanup (`27–29`); `data-type="ratio"` (`37`) |
| Звук рации | `ratioAudio.js:5–12` | Singleton `Audio`, `playRatioSound()` |
| `RATIO_DISPLAY_SEC = 3` | `parkingZoneConstants.js:37–39` | Дублируется с PLAN; используется в `PARKING_SPAWN_DELAY_*` |
| Клик illegal → звук + эвакуация | `ParkingZoneLayer.jsx:93–97` | Не трогать в TASK-062 |
| `handleParkingViolationClick` | `mapStore.jsx:1090–1107` | Сразу `phase: 'spawn_delay'` |
| `isParkingFineActive()` | `mapStore.jsx:477–484` | Блокирует при `pendingSpotIndex` — фикс в TASK-063 |
| `mapStore.dispose()` | `mapStore.jsx:746–762` | Очищает traffic/refuel timers; **ratio timers — не здесь в TASK-062** |
| Game unmount cleanup | `Game.jsx:140–144` | `carStore.dispose()`, `mapStore.dispose()` |
| MobX контракт | `PROJECT_PRINCIPLES.md:105–113` | `makeAutoObservable`, `runInAction`, таймеры в `dispose()` |
| Единицы 80–250 м | `GAME_UNITS.md`, `state_app.jsx` | 1600–5000 world px (`× 20`) |

**Grep `Ratio` / `playRatioSound` / `RATIO_DISPLAY_SEC` в `src/`:** только `Ratio.jsx`, `Game.jsx`, `ParkingZoneLayer.jsx`, `ratioAudio.js`, `parkingZoneConstants.js` (gearRatio в `carStore` — не рация).

---

## 3. Опора на код

| Паттерн | Файл |
|---------|------|
| MobX store + `makeAutoObservable` | `tutorialStore.js:57+`, `atmosphereStore.jsx:21–35` |
| Singleton store + default export | `atmosphereStore.jsx` (default instance) |
| `dispose()` с `clearInterval` / сброс state | `mapStore.jsx:746–762` |
| Ratio UI: таймер показа в компоненте | `Ratio.jsx:17–29` |
| Централизованный рендер модалки | PLAN § «Централизация Ratio», `Game.jsx:225–233` |
| `key={sessionId}` для remount | PLAN § «Централизация Ratio» (`332–348`) |
| `sessionId` invalidation для таймеров | PLAN § «П.5 — Утечки памяти» (`301–322`) |
| Vitest + fake timers | `tutorialStore.test.js`, `atmosphereStore.test.js` |
| Константы из PLAN § «Константы» | `PLAN.md:71–90` |
| `observer` на `Game` | `Game.jsx:41` — чтение `ratioStore` в render реактивно |

---

## 4. API: `ratioConstants.js`

**Файл:** `src/state/ratioConstants.js` (**создать**)

Экспортировать все тексты и тайминги из PLAN § «Константы» (`PLAN.md:75–89`), **кроме** `DISPATCH_ORIENTATION_CONFLICT_CHANCE` (TASK-065 → `event.config.js`).

```js
export const RATIO_DISPLAY_SEC = 3;
export const DISPATCH_RESPONSE_DELAY_SEC = 1;

export const DISPATCH_REQUEST_MESSAGES = [
  "Диспетчер, я свободный, есть что по близости?",
  "Диспетчер, диспетчер, есть что работа?",
  "Диспетчер, есть что рядом?",
  "Диспетчер, готов принять вызов",
  "Диспетчер, есть что интересного?",
];

export const EVACUATION_RATIO_MESSAGE = "Диспетчер, нужен эвакуатор.";
export const DISPATCH_CONFLICT_MESSAGE = "Да, рядом замечен конфликт";
export const DISPATCH_QUIET_MESSAGE =
  "Пока всё тихо, продолжайте потрулирование";
export const DISPATCH_ORIENTATION_ALREADY_MESSAGE =
  "Мы уже выслали ориентировку, следую к цели";

/** Игровые метры (HUD / геймдизайн) */
export const ORIENTATION_MIN_METERS = 80;
export const ORIENTATION_MAX_METERS = 250;

/** world px = meters × distanceMetersFactor (20) — для TASK-065 spawn */
export const ORIENTATION_MIN_WORLD_PX = ORIENTATION_MIN_METERS * 20; // 1600
export const ORIENTATION_MAX_WORLD_PX = ORIENTATION_MAX_METERS * 20; // 5000
```

### Миграция `RATIO_DISPLAY_SEC`

| Файл | Действие |
|------|----------|
| `parkingZoneConstants.js:37` | Удалить локальное `export const RATIO_DISPLAY_SEC = 3`; `import { RATIO_DISPLAY_SEC } from "./ratioConstants"`; `PARKING_SPAWN_DELAY_*` остаются на базе импорта |
| `Ratio.jsx:3` | `import { RATIO_DISPLAY_SEC } from "../../state/ratioConstants"` |

**Не** добавлять `DISPATCH_ORIENTATION_CONFLICT_CHANCE` в этот файл.

---

## 5. API: `ratioStore.jsx`

**Файл:** `src/state/ratioStore.jsx` (**создать**)

### 5.1. Observable fields

| Поле | Тип | Начальное | Описание |
|------|-----|-----------|----------|
| `phase` | `'idle' \| 'showing' \| 'dispatch_wait' \| 'dispatch_result'` | `'idle'` | State machine (PLAN § «Паттерн ratio-сессии») |
| `message` | `string \| null` | `null` | Текст для `<Ratio>`; `null` → не рендерить store-driven Ratio |
| `sessionId` | `number` | `0` | Инкремент при каждом новом `showMessage`; `key` в `Game.jsx` |
| `playSoundOnShow` | `boolean` | `true` | Проп `playSound` для `<Ratio>` |

### 5.2. Private (не observable)

| Поле | Описание |
|------|----------|
| `_timers` | `number[]` — id `setTimeout` для `clearRatioTimers()` |
| `_onDismissComplete` | `(() => void) \| null` — колбэк после dismiss текущего сообщения |

### 5.3. Methods

- `showMessage(message, options = {})` — options: `{ playSound = true, onComplete = null }`; инкремент `sessionId`, `clearRatioTimers()`, `phase = 'showing'`
- `onRatioDismiss()` — вызывается из Ratio; если `onComplete` — `scheduleAfterDismiss(cb)`
- `scheduleAfterDismiss(callback, delaySec = DISPATCH_RESPONSE_DELAY_SEC)` — guard по `sessionId`
- `showDispatchResult(message, options)` — для TASK-065
- `scheduleTimer(callback, delayMs)` — внутренний, guard по `sessionId`
- `clearRatioTimers()`, `dispose()`
- getter `isFlowActive` — `phase !== 'idle'`

### 5.4. Export

Singleton `ratioStore` по образцу `atmosphereStore`.

### 5.5. Разделение таймеров

| Таймер | Где | Длительность |
|--------|-----|--------------|
| Показ модалки | `Ratio.jsx` `useEffect` | `RATIO_DISPLAY_SEC` (3 с) → `onRatioDismiss()` |
| Пауза диспетчера | `ratioStore.scheduleAfterDismiss` | `DISPATCH_RESPONSE_DELAY_SEC` (1 с) |
| Звук | `Ratio.jsx` при mount если `playSound` | `playRatioSound()` |

**Не** дублировать 3-секундный таймер в `ratioStore`.

---

## 6. Интеграция в `Game.jsx`

- Import `ratioStore`
- Оставить `showFreeModeRatio` intro Ratio
- Добавить store-driven Ratio с `key={ratioStore.sessionId}`
- **Удалить** Ratio при `parkingEvacuation.phase === 'spawn_delay'`
- `ratioStore.dispose()` в unmount cleanup

---

## 7. Тест-план: `ratioStore.test.js`

| # | Тест |
|---|------|
| 1 | `showMessage sets showing state` |
| 2 | `onRatioDismiss clears message` |
| 3 | `onRatioDismiss invokes onComplete` |
| 4 | `timer chain: show → dismiss → wait → second show` |
| 5 | `sessionId invalidation` |
| 6 | `dispose clears timers and state` |
| 7 | `isFlowActive` |

---

## 8. Файлы: создать / изменить

| Файл | Действие |
|------|----------|
| `src/state/ratioConstants.js` | **Создать** |
| `src/state/ratioStore.jsx` | **Создать** |
| `src/state/ratioStore.test.js` | **Создать** |
| `src/components/game/Game.jsx` | Централизация Ratio, cleanup |
| `src/components/car/Ratio.jsx` | Import `ratioConstants` |
| `src/state/parkingZoneConstants.js` | Import `RATIO_DISPLAY_SEC` |

**Не менять:** `mapStore.jsx`, `ParkingZoneLayer.jsx`, `Controllers.jsx`, `event.config.js`, `ratioAudio.js`, CSS.

---

## 9. Definition of Done (TASK-062)

- [ ] `ratioConstants.js` экспортирует тексты/тайминги из PLAN § «Константы» (без conflict chance)
- [ ] `ratioStore`: `showMessage`, `onRatioDismiss`, `sessionId`, `dispose`, `clearRatioTimers`, фазы state machine
- [ ] `Game.jsx`: единый store-driven `<Ratio key={sessionId}>`, free-mode intro сохранён, spawn_delay Ratio убран
- [ ] `ratioStore.dispose()` в Game unmount cleanup
- [ ] `ratioStore.test.js` pass (timer chain, sessionId invalidation, dispose)
- [ ] `npm test` — полный прогон без регрессий
- [ ] Review одобрен
