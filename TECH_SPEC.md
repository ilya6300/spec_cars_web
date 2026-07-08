# TECH_SPEC.md — Динамические объекты окружения

## 🎯 Цель

Реализовать систему динамических объектов окружения (здания, бензоколонки, светофоры), которые:

- Двигаются по направлению движения (аналогично белой прерывистой линии)
- Отрисовываются в зелёной зоне выше дороги
- Кликабельны (клик → действие, долгое нажатие → действие)
- Имеют события при появлении в поле зрения (светофор → полиция останавливается)
- Здания могут идти подряд, бензоколонки — с большим интервалом
- **Не накладываются друг на друга** (anti-overlap через `lastObjectEndMeter`)

---

## 📦 Новая структура данных

### 1. @src/state/objects.jsx — Класс ObjectConfig и массив объектов

`javascript
class ObjectConfig {
constructor(config) {
this.id = config.id; // уникальный ID типа
this.type = config.type; // 'building' | 'gas_station' | 'traffic_light'
this.image = config.image; // URL ассета
this.zIndex = config.zIndex; // слой рендеринга
this.width = config.width; // ширина в пикселях
this.height = config.height; // высота в пикселях
this.minDistance = config.minDistance; // мин. дистанция до следующего такого же
this.maxDistance = config.maxDistance; // макс. дистанция до следующего такого же
this.onClick = config.onClick; // callback при клике (принимает objectInstance, mapStore, carStore)
this.onLongPress = config.onLongPress; // callback при долгом нажатии
this.onAppear = config.onAppear; // callback при появлении в поле зрения
}
}

// Экземпляры объектов
const buildings = new ObjectConfig({
id: 'building',
type: 'building',
image: '../assets/objects/house*1.png',
zIndex: 1,
width: 80,
height: 80,
minDistance: 0,
maxDistance: 150,
onClick: (obj, mapStore, carStore) => { /* ничего _/ },
onLongPress: (obj, mapStore, carStore) => { /_ ничего _/ },
onAppear: (obj, mapStore, carStore) => { /_ ничего \_/ }
});

const gasStation = new ObjectConfig({
id: 'gas*station',
type: 'gas_station',
image: '../assets/objects/gas_station.png',
zIndex: 2,
width: 100,
height: 100,
minDistance: 2000,
maxDistance: 5000,
onClick: (obj, mapStore, carStore) => {
mapStore.refuelCar(10); // добавить 10 литров, не превышая maxFuel
},
onLongPress: (obj, mapStore, carStore) => {
mapStore.startRefueling(); // начать непрерывную заправку
},
onAppear: (obj, mapStore, carStore) => { /* ничего \_/ }
});

const trafficLight = new ObjectConfig({
id: 'traffic*light',
type: 'traffic_light',
image: null, // будет обновляться динамически через MapStore.trafficLightColor
zIndex: 2,
width: 60,
height: 120,
minDistance: 3000,
maxDistance: 6000,
onClick: (obj, mapStore, carStore) => { /* ничего _/ },
onLongPress: (obj, mapStore, carStore) => { /_ ничего \_/ },
onAppear: (obj, mapStore, carStore) => {
// Событие: при появлении светофора в поле зрения
if (mapStore.trafficLightColor === 'red' && !carStore.isSirenOn) {
carStore.forceStop(); // сбросить скорость до 0, не глушить двигатель
}
}
});

// Экспорт массива объектов
const objectConfigs = [buildings, gasStation, trafficLight];
export default objectConfigs;
`

---

## 🧠 Расширение MapStore (@src/state/mapStore.jsx)

### Новые observable-поля

`javascript
// Массив активных объектов на экране
activeObjects = [];
// Каждый элемент: { uid: string, typeId: string, screenX: number, appeared: boolean }

// Расстояния до следующего спавна для каждого типа
nextSpawnDistances = {
building: 0,
gas_station: 2000,
traffic_light: 3000
};

// Состояние светофора
trafficLightColor = 'red'; // 'red' | 'green'
trafficLightTimer = null; // ID setInterval

// Состояние заправки
isRefueling = false; // флаг непрерывной заправки
refuelInterval = null; // ID setInterval
`

### Новые методы

#### 1. spawnObjects(viewportWidth) — Спавн новых объектов

`javascript
spawnObjects(viewportWidth) {
// Проверяем каждый тип объекта
objectConfigs.forEach(config => {
// Получаем текущее расстояние до следующего спавна
let nextSpawn = this.nextSpawnDistances[config.type];

    // Если расстояние пройдено — спавним объект
    if (this.offsetX >= nextSpawn) {
      const uid = \obj_\_\_\\;
      const screenX = viewportWidth + Math.random() * 100; // за правым краем экрана

      this.activeObjects.push({
        uid,
        typeId: config.type,
        screenX,
        appeared: false
      });

      // Обновляем расстояние до следующего спавна
      this.nextSpawnDistances[config.type] =
        nextSpawn + config.minDistance + Math.random() * (config.maxDistance - config.minDistance);
    }

});
}
`

#### 2. despawnObjects(viewportWidth) — Удаление ушедших объектов

`javascript
despawnObjects(viewportWidth) {
const configMap = {};
objectConfigs.forEach(c => { configMap[c.type] = c; });

this.activeObjects = this.activeObjects.filter(obj => {
const config = configMap[obj.typeId];
return obj.screenX > -config.width; // оставляем только видимые
});
}
`

#### 3. updateObjectPositions(carSpeed, deltaTime) — Сдвиг объектов

`javascript
updateObjectPositions(carSpeed, deltaTime) {
  // Сдвигаем все объекты влево
  this.activeObjects.forEach(obj => {
    obj.screenX -= carSpeed * deltaTime;
  });
}
`

#### 4. triggerAppearEvents(carStore) — Вызов onAppear

`javascript
triggerAppearEvents(carStore) {
const configMap = {};
objectConfigs.forEach(c => { configMap[c.type] = c; });

this.activeObjects.forEach(obj => {
if (!obj.appeared) {
const config = configMap[obj.typeId];
if (config.onAppear) {
// Передаём ссылку на объект и сторы
config.onAppear({ ...obj, config }, this, carStore);
}
obj.appeared = true;
}
});
}
`

#### 5. startTrafficLightTimer() — Глобальный таймер светофора

`javascript
startTrafficLightTimer() {
// Останавливаем существующий таймер
if (this.trafficLightTimer) {
clearInterval(this.trafficLightTimer);
}

// Переключаем цвет каждые 10 секунд
this.trafficLightTimer = setInterval(() => {
this.trafficLightColor =
this.trafficLightColor === 'red' ? 'green' : 'red';
}, 10000);
}
`

#### 6. refuelCar(amount) — Однократная заправка

`javascript
refuelCar(amount) {
  // Находим активный CarStore через контекст или передаём как аргумент
  // Предположим, что carStore доступен через замыкание или глобальную переменную
  // Для простоты: метод принимает carStore
  if (this.carStore) {
    this.carStore.fuel = Math.min(
      this.carStore.fuel + amount,
      this.carStore.maxFuel
    );
  }
}
`

#### 7. startRefueling() — Начать непрерывную заправку

`javascript
startRefueling() {
if (this.isRefueling) return;
this.isRefueling = true;

this.refuelInterval = setInterval(() => {
if (this.carStore) {
this.carStore.fuel = Math.min(
this.carStore.fuel + 1,
this.carStore.maxFuel
);
}
}, 100); // 1 литр каждые 100ms
}
`

#### 8. stopRefueling() — Остановить непрерывную заправку

`javascript
stopRefueling() {
  this.isRefueling = false;
  if (this.refuelInterval) {
    clearInterval(this.refuelInterval);
    this.refuelInterval = null;
  }
}
`

#### 9. getObjectAtScreenPosition(screenX, screenY) — Проверка клика

`javascript
getObjectAtScreenPosition(screenX, screenY) {
const configMap = {};
objectConfigs.forEach(c => { configMap[c.type] = c; });

// Ищем объект, который находится под координатами клика
return this.activeObjects.find(obj => {
const config = configMap[obj.typeId];
return (
obj.screenX <= screenX &&
obj.screenX + config.width >= screenX &&
// Y-координата не проверяется, так как объекты в одной зоне
true
);
});
}
`

---

## 🎨 Обновление @src/components/map/Maps.jsx

### Новая структура компонента

`jsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import MapsStore from '../../state/mapStore';
import objectConfigs from '../../state/objects';

export const Maps = observer(({ map, distance, carStore, onClickObject }) => {
// Вычисляем текущие объекты для рендеринга
const activeObjects = map.activeObjects || [];
const configMap = {};
objectConfigs.forEach(c => { configMap[c.type] = c; });

return (

<div className="game-map">
{/_ Фон карты _/}
<div
className="game-map-background"
style={{
          backgroundImage: \url(\)\,
        }}
/>

      {/* Слой с прерывистой разметкой */}
      <div
        className="road-line"
        style={{
          backgroundImage: \url(\)\,
          backgroundPositionX: \-\px\,
        }}
      />

      {/* Слой с объектами окружения */}
      {activeObjects.map(obj => {
        const config = configMap[obj.typeId];
        if (!config) return null;

        // Для светофора выбираем изображение по цвету
        const image = obj.typeId === 'traffic_light'
          ? (map.trafficLightColor === 'red'
             ? '../assets/objects/traffic_light_red.png'
             : '../assets/objects/traffic_light_green.png')
          : config.image;

        return (
          <div
            key={obj.uid}
            className="game-object"
            style={{
              backgroundImage: \url(\)\,
              backgroundPositionX: \-\px\,
              zIndex: config.zIndex,
              top: '0', // в зелёной зоне выше дороги
              transform: 'translateY(-50%)', // центрируем относительно верхней границы
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClickObject(obj, config, map, carStore);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              // Начинаем таймер long press
              const timeout = setTimeout(() => {
                if (config.onLongPress) {
                  config.onLongPress(obj, map, carStore);
                }
              }, 500);

              // Сохраняем ID таймера для отмены
              obj.longPressTimeout = timeout;
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              // Отменяем long press, если отпустили раньше 500ms
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
                obj.longPressTimeout = null;
              }
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              // Отменяем long press, если ушли с объекта
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
                obj.longPressTimeout = null;
              }
            }}
          />
        );
      })}
    </div>

);
});
`

---

## 🎮 Обновление @src/components/game/Game.jsx

### Интеграция с MapStore и обработкой кликов

`jsx
import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import { Car } from "../car/Car";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import MapsStore from "../../state/maps";
import { Maps } from "../map/Maps";
import { Conntollers } from "../contollers/Conntollers";

export const Game = () => {
const [activeCarStore] = useState(() => new CarStore(Cars.cars[0]));
const [activeMapStore] = useState(() => {
const store = new MapStore(MapsStore.maps[0]);
// Привязываем carStore к mapStore для заправки
store.carStore = activeCarStore;
return store;
});

const [distance, setDistance] = useState(0);
const lastTimeRef = useRef(performance.now());
const viewportWidthRef = useRef(window.innerWidth);

useEffect(() => {
// Обновляем viewport width при ресайзе
const handleResize = () => {
viewportWidthRef.current = window.innerWidth;
};
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
let animationFrameId;

    const gameLoop = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // 1. Обновляем физику машины
      activeCarStore.updatePhysics(deltaTime);

      // 2. Рассчитываем пиксели движения
      const pixelsMoved = activeCarStore.currentSpeed * deltaTime;

      // 3. Накапливаем расстояние
      setDistance((prev) => prev + pixelsMoved);

      // 4. Обновляем объекты
      activeMapStore.updateObjectPositions(activeCarStore.currentSpeed, deltaTime);
      activeMapStore.spawnObjects(viewportWidthRef.current);
      activeMapStore.despawnObjects(viewportWidthRef.current);
      activeMapStore.triggerAppearEvents(activeCarStore);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);

}, [activeCarStore, activeMapStore]);

// Запуск таймера светофора при монтировании
useEffect(() => {
activeMapStore.startTrafficLightTimer();
return () => {
if (activeMapStore.trafficLightTimer) {
clearInterval(activeMapStore.trafficLightTimer);
}
};
}, [activeMapStore]);

// Обработчик клика по объекту
const handleObjectClick = (obj, config, mapStore, carStore) => {
// Отменяем long press, если был клик (а не долгое нажатие)
if (obj.longPressTimeout) {
clearTimeout(obj.longPressTimeout);
obj.longPressTimeout = null;
}

    // Вызываем onClick
    if (config.onClick) {
      config.onClick(obj, mapStore, carStore);
    }

};

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
</div>
);
};
`

---

## 🎯 Логика forceStop в CarStore

### Метод forceStop()

`javascript
forceStop() {
  // Сбрасываем скорость до 0, но не глушим двигатель
  runInAction(() => {
    this.currentSpeed = 0;
    // isIgnitionOn не трогаем — двигатель продолжает работать
  });
}
`

---

## 📐 Z-Index иерархия слоёв (CSS)

`css
/_ В style/road.css или style/app.css _/

.game-viewport {
position: relative;
width: 100%;
height: 100vh;
}

.game-map {
position: relative;
width: 100%;
height: 40%; /_ верхняя часть экрана _/
z-index: 1;
}

.game-map-background {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-size: cover;
z-index: 0;
}

.road-line {
position: absolute;
top: 60%; /_ дорожная разметка ниже _/
left: 0;
width: 200%; /_ для бесшовного зацикливания _/
height: 10%;
background-repeat: repeat-x;
background-size: 100px 10px;
z-index: 3;
}

.game-object {
position: absolute;
top: 0; /_ в зелёной зоне _/
width: 80px;
height: 80px;
background-repeat: no-repeat;
background-size: contain;
cursor: pointer;
z-index: var(--object-z-index); /_ динамический z-index из config.zIndex _/
}
`

---

## 🧪 Тестирование

### Unit-тесты для MapStore

1. **Тест: spawnObjects** — проверить, что объекты спавнятся при превышении distance
2. **Тест: despawnObjects** — проверить, что объекты удаляются при уходе за левый край
3. **Тест: updateObjectPositions** — проверить, что screenX уменьшается на carSpeed \* deltaTime
4. **Тест: triggerAppearEvents** — проверить, что onAppear вызывается один раз при появлении
5. **Тест: startTrafficLightTimer** — проверить, что color меняется каждые 10с

### Component-тесты для Maps

1. **Тест: рендеринг объектов** — проверить, что объекты рендерятся с корректными стилями
2. **Тест: onClick** — проверить, что onClick вызывается при клике
3. **Тест: onLongPress** — проверить, что onLongPress вызывается после 500ms удержания

---

## 🚀 Порядок реализации (по задачам из TODO.md)

1. **#1**: Создать ObjectConfig в @src/state/objects.jsx
2. **#2**: Добавить массив объектов (buildings, gas_station, traffic_light)
3. **#3**: Расширить MapStore новыми полями и методами
4. **#4**: Обновить Maps.jsx для рендеринга объектов
5. **#5**: Реализовать onClick на бензоколонке (refuelCar)
6. **#6**: Реализовать onAppear для светофора (forceStop)
7. **#7**: Реализовать глобальный таймер светофора
8. **#8**: Добавить зацикливание объектов
9. **#9**: Настроить Z-Index иерархию
10. **#10**: Реализовать onLongPress для бензоколонки

---

## ⚠️ Важные замечания

1. **Не использовать console.log** в production-коде.
2. **MobX-контракт**: все мутации в MapStore только через методы класса.
3. **Observer**: компонент Maps должен быть обёрнут в observer для реактивности.
4. **Очистка таймеров**: при размонтировании компонента очищать setInterval (светофор, заправка).
5. **Адаптивность**: viewport width обновляется при resize, объекты позиционируются относительно него.

---

# TECH SPEC — Отслеживание светофора в carStore (текущая задача)

## 🎯 Цель

В `carStore` корректно отслеживать наличие светофора на экране (`isTrafficLightOnScreen`) и его цвет (`trafficLightColor`), заменяя текущий `console.log(MapStore.trafficLightOnTheMap)` на рабочую логику.

---

## 1. Изменения в `@src/state/mapStore.jsx`

### 1.1. Исправление `triggerAppearEvents()` (строка ~77)

**Сейчас (закомментировано):**

```js
if (obj.typeId === "traffic_light") {
  // this.trafficLightOnTheMap = true;
}
```

**Нужно:**

```js
if (obj.typeId === "traffic_light") {
  this.trafficLightOnTheMap = true;
}
```

### 1.2. Исправление `despawnObjects()` (строка ~66)

**Сейчас (баг):** флаг `trafficLightOnTheMap = false` сбрасывается для всех объектов, а не только для светофора.
**Нужно:** перенести сброс внутрь условия фильтрации для светофора:

```js
this.activeObjects = this.activeObjects.filter((obj) => {
  const config = configMap[obj.typeId];
  const screenX = obj.worldX - this.offsetX;
  if (obj.typeId === "traffic_light" && screenX <= -config.width) {
    this.trafficLightOnTheMap = false;
  }
  return screenX > -config.width;
});
```

### 1.3. Новое computed-свойство `isTrafficLightRed`

Добавить после полей класса (автоматически станет computed благодаря `makeAutoObservable`):

```js
get isTrafficLightRed() {
  return this.trafficLightOnTheMap && this.trafficLightColor === "red";
}
```

---

## 2. Изменения в `@src/state/carStore.jsx`

### 2.1. Новые observable-поля

Добавить в конструктор (перед `makeAutoObservable`):

```js
// Состояние светофора
isTrafficLightOnScreen = false;
trafficLightColor = null; // 'red' | 'green' | null
```

### 2.2. Новый метод `checkTrafficLight(mapStore)`

```js
checkTrafficLight(mapStore) {
  runInAction(() => {
    this.isTrafficLightOnScreen = mapStore.trafficLightOnTheMap;
    this.trafficLightColor = mapStore.trafficLightOnTheMap
      ? mapStore.trafficLightColor
      : null;
  });
}
```

### 2.3. Исправление `updatePhysics()` (строка ~189)

**Сейчас:**

```js
console.log(MapStore.trafficLightOnTheMap);
```

**Нужно:** убрать console.log. Метод `checkTrafficLight` будет вызываться из Game.jsx в игровом цикле.

### 2.4. Новое computed-свойство `shouldStopForLight`

```js
get shouldStopForLight() {
  return this.isTrafficLightOnScreen && this.trafficLightColor === "red";
}
```

---

## 3. Интеграция (Game.jsx / игровой цикл)

В игровом цикле, после `mapStore.update()`, добавить вызов:

```js
carStore.checkTrafficLight(mapStore);
```

---

## 4. Зависимости

- Новые npm-пакеты: **не требуются**
- Только изменения в `mapStore.jsx` и `carStore.jsx`

---

# TECH SPEC — Anti-overlap объектов (CONCEPT.md)

## 🎯 Цель

Исправить наложение объектов (дома, светофоры, бензоколонки) друг на друга. Проблема: при спавне каждый тип объекта рассчитывает дистанцию только до своего «следующего двойника». Решение: добавить общий `lastObjectEndMeter` — метр, на котором закончился самый последний созданный объект любого типа. Новый объект спавнится только после этой отметки.

## 📐 Изменения в @src/state/mapStore.jsx

### 4.1. Новое observable-поле

```js
// Метр, на котором закончился самый последний созданный объект любого типа
lastObjectEndMeter = 0;
```

### 4.2. Модификация spawnObjects

**Сейчас:**

```js
spawnObjects(viewportWidth) {
  objectConfigs.forEach((config) => {
    const nextSpawn = this.nextSpawnDistances[config.type];
    if (this.offsetX >= nextSpawn) {
      const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;
      const worldX = this.offsetX + viewportWidth + Math.random() * 100;
      runInAction(() => {
        this.activeObjects.push({ uid, typeId: config.type, worldX, appeared: false });
      });
      this.nextSpawnDistances[config.type] =
        nextSpawn + config.minDistance + Math.random() * (config.maxDistance - config.minDistance);
    }
  });
}
```

**Нужно:**

```js
spawnObjects(viewportWidth) {
  objectConfigs.forEach((config) => {
    const nextSpawn = this.nextSpawnDistances[config.type];

    if (this.offsetX >= nextSpawn) {
      // Ключевое изменение: worldX не может быть меньше lastObjectEndMeter
      const worldX = Math.max(
        this.offsetX + viewportWidth,
        this.lastObjectEndMeter
      ) + Math.random() * 100;

      const uid = `obj_${config.type}_${Date.now()}_${Math.random()}`;

      runInAction(() => {
        this.activeObjects.push({
          uid,
          typeId: config.type,
          worldX,
          appeared: false,
        });
        // Обновляем метр конца последнего объекта
        this.lastObjectEndMeter = worldX + config.width;
      });

      this.nextSpawnDistances[config.type] =
        nextSpawn +
        config.minDistance +
        Math.random() * (config.maxDistance - config.minDistance);
    }
  });
}
```

### 4.3. Обновление despawnObjects

После удаления ушедших объектов нужно скорректировать `lastObjectEndMeter`:

```js
despawnObjects() {
  runInAction(() => {
    const configMap = {};
    objectConfigs.forEach((c) => {
      configMap[c.type] = c;
    });

    this.activeObjects = this.activeObjects.filter((obj) => {
      const config = configMap[obj.typeId];
      const screenX = obj.worldX - this.offsetX;
      if (obj.typeId === "traffic_light" && screenX <= -config.width) {
        this.trafficLightOnTheMap = false;
      }
      return screenX > -config.width;
    });

    // Корректировка lastObjectEndMeter: если последний видимый объект ушёл,
    // сбрасываем на его конец + ширину
    const sorted = [...this.activeObjects].sort((a, b) => b.worldX - a.worldX);
    if (sorted.length > 0) {
      const lastConfig = configMap[sorted[0].typeId];
      this.lastObjectEndMeter = sorted[0].worldX + lastConfig.width;
    } else {
      // Нет активных объектов — сбрасываем
      this.lastObjectEndMeter = this.offsetX;
    }
  });
}
```

---

# TECH SPEC — Задача #11: Исправить refuelCar

## Проблема

Метод `refuelCar` в MapStore имеет `return;` на первой строке, который блокирует весь код.

## Исправление @src/state/mapStore.jsx

**Сейчас:**

```js
refuelCar(amount) {
  return;
  if (this.carStore) {
    runInAction(() => {
      this.carStore.fuel = Math.min(this.carStore.fuel + amount, this.carStore.maxFuel);
    });
  }
}
```

**Нужно:**

```js
refuelCar(amount) {
  if (this.carStore) {
    runInAction(() => {
      this.carStore.fuel = Math.min(this.carStore.fuel + amount, this.carStore.maxFuel);
    });
  }
}
```

---

# TECH SPEC — Задача #13: Убрать console.log из carStore

## Исправление @src/state/carStore.jsx

В `updatePhysics` (строка ~189) убрать `console.log`:

**Сейчас:**

```js
if (this.isGasPressed && this.fuel > 0 && this.trafficLightColor !== "red") {
  console.log(
    this.trafficLightColor,
    this.trafficLightOnTheMap,
    this.isTrafficLightOnScreen,
  );
  // ...
}
```

**Нужно:**

```js
if (this.isGasPressed && this.fuel > 0 && this.trafficLightColor !== "red") {
  const currentConsumption =
    (this.currentSpeed / this.maxSpeed) * this.fuelConsumption;
  this.fuel = this.fuel - 0.5;

  if (this.fuel === 0) {
    this.isGasPressed = false;
  }
}
```

---

# TECH SPEC — Задача #14: Исправить forceStop

## Исправление @src/state/carStore.jsx

**Сейчас:**

```js
forceStop() {
  runInAction(() => {
    if (!this.sirena) {
      this.isGasPressed = false;
    }
    // this.currentSpeed = 0;  ← закомментировано
  });
}
```

**Нужно:**

```js
forceStop() {
  runInAction(() => {
    if (!this.sirena) {
      this.isGasPressed = false;
    }
    this.currentSpeed = 0;
  });
}
```

---

# TECH SPEC — Задача #15: Исправить onPointerDown в Maps.jsx

## Проблема

Таймер long press сохраняется на объекте данных (`obj.longPressTimeout`), а не на DOM-элементе. При `onPointerLeave` таймер ищется на объекте данных, но если объект был перерендерен (MobX re-render), ссылка теряется.

## Исправление @src/components/map/Maps.jsx

**Сейчас:**

```jsx
onPointerDown={(e) => {
  e.stopPropagation();
  const timeout = setTimeout(() => {
    if (config.onLongPress) {
      config.onLongPress(obj, map, carStore);
    }
  }, 500);
  obj.longPressTimeout = timeout;
}}
onPointerUp={(e) => {
  e.stopPropagation();
  if (obj.longPressTimeout) {
    clearTimeout(obj.longPressTimeout);
    obj.longPressTimeout = null;
  }
}}
onPointerLeave={(e) => {
  e.stopPropagation();
  if (obj.longPressTimeout) {
    clearTimeout(obj.longPressTimeout);
    obj.longPressTimeout = null;
  }
}}
```

**Нужно:** использовать `e.currentTarget` для хранения таймера:

```jsx
onPointerDown={(e) => {
  e.stopPropagation();
  const timeout = setTimeout(() => {
    if (config.onLongPress) {
      config.onLongPress(obj, map, carStore);
    }
  }, 500);
  e.currentTarget.longPressTimeout = timeout;
}}
onPointerUp={(e) => {
  e.stopPropagation();
  const el = e.currentTarget;
  if (el.longPressTimeout) {
    clearTimeout(el.longPressTimeout);
    el.longPressTimeout = null;
  }
  if (map.isRefueling) {
    map.stopRefueling();
  }
}}
onPointerLeave={(e) => {
  e.stopPropagation();
  const el = e.currentTarget;
  if (el.longPressTimeout) {
    clearTimeout(el.longPressTimeout);
    el.longPressTimeout = null;
  }
}}
```

---

# TECH SPEC — Отслеживание светофора в carStore (текущая задача)

## 🎯 Цель

В `carStore` корректно отслеживать наличие светофора на экране (`isTrafficLightOnScreen`) и его цвет (`trafficLightColor`), заменяя текущий `console.log(MapStore.trafficLightOnTheMap)` на рабочую логику.

---

## 1. Изменения в `@src/state/mapStore.jsx`

### 1.1. Исправление `triggerAppearEvents()` (строка ~77)

**Сейчас (закомментировано):**

```js
if (obj.typeId === "traffic_light") {
  // this.trafficLightOnTheMap = true;
}
```

**Нужно:**

```js
if (obj.typeId === "traffic_light") {
  this.trafficLightOnTheMap = true;
}
```

### 1.2. Исправление `despawnObjects()` (строка ~66)

**Сейчас (баг):** флаг `trafficLightOnTheMap = false` сбрасывается для всех объектов, а не только для светофора.
**Нужно:** перенести сброс внутрь условия фильтрации для светофора:

```js
this.activeObjects = this.activeObjects.filter((obj) => {
  const config = configMap[obj.typeId];
  const screenX = obj.worldX - this.offsetX;
  if (obj.typeId === "traffic_light" && screenX <= -config.width) {
    this.trafficLightOnTheMap = false;
  }
  return screenX > -config.width;
});
```

### 1.3. Новое computed-свойство `isTrafficLightRed`

Добавить после полей класса (автоматически станет computed благодаря `makeAutoObservable`):

```js
get isTrafficLightRed() {
  return this.trafficLightOnTheMap && this.trafficLightColor === "red";
}
```

---

## 2. Изменения в `@src/state/carStore.jsx`

### 2.1. Новые observable-поля

Добавить в конструктор (перед `makeAutoObservable`):

```js
// Состояние светофора
isTrafficLightOnScreen = false;
trafficLightColor = null; // 'red' | 'green' | null
```

### 2.2. Новый метод `checkTrafficLight(mapStore)`

```js
checkTrafficLight(mapStore) {
  runInAction(() => {
    this.isTrafficLightOnScreen = mapStore.trafficLightOnTheMap;
    this.trafficLightColor = mapStore.trafficLightOnTheMap
      ? mapStore.trafficLightColor
      : null;
  });
}
```

### 2.3. Исправление `updatePhysics()` (строка ~189)

**Сейчас:**

```js
console.log(MapStore.trafficLightOnTheMap);
```

**Нужно:** убрать console.log. Метод `checkTrafficLight` будет вызываться из Game.jsx в игровом цикле.

### 2.4. Новое computed-свойство `shouldStopForLight`

```js
get shouldStopForLight() {
  return this.isTrafficLightOnScreen && this.trafficLightColor === "red";
}
```

---

## 3. Интеграция (Game.jsx / игровой цикл)

В игровом цикле, после `mapStore.update()`, добавить вызов:

```js
carStore.checkTrafficLight(mapStore);
```

---

## 4. Зависимости

- Новые npm-пакеты: **не требуются**
- Только изменения в `mapStore.jsx` и `carStore.jsx`
