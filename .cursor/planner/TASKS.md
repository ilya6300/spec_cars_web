# TASKS — spec_cars_web

> Активные задачи. Orchestrator управляет статусами и чекпоинтами.  
> Завершённые — `.cursor/planner/DONE.md`.  
> Спецификация активной задачи — `.cursor/planner/SPEC.md`.

## Статусы

`PLANNED` → `IN_UI_UX_DESIGN` / `ARCHITECTURE` → `IN_ART_DIRECTION` → `IN_DEVELOPMENT` → `IN_REVIEW` → `DONE` / `BLOCKED`

---

## PLAN: Radio Quest System

**Статус PLAN:** `Approved` — **волна закрыта** (TASK-062…068 → DONE.md)  
**Осталось:** TASK-061 (backlog, Low)

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
