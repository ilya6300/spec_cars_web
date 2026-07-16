# TECH_SPEC.md: Правки по Квесту с другими автомобилями (Quest Cars)

## 📌 Описание изменений

По `CONCEPT.md` необходимо разделить логику квестовых машин по типам `enemy`:
- **`enemy = true`** (нарушитель): кнопка "Арестовать" появляется при сближении, квест отключается ТОЛЬКО при аресте. Машина может уйти за экран и вернуться.
- **`enemy = false`** (не нарушитель): квест сбрасывается, если автомобиль пропал из видимости на 5 секунд.

---

## 📝 Список файлов для изменений

| Файл | Тип изменений | Описание |
|------|--------------|----------|
| `src/state/questCarStore.jsx` | Изменение | Разделить таймеры видимости (8 сек / 5 сек), добавить флаг `dismissed` |
| `src/state/mapStore.jsx` | Изменение | Исправить `updateQuestCars()` для раздельной обработки типов, обновить `removeQuestCarByIndex()` |
| `src/components/game/Game.jsx` | Проверка | Убедиться, что кнопка "Арестовать" привязана только к `enemy=true` |

---

## 🔧 Детальный план реализации

### Шаг 1: `QuestCarStore.updateVisibility()` — разделить таймеры

**Текущий код (строки 54–74):**
```javascript
updateVisibility(deltaTime, viewportWidth, distance) {
  const screenX = this.positionX - distance;
  const isOffScreen = this.enemy 
    ? screenX >= viewportWidth + 200 
    : screenX <= -200;

  if (!isOffScreen) {
    this.lastVisibleTime = null;
  } else if (this.lastVisibleTime === null) {
    this.lastVisibleTime = performance.now() / 1000;
  }

  if (isOffScreen && this.lastVisibleTime !== null) {
    const timeOffScreen = (performance.now() / 1000) - this.lastVisibleTime;
    if (timeOffScreen > 5) {
      this.active = false;
    }
  }

  return this.active;
}
```

**Изменения:**
1. Добавить новое observable поле `dismissed = false` в конструктор (после строки 33 `this.lastVisibleTime = null;`).
2. Заменить жёсткий таймаут `5` на условный:
   - `enemy === true` → `8` секунд
   - `enemy === false` → `5` секунд
3. При деактивации устанавливать `this.dismissed = true`.

**Новый код:**
```javascript
// В конструкторе (после строки 33):
this.dismissed = false;

// Обновлённый метод updateVisibility:
updateVisibility(deltaTime, viewportWidth, distance) {
  const screenX = this.positionX - distance;
  const isOffScreen = this.enemy 
    ? screenX >= viewportWidth + 200 
    : screenX <= -200;

  if (!isOffScreen) {
    this.lastVisibleTime = null;
  } else if (this.lastVisibleTime === null) {
    this.lastVisibleTime = performance.now() / 1000;
  }

  if (isOffScreen && this.lastVisibleTime !== null) {
    const timeOffScreen = (performance.now() / 1000) - this.lastVisibleTime;
    const timeout = this.enemy ? 8 : 5;
    if (timeOffScreen > timeout) {
      this.active = false;
      this.dismissed = true;
    }
  }

  return this.active;
}
```

---

### Шаг 2: `MapStore.updateQuestCars()` — раздельная обработка типов

**Текущий код (строки 351–371):**
```javascript
updateQuestCars(deltaTime) {
  if (this.questCars.length === 0) return;

  const viewportWidth = window.innerWidth;
  const policeSpeed = this.carStore.currentSpeed;

  runInAction(() => {
    for (const questCar of this.questCars) {
      if (questCar.active) {
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
        questCar.updateVisibility(deltaTime, viewportWidth, this.offsetX);
      }
    }

    this.questCars = this.questCars.filter((questCar) => {
      if (!questCar.active) return false;
      return true;
    });
  });
}
```

**Проблема:** Текущий код удаляет из `questCars` все машины с `active = false`, включая `enemy=true`. По CONCEPT.md, `enemy=true` машины должны оставаться в массиве (могут вернуться на экран).

**Изменения:**
1. При обновлении позиции — вызывать `updatePosition` и `updateWheelRotation` даже для неактивных `enemy=true` машин (чтобы отслеживать возвращение).
2. Фильтрация: удалять только `enemy=false` с `active=false`, `enemy=true` с `active=false` — НЕ удалять.

**Новый код:**
```javascript
updateQuestCars(deltaTime) {
  if (this.questCars.length === 0) return;

  const viewportWidth = window.innerWidth;
  const policeSpeed = this.carStore.currentSpeed;

  runInAction(() => {
    for (const questCar of this.questCars) {
      if (questCar.active) {
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
        questCar.updateVisibility(deltaTime, viewportWidth, this.offsetX);
      } else if (questCar.enemy) {
        // Для enemy=true обновляем позиции даже неактивной машины
        // чтобы отследить возвращение на экран
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
        questCar.updateVisibility(deltaTime, viewportWidth, this.offsetX);
      }
    }

    // Удаляем только enemy=false с active=false (уехал и не вернётся)
    // enemy=true остаётся в массиве (может вернуться)
    this.questCars = this.questCars.filter((questCar) => {
      if (!questCar.active && !questCar.enemy) return false;
      return true;
    });
  });
}
```

---

### Шаг 3: `MapStore.removeQuestCarByIndex()` — установить dismissed

**Текущий код (строки 373–383):**
```javascript
removeQuestCarByIndex(index) {
  runInAction(() => {
    if (index >= 0 && index < this.questCars.length) {
      this.questCars.splice(index, 1);
      if (this.questCars.length === 0) {
        this.questCarActive = false;
        this.questCarSpawnTimer = 3 + Math.random() * 5;
      }
    }
  });
}
```

**Изменения:**
1. Перед удалением установить `dismissed = true` для удаляемой машины.
2. Остальная логика без изменений.

**Новый код:**
```javascript
removeQuestCarByIndex(index) {
  runInAction(() => {
    if (index >= 0 && index < this.questCars.length) {
      const removedCar = this.questCars[index];
      if (removedCar) {
        removedCar.dismissed = true;
      }
      this.questCars.splice(index, 1);
      if (this.questCars.length === 0) {
        this.questCarActive = false;
        this.questCarSpawnTimer = 3 + Math.random() * 5;
      }
    }
  });
}
```

---

### Шаг 4: `Game.jsx` — проверка кнопки "Арестовать"

**Текущий код (строки 142–163):**
```jsx
{activeMapStore.questCarForArrest && (
  <button className="arrest-button-quest-car-map" onClick={...}>
    Арестовать
  </button>
)}
```

**Анализ:** Кнопка уже привязана к `questCarForArrest`, который устанавливается в `checkQuestCarDistance()`. Этот метод уже фильтрует по `questCar.enemy` (строка 394 в `mapStore.jsx`):
```javascript
if (questCar.enemy && questCar.active) {
```
✅ Всё корректно — только `enemy=true` и только `active=true`.

**Вывод:** Фазы #2 и #3 из TODO.md уже реализованы корректно. Кнопка "Арестовать" динамически появляется/исчезает в зависимости от дистанции.

---

### Шаг 5: `Game.jsx` — синхронизация questCarStores

**Текущий код (строки 72–75):**
```javascript
const newQuestCarStores = activeMapStore.questCars;
if (newQuestCarStores.length !== questCarStores.length) {
  setQuestCarStores(newQuestCarStores);
}
```

**Вывод:** При удалении `enemy=false` машины из `questCars` длина массива изменится, и React обновит рендер. ✅ Работает корректно. Изменений не требуется.

---

## 📋 Итоговый чек-лист изменений

| # | Файл | Изменение | Приоритет |
|---|------|-----------|-----------|
| 1 | `src/state/questCarStore.jsx` | Добавить `dismissed = false`, разделить таймеры 8/5 сек | Критический |
| 2 | `src/state/mapStore.jsx` | Обновить `updateQuestCars()` — не удалять `enemy=true` при `active=false` | Критический |
| 3 | `src/state/mapStore.jsx` | Обновить `removeQuestCarByIndex()` — установить `dismissed = true` | Высокий |
| 4 | `src/components/game/Game.jsx` | Без изменений (кнопка уже корректна) | — |
| 5 | `src/components/game/QuestCar.jsx` | Без изменений | — |

---

## 🧪 Тестирование

### Unit-тесты (Vitest)
- `questCarStore.test.jsx` — тест `updateVisibility()` с таймерами 8 и 5 сек.

### E2E-тесты (Playwright)
- Проверка: `enemy=true` машина подъезжает → кнопка "Арестовать" появляется → машина отъезжает → кнопка исчезает.
- Проверка: `enemy=false` машина уехала за экран → квест сбросился через 5 сек.

---

## 📦 Зависимости
Новые npm-пакеты **не требуются**. Все изменения в рамках существующего стека (React + MobX).
