# TECH_SPEC: Квест полиции (Арест)

## Новые зависимости

Нет. Все фичи покрываются текущим стеком (React 19 + MobX 6 + Vite).

---

## Задача 1: Состояние квеста в MapStore

### Изменяемый файл: `src/state/mapStore.jsx`

**Новые observable-поля (добавить в класс, значения по умолчанию):**

```javascript
// Police Quest state
isPoliceQuestActive = false;
questTargetObject = null; // { uid, typeId, worldX, appeared }
questCarPosition = -150; // старт за левым краем экрана
```

**Новые action-методы (добавить в класс):**

```javascript
startQuest(targetObj) {
  runInAction(() => {
    this.isPoliceQuestActive = true;
    this.questTargetObject = targetObj;
    this.questCarPosition = -150;
  });
}

finishQuest() {
  runInAction(() => {
    this.isPoliceQuestActive = false;
    this.questTargetObject = null;
    this.questCarPosition = -150;
  });
}

removeObjectByUid(uid) {
  runInAction(() => {
    const idx = this.activeObjects.findIndex(obj => obj.uid === uid);
    if (idx !== -1) {
      this.activeObjects.splice(idx, 1);
      // Корректировка lastObjectEndMeter
      const configMap = {};
      objectConfigs.forEach(c => configMap[c.type] = c);
      const sorted = [...this.activeObjects].sort((a, b) => b.worldX - a.worldX);
      if (sorted.length > 0) {
        const lastConfig = configMap[sorted[0].typeId];
        this.lastObjectEndMeter = sorted[0].worldX + lastConfig.width;
      } else {
        this.lastObjectEndMeter = this.offsetX;
      }
    }
  });
}
```

---

## Задача 2: Обновление onClick в objects.jsx

### Изменяемый файл: `src/state/objects.jsx`

**Цель:** Заменить заглушки `onClick` на реальный вызов квеста.

**Изменения в `getPolicequest()`:**

Для `humanAggr1Obj`, `humanAggr2Obj`, `humanAggr3Obj` заменить `onClick`:

```javascript
// Было:
onClick: (obj, mapStore, carStore) => {
  console.log("Поймал", obj);
  /* ничего */
},

// Стало:
onClick: (obj, mapStore, carStore) => {
  mapStore.startQuest(obj);
  carStore.toggleSirena();
},
```

**Примечание:** `onLongPress` оставить пустым как и было.

---

## Задача 3: Создание компонента PoliceQuestModal.jsx

### Новый файл: `src/components/game/PoliceQuestModal.jsx`

**Архитектура компонента:**

- Тип: `observer` из `mobx-react-lite`
- Props: `mapStore` (MapStore instance), `carStore` (CarStore instance)

**Структура JSX:**

```jsx
<div className="police-quest-modal">
  {/* Правая часть — целевой объект */}
  <div className="quest-target">
    <img src={targetImage} alt="Target" className="target-image" />
  </div>

  {/* Анимированная машина подъезжает слева */}
  <div className="quest-car" style={{ left: `${mapStore.questCarPosition}px` }}>
    <CarModel carStore={carStore} />
  </div>

  {/* Кнопка "Арестовать" */}
  <button className="arrest-button" onClick={handleArrest}>
    Арестовать
  </button>
</div>
```

**Логика:**

- `targetImage` — брать из `Objects` (импортировать `Objects` из `../../state/objects`) по `typeId` из `questTargetObject.typeId`
- Машина позиционируется абсолютно через `left` в пикселях
- Кнопка занимает нижнюю часть модалки

**Стили:** Создать `src/style/police_quest.css`:

```css
.police-quest-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10%;
}

.quest-target {
  position: relative;
  width: 150px;
  height: 150px;
}

.target-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.quest-car {
  position: absolute;
  bottom: 20%;
  width: 120px;
  height: 80px;
  transition: none; /* анимация через requestAnimationFrame */
}

.arrest-button {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px 60px;
  font-size: 24px;
  font-weight: bold;
  background: #ff4444;
  color: white;
  border: 2px solid #fff;
  border-radius: 12px;
  cursor: pointer;
  z-index: 1001;
}

.arrest-button:hover {
  background: #cc0000;
}
```

---

## Задача 4: Реализация getPolicequest в onClick

### Изменяемый файл: `src/state/objects.jsx`

**Цель:** Связать клик с запуском квеста и сирены.

**Конкретные изменения:**

В функции `getPolicequest()` заменить `onClick` для всех трёх объектов:

```javascript
// humanAggr1Obj
onClick: (obj, mapStore, carStore) => {
  mapStore.startQuest(obj);
  carStore.toggleSirena();
},

// humanAggr2Obj
onClick: (obj, mapStore, carStore) => {
  mapStore.startQuest(obj);
  carStore.toggleSirena();
},

// humanAggr3Obj
onClick: (obj, mapStore, carStore) => {
  mapStore.startQuest(obj);
  carStore.toggleSirena();
},
```

**Удалить все `console.log("Поймал", obj);`** — это временные логи разработки.

---

## Задача 5: Анимация подъезда машины в PoliceQuestModal

### Изменяемый файл: `src/components/game/PoliceQuestModal.jsx`

**Логика анимации:**

```jsx
import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import Objects from "../../state/objects";

export const PoliceQuestModal = observer(({ mapStore, carStore }) => {
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const targetWidth = 150; // ширина целевого объекта
  const modalWidth = window.innerWidth;
  const endPosition = modalWidth - targetWidth - 50; // 50px отступ справа

  useEffect(() => {
    if (!mapStore.isPoliceQuestActive) return;

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Скорость подъезда (пикселей в секунду)
      const speed = 300;
      const delta = speed * deltaTime;

      if (mapStore.questCarPosition < endPosition) {
        mapStore.questCarPosition = Math.min(
          mapStore.questCarPosition + delta,
          endPosition,
        );
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mapStore.isPoliceQuestActive, mapStore.questCarPosition]);

  if (!mapStore.isPoliceQuestActive || !mapStore.questTargetObject) {
    return null;
  }

  const targetObj = mapStore.questTargetObject;
  const targetImage =
    Objects[
      targetObj.typeId === "human_aggr1"
        ? "humanAggr1Img"
        : targetObj.typeId === "human_aggr2"
          ? "humanAggr2Img"
          : "humanAggr3Img"
    ];

  return (
    <div className="police-quest-modal">
      <div className="quest-target">
        <img src={targetImage} alt="Target" className="target-image" />
      </div>

      <div
        className="quest-car"
        style={{ left: `${mapStore.questCarPosition}px` }}
      >
        <CarModel carStore={carStore} />
      </div>

      <button className="arrest-button" onClick={() => handleArrest()}>
        Арестовать
      </button>
    </div>
  );
});
```

**Примечание:** Для корректного отображения изображений объектов `humanAggr*` нужно экспортировать их из `objects.jsx` или добавить в `Objects` класс.

**Дополнительное изменение в `src/state/objects.jsx`:**

Добавить в класс `ObjectsClass`:

```javascript
class ObjectsClass {
  white_line = whiteLine;
  trafficLightRed = trafficLightRed;
  trafficLightGreen = trafficLightGreen;

  // Police quest images
  humanAggr1Img = humanAggr1Img;
  humanAggr2Img = humanAggr2Img;
  humanAggr3Img = humanAggr3Img;
}
```

---

## Задача 6: Обработчик кнопки "Арестовать"

### Изменяемый файл: `src/components/game/PoliceQuestModal.jsx`

**Реализация `handleArrest`:**

```javascript
const handleArrest = () => {
  const target = mapStore.questTargetObject;
  if (target) {
    // 1. Удалить объект с карты
    mapStore.removeObjectByUid(target.uid);

    // 2. Увеличить счётчик арестов
    runInAction(() => {
      carStore.countHelp += 1;
    });

    // 3. Выключить сирену
    if (carStore.sirena) {
      carStore.toggleSirena();
    }

    // 4. Закрыть модалку
    mapStore.finishQuest();
  }
};
```

**Важно:** `runInAction` импортировать из `mobx`.

---

## Задача 7: Подключение PoliceQuestModal к Game.jsx

### Изменяемый файл: `src/components/game/Game.jsx`

**Изменения:**

```jsx
import { PoliceQuestModal } from "./PoliceQuestModal";

// В return JSX:
return (
  <div className="game-viewport">
    <Maps
      map={activeMapStore}
      distance={distance}
      carStore={activeCarStore}
      onClickObject={handleObjectClick}
    />
    <Car carStore={activeCarStore} />
    <Conntollers activeCarStore={activeCarStore} />

    {/* Police Quest Modal */}
    {activeMapStore.isPoliceQuestActive && (
      <PoliceQuestModal mapStore={activeMapStore} carStore={activeCarStore} />
    )}
  </div>
);
```

---

## Итоговый чек-лист файлов для изменений

| №   | Файл                                       | Тип       | Описание                                         |
| --- | ------------------------------------------ | --------- | ------------------------------------------------ |
| 1   | `src/state/mapStore.jsx`                   | Изменение | Добавить поля квеста и 3 метода                  |
| 2   | `src/state/objects.jsx`                    | Изменение | Обновить onClick + добавить экспорты изображений |
| 3   | `src/components/game/PoliceQuestModal.jsx` | Новый     | Модалка с анимацией                              |
| 4   | `src/style/police_quest.css`               | Новый     | Стили модалки                                    |
| 5   | `src/components/game/Game.jsx`             | Изменение | Подключить модалку                               |

---

## Зависимости между задачами

- Задачи 1 и 2 независимы (можно параллельно)
- Задача 3 зависит от #1 (нужны поля в MapStore)
- Задача 4 зависит от #1 (нужен startQuest)
- Задача 5 зависит от #3 (база модалки)
- Задача 6 зависит от #2, #3 (нужны методы и модалка)
- Задача 7 зависит от #3, #6 (нужна модалка и логика ареста)

**Рекомендуемый порядок реализации:** 1 → 2, 3 → 4 → 5 → 6 → 7

---

# 🆕 ТЕХНИЧЕСКОЕ ЗАДАНИЕ: МКПП (Переключение передач)

## 🎯 Цель реализации

Добавить компонент переключения передач (МКПП) с 5 режимами: N, 1, 2, 3, 4. Каждый режим задаёт передаточное отношение, влияющее на максимальную скорость автомобиля.

---

## Задача 8: Создание компонента GearBox.jsx

### Новый файл: `src/components/contollers/GearBox.jsx`

**Архитектура компонента:**

- Тип: `observer` из `mobx-lite`
- Props: `gear: string`, `shiftGear: (gear: string) => void`

**Структура JSX:**

```jsx
<div className="gearbox-container">
  <p>МКПП</p>
  <div className="gearbox-buttons">
    <button
      className={gear === "N" ? "active" : ""}
      onClick={() => shiftGear("N")}
    >
      N
    </button>
    <button
      className={gear === "1" ? "active" : ""}
      onClick={() => shiftGear("1")}
    >
      1
    </button>
    <button
      className={gear === "2" ? "active" : ""}
      onClick={() => shiftGear("2")}
    >
      2
    </button>
    <button
      className={gear === "3" ? "active" : ""}
      onClick={() => shiftGear("3")}
    >
      3
    </button>
    <button
      className={gear === "4" ? "active" : ""}
      onClick={() => shiftGear("4")}
    >
      4
    </button>
  </div>
</div>
```

**Стили:** Создать `src/style/gearbox.css`:

```css
.gearbox-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gearbox-buttons {
  display: flex;
  gap: 4px;
}

.gearbox-buttons button {
  width: 40px;
  height: 40px;
  border: 2px solid #333;
  border-radius: 6px;
  background: #f0f0f0;
  font-weight: bold;
  cursor: pointer;
}

.gearbox-buttons button.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}
```

---

## Задача 9: Интеграция в Conntollers.jsx

### Изменяемый файл: `src/components/contollers/Conntollers.jsx`

**Изменения:**

```jsx
import { GearBox } from './GearBox';

// В return JSX, между зажиганием и сиреной:
<img className="ignition-key" ... />
<GearBox gear={activeCarStore.gear} shiftGear={(g) => activeCarStore.shiftGear(g)} />
<img className="ignition-sirena" ... />
```

---

## Задача 10: Логика в CarStore

### Изменяемый файл: `src/state/carStore.jsx`

**Новые observable-поля (добавить в класс):**

```javascript
gear = "N"; // 'N' | '1' | '2' | '3' | '4'
```

**Новый action-метод (добавить в класс):**

```javascript
shiftGear(newGear) {
  runInAction(() => {
    const validGears = ['N', '1', '2', '3', '4'];
    if (!validGears.includes(newGear)) return;

    // Безопасность: блокировка при высокой скорости
    if (newGear === 'N' && this.currentSpeed > 120) return;
    if (newGear === '1' && this.currentSpeed > 200) return;

    this.gear = newGear;
  });
}
```

**Новый computed (добавить в класс):**

```javascript
get gearRatio() {
  switch (this.gear) {
    case 'N': return 0;      // Нейтралка — скорость 0
    case '1': return 4;      // Делим на 4
    case '2': return 3;      // Делим на 3
    case '3': return 2;      // Делим на 2
    case '4': return 1;      // Прямая передача
    default: return 1;
  }
}
```

---

## Задача 11: Привязка к скорости в updatePhysics

### Изменяемый файл: `src/state/carStore.jsx`

**Изменения в методе `updatePhysics(deltaTime)`:**

```javascript
// Было:
if (this.isGasPressed && this.fuel > 0 && this.isIgnitionOn) {
  this.currentSpeed = Math.min(
    this.maxSpeed,
    this.currentSpeed + this.acceleration * deltaTime,
  );
}

// Стало:
const effectiveMaxSpeed =
  this.gear === "N" ? 0 : this.maxSpeed / this.gearRatio;

if (this.isGasPressed && this.fuel > 0 && this.isIgnitionOn) {
  this.currentSpeed = Math.min(
    effectiveMaxSpeed,
    this.currentSpeed + this.acceleration * deltaTime,
  );
}
```

---

## Задача 12: Визуальная индикация

Кнопка активной передачи получает класс `.active` (см. стили в задаче 8).

---

## Задача 13: Безопасность

Метод `shiftGear()` проверяет текущую скорость перед переключением на низшие передачи.

---

## Итоговый чек-лист файлов для изменений

| №   | Файл                                        | Тип       | Описание                              |
| --- | ------------------------------------------- | --------- | ------------------------------------- |
| 8   | `src/components/contollers/GearBox.jsx`     | Новый     | Компонент МКПП                        |
| 9   | `src/components/contollers/Conntollers.jsx` | Изменение | Подключить GearBox                    |
| 10  | `src/state/carStore.jsx`                    | Изменение | Добавить gear, shiftGear(), gearRatio |
| 11  | `src/state/carStore.jsx`                    | Изменение | Обновить updatePhysics                |
| 12  | `src/style/gearbox.css`                     | Новый     | Стили МКПП                            |

---

## Зависимости между задачами

- Задача 8 независима (создание компонента)
- Задача 9 зависит от #8 (нужен GearBox)
- Задача 10 независима (логика стора)
- Задача 11 зависит от #10 (нужен gearRatio)
- Задача 12 зависит от #8, #10 (нужен UI и состояние)
- Задача 13 зависит от #10 (нужен shiftGear)

**Рекомендуемый порядок реализации:** 8, 10 → 9, 11 → 12, 13
