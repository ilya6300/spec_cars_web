# SPEC: TASK-061 — Maps.jsx: убрать per-frame inline style churn

**Задача:** TASK-061  
**Контекст:** logic  
**Приоритет:** Critical  
**Зависимости:** TASK-060 (закрыт)

---

## 1. Цель

Устранить per-frame React rerender и аллокации inline `style` в `Maps.jsx`, вызванные чтением `map.offsetX` в `observer`-компоненте на каждом кадре game loop (~60 fps). Scroll дороги, разметки и объектов перенести на **один DOM-обновляемый scroll offset** вне React render path.

## 2. Scope

| В scope | Out of scope |
|---|---|
| `Maps.jsx` — структура DOM, убрать `offsetX` из render | `CollectibleStarLayer`, `ParkingZoneLayer`, `PedestrianCrossingLayer` |
| Новый hook `useMapScrollSync` | TASK-062 — второй rAF в `Game.jsx` |
| `road.css` — `.game-map-scroll`, CSS var `--map-scroll-x` | Изменение семантики `mapStore.offsetX` / `advance()` |
| Визуальная идентичность scroll ПК + mobile | Playwright perf smoke (TASK-063) |

---

## 3. Root cause (evidence)

```
useGameLoop → mapStore.advance() → offsetX += ...
  → Maps observer render → scrollX = map.offsetX
  → new style { backgroundPositionX: -${scrollX}px }
  → activeObjects.map → new style { left: ${screenX}px } per object per frame
```

| Evidence | Файл |
|---|---|
| offsetX каждый кадр | `mapStore.jsx:158-161` |
| Maps читает offsetX | `Maps.jsx:16,20` |
| Per-frame road-line style | `Maps.jsx:52-58` |
| Per-frame object style | `Maps.jsx:72,126-152` |
| React fiber на road-wet | PLAN.md, PROJECT_DOCS TASK-060 |

---

## 4. Решение

**Scroll-wrapper + CSS variable `--map-scroll-x` + MobX `reaction` + ref** (паттерн `StarFlyOverlay.jsx`).

### DOM-структура

```
.game-map
  .road-wet                    /* вне scroll */
  .game-map-scroll             /* transform translateX(-var(--map-scroll-x)) */
    .road-line
    .game-object × N           /* left: worldX */
```

### Hook `useMapScrollSync`

- `reaction(() => mapStore.offsetX, x => scrollRef.current?.style.setProperty('--map-scroll-x', `${x}px`))`
- Не читать `offsetX` в render `Maps`
- Cleanup: dispose reaction

### Maps.jsx

- Убрать `scrollX = map.offsetX`
- Объекты: `left: obj.worldX`
- `observer` сохранить для `activeObjects`, `trafficLightColor`, quest state

---

## 5. Изменяемые файлы

| Файл | Действие |
|---|---|
| `src/components/map/Maps.jsx` | Scroll wrapper, worldX coords |
| `src/hooks/useMapScrollSync.js` | **Создать** |
| `src/hooks/useMapScrollSync.test.js` | **Создать** |
| `src/style/road.css` | `.game-map-scroll`, static road-line |
| `src/style/ui-tokens.css` | Опционально `--map-scroll-x: 0px` |

**Не менять:** `mapStore.jsx`, `useGameLoop.js`, `gameSession.js`, sibling layers.

---

## 6. MobX / Game loop

- `offsetX` observable без изменений
- Maps rerender только при activeObjects/trafficLight/quest changes
- 1× `setProperty` / кадр в reaction

---

## 7. Тесты

- `useMapScrollSync.test.js` — setProperty при offsetX change
- `npm test` full pass
- Manual: 2+ min driving, click handlers, ПК + mobile

---

## 8. Definition of Done

- [ ] Maps не читает `map.offsetX` в render
- [ ] Scroll через `.game-map-scroll` + `--map-scroll-x`
- [ ] Объекты `left: worldX`, визуально идентично
- [ ] spawn/despawn, click/long-press без регрессии
- [ ] npm test pass
- [ ] Manual 2+ min без нарастающего фриза
