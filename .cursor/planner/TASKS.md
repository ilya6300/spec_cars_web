# Задачи spec_cars_web

> План: `.cursor/planner/PLAN.md` (Approved 5 авг. 2026)  
> Источник UI wave: `.cursor/planner/UI_UX_DRAFT.md`

**Активная задача:** нет  
**Последнее закрытие:** TASK-023 → `DONE.md`

---

## TASK-023: Mobile lane, HUD transparency, help icons

**Статус:** DONE  
**Контекст:** `mixed`  
**Приоритет:** High  
**Зависимости:** TASK-016, TASK-021

### Документация

- @docs .cursor/planner/PROJECT_PRINCIPLES.md
- @docs src/style/media.css — mobile breakpoints
- @docs src/style/ui-tokens.css — lane + glass tokens
- @docs src/components/car/HelpBadges.jsx

### Критерии готовности

- [x] Mobile landscape: `--car-lane-y: 58%`, `--player-car-lane-y: 66%` в `media.css`
- [x] Desktop lane tokens без изменений
- [x] Mobile `--ui-glass-bg: rgba(20,25,35,0.38)`, blur 8px
- [x] Убран hardcoded `0.8` у `.controllers_container`
- [x] Help badges: action-SVG (погоня/наручники/штраф) + подписи
- [x] `data-type` на badges сохранены

---

## TASK-018: Цветовая система состояний

**Статус:** DONE  
**Контекст:** `ui-ux`  
**Приоритет:** High  
**Зависимости:** —

### Критерии готовности

- [x] CSS variables `--ui-accent`, `--ui-warning`, `--ui-danger` в `ui-tokens.css`
- [x] Glass tokens `--ui-glass-*`
- [x] Применение к gear active, fuel warning, SpeedDisplay.critical

---

## TASK-016: HUD glass-карточка

**Статус:** DONE  
**Контекст:** `ui-ux`  
**Приоритет:** Critical  
**Зависимости:** TASK-018

### Критерии готовности

- [x] Единая glass HUD-панель top-left
- [x] Убран дубль «Скорость: X км/ч»
- [x] Inline `<style>` удалён из `Car.jsx`
- [x] Стили в `hud.css`
- [x] `data-type` сохранены

---

## TASK-017: Консолидация CSS controls

**Статус:** DONE  
**Контекст:** `ui-ux`  
**Приоритет:** High  
**Зависимости:** TASK-016

### Критерии готовности

- [x] `control.css` — только tutorial overlay
- [x] Controls styles — только `gearbox.css` + `media.css`

---

## TASK-019: Канистра топлива

**Статус:** DONE  
**Контекст:** `ui-ux`  
**Приоритет:** Medium  
**Зависимости:** TASK-016

### Критерии готовности

- [x] Размер 52×68 px
- [x] Gradient green→yellow→red через `--fuel-percent`
- [x] Low fuel: пульсация + иконка «!»

---

## TASK-021: Help badges иконки

**Статус:** DONE  
**Контекст:** `mixed`  
**Приоритет:** Medium  
**Зависимости:** TASK-016

### Критерии готовности

- [x] SVG иконки в `src/assets/ui/help-badge-*.svg`
- [x] Emoji заменены в `HelpBadges.jsx`
- [x] Счётчик 16px bold

---

## TASK-020: Микроанимации UI

**Статус:** DONE  
**Контекст:** `ui-ux`  
**Приоритет:** Medium  
**Зависимости:** TASK-017

### Критерии готовности

- [x] Gear pulse на active
- [x] Ignition flash ring
- [x] Badge count bounce
- [x] `prefers-reduced-motion`

---

## TASK-022: Ассет пальца туториала

**Статус:** DONE  
**Контекст:** `assets`  
**Приоритет:** Low  
**Зависимости:** TASK-020

### Критерии готовности

- [x] `tutorial_finger_pointer.svg` transparent 128px
- [x] Подключён в `TutorialOverlay.jsx`

---

## Отложенные задачи

| ID | Задача | Причина |
|----|--------|---------|
| TASK-004 | App screen routing | Меню не в scope |
| TASK-007 | Map unlock / winter | Не в scope |
| TASK-011 | Mode selection screen | Меню не в scope |
