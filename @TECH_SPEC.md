# TECH_SPEC: SpeedDisplay — показ максимальной скорости видимых квестовых машин

## 📌 Описание изменений

Заменить текущую логику выбора скорости для `SpeedDisplay`:
1. Показывать SpeedDisplay **только** когда на экране есть хотя бы одна **видимая** квестовая машина.
2. Если машин несколько — показывать скорость **самой быстрой** из видимых.

## 📍 Изменяемые файлы

| Файл | Тип | Описание |
|------|-----|----------|
| `src/components/game/Game.jsx` | Компонент | Изменить условие рендера и логику выбора скорости |

## ❌ Не изменяемые файлы

- `src/components/game/SpeedDisplay.jsx` — компонент не меняется
- `src/components/game/QuestCar.jsx` — не меняется
- `state/` — сторы не меняются

## 🔧 Детали реализации

### Видимость машины на экране

В `QuestCar.jsx` экранная координата: `screenX = positionX - distance`.
Машина видима когда: `screenX > -150` и `screenX < viewportWidth`.

### Текущий код (Game.jsx, строки 122-128):
```jsx
{activeMapStore.questCars.length > 0 && (
  <SpeedDisplay
    currentSpeed={Math.max(
      ...activeMapStore.questCars.map((car) => car.currentSpeed),
    )}
  />
)}
```

### Новый код:
```jsx
{(() => {
  const viewportWidth = window.innerWidth;
  const visibleCars = activeMapStore.questCars.filter(
    (car) => car.positionX - distance > -150 && car.positionX - distance < viewportWidth
  );
  if (visibleCars.length === 0) return null;
  return (
    <SpeedDisplay
      currentSpeed={Math.max(...visibleCars.map((car) => car.currentSpeed))}
    />
  );
})()}
```

## ✅ Критерии готовности

1. SpeedDisplay скрыт когда нет видимых квестовых машин
2. SpeedDisplay показывает скорость самой быстрой видимой машины
3. При 1 видимой машине — показывает её скорость
4. Нет ошибок в консоли
5. `npx vite build` проходит успешно
