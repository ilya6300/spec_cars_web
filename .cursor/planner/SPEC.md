# SPEC: TASK-074 — Гараж, кастомизация колёс, миграция звёзд→монеты

**Задача:** TASK-074  
**Контекст:** mixed  
**Приоритет:** High  
**Статус:** REVIEW_APPROVED  
**Исполнитель:** Developer

---

## Обзор

Единая задача из PLAN.md §1–2: перенос геометрии игрока из CSS в `cars.jsx`, массив `wheels[17]` + MobX `garageStore` с persistence, экран «Гараж» (65/35), полная миграция валюты stars→coins без изменения логики начисления. `getResolvedPlayerCar()` — единая точка сборки `urlBody` + active skin + active wheel (`urlShell`) + `layoutTokens`.

---

## 1. Цель и scope

### In scope

- `layoutTokens` (7 полей) в `cars.jsx`; удалить дубли из `ui-tokens.css:51–58`
- `wheels[]` — 17 элементов; `urlShell` убрать из источника правды cars/skins
- `garageStore` + persist `spec_cars_active_skin`, `spec_cars_active_wheel`
- Полная миграция stars→coins (§4)
- `Garage.jsx` + `garage.css`; `appStore.openGarage` / `backFromGarage`
- `CarModel` — inline CSS vars из `layoutTokens` для `variant="player"`
- Mobile merge width `220px` (§7)
- Unit + E2E тесты

### Out of scope

- Магазин на дороге, покупка, UI для `open: false` (архитектура заложена)
- Несколько кузовов в UI
- Перенос collectible spawn distances в `event.config.js`
- Переименование папки `whell`
- `price` wheels/skins в `event.config.js` — OK (data catalog)

---

## 2. Архитектура данных

### 2.1. `cars.jsx`

```javascript
export const PLAYER_LAYOUT_TOKENS = {
  width: "250px",
  wheelOffset: "11%",
  bodyLift: "-1%",
  wheelBottom: "-11%",
  wheelSize: "20.5%",
  wheelLeft: "9%",
  wheelRight: "69%",
};
export const MOBILE_PLAYER_LAYOUT_WIDTH = "220px";
```

`police-0`: `layoutTokens`, `active/open/price`, `skins[]` без `urlShell`.  
`Cars.wheels[]`: 17 элементов (`shell_1` + `whell_new_1…16`), `{ id, name, src, active, open, price: 5 }`.

Хелперы: `getWheelById`, `getSkinById`, `getEffectiveLayoutTokens`, `layoutTokensToCssVars`.

### 2.2. `garageStore`

- `selectSkin(skinId)` / `selectWheel(wheelId)` — мгновенно, persist
- `getResolvedPlayerCar()` — `{ ...car, urlBody, urlShell: activeWheel.src, layoutTokens: merged }`
- `getPreviewCarStore()` — `{ urlBody, urlShell, wheelRotation: 0, sirena: false }`

### 2.3. Mobile merge

`viewportHeight <= 600` OR `viewportWidth <= 900` → `width: "220px"`.  
Удалить `--player-car-width: 220px` из `media.css`; merge только через JS.

---

## 3. Persistence

| Key | Назначение |
|-----|------------|
| `spec_cars_active_skin` | default `"default"` |
| `spec_cars_active_wheel` | default `"shell_1"` |
| `spec_cars_total_coins` | migration from `spec_cars_total_stars` (one-time, keep old key) |

Records: новые `{ coins }`; load accepts legacy `stars` → normalize to `coins`.

---

## 4. Coins migration (полная)

| Было | Станет |
|------|--------|
| `starsStore` | `coinsStore` |
| `totalStars` / `addStars` | `totalCoins` / `addCoins` |
| `collectible_star` | `collectible_coin` |
| `calculateSessionStars` | `calculateSessionCoins` |
| `sessionStars` | `sessionCoins` |
| `GlobalStarsDisplay` | `GlobalCoinsDisplay` |
| `StarFlyOverlay` | `CoinFlyOverlay` |
| `CollectibleStarLayer` | `CollectibleCoinLayer` |
| `collectible-star.svg` | `collectible-coin.svg` |

Логика начисления **не меняется**: 1 pickup = +1; session rating 0–3 same thresholds.

Добавить `GlobalCoinsDisplay` в `Game.jsx` (free mode) для fly target `[data-type="global-coins"]`.

Полный список файлов — см. `.cursor/planner/arhive/garage_and_coins_7369f233.plan.md` и grep по `star`/`stars`.

---

## 5. Garage navigation

`appStore.screen`: `"menu" | "garage" | "game" | "ui-test"`  
`openGarage()` / `backFromGarage()` — без сброса кастомизации  
`AppScreen.jsx`: `screen === "garage"` → `<Garage />`  
`StartMenu`: кнопка `data-type="open-garage"` в `header-actions`

---

## 6. gameBootstrap + CarModel

```javascript
const carConfig = garageStore.getResolvedPlayerCar();
```

`CarModel`: prop `layoutTokens` → `style={layoutTokensToCssVars(...)}` для `variant="player"`.  
`Car.jsx`: передать `layoutTokens={carStore.layoutTokens}`.

---

## 7. Баланс / event.config.js

- `price` wheels/skins — **не** в event.config (OK)
- Collectible distances **не переносим** в этой TASK (литералы в `objects.jsx`: 15000/25000/20000 world px)

---

## 8. Изменяемые файлы

**Новые:** `garageStore.jsx`, `Garage.jsx`, `garage.css`, `coinsStore.jsx`, `GlobalCoinsDisplay.jsx`, `CoinFlyOverlay.jsx`, `CollectibleCoinLayer.jsx`, `coin-fly.css`, `collectible-coin.svg`, `garage.svg`, tests.

**Изменяемые:** `cars.jsx`, `gameBootstrap.js`, `persistence.js`, `appStore.jsx`, `AppScreen.jsx`, `CarModel.jsx`, `Car.jsx`, `StartMenu.jsx`, map/mode/records stores, UI components, CSS files, E2E specs.

**Удаляемые после rename:** `starsStore.jsx`, `GlobalStarsDisplay.jsx`, `StarFlyOverlay.jsx`, `CollectibleStarLayer.jsx`, `star-fly.css`, `collectible-star.svg`.

---

## 9. Тесты

- Unit: `garageStore`, `coinsStore` migration, `cars` wheels count, `getResolvedPlayerCar`, rename tests
- E2E: `garage.spec.js`, `global-coins`, coin pickup, wheel persist after game

---

## 10. Риски

| Риск | Mitigation |
|------|------------|
| Preview vs game width | Единый `getEffectiveLayoutTokens` |
| Fly без target в Game | GlobalCoinsDisplay в Game.jsx |
| Legacy records `stars` | Normalize on load |
| Art assets | Placeholder до Art review (§12) |

---

## 11. UI/UX требования

**Visual Concept:** Workshop Garage — `car_box.png` + glass panel; accent `--ui-accent`.

### Layout
- Desktop: Preview 65% | Panel 35%
- Mobile portrait: stack 45% / 55%
- Root: `data-type="garage-screen"`, `100dvh`

### Табы
- `garage-tab-cars` / `garage-tab-wheels`; default **«Колёса»**
- min-height 44px

### Карточки
- `garage-card` + `data-id`, `data-active`, `data-open`
- Active: `border: 2px solid var(--ui-accent)`
- Locked: `grayscale(0.6) brightness(0.75)`, `pointer-events: none`
- **Без price**; instant apply

### StartMenu
- `open-garage` слева от «Настройки», 44×44 glass button

### HUD гаража
- `garage-hud`: `[GlobalCoinsDisplay] [garage-back]`

### data-type (E2E)
`garage-screen`, `garage-hud`, `garage-back`, `garage-tabs`, `garage-tab-cars`, `garage-tab-wheels`, `garage-card-grid`, `garage-card`, `open-garage`, `global-coins`, `mode-result-coins`, `help-coins`, `leaderboard-coins`

---

## 12. Art Direction

### Ассеты

| Файл | Назначение | Размер display |
|------|------------|----------------|
| `src/assets/ui/garage.svg` | Кнопка гаража | 24–28px @ 44×44 btn |
| `src/assets/ui/collectible-coin.svg` | Master coin (map, HUD, help, leaderboard, mode result) | 48px map; 18px HUD; 14px help/leaderboard |

### Coin palette
- `--ui-coin-primary`: `#e8a820`
- `--ui-coin-highlight`: `#f5c842`
- `--ui-coin-stroke`: `#1a1208`

### Placeholder strategy
Developer **не блокируется**: data layer + garage layout можно до финальных SVG. Placeholder: inline SVG door icon + coin SVG based on star shape with gold colors. Финальные ассеты — gate **Art review**.

### Art review checklist
- Garage icon readable @ 24px
- Coin readable @ 48px and @ 14px
- Один SVG монеты во всех 6 точках UI
- Нет Unicode ★ в production UI

---

## Последовательность реализации

1. `cars.jsx` tokens + wheels + helpers
2. `persistence` + `coinsStore` + migration
3. `garageStore`
4. Scoring/session rename
5. `gameBootstrap` + `CarModel` + CSS cleanup
6. Map collectible rename
7. UI coins migration + Game HUD
8. `appStore` + `Garage.jsx` + StartMenu
9. E2E + cleanup old star files
10. Art assets (SVG) — можно параллельно шаг 8 с placeholder

---

*Orchestrator: TASK-074 активна. Developer — реализация по этому SPEC.*
