# TECH_SPEC: Fix Bensin (Fuel Canister) Component

## 📌 Описание изменений

Компонент `Bensin.jsx` отображает канистру топлива, но содержит три дефекта:
1. Используется несуществующее поле `carStore.max` вместо `carStore.maxFuel` — процент заполнения всегда `NaN`.
2. CSS-свойство `background: #737373bd` у класса `.canister` полностью перезаписывает inline `background: linear-gradient(...)`, из-за чего топливо не видно — канистра выглядит серой.
3. Цвет топлива `#34d399` (зелёный) не соответствует ТЗ — нужен `#c3bf12bd` (жёлто-зелёный).

## 📍 Изменяемые файлы

| Файл | Тип | Описание |
|------|-----|----------|
| `src/components/car/Bensin.jsx` | Компонент | Исправить поле, заменить цвет |
| `src/style/interface.css` | Стили | Убрать `background` из `.canister` |

## ❌ Не изменяемые файлы

- `state/carStore.jsx` — сторы не меняются
- `components/car/Car.jsx` — не меняется

## 🔧 Детали реализации

### Задача 1: Исправить имя поля

**Файл:** `src/components/car/Bensin.jsx`

**Текущий код (строки 10-12):**
```jsx
<div 
  className={`canister ${((carStore.fuel / carStore.max) * 100) < 5 ? "blink-red" : ""}`}
  style={{
    background: `linear-gradient(to top, #34d399 ${Math.min(Math.max((carStore.fuel / carStore.max) * 100, 0), 100)}%, #1f2937 ${Math.min(Math.max((carStore.fuel / carStore.max) * 100, 0), 100)}%)`
  }}
>
```

**Новый код:**
```jsx
<div 
  className={`canister ${((carStore.fuel / carStore.maxFuel) * 100) < 5 ? "blink-red" : ""}`}
  style={{
    background: `linear-gradient(to top, #c3bf12bd ${Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100)}%, #1f2937 ${Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100)}%)`
  }}
>
```

Изменения:
- `carStore.max` → `carStore.maxFuel` (3 вхождения)
- `#34d399` → `#c3bf12bd` (1 вхождение)

### Задача 2: Убрать background из CSS

**Файл:** `src/style/interface.css`

**Текущий код (строки 16-28):**
```css
.canister {
    position: relative;
    width: 45px;
    height: 60px;
    border: 2px solid #737373bd;
    background: #737373bd;
    border-radius: 12px 12px 6px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

**Новый код:**
```css
.canister {
    position: relative;
    width: 45px;
    height: 60px;
    border: 2px solid #737373bd;
    border-radius: 12px 12px 6px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

Изменения:
- Удалена строка `background: #737373bd;` — она перезаписывает inline-градиент.
- `transition` оставляем — анимация `blink-red` меняет `border-color` и `box-shadow`, а не `background`.

### Задача 3: Цвет топлива

Выполняется в рамках Задачи 1 (замена `#34d399` на `#c3bf12bd` в linear-gradient).

## ✅ Критерии готовности

1. Процент заполнения канистры рассчитывается корректно (`fuel / maxFuel`)
2. Канистра не серая — виден градиент топлива (жёлто-зелёный) поверх тёмного фона
3. При уровне топлива < 5% — срабатывает анимация `blink-red` (мигание красной рамки)
4. Визуальный контур канистры (border, border-radius) сохранён
5. Нет ошибок в консоли
6. `npx vite build` проходит успешно
