# TASKS — spec_cars_web

> Активные задачи. Orchestrator управляет статусами и чекпоинтами.  
> Завершённые — `.cursor/planner/DONE.md`.  
> Спецификация активной задачи — `.cursor/planner/SPEC.md`.

## Статусы

`PLANNED` → `IN_UI_UX_DESIGN` / `ARCHITECTURE` → `IN_ART_DIRECTION` → `IN_DEVELOPMENT` → `IN_REVIEW` → `DONE` / `BLOCKED`

---

## PLAN: Гараж, колёса, монеты (PLAN.md §1–2)

**Статус PLAN:** `Approved` — проработан Planner в `garage_and_coins_7369f233.plan.md`  
**Порядок внедрения:** data layer → coins migration → garage UI → tests/review

| Задача | Область | Статус |
|--------|---------|--------|
| **TASK-074** | Гараж + колёса + монеты (единая TASK) | **REVIEW_APPROVED** |

---

## TASK-074: Гараж, кастомизация колёс, миграция звёзд→монеты — **ACTIVE**

**Статус:** `REVIEW_APPROVED`  
**Контекст:** `mixed` (UI экран гаража + иконки монет/гаража + данные cars/wheels + MobX stores)  
**Приоритет:** High  
**Зависимости:** нет (PLAN «Оживление мира» завершён)

### Описание

Реализация PLAN.md §1–2:

1. **Data layer:** перенос CSS-токенов геометрии машины из `ui-tokens.css` в `cars.jsx` (`layoutTokens`); массив `wheels[17]`; расширение `skins`/`cars` полями `active`/`open`/`price`; MobX `garageStore` с persistence; `getResolvedPlayerCar()` для `gameBootstrap` и `CarModel`.
2. **Coins migration:** полная замена stars→coins (store, persistence+migration, `collectible_coin`, HUD, mode result, leaderboard, E2E).
3. **Garage UI:** экран `garage` в `appStore`, компонент `Garage.jsx`, кнопка в `StartMenu`, превью 65/35, табы «Автомобили»/«Колёса», мгновенное применение скина/колёс.

**Вне scope:** магазин на дороге, покупка, `open: false` в UI (заложить в архитектуру), несколько кузовов.

### Критерии готовности

**Data layer**
- [ ] `police-0` содержит `layoutTokens` (7 полей из ui-tokens §51–58); `--player-car-lane-y` остаётся глобальным
- [ ] `wheels[]` — 17 элементов (`shell_1` + `whell_new_1…16`), поля `id`, `name`, `src`, `active`, `open`, `price`
- [ ] `garageStore`: `selectSkin`, `selectWheel`, `getPreviewCarStore`, `getResolvedPlayerCar`; persist `spec_cars_active_skin`, `spec_cars_active_wheel`
- [ ] `gameBootstrap` использует `garageStore.getResolvedPlayerCar()`; `CarModel` принимает `layoutTokens` для `variant="player"`
- [ ] Mobile width 220px — merge токенов (не расходится превью/игра)
- [ ] Unit-тесты: `garageStore`, `cars.jsx` wheels count, `getResolvedPlayerCar`

**Coins migration**
- [ ] `coinsStore` / `totalCoins`; migration из `spec_cars_total_stars` → `spec_cars_total_coins` (один раз)
- [ ] `collectible_star` → `collectible_coin`; `GlobalCoinsDisplay`; CSS `.global-coins`, `.help-coins`, `.mode-result-coin`
- [ ] Leaderboard: монета + `{record.coins}`; E2E `[data-type="global-coins"]`
- [ ] Логика начисления **не меняется** (1 collectible = +1; пороги modeScoring те же)
- [ ] Unit + E2E обновлены

**Garage UI**
- [ ] `appStore.screen`: `menu | garage | game | ui-test`; `openGarage()` / `backFromGarage()`
- [ ] `Garage.jsx` + `garage.css`: фон `car_box.png`, превью слева 65%, панель справа 35%, табы, карточки
- [ ] Карточка: превью src; `open===false` → grayscale filter; `active===true` → accent border; **без price**
- [ ] Кнопка гаража в `StartMenu` (икона от Art Director); выход — паттерн `BackToMenuButton`
- [ ] Выбор колёс/скина сохраняется после выхода и старта игры
- [ ] E2E: open/close garage, wheel persist after game
- [ ] Работает на ПК и мобильном (portrait/landscape)

### Документация

- @docs `.cursor/planner/PROJECT_PRINCIPLES.md` — MobX, game loop, слои
- @docs `.cursor/planner/GAME_UNITS.md` — единицы (price не в event.config — ок)
- @docs `.cursor/planner/PLAN.md` — требования пользователя
- @docs `.cursor/planner/arhive/garage_and_coins_7369f233.plan.md` — проработка Planner
- @docs `src/state/cars.jsx` — данные машин
- @docs `src/state/starsStore.jsx` — текущая валюта (→ coinsStore)
- @docs `src/state/persistence.js` — localStorage
- @docs `src/state/gameBootstrap.js` — createGameStores
- @docs `src/state/appStore.jsx` — навигация экранов
- @docs `src/state/mapStore.jsx` — collectible spawn
- @docs `src/state/objects.jsx` — типы объектов
- @docs `src/state/modeScoring.js` — расчёт сессии
- @docs `src/state/modeStore.jsx` — session stars/coins
- @docs `src/state/recordsStore.jsx` — leaderboard
- @docs `src/components/car/CarModel.jsx` — рендер машины
- @docs `src/components/car/Car.jsx` — player car
- @docs `src/components/menu/StartMenu.jsx` — стартовое меню
- @docs `src/components/app/AppScreen.jsx` — роутинг экранов
- @docs `src/components/ui/GlobalStarsDisplay.jsx` — HUD валюты
- @docs `src/components/game/BackToMenuButton.jsx` — паттерн выхода
- @docs `src/components/game/CollectibleStarLayer.jsx` — collectible layer
- @docs `src/components/game/StarFlyOverlay.jsx` — fly animation
- @docs `src/components/game/ModeResultModal.jsx` — результат режима
- @docs `src/components/car/HelpBadges.jsx` — help badges
- @docs `src/components/menu/LeaderboardPanel.jsx` — таблица рекордов
- @docs `src/style/ui-tokens.css` — текущие CSS-токены машины
- @docs `src/style/player-car.css` — CSS vars bridge
- @docs `src/style/media.css` — mobile override width 220px
- @docs `src/assets/background/car_box.png` — фон гаража
- @docs `src/assets/cars/whell/` — 16 новых колёс

### Чекпоинты

- [x] UI/UX дизайн готов
- [x] Архитектура / SPEC готовы
- [x] Art direction готов
- [x] Реализация готова
- [x] Review одобрен
- [ ] UI/UX приёмка пройдена
- [ ] Art приёмка пройдена
- [x] Тесты пройдены (315 unit)
- [ ] Документация готова

**Циклы:** 0

---

## PLAN: Оживление мира — **Complete**

Все задачи TASK-069…073 — см. `.cursor/planner/DONE.md`.

---

## TASK-061: Maps.jsx — убрать per-frame inline style churn — **BACKLOG**

**Статус:** PLANNED  
**Контекст:** logic  
**Приоритет:** Low  
**Зависимости:** TASK-060 (DONE)

### Описание

Устранить per-frame React rerender в `Maps.jsx` из-за чтения `map.offsetX` в `observer` (~60 fps). Перенести scroll на DOM `--map-scroll-x` через `useMapScrollSync`. Спека: `.cursor/planner/SPEC.md` (TASK-061).

### Критерии готовности

- [ ] `Maps.jsx` не читает `map.offsetX` в render
- [ ] Scroll через `.game-map-scroll` + CSS var `--map-scroll-x`
- [ ] Визуально идентично baseline
- [ ] `useMapScrollSync.test.jsx` pass
- [ ] `npm test` — полный прогон

### Документация

- @docs `.cursor/planner/SPEC.md` — TASK-061
- @docs `.cursor/planner/PROJECT_PRINCIPLES.md`
- @docs `src/components/map/Maps.jsx`
- @docs `src/hooks/useMapScrollSync.js`

### Чекпоинты

- [ ] Архитектура / SPEC готовы
- [ ] Реализация готова
- [ ] Review одобрен
- [ ] Тесты пройдены
- [ ] Документация готова

**Циклы:** 0
