# Задачи spec_cars_web

> План: `.cursor/planner/PLAN.md` (Approved 5 авг. 2026)  
> Источник UI wave: `.cursor/planner/UI_UX_DRAFT.md`

**Активная задача:** нет (UI wave завершена 5 авг. 2026)  
**Последнее закрытие:** TASK-016…022 → `DONE.md`

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
