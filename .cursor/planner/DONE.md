# Завершённые задачи spec_cars_web

> Orchestrator переносит сюда задачи со статусом `DONE` из `TASKS.md`.

**Волна 0+1 закрыта:** 5 авг. 2026  
**Волна 2 (TASK-013…015) закрыта:** 5 авг. 2026  
**UI wave (TASK-016…022) закрыта:** 5 авг. 2026  
**PLAN wave (TASK-024+):** TASK-024…028 закрыты 7 авг. 2026  
**Pedestrian quest rework:** TASK-039 закрыта 10 авг. 2026  
**Bug-fix iteration (TASK-040…045):** закрыта 12 авг. 2026  
**Traffic light stop distance (TASK-046):** закрыта 12 авг. 2026  
**Civilian traffic light stop (TASK-047):** закрыта 12 авг. 2026  
**Chase atmosphere rain (TASK-048):** закрыта 13 авг. 2026  
**SVG rain rework (TASK-049):** закрыта 13 авг. 2026  
**Headlights night glow (TASK-050):** закрыта 13 авг. 2026  
**QuestArrestModal atmosphere (TASK-051):** закрыта 13 авг. 2026  
**Free mode dynamic rain (TASK-052):** закрыта 13 авг. 2026  
**PoliceQuestModal atmosphere (TASK-053):** закрыта 14 авг. 2026  
**AI traffic bugs (TASK-054):** закрыта 14 авг. 2026  
**Event config centralization (TASK-055):** закрыта 16 авг. 2026  
**Keyboard controls (TASK-056):** закрыта 16 авг. 2026  
**Settings menu (TASK-057):** закрыта 16 авг. 2026  
**Critical bugs PLAN §1–3 (TASK-058):** закрыта 16 авг. 2026  
**Parking fine quest (TASK-059):** закрыта 16 авг. 2026  
**Mobile perf portrait rain + road-wet (TASK-060):** закрыта 17 авг. 2026  
**Radio Quest System (TASK-062…068):** закрыта 19 авг. 2026  
**Проверка Radio Quest:** Vitest 228/228, E2E parking-quest + orientation-quest pass  
**Источник UI wave:** `UI_UX_DRAFT.md`

---

## TASK-068: Тесты рации + E2E ориентировки + секция PLAN

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** logic  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| `orientation-quest.spec.js` | ✅ |
| `parking-quest.spec.js` two-step | ✅ |
| PLAN.md секция «Рация — двухшаговое взаимодействие» | ✅ |
| Vitest 228/228 | ✅ |

---

## TASK-067: Туториал — парковка, roadside, таймаут сирены 4 с

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| Шаги parking-violation → ratio-after-parking | ✅ |
| Шаги roadside-breakdown → ratio-after-breakdown | ✅ |
| `TUTORIAL_SIREN_TIMEOUT_SEC = 4`, skip Block B | ✅ |
| `tutorialStore.test.js` | ✅ |

---

## TASK-066: C2 «Заглохла у обочине» (roadside_breakdown)

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| `roadside_breakdown` spawn 175–400 м (3500–8000 px) | ✅ |
| `RoadsideBreakdownLayer.jsx` двухшаговый флоу | ✅ |
| `roadsideHelp` +2 очка | ✅ |
| Unit tests mapStore | ✅ |

---

## TASK-065: Диспетчерский запрос + квест ориентировки (HUD)

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| `DISPATCH_ORIENTATION_CONFLICT_CHANCE = 0.2` | ✅ |
| `handleRatioPress` dispatch/conflict/quiet/already | ✅ |
| `OrientationDistanceHud.jsx` | ✅ |
| Unit tests dispatch/orientation | ✅ |

---

## TASK-064: Controllers — рация (видимость, onClick, подсветка)

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** ui-ux  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| Рация free+timed, скрыта chase | ✅ |
| `data-type="ratio"`, `--has-target`, `--disabled` | ✅ |
| `handleRatioPress` onClick | ✅ |
| E2E two-step parking | ✅ |

---

## TASK-063: Парковка — двухшаговый флоу

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1

| Критерий | Результат |
|---|---|
| select → radio confirm → evacuation | ✅ |
| `isEvacuationInProgress` / `hasPendingEvacuationTarget` | ✅ |
| `mapStore.test.jsx` two-step | ✅ |

---

## TASK-062: ratioConstants + ratioStore (централизация Ratio)

**Статус:** DONE  
**Закрыто:** 19 авг. 2026  
**Контекст:** logic  
**Циклы:** 1 (Reviewer APPROVED после fix scope)

| Критерий | Результат |
|---|---|
| `ratioConstants.js` — тексты, тайминги, orientation distances | ✅ |
| `ratioStore.jsx` — MobX, sessionId, phases, dispose | ✅ |
| `Game.jsx` — единый store-driven Ratio, free intro сохранён | ✅ |
| spawn_delay auto-Ratio убран | ✅ (временно до TASK-063) |
| `ratioStore.test.js` 7/7 | ✅ |
| Vitest 223/223 | ✅ |

### Новые файлы

- `src/state/ratioConstants.js`
- `src/state/ratioStore.jsx`
- `src/state/ratioStore.test.js`

---


**Статус:** DONE  
**Закрыто:** 17 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1 (Reviewer APPROVED, UI/UX принято)

| Критерий | Результат |
|---|---|
| Portrait mobile rain: 1 static far, mid/near hidden | ✅ `mode.css` `@media (max-width: 900px)` |
| Mobile road-wet: 2 gradients, blur 3px, no shimmer | ✅ `road.css` mobile block |
| Desktop без регрессии | ✅ 3 rain layers + shimmer |
| CSS tokens | ✅ `ui-tokens.css` |
| Gate `--rain` only; `data-type="road-wet"` | ✅ |
| Vitest 212/212 | ✅ |
| Playwright chase-mode 13/13 + mobile portrait E2E | ✅ |

### Root cause

1. TASK-058 не покрывал portrait (~390×844) — 3 GPU rain layers на smartphone.
2. `.road-wet` без mobile override — blur 10px + shimmer на всех mobile.

### Изменённые файлы

- `src/style/ui-tokens.css`
- `src/style/mode.css`
- `src/style/road.css`
- `tests/e2e/chase-mode.spec.js`

---

## TASK-059: Квест «Штраф за неправильную парковку»

**Статус:** DONE  
**Закрыто:** 16 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1 (Reviewer APPROVED после fix mutual exclusion)

| Критерий | Результат |
|---|---|
| Зона 4–8 мест (`unit_parking.png`, 382×122) | ✅ `parkingZoneConstants.js`, `initParkingZone` |
| 50% занятость, 20% illegal, 0 min нарушителей | ✅ |
| Клик по нарушителю → 1 с → finish overlay pedestrian | ✅ `ParkingZoneLayer`, `mapStore` |
| Без новых модалок | ✅ `QuestFinishOverlay variant="pedestrian"` |
| `parkingFine` = 4 очка (1 звезда) | ✅ `modeScoring.js`, `HelpBadges` |
| Взаимоисключение квестов | ✅ `isParkingFineActive()` |
| Не спавнить в chase/night | ✅ |
| Vitest 212/212 | ✅ |
| Playwright `parking-quest.spec.js` | ✅ |

### Новые файлы

- `src/state/parkingZoneConstants.js`
- `src/components/game/ParkingZoneLayer.jsx`
- `src/style/parking_zone_layer.css`
- `tests/e2e/parking-quest.spec.js`

---

## TASK-058: Критические баги PLAN §1–3 (пешеход, дождь mobile, педаль газа)

**Статус:** DONE  
**Закрыто:** 16 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| §1 Пешеход: retry `triggerAppearEvents` при блокере | ✅ `mapStore.jsx`, `objects.jsx` |
| §1 Vitest: blocked + success appear | ✅ 2 новых теста |
| §2 Mobile rain: 1 статичный слой | ✅ `mode.css` mobile media |
| §3 Gas pedal: pointer capture, без mouseleave | ✅ `Controllers.jsx`, `gearbox.css` |
| §3 Vitest pointermove не сбрасывает газ | ✅ |
| Vitest mapStore 29/30*, controllers 11/11 | ✅ |

\* Предсуществующий fail: `spawnEnemyQuestCar blocks enemy before 20s in chase` — gate в `event.config.js` = 15 с, тест ожидает 20 с (TASK-055 drift).

### Root cause (evidence)

1. **Пешеход:** `appeared=true` ставился до успешного `initQuestCrossing` → квест «сгорал» при временных блокерах (`human_aggr` на экране).
2. **Дождь mobile:** 3 GPU-анимированных слоя + увеличенный `background-size` в mobile media.
3. **Педаль:** `onMouseLeave` и touch без `setPointerCapture`.

---

## TASK-057: Меню «Настройки» и модалка «Управление» (PLAN §2.5)

**Статус:** DONE  
**Закрыто:** 16 авг. 2026  
**Контекст:** ui-ux  
**Циклы:** 1 (Reviewer APPROVED, UI/UX принято)

| Критерий | Результат |
|---|---|
| Кнопка «Настройки» `open-settings` | ✅ |
| L1/L2 модалки, Escape/backdrop/close | ✅ |
| Тексты управления (мышь + клавиатура) | ✅ |
| z-index 1100/1101, glass-стиль | ✅ |
| Vitest menu 18/18 | ✅ |
| Playwright menu.spec.js (спеки добавлены) | ✅ |

---

## TASK-056: Управление с клавиатуры (ПК) (PLAN §2)

**Статус:** DONE  
**Закрыто:** 16 авг. 2026  
**Контекст:** logic  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| Ctrl/Alt/Space/Shift/0-4 bindings | ✅ |
| Composite controlsBlocked | ✅ |
| Vitest controllers 16/16 | ✅ |

---

## TASK-055: Централизованный `event.config.js` (PLAN §1)

**Статус:** DONE  
**Закрыто:** 16 авг. 2026  
**Контекст:** logic  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| `event.config.js` — единый источник констант | ✅ |
| Enemy gates: free/timed 30 с, chase 20 с | ✅ |
| Pedestrian spawn 100 %, cross on red 30 % | ✅ |
| Free rain 10 %, chase rain 100 % | ✅ |
| Vitest mapStore 28/28, atmosphere 10/10, modeScoring 8/8 | ✅ |

---

## TASK-054: Баги AI-трафика в свободном режиме (PLAN критические баги)

**Статус:** DONE  
**Закрыто:** 14 авг. 2026  
**Контекст:** logic  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| Мирная машина не едет назад на красном | ✅ guard `currentSpeed > 0` в updatePosition |
| Обогнанная civilian не удаляется слева | ✅ асимметричный despawn в removeOffScreenQuestCars |
| Enemy despawn без изменений | ✅ |
| Vitest questCarStore | ✅ 27/27 |
| Vitest mapStore | ✅ 26/26 |

### Изменённые файлы

- `src/state/questCarStore.jsx`
- `src/state/mapStore.jsx`
- `src/state/questCarStore.test.jsx`
- `src/state/mapStore.test.jsx`

---

## TASK-053: PoliceQuestModal — дождь и свечение фар (PLAN §1)

**Статус:** DONE  
**Закрыто:** 14 авг. 2026  
**Контекст:** mixed  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| RainLayer внутри modal | ✅ `--rain` + scoped rain-layer |
| Headlights на police car | ✅ `showHeadlights={atmosphereStore.isNight}` |
| Z-index rain под машиной, CTA выше | ✅ police_quest.css 1003–1006 |
| Паттерн TASK-051 (QuestArrestModal) | ✅ |
| Vitest | ✅ 2/2 |
| Playwright chase-mode | ✅ PoliceQuestModal test |

### Изменённые файлы

- `src/components/game/PoliceQuestModal.jsx`
- `src/style/police_quest.css`
- `src/components/game/PoliceQuestModal.test.jsx`
- `tests/e2e/chase-mode.spec.js`

---

## TASK-052: Free mode — динамический дождь (PLAN §2)

**Статус:** DONE  
**Закрыто:** 13 авг. 2026  
**Контекст:** logic  
**Циклы:** 1 (Reviewer APPROVED)

| Критерий | Результат |
|---|---|
| 10% rain at free start | ✅ `shouldStartFreeRain` + `initFreeWeather` |
| Rain duration 2–6 min | ✅ `pickFreeRainDurationSec` 120–360 s |
| Every 60 s clear → 10% roll | ✅ `tick` + `FREE_RAIN_CHECK_INTERVAL_SEC` |
| timeOfDay always day in free | ✅ enforced in init + tick |
| cleanup backToMenu | ✅ `stopFreeWeather` |
| Chase/timed unchanged | ✅ `getAtmosphereForMode` + guard in tick |
| E2E deterministic | ✅ `__WEATHER_TEST__` hook |
| Vitest | ✅ 10/10 |
| Playwright chase-mode | ✅ 11/11 |

### Изменённые файлы

- `src/state/atmosphereStore.jsx`
- `src/state/atmosphereStore.test.js`
- `src/state/gameSession.js`
- `src/state/appStore.jsx`
- `src/components/game/Game.jsx`
- `tests/e2e/helpers.js`
- `tests/e2e/chase-mode.spec.js`

---

## TASK-051: QuestArrestModal — дождь, фары, вращение колёс (PLAN §1)

**Статус:** DONE  
**Закрыто:** 13 авг. 2026  
**Контекст:** mixed  
**Циклы:** 2 (UI/UX P1 mobile landscape → fix → принято)

| Критерий | Результат |
|---|---|
| RainLayer внутри modal | ✅ `--rain` + scoped rain-layer |
| Headlights ×2 | ✅ `showHeadlights` на police + target |
| rAF колёса до arrestAnimFinished | ✅ WHEEL_SPEED 450 × 0.75 |
| CTA z-index 1210, touch 48px | ✅ `.quest-arrest-cta`, `arrest-modal-button` |
| Mobile landscape CTA не перекрыт | ✅ `top: 58%` для машин |
| Viewport rain/headlights без регрессии | ✅ TASK-050 |
| Vitest | ✅ 3/3 |
| Playwright chase-mode | ✅ 6/6 |

### Изменённые файлы

- `src/components/game/QuestArrestModal.jsx`
- `src/style/quest_arrest.css`
- `src/components/game/QuestArrestModal.test.jsx`
- `tests/e2e/chase-mode.spec.js`

---

## TASK-050: Улучшение свечения фар в ночном режиме (PLAN headlights)

**Статус:** DONE  
**Закрыто:** 13 авг. 2026  
**Контекст:** ui-ux  
**Циклы:** 1 (Reviewer → fix night filter → APPROVED)

| Критерий | Результат |
|---|---|
| NIGHT → headlights (независимо от rain) | ✅ gate `isNight` + ignition (игрок) |
| RAIN → дождь (независимо от night) | ✅ `RainLayer` только `isRainy` |
| WET → road-wet / reflection только при rain | ✅ `.game-viewport--rain` |
| Два конуса left/right + road beam | ✅ `CarModel` + `HeadlightRoadLayer` z-index 48 |
| Слои MAP → WET → BEAM → CAR → RAIN → UI | ✅ `Game.jsx` DOM-порядок |
| Glow кузова без селектора `--rain` | ✅ `car.css` |
| Ночной filter `.game-map` не изменён | ✅ после review fix |
| E2E 4 атмосферных состояния | ✅ chase-mode 6/6 |
| Vitest | ✅ 150/151 (RefuelModal pre-existing) |
| UI/UX приёмка | ✅ принято |

### Изменённые файлы

- `src/components/game/HeadlightRoadLayer.jsx` — road beam + reflection
- `src/components/game/Game.jsx` — DOM-порядок, HeadlightRoadLayer
- `src/components/game/RainLayer.jsx` — gate только `isRainy`
- `src/components/car/CarModel.jsx` — два конуса + data-type
- `src/components/map/Maps.jsx` — `data-type="road-wet"`
- `src/style/car.css` — конусы left/right, glow
- `src/style/road.css` — wet gate `--rain`, reflection
- `src/style/mode.css` — headlight-road-layer, rain селекторы `--rain`
- `tests/e2e/chase-mode.spec.js`, `tests/e2e/helpers.js` — 4 состояния, `setAtmosphere`

**Carry-over batch TASK-049:** `atmosphereStore.isRainy`, `modeScoring` chase rain, `RainLayer`/`rain.svg`/`AtmosphereOverlay`.

---

## TASK-049: Замена CSS-дождя на SVG-слои, мокрый асфальт и мягкая ночь (PLAN §1)

**Статус:** DONE  
**Закрыто:** 13 авг. 2026  
**Контекст:** ui-ux  
**Циклы:** 1 (Reviewer APPROVED с первого раза)

| Критерий | Результат |
|---|---|
| `repeating-linear-gradient` дождя удалён | ✅ grep `src/` = 0 |
| SVG-капли, 3 слоя FAR/MID/NEAR, угол ~12° | ✅ `rain.svg` + `RainLayer` |
| Машины под дождём, HUD над дождём | ✅ sprite 60 / rain 100 / HUD 105 |
| Мокрый асфальт под машинами, только night+rain | ✅ `.road-wet` внутри `.game-map` |
| Ночь `brightness(0.78) saturate(0.82) hue-rotate(-8deg)` | ✅ только `.game-map` |
| День без дождя и мокрой дороги | ✅ gate `isRainy && isNight` |
| Reduced-motion: статика, не `opacity: 0` | ✅ |
| E2E chase-mode | ✅ 4/4 |
| Vitest modeScoring | ✅ 8/8 (регрессия 150/151, RefuelModal вне scope) |
| Механика atmosphere/scoring | ✅ не менялась |

### Изменённые файлы

- `src/assets/effects/rain.svg` — новый SVG-тайл
- `src/components/game/RainLayer.jsx` — far/mid/near, Vite import
- `src/style/mode.css` — SVG-дождь, night filter, reduced-motion
- `src/style/car.css` — снят `z-index` с `.car-ui`
- `src/style/player-car.css` — спрайт `z-index: 60`
- `src/style/hud.css` — `.hud-panel` `z-index: 105`
- `src/style/quest_car.css` — `.speed-display` 105
- `src/components/map/Maps.jsx` — `.road-wet`
- `src/style/road.css` — мокрый асфальт
- `tests/e2e/chase-mode.spec.js` — слои, z-index, день, reduced-motion

---

## TASK-048: Атмосфера погони — ночной эффект и дождь (PLAN §1)

**Статус:** DONE  
**Закрыто:** 13 авг. 2026  
**Контекст:** ui-ux  
**Циклы:** 1 (Reviewer → CSS reduced-motion fix)

| Критерий | Результат |
|---|---|
| Chase → `{ night, rain }` через `getAtmosphereForMode` | ✅ |
| Переиспользуемый `RainLayer` (far/near слои) | ✅ |
| Дождь в `Game.jsx` при `isRainy`, z-index 100 | ✅ |
| CSS дождя + reduced-motion (opacity 0) | ✅ |
| Unit-тесты modeScoring | ✅ 8/8 |
| E2E rain-layer в chase | ✅ |
| Модалки квестов без дождя | ✅ |

### Изменённые файлы

- `src/state/atmosphereStore.jsx` — getter `isRainy`
- `src/state/modeScoring.js` — chase weather rain
- `src/components/game/RainLayer.jsx` — новый компонент
- `src/components/game/Game.jsx` — интеграция
- `src/style/mode.css` — CSS дождя
- `src/state/modeScoring.test.js`, `tests/e2e/chase-mode.spec.js`

---

## TASK-047: Civilian quest-cars — остановка на красный светофор (PLAN §1)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Civilian стоп на красный `traffic_light` (80px) | ✅ |
| Зелёный — delay 0.3–1.5 s после стопа | ✅ |
| Плавный brake/accel (профиль gear 2) | ✅ |
| `enemy=true` / chase / quest crossing не затронуты | ✅ |
| Vitest | ✅ 148/148 |

---

## TASK-046: Плавная остановка перед светофором (PLAN §1)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Остановка 50–80 px от светофора | ✅ target 65 px |
| Плавное торможение по скорости | ✅ coast + calculated decel |
| Блок газа до зелёного | ✅ |
| Vitest | ✅ 142/142 |

---

## TASK-040: Quest finish overlay z-index (PLAN §1)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| Overlay вне pedestrian layer | ✅ `Game.jsx` после `Controllers` |
| Continue кликабелен на mobile | ✅ z-index 1501 > controls 110 |
| Human не перекрывает controls | ✅ layer z-index 55 |
| Vitest | ✅ 140/140 |

---

## TASK-041: Police quest подъезд к human_aggr на ПК (PLAN §2)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** mixed

| Критерий | Результат |
|---|---|
| Desktop gap 18px (было 60) | ✅ |
| Per-frame remeasure endPosition | ✅ |
| Vitest | ✅ |

---

## TASK-042: Красный светофор — стоп и блок газа (PLAN §3)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Только `traffic_light` | ✅ |
| Блок газа до зелёного без сирены | ✅ |
| Сирена обходит блок | ✅ |
| Pedestrian quest не изменён | ✅ |

---

## TASK-043: Спавн peaceful human ÷2 (PLAN §4.1)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| minDistance 100, maxDistance 12000 | ✅ |
| human_aggr без изменений | ✅ |

---

## TASK-044: Mutex human_aggr ↔ pedestrian quest (PLAN §4.2)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Нет spawn aggr при pedestrian quest | ✅ |
| initQuestCrossing blocked при aggr на экране | ✅ |
| startQuest blocked при pedestrian quest | ✅ |

---

## TASK-045: Enemy quest-car spawn gates (PLAN §4.3)

**Статус:** DONE  
**Закрыто:** 12 авг. 2026  
**Контекст:** logic

| Критерий | Результат |
|---|---|
| Не раньше 30 с (`sessionElapsedSec`) | ✅ |
| Блок при активном квесте | ✅ |
| Civilian spawn без изменений | ✅ |

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
