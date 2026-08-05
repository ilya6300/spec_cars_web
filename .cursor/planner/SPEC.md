# Техническая спецификация (текущая задача)

**Задача:** TASK-023 — Mobile lane, HUD transparency, help icons

**Статус:** DONE

---

## Обзор решения

Три mobile-only улучшения без изменения desktop:

1. **Lane calibration** — mobile overrides CSS-токенов полос в `media.css`
2. **HUD transparency** — снижение непрозрачности glass-панелей на mobile
3. **Help badges A+B** — action-SVG иконки + микро-подписи

---

## UI/UX требования

### Адаптивность (mobile breakpoint)

`(max-width: 900px) and (orientation: landscape), (max-height: 500px)`

| Элемент | Desktop | Mobile |
|---|---|---|
| `--player-car-lane-y` | 62% | 66% |
| `--car-lane-y` | 56% | 58% |
| `--ui-glass-bg` | 0.65 | 0.38 |
| `--ui-glass-blur` | 12px | 8px |

### Help badges

- Иконка = действие игрока (погоня, арест, штраф)
- Подпись 9px под счётчиком: «Погоня», «Арест», «Штраф»
- Touch targets badge ≥ 44px

---

## Изменяемые файлы

| Файл | Изменение |
|---|---|
| `src/style/media.css` | Lane tokens + glass mobile overrides |
| `src/style/ui-tokens.css` | Комментарий про mobile overrides |
| `src/style/hud.css` | text-shadow на mobile |
| `src/style/interface.css` | `.help-badge-meta`, `.help-badge-label` |
| `src/components/car/HelpBadges.jsx` | Вертикальный layout + подписи |
| `src/assets/ui/help-badge-*.svg` | Action-пиктограммы |

---

## Критерии готовности

- [x] Mobile: машина на нижней полосе, не пересекает пунктир
- [x] Desktop: позиция машины и прозрачность HUD без регрессии
- [x] Mobile: HUD и controls прозрачнее (~0.38), текст читаем
- [x] Help badges: action-SVG + подписи
- [x] `data-type` сохранены для E2E
