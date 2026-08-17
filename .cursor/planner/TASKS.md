# Задачи spec_cars_web

> План: `.cursor/planner/PLAN.md` (Approved 17 авг. 2026)

**Активная задача:** TASK-061  
**Последнее закрытие:** TASK-060 → `DONE.md`

---

## TASK-061: Maps.jsx — убрать per-frame inline style churn (PLAN critical freeze)

**Статус:** IN_DOCUMENTATION  
**Циклы:** 1  
**Приоритет:** Critical  
**Зависимости:** TASK-060 (рекомендуется)

### Чекпоинты

- [x] Architect / SPEC готов
- [x] Реализация готова
- [ ] Review одобрен

### Описание

Снизить нагрузку от 60 fps ререндера `Maps` (MobX `observer` на `offsetX`): убрать создание новых inline `style` объектов и строк `backgroundPositionX: -${scrollX}px` / `left: ${screenX}px` каждый кадр. Перенести scroll разметки/контейнера на CSS (`transform` / CSS variable `--map-scroll-x`), минимизировать per-object style updates.

**Воспроизведение:** та же сессия 1–2 мин на mobile; Performance/Memory — рост `(string)` / `compiled code`, частые React commits на `Maps`.

**Expected:** scroll дороги/разметки/объектов плавный, без нарастающих аллокаций.  
**Actual:** heap указывает на React fiber у `road-wet` и string retention; `Maps.jsx` ререндерится каждый кадр.

**Область кода:** `src/components/map/Maps.jsx:16–218`, `src/state/mapStore.jsx:158–161` (`offsetX`), `src/hooks/useGameLoop.js` → `tickGameFrame`.

### Критерии готовности (DoD)

- [ ] `backgroundPositionX` / scroll разметки не обновляется через новый React `style` object каждый кадр (CSS var или transform на wrapper).
- [ ] Визуальная идентичность: разметка, объекты, despawn/spawn — **ПК + mobile** (portrait + landscape).
- [ ] `activeObjects` рендер без лишних inline-строк там, где достаточно CSS class + один scroll offset.
- [ ] `npm test` без регрессии (`mapStore.test.jsx` и связанные).
- [ ] Manual: 2+ мин driving — нет нарастающего фриза (совместно с TASK-060).

### Документация

- @docs `.cursor/planner/PROJECT_PRINCIPLES.md` — §3.3 game loop, §3.4 координаты `screenX = worldX - offsetX`
- @docs `src/components/map/Maps.jsx`
- @docs `src/state/mapStore.jsx`
- @docs `src/hooks/useGameLoop.js`
- @docs `src/state/gameSession.js`
- @docs `src/style/road.css`

### Примечания

- `Maps` — `observer`; любое чтение `map.offsetX` тригерит ререндер каждый кадр.
- `activeObjects.map` создаёт новый `style={{ backgroundImage: url(...), left: ... }}` per object per frame.
- Despawn в `mapStore.despawnObjects` — корректен; проблема скорее churn, не unbounded array.

### Чекпоинты

- [ ] Architect / SPEC готов
- [ ] Реализация готова
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-062: Game.jsx — убрать второй rAF / throttle liveSession (PLAN critical freeze)

**Статус:** PLANNED  
**Контекст:** logic  
**Циклы:** 0  
**Приоритет:** High  
**Зависимости:** TASK-061 (опционально)

### Описание

Устранить параллельный `requestAnimationFrame` в `Game.jsx` (`trackSession`), который каждый кадр вызывает `recordsStore.setLiveSession({…})` с новым объектом и `runInAction`. Объединить с `useGameLoop` / `tickGameFrame` или throttle обновления live session (например 2–4 раза/с), сохранив корректность leaderboard HUD.

**Воспроизведение:** любая сессия >1 мин; heap categories: closures, timers, compiled code.

**Expected:** один game rAF; live stats обновляются достаточно плавно для HUD.  
**Actual:** два независимых rAF (`useGameLoop.js:32`, `Game.jsx:115`).

**Область кода:** `src/components/game/Game.jsx:78–125`, `src/hooks/useGameLoop.js`, `src/state/recordsStore.jsx:68–72`, `src/state/gameSession.js`.

### Критерии готовности (DoD)

- [ ] Не более одного постоянного rAF на игровую сессию (game physics + session tracking объединены или session throttled).
- [ ] `recordsStore.liveSession` обновляется корректно для leaderboard panel (time, km, score, stars).
- [ ] Cleanup при unmount: нет orphan rAF.
- [ ] `npm test` — `recordsStore.test.jsx` pass.
- [ ] Manual mobile 2+ мин — вклад в общий perf (нет регрессии HUD).

### Документация

- @docs `.cursor/planner/PROJECT_PRINCIPLES.md` — §3.3 game loop, §7.3 «Не чистить rAF»
- @docs `src/components/game/Game.jsx`
- @docs `src/hooks/useGameLoop.js`
- @docs `src/state/gameSession.js`
- @docs `src/state/recordsStore.jsx`
- @docs `src/state/recordsStore.test.jsx`

### Примечания

- `setLiveSession` создаёт новый snapshot object каждый frame → MobX + potential GC pressure.
- `useGameLoop` уже имеет `running` guard (TASK-001 pattern).

### Чекпоинты

- [ ] Architect / SPEC готов
- [ ] Реализация готова
- [ ] Review одобрен
- [ ] Документация готова

---

## TASK-063: Регрессия — mobile freeze 2 min + bounds activeObjects (PLAN critical freeze)

**Статус:** PLANNED  
**Контекст:** logic  
**Циклы:** 0  
**Приоритет:** High  
**Зависимости:** TASK-060, TASK-061, TASK-062

### Описание

Зафиксировать DoD багфикса: чеклист ручной проверки mobile 2+ мин, smoke через `window.__TEST_STATE__` (bounds `activeMapStore.activeObjects.length`), Vitest full suite. При возможности — Playwright mobile viewport session ≥90 s без падения FPS threshold (Architect определяет метрику).

**Воспроизведение:** см. TASK-060 steps.  
**Expected:** стабильная игра ≥2 мин, `activeObjects.length` не растёт монотонно.  
**Actual:** фризы через 1–2 мин (PLAN).

**Область кода:** `src/components/game/Game.jsx:166–187` (`__TEST_STATE__`), `src/state/mapStore.jsx` (`activeObjects`, `despawnObjects`).

### Критерии готовности (DoD)

- [ ] Manual checklist: portrait + landscape mobile, chase rain + free rain, 2+ мин — нет critical freeze.
- [ ] Через `__TEST_STATE__`: после simulated 120 s driving `activeObjects.length` ≤ разумного upper bound (Architect задаёт в SPEC, grep object types).
- [ ] `npm test` — full Vitest pass.
- [ ] Playwright: существующие specs pass; при добавлении perf smoke — документировать в SPEC.
- [ ] ПК: без регрессии chase/free gameplay.

### Документация

- @docs `.cursor/planner/PROJECT_PRINCIPLES.md` — §5 `__TEST_STATE__`
- @docs `src/components/game/Game.jsx`
- @docs `src/state/mapStore.jsx`
- @docs `src/state/mapStore.test.jsx`
- @docs `tests/e2e/chase-mode.spec.js`
- @docs `playwright.config.js`

### Примечания

- Нет автотеста на perf в репо — manual + optional Playwright metrics.
- Проверить parking zone `fineTimerId` cleanup (`mapStore.jsx:1070–1072`) не накапливает timers.

### Чекпоинты

- [ ] SPEC / метрики готовы
- [ ] Validation выполнена
- [ ] Review одобрен
- [ ] Документация готова (PROJECT_DOCS после закрытия волны)

---

## Отложенные задачи

| ID | Задача | Причина |
|----|--------|---------|
| TASK-004 | App screen routing | Меню не в scope |
| TASK-007 | Map unlock / winter | Не в scope |
| TASK-011 | Mode selection screen | Меню не в scope |
| PLAN §9 | Баланс расхода топлива | Исключён пользователем |
