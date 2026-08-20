# TASKS — spec_cars_web

> Активные задачи. Orchestrator управляет статусами и чекпоинтами.  
> Завершённые — `.cursor/planner/DONE.md`.  
> Спецификация активной задачи — `.cursor/planner/SPEC.md`.

## Статусы

`PLANNED` → `IN_UI_UX_DESIGN` / `ARCHITECTURE` → `IN_ART_DIRECTION` → `IN_DEVELOPMENT` → `IN_REVIEW` → `DONE` / `BLOCKED`

---

## PLAN: Оживление мира (PLAN.md § «В работу»)

**Статус PLAN:** `Complete` — все волны закрыты 20 авг. 2026  
**Порядок внедрения:** A1 → A0 spawn → A2+группы → A0 реакция → баланс парковки ✅

| Задача | Волна | Статус |
|--------|-------|--------|
| TASK-069 | 1 — A1 idle CSS | **DONE** |
| TASK-070 | 2 — A0 spawn/sidewalk/cap | **DONE** |
| TASK-071 | 3 — A2 drift + группы | **DONE** |
| TASK-072 | 4 — A0 реакция human_aggr | **DONE** |
| TASK-073 | 5 — баланс парковки 2 очка | **DONE** |

**Backlog (другой план):** TASK-061 (Maps.jsx scroll)

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
