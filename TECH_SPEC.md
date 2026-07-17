# TECH_SPEC.md — Техническая спецификация: Новая логика спавна квестовых машин

## 1. Обзор

**Цель:** Перевести логику квестовых машин со старой схемы (удаление при уходе за экран) на новую (машины не удаляются, спавн каждые 5-15 секунд, множественные машины).

**Концепция:** `CONCEPT.md` — "Не удаляй машины, добавляй новые с интервалом 5-15 секунд. Не меняй расчёты скорости, просто спавн и тайминги."

---

## 2. Изменение A: QuestCarStore.jsx (удалить логику видимости)

### Удалить:
- Поле `lastVisibleTime` (строка 17)
- Поле `dismissed` (строка 34)
- Инициализацию `this.lastVisibleTime = null;` (строка 33)
- Инициализацию `this.dismissed = false;` (строка 34)
- Весь метод `updateVisibility(deltaTime, viewportWidth, distance)` (строки 50-72)

### Оставить без изменений:
- `constructor(carData)` — все остальные поля
- `spawn(positionX, speed)`
- `updatePosition(deltaTime, policeSpeed)`
- `updateWheelRotation(deltaTime)`
- `deactivate()`

### Итоговый контракт QuestCarStore:
```
поля: id, type, name, urlBody, urlShell, maxSpeed, minSpeed, enemy, speedMultiplier, currentSpeed, positionX, active, wheelRotation
методы: constructor, spawn, updatePosition, updateWheelRotation, deactivate
```

---

## 3. Изменение B: MapStore.jsx — Правка spawnQuestCar()

### Убрать проверки (строки 315-325):
1. `if (this.isPedestrianCrossingQuestActive) { return; }`
2. `if (this.questCars.length > 0 || this.questCarActive) { return; }`
3. `if (!this.carStore.gear || (this.carStore.gear !== "2" && this.carStore.gear !== "3")) { return; }`

### Изменить:
- `this.questCarActive = true;` → удалить
- `this.questCarSpawnTimer = 3 + Math.random() * 5;` → `this.questCarSpawnTimer = 5 + Math.random() * 10;`

### Новый алгоритм:
1. Выбрать случайную машину из `Cars.otherCars`
2. Создать `new QuestCarStore(randomCarData)`
3. Определить `positionX`: enemy=true → -200, enemy=false → viewportWidth + 200
4. Вызвать `questCar.spawn(positionX, speed)`
5. `this.questCars.push(questCar)`
6. `this.questCarSpawnTimer = 5 + Math.random() * 10`

---

## 4. Изменение C: MapStore.jsx — Правка updateQuestCars()

### Убрать:
1. Проверку `if (this.questCars.length === 0) return;` (строка 352)
2. Вызов `questCar.updateVisibility(...)` внутри цикла (строка 362)
3. Блок `else if (questCar.enemy)` (строки 363-369)
4. Фильтрацию `this.questCars = this.questCars.filter(...)` (строки 374-377)
5. Сброс `questCarActive` (строки 380-384)

### Оставить:
- Цикл `for (const questCar of this.questCars)` с `updatePosition` и `updateWheelRotation`

### Новый код:
```javascript
updateQuestCars(deltaTime) {
  if (this.questCars.length === 0) return;
  const policeSpeed = this.carStore.currentSpeed;
  runInAction(() => {
    for (const questCar of this.questCars) {
      if (questCar.active) {
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
      }
    }
  });
}
```

---

## 5. Изменение D: MapStore.jsx — Правка spawnObjects()

### Убрать:
- Блок `if (!this.isPedestrianCrossingQuestActive) { ... }` вокруг спавна квестовых машин (строки 95-104)

### Новый код:
```javascript
spawnObjects(viewportWidth, deltaTime) {
  this.questCarSpawnTimer -= deltaTime;
  if (this.questCarSpawnTimer <= 0) {
    this.spawnQuestCar();
  }
  // ... остальной код objectConfigs без изменений ...
}
```

---

## 6. Изменение E: MapStore.jsx — Правка removeQuestCarByIndex()

### Удалить:
- `removedCar.dismissed = true;` (строка 393)
- `this.questCarActive = false;` (строка 397)

### Изменить:
- `this.questCarSpawnTimer = 3 + Math.random() * 5;` → `this.questCarSpawnTimer = 5 + Math.random() * 10;`

### Новый код:
```javascript
removeQuestCarByIndex(index) {
  runInAction(() => {
    if (index >= 0 && index < this.questCars.length) {
      this.questCars.splice(index, 1);
      if (this.questCars.length === 0) {
        this.questCarSpawnTimer = 5 + Math.random() * 10;
      }
    }
  });
}
```

---

## 7. Изменение F: MapStore.jsx — Удалить поле questCarActive

### Удалить:
- Объявление `questCarActive = false;` (строка 78)
- Все ссылки на `this.questCarActive` в файле

### Проверить:
- `spawnQuestCar()` — удалено
- `updateQuestCars()` — удалено
- `removeQuestCarByIndex()` — удалено
- `Game.jsx` — нужно удалить там тоже

---

## 8. Изменение G: MapStore.jsx — Правка dispose()

### Удалить:
- `this.questCars.forEach((car) => car.deactivate());` (строка 256)

### Оставить:
- `this.questCars = [];`
- `this.questCarForArrest = null;`

---

## 9. Изменение H: Game.jsx

### Удалить (4 блока):
1. `const [questCarStores, setQuestCarStores] = useState([]);` (строка 28)
2. Блок сброса `questCarActive` (строки 66-71):
   ```javascript
   if (activeMapStore.questCars.length === 0 && activeMapStore.questCarActive) {
     activeMapStore.questCarActive = false;
   }
   ```
3. Блок синхронизации (строки 75-78):
   ```javascript
   const newQuestCarStores = activeMapStore.questCars;
   if (newQuestCarStores.length !== questCarStores.length) {
     setQuestCarStores(newQuestCarStores);
   }
   ```

### Заменить:
4. `questCarStores` в JSX → `activeMapStore.questCars`:
   - `{questCarStores.map(...)}` → `{activeMapStore.questCars.map(...)}`
   - `{questCarStores.length > 0 && (...)}` → `{activeMapStore.questCars.length > 0 && (...)}`

### Обновить зависимости useEffect:
- Убрать `questCarStores.length` из массива зависимостей
- Оставить `[activeCarStore, activeMapStore]`

---

## 10. Изменение I: Обновление instructions.md

### Секция "Квест 3: Квест с другими автомобилями (Quest Cars)"

**Удалить пункты:**
- "Массив `questCars` пуст (только одна машина одновременно)"
- "Квест срабатывает многократно: после завершения предыдущего квеста спавнится новая машина через 3-8 секунд"
- "Условия запуска: Скорость полицейского автомобиля на 2 или 3 передаче"
- "Спавн только при 2-3 передаче (проверка `carStore.gear`)"
- Целиком раздел "Критерии сброса квеста" (для enemy=true и enemy=false)
- Пункт "enemy=true: квест НЕ сбрасывается при уходе за экран (только при аресте)"
- Пункт "enemy=false: квест сбрасывается через 5 сек после ухода за экран"

**Обновить:**
- "Квест срабатывает многократно: после завершения предыдущего квеста спавнится новая машина через 3-8 секунд" → "Машины спавнятся автоматически каждые 5-15 секунд. Может быть несколько машин одновременно."
- Тайминги: 3-8 → 5-15

**Удалить из таблицы "Ключевые условия запуска квестов":**
- Строку "Quest Cars | Пока нет других квестов + скорость на 2/3 передаче | questCarActive = false"

---

## 11. Изменение J: Обновление unit-тестов

### questCarStore.test.jsx:
**Удалить тесты (9 штук):**
1. `lastVisibleTime initialized to null`
2. `updateVisibility resets lastVisibleTime for enemy=false when visible`
3. `updateVisibility resets lastVisibleTime for enemy=true when visible`
4. `updateVisibility does not set lastVisibleTime when still on screen`
5. `dismissed initialized to false`
6. `updateVisibility enemy=false deactivated after 5 seconds off screen`
7. `updateVisibility enemy=true deactivated after 8 seconds off screen`
8. `updateVisibility enemy=false returns to screen resets timer`
9. `updateVisibility enemy=true returns to screen resets timer`

**Добавить тесты (4 штуки):**
1. `множественный спавн: создание 3 машин подряд, все active=true`
2. `машины не удаляются после ухода за экран (positionX уходит далеко, active=true)`
3. `updatePosition работает одинаково для всех машин в массиве`
4. `конструктор не содержит полей lastVisibleTime и dismissed`

### mapStore.test.jsx:
**Удалить/обновить:**
1. `questCarActive initialized to false` — удалить
2. `questCarSpawnTimer initialized to 3` — обновить на `5`
3. `removeQuestCarByIndex resets questCarActive when array empty` — убрать проверку `questCarActive`, оставить только проверку таймера

**Добавить тесты:**
1. `spawnQuestCar создаёт машину без проверок (несколько вызовов = несколько машин)`
2. `updateQuestCars не фильтрует и не удаляет машины`

---

## 12. Порядок выполнения (для Разработчика)

| Шаг | Файл | Описание |
|-----|------|----------|
| 1 | `QuestCarStore.jsx` | Удалить `lastVisibleTime`, `dismissed`, `updateVisibility()` |
| 2 | `MapStore.jsx` | `spawnQuestCar()`: убрать 3 проверки, изменить таймер |
| 3 | `MapStore.jsx` | `updateQuestCars()`: убрать фильтрацию, сброс, `updateVisibility` |
| 4 | `MapStore.jsx` | `spawnObjects()`: убрать `if (!this.isPedestrianCrossingQuestActive)` |
| 5 | `MapStore.jsx` | `removeQuestCarByIndex()`: убрать `dismissed`, `questCarActive` |
| 6 | `MapStore.jsx` | `dispose()`: убрать `deactivate()` |
| 7 | `MapStore.jsx` | Удалить поле `questCarActive` и все упоминания |
| 8 | `Game.jsx` | Убрать `useState questCarStores`, сброс `questCarActive`, синхронизацию |
| 9 | `instructions.md` | Обновить секцию Quest Cars |
| 10 | `questCarStore.test.jsx` | Удалить 9 тестов, добавить 4 новых |
| 11 | `mapStore.test.jsx` | Обновить тесты |
| 12 | e2e-тесты | Обновить сценарии |

---

## 13. Новые npm-пакеты

Не требуются. Все изменения в рамках существующего стека (React 19.2.7 + MobX 6.16.1 + Vite 8.1.1).