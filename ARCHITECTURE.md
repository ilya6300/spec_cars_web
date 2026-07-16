# ARCHITECTURE.md (Глобальная карта проекта)

## 🏗️ 1. Архитектурный паттерн и стек

- **Архитектурный подход**: Простая модульная (Component-Driven) структура без строгого следования FSD/Clean Architecture. Разделение на 4 зоны верхнего уровня: UI-компоненты, состояние (stores), стили и статические ресурсы.
- **Стек технологий**:
  - **Язык**: JavaScript (ES Modules, `"type": "module"` в `package.json`).
  - **UI-фреймворк**: React 19.2.7 + React DOM.
  - **Стейт-менеджер**: MobX 6.16.1 (`makeAutoObservable`, `runInAction`) + `mobx-lite` 0.1.15.
  - **Бандлер**: Vite 8.1.1.
  - **Запросы к серверу**: Отсутствуют (проект работает с локальными ассетами и стейтом).

---

## 📁 2. Карта директорий (High-Level)

```
src/
├── main.jsx              # Точка входа (ReactDOM.createRoot)
├── App.jsx               # Корневой компонент (обёртка)
├── state/                # 🧠 Слой бизнес-логики и стейта
│   ├── carStore.jsx      # Класс MobX: физика авто, скорость, топливо, зажигание, вращение колёс
│   ├── mapStore.jsx      # Класс MobX: состояние карты, коллизии, координаты
│   ├── questCarStore.jsx # Класс MobX: управление квестовыми автомобилями
│   ├── maps.jsx          # Статический объект с метаданными карт
│   ├── cars.jsx          # Статический объект с данными доступных автомобилей
│   └── objects.jsx       # Статические данные объектов окружения
├── components/           # 🎨 UI-слои (презентационные компоненты)
│   ├── game/Game.jsx     # Игровой цикл (requestAnimationFrame), композиция слоёв
│   ├── game/PoliceQuestModal.jsx  # Модальное окно квеста полиции (анимация, кнопка ареста)
│   ├── game/PedestrianCrossingModal.jsx  # Модальное окно квеста пешеходного перехода
│   ├── game/QuestCar.jsx      # Компонент отображения квестового автомобиля
│   ├── game/SpeedDisplay.jsx  # Компонент отображения скорости в правом верхнем углу
│   ├── map/Maps.jsx      # Рендер карты с учётом distance (смещение)
│   ├── car/Car.jsx       # Рендер автомобиля с передачей carStore
│   ├── car/CarModel.jsx  # 3D-модель автомобиля
│   └── contollers/       # Элементы управления
│       ├── Conntollers.jsx  # Контейнер контроллеров (зажигание, МКПП, газ, сирена)
│       └── GearBox.jsx      # Компонент переключения передач (МКПП)
├── style/                # 🎨 Глобальные и компонентные стили (Plain CSS)
│   ├── app.css           # Базовые стили приложения
│   ├── main.css          # Стили основного layout
│   ├── car.css           # Стили автомобиля
│   ├── road.css          # Стили дороги
│   ├── control.css       # Стили контроллеров
│   ├── gearbox.css       # Стили компонента МКПП (GearBox)
│   ├── police_quest.css  # Стили модального окна квеста полиции
│   ├── pedestrian_crossing.css  # Стили модального окна пешеходного перехода
│   ├── quest_car.css     # Стили квеста с другими автомобилями и скорости
│   ├── media.css         # Медиа-запросы
│   └── zeroling.css      # Сброс/нулевые стили
└── assets/               # 🖼️ Статические ресурсы (PNG-изображения)
    ├── cars/             # Спрайты/изображения авто
    ├── maps/             # Текстуры дорог/карт
    └── objects/          # Объекты окружения
```

**Правила импортов**:

- `components/` → могут импортировать из `state/`, `assets/`, `style/`.
- `state/` → **запрещено** импортировать из `components/` и `style/`. Stores — чистая логика.
- `style/` и `assets/` → импортируются только в `components/` и `main.jsx`.
- Кросс-импорты внутри `components/` разрешены только через индексные файлы или прямые пути (например, `Game.jsx` импортирует `Car`, `Maps`, `Conntollers`).

---

## 🧠 3. Управление состоянием (MobX Stores)

### Основные сторы

| Стор               | Тип                          | Зона ответственности                                                                                                                                                       |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CarStore`         | Класс (`makeAutoObservable`) | Физика автомобиля: разгон/торможение, расход топлива, текущая/макс. скорость, зажигание (`isIgnitionOn`), вращение колёс (`wheelRotation`), счётчик арестов (`countHelp`). |
| `MapStore`         | Класс (`makeAutoObservable`) | Состояние карты: позиция прокрутки, коллизии, смена уровней, состояние квеста полиции, квест с другими автомобилями.                                                      |
| `QuestCarStore`    | Класс (`makeAutoObservable`) | Управление квестовыми автомобилями: спавн, движение, вращение колёс, активность.                                                                                           |
| `MapsStore`        | Plain Object                 | Статическая коллекция карт (id, name, url). Не является MobX-стором.                                                                                                       |
| `Cars` / `objects` | Plain Objects                | Статические справочники данных.                                                                                                                                            |

### 🔹 Расширение контракта `Cars` (Speed Multiplier)

| Поле / Метод       | Тип      | Описание                                                                                       |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `speedMultiplier`  | `number` | Множитель скорости для преобразования кодовых значений в реальные km/h. Применяется к Cars.cars[0]. |

**Формула расчёта эффективной максимальной скорости**:

```javascript
const multiplier = this.speedMultiplier !== undefined ? this.speedMultiplier : 1;
const effectiveMaxSpeed = this.gear === "N" ? 0 : (this.maxSpeed / this.gearRatio) * multiplier;
```

**Пример значений для полицейского автомобиля**:
- maxSpeed: 900 (кодовое значение)
- speedMultiplier: 0.156
- 4th gear: 900 × 0.156 / 1 = 140 km/h
- 3rd gear: 900 × 0.156 / 1.33 = ~105 km/h
- 2nd gear: 900 × 0.156 / 2 = ~70 km/h
- 1st gear: 900 × 0.156 / 4 = ~35 km/h

### 🔹 Расширение контракта `MapStore` (Police Quest)

| Поле / Метод             | Тип                    | Описание                                                                                                 |
| ------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `isPoliceQuestActive`    | `boolean` (observable) | Флаг активности модального окна квеста. Значение по умолчанию: `false`.                                  |
| `questTargetObject`      | `Object` / `null`      | Ссылка на кликнутый объект окружения (`{ uid, typeId, worldX, appeared }` из `activeObjects`).           |
| `questCarPosition`       | `number`               | Текущая координата X машины в модалке. Инициализация: `-150` (за левым краем экрана).                    |
| `startQuest(targetObj)`  | `action`               | Устанавливает `isPoliceQuestActive = true`, сохраняет `targetObj`, сбрасывает `questCarPosition = -150`. |
| `finishQuest()`          | `action`               | Сбрасывает флаг квеста, очищает целевой объект, возвращает машину за экран.                              |
| `removeObjectByUid(uid)` | `action`               | Фильтрует массив `activeObjects`, удаляя элемент с переданным `uid`. Корректирует `lastObjectEndMeter`.  |

### 🔹 Расширение контракта `MapStore` (Pedestrian Crossing Quest)

| Поле / Метод                         | Тип                    | Описание                                                                                                 |
| ------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `isPedestrianCrossingQuestActive`    | `boolean` (observable) | Флаг активности модального окна квеста пешеходного перехода. По умолчанию: `false`.                      |
| `pedestrianCrossingTargetObject`     | `Object` / `null`      | Ссылка на выбранный объект human (`{ uid, typeId }` из `dataObjectsSub`).                                |
| `pedestrianCarPosition`              | `number`               | Текущая координата X машины в модалке. Инициализация: `-150`.                                            |
| `pedestrianState`                    | `string` (observable)  | Состояние пешехода: `"waiting"` | `"walking"` | `"stopped"`.                                               |
| `startPedestrianCrossingQuest(obj)`  | `action`               | Устанавливает `isPedestrianCrossingQuestActive = true`, сохраняет `obj`, сбрасывает позицию и состояние. |
| `finishPedestrianCrossingQuest()`    | `action`               | Сбрасывает флаг квеста, очищает целевой объект, возвращает машину за экран.                              |

### 🔹 Расширение контракта `CarStore` (МКПП)

| Поле / Метод      | Тип                   | Описание                                                                         |
| ----------------- | --------------------- | -------------------------------------------------------------------------------- |
| `countHelp`       | `number` (observable) | Счётчик успешных арестов. Увеличивается на `+1` при завершении квеста.           |
| `toggleSirena()`  | `action`              | Переключает визуальное/звуковое состояние сирены (флаг `sirena`).                |
| `gear`            | `string` (observable) | Текущая передача: `'N'`, `'1'`, `'2'`, `'3'`, `'4'`. По умолчанию `'N'`.         |
| `shiftGear(gear)` | `action`              | Переключает передачу с проверкой безопасности (блокировка при высокой скорости). |
| `gearRatio`       | `computed`            | Передаточное отношение: N=0, 1=4, 2=2, 3=1.33, 4=1. Влияет на макс. скорость.    |

### 🔹 Расширение контракта `CarStore` (Pedestrian Crossing)

| Поле / Метод               | Тип                   | Описание                                                                         |
| -------------------------- | --------------------- | -------------------------------------------------------------------------------- |
| `pedestrianQuestTriggered` | `boolean`             | Флаг: квест пешеходного перехода уже запущен на текущем светофоре.               |

### 🔹 Новый стор: `QuestCarStore` (Квестовые автомобили)

| Поле / Метод       | Тип                      | Описание                                                                                                                                 |
| ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `number` (observable)    | Уникальный ID машины.                                                                                                                    |
| `type`             | `string` (observable)    | Тип машины (из `Cars.otherCars`).                                                                                                        |
| `name`             | `string` (observable)    | Название машины.                                                                                                                         |
| `urlBody`          | `string` (observable)    | URL спрайта кузова.                                                                                                                      |
| `urlShell`         | `string` (observable)    | URL спрайта колёс.                                                                                                                       |
| `maxSpeed`         | `number` (observable)    | Максимальная скорость (из `Cars.otherCars`).                                                                                            |
| `minSpeed`         | `number` (observable)    | Минимальная скорость (из `Cars.otherCars`).                                                                                             |
| `enemy`            | `boolean` (observable)   | Флаг враждебности: `enemy=false` (спавн справа, движение слева направо), `enemy=true` (спавн слева, движение справа налево).            |
| `currentSpeed`     | `number` (observable)    | Текущая скорость (случайная в диапазоне `[minSpeed, maxSpeed]`).                                                                        |
| `positionX`        | `number` (observable)    | Текущая координата X на экране.                                                                                                          |
| `active`           | `boolean` (observable)   | Флаг активности машины.                                                                                                                  |
| `wheelRotation`    | `number` (observable)    | Угол вращения колёс (зависит от `currentSpeed`).                                                                                        |
| `constructor(carData)` | `action`               | Инициализирует машину из `Cars.otherCars`.                                                                                              |
| `spawn(positionX, speed)` | `action`            | Устанавливает начальную позицию и скорость.                                                                                             |
| `updatePosition(deltaTime)` | `action`          | Обновляет `positionX` на основе `currentSpeed`.                                                                                         |
| `updateWheelRotation(deltaTime)` | `action`    | Обновляет `wheelRotation` на основе `currentSpeed` (коэффициент 5).                                                                     |
| `deactivate()`     | `action`                 | Сбрасывает `active = false`.                                                                                                             |

### 🔹 Расширение контракта `MapStore` (Quest Cars: Относительное движение)

| Поле / Метод               | Тип                      | Описание                                                                                                                                 |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `questCars`                | `QuestCarStore[]`        | Массив активных квестовых машин.                                                                                                         |
| `questCarSpawnTimer`       | `number`                 | Таймер следующего спавна (3-8 секунд).                                                                                                  |
| `questCarActive`           | `boolean`                | Флаг активности квеста с другим автомобилем.                                                                                            |
| `questCarForArrest`        | `QuestCarStore | null`   | Квестовая машина, к которой подъехал полицейский (для показа кнопки "Арестовать").                                                     |
| `spawnQuestCar()`          | `action`                 | Спавнит квестовую машину (только если `!isPedestrianCrossingQuestActive && !questCarActive`).                                           |
| `updateQuestCars(deltaTime)` | `action`               | Обновляет позиции всех questCars с учётом **относительной скорости**. Передаёт `policeSpeed` в `questCar.updatePosition(deltaTime, policeSpeed)`. |
| `removeQuestCarByIndex(index)` | `action`             | Удаляет questCar из массива `questCars` по индексу.                                                                                     |
| `dispose()`                | `action`                 | Очистка таймеров и состояния при размонтировании.                                                                                       |

**API-контракт между `MapStore` и `QuestCarStore`:**
```javascript
// MapStore.updateQuestCars(deltaTime):
questCar.updatePosition(deltaTime, this.carStore.currentSpeed);
questCar.updateWheelRotation(deltaTime);
```

### 🔹 Новый стор: `QuestCarStore` (Квестовые автомобили)

| Поле / Метод       | Тип                      | Описание                                                                                                                                 |
| ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `number` (observable)    | Уникальный ID машины.                                                                                                                    |
| `type`             | `string` (observable)    | Тип машины (из `Cars.otherCars`).                                                                                                        |
| `name`             | `string` (observable)    | Название машины.                                                                                                                         |
| `urlBody`          | `string` (observable)    | URL спрайта кузова.                                                                                                                      |
| `urlShell`         | `string` (observable)    | URL спрайта колёс.                                                                                                                       |
| `maxSpeed`         | `number` (observable)    | Максимальная скорость (из `Cars.otherCars`).                                                                                            |
| `minSpeed`         | `number` (observable)    | Минимальная скорость (из `Cars.otherCars`).                                                                                             |
| `enemy`            | `boolean` (observable)   | Флаг враждебности: `enemy=false` (спавн справа, движение слева направо), `enemy=true` (спавн слева, движение справа налево).            |
| `currentSpeed`     | `number` (observable)    | Текущая скорость (случайная в диапазоне `[minSpeed, maxSpeed]`).                                                                        |
| `positionX`        | `number` (observable)    | Текущая координата X на экране.                                                                                                          |
| `active`           | `boolean` (observable)   | Флаг активности машины.                                                                                                                  |
| `wheelRotation`    | `number` (observable)    | Угол вращения колёс (зависит от `currentSpeed`).                                                                                        |
| `constructor(carData)` | `action`               | Инициализирует машину из `Cars.otherCars`.                                                                                              |
| `spawn(positionX, speed)` | `action`            | Устанавливает начальную позицию и скорость.                                                                                             |
| `updatePosition(deltaTime, policeSpeed)` | `action`      | Обновляет `positionX` на основе **относительной скорости** `relativeSpeed = currentSpeed - policeSpeed`.                              |
| `updateWheelRotation(deltaTime)` | `action`    | Обновляет `wheelRotation` на основе `currentSpeed` (коэффициент 5).                                                                     |
| `deactivate()`     | `action`                 | Сбрасывает `active = false`.                                                                                                             |

---

### 🧠 Quest Cars: Относительное движение

**Концепция:** Движение всех квестовых машин рассчитывается **относительно скорости полицейского автомобиля**. Это создаёт ощущение относительного движения в реальном времени.

**Формула относительной скорости:**
```javascript
relativeSpeed = questCar.currentSpeed - policeSpeed
```

**Правила движения:**
- **Для `enemy=false` (не нарушитель):**
  - Спавн справа (`positionX = viewportWidth + 200`)
  - Движение **влево** (отрицательное направление)
  - Относительное смещение: `positionX -= relativeSpeed * deltaTime`
  - Если `questCar.currentSpeed > policeSpeed` → машина движется влево (от полицейского)
  - Если `questCar.currentSpeed < policeSpeed` → машина движется вправо (полицейский догоняет)
  - Если `questCar.currentSpeed === policeSpeed` → машина стоит на месте

- **Для `enemy=true` (нарушитель):**
  - Спавн слева (`positionX = -200`)
  - Движение **вправо** (положительное направление)
  - Относительное смещение: `positionX += relativeSpeed * deltaTime`
  - Если `questCar.currentSpeed > policeSpeed` → машина движется вправо (от полицейского)
  - Если `questCar.currentSpeed < policeSpeed` → машина движется влево (полицейский догоняет)
  - Если `questCar.currentSpeed === policeSpeed` → машина стоит на месте

**Примеры:**
1. `policeSpeed = 80`, `questCar.currentSpeed = 60`, `enemy=false`
   - `relativeSpeed = 60 - 80 = -20`
   - `positionX += 20 * deltaTime` (машина уходит вправо, полицейский её догоняет)

2. `policeSpeed = 0`, `questCar.currentSpeed = 60`, `enemy=false`
   - `relativeSpeed = 60 - 0 = 60`
   - `positionX -= 60 * deltaTime` (машина едет влево со своей скоростью)

3. `policeSpeed = 80`, `questCar.currentSpeed = 80`, `enemy=false`
   - `relativeSpeed = 80 - 80 = 0`
   - Машина стоит на месте (движется синхронно с полицейским)

4. `policeSpeed = 80`, `questCar.currentSpeed = 100`, `enemy=true`
   - `relativeSpeed = 100 - 80 = 20`
   - `positionX += 20 * deltaTime` (нарушитель уходит вправо от полицейского)

**Обновление спавна:**
- Скорость машины `currentSpeed` выбирается случайно в диапазоне `[minSpeed, maxSpeed]` при создании
- При спавне **не требуется** учитывать `policeSpeed` — относительность обеспечивается в `updatePosition()`

**Обновление wheelRotation:**
- Вращение колёс рассчитывается **абсолютно** (по `currentSpeed`), так как это визуальный эффект реальной скорости машины
- Не зависит от `policeSpeed`

---

### Паттерн инициализации

- **Без RootStore и Context DI**. Сторы создаются напрямую в компонентах:
  ```jsx
  // В Game.jsx:
  const [activeCarStore] = useState(() => new CarStore(Cars.cars[0]));
  const [activeMapStore] = useState(() => new MapStore(MapsStore.maps[0]));
  const [questCarStores, setQuestCarStores] = useState([]); // Для QuestCarStore
  ```
- Каждый экземпляр `CarStore` / `MapStore` / `QuestCarStore` инкапсулирует свой стейт. MobX-наблюдение (`observer`) применяется к компонентам, которые читают поля стора.
- Мутации внутри сторов происходят **исключительно через методы класса** (`pressGas()`, `releaseGas()`, `updatePhysics()`, `spawnQuestCar()`, `updateQuestCars()`).
- **Взаимодействие сторов**: `MapStore` управляет массивом `questCars` (экземпляры `QuestCarStore`), `Game.jsx` поддерживает `questCarStores` в синхронизации через `useState`.

### 🔹 Правила UI-компонентов для Quest Cars

| Компонент        | Зона ответственности                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `QuestCar.jsx`   | Отображение квестового автомобиля: `positionX`, `z-index=50` (ниже полицейского), направление движения (enemy=false справа, enemy=true слева), `CarModel`. |
| `SpeedDisplay.jsx` | Отображение текущей скорости (`currentSpeed`) в правом верхнем углу: белый цвет при `≤60`, красный + анимация (`scale 1.2`) при `>60`.              |

### Правила z-index для слоёв игры

| Слой                               | z-index | Описание                                                                 |
| ---------------------------------- | ------- | ------------------------------------------------------------------------ |
| Фон                               | 1       | Карта, дорога, объекты окружения.                                        |
| Квестовый автомобиль              | 50      | Машина из `Cars.otherCars` (ниже полицейского).                         |
| Полицейский автомобиль             | 100     | Машина игрока (выше квестового).                                        |
| UI-элементы (SpeedDisplay)        | 200     | Элементы интерфейса в правом верхнем углу.                              |
| Модальные окна (PoliceQuestModal) | 1000    | Модальные окна с повышенным z-index для перекрытия всего.               |

### MobX-контракт проекта

1. Все поля стора объявляются как публичные свойства класса — `makeAutoObservable(this)` в конструкторе автоматически делает их observable.
2. **Изменение стейта** — только через методы класса (`action`/`flow`). Прямая мутация `this.field = value` извне запрещена.
3. Пакетные обновления (например, в `updatePhysics`) обернуты в `runInAction(() => { ... })` для гарантии единого реактивного тика.
4. Компоненты, читающие observable-данные стора, должны быть обёрнуты в `observer` (из `mobx-react-lite` или `mobx-react`).

---

## 🔗 6. Интеграция между сторами

### 🔄 Отношения `MapStore` ↔ `QuestCarStore`

- `MapStore` управляет массивом `questCars`, где каждый элемент — экземпляр `QuestCarStore`.
- `QuestCarStore` содержит физику и данные одной квестовой машины (координаты, скорость, вращение колёс).
- `MapStore.spawnQuestCar()` выбирает случайную машину из `Cars.otherCars`, создаёт `new QuestCarStore(carData)` и добавляет в `questCars`.
- `MapStore.updateQuestCars(deltaTime)` вызывает `questCar.updatePosition(deltaTime)` и `questCar.updateWheelRotation(deltaTime)` для каждого элемента массива.
- `MapStore.removeQuestCarByIndex(index)` удаляет элемент из `questCars` (например, при аресте или уходе за экран).

### 🔄 Отношения `Game.jsx` ↔ `QuestCarStore`

- `Game.jsx` поддерживает состояние `questCarStores` через `useState(() => [])`.
- При спавне новой машины в `MapStore.spawnQuestCar()` вызывается `setQuestCarStores([...questCarStores, newQuestCarStore])`.
- При удалении машины в `MapStore.removeQuestCarByIndex()` вызывается `setQuestCarStores(filteredArray)`.
- `Game.jsx` передаёт `questCarStore` в `QuestCar.jsx` (обёрнутый в `observer`) для рендеринга.

### 🔄 Отношения `PoliceQuestModal.jsx` ↔ `QuestCarStore`

- `MapStore.questCarForArrest` хранит ссылку на квестовую машину, к которой подъехал полицейский.
- `Game.jsx` проверяет дистанцию между `questCar.positionX` и `mapStore.questCarPosition` в игровом цикле.
- Если дистанция `< 50px`, устанавливается `mapStore.questCarForArrest = questCar`.
- Кнопка "Арестовать" вызывает `mapStore.removeQuestCarByIndex()`, увеличивает `carStore.countHelp +1`, и сбрасывает `questCarForArrest`.

---

## 🛑 7. Жёсткие архитектурные ограничения (Запреты для ИИ)

1. **Запрещено создавать `useState` для данных, управляемых MobX**. Если состояние нужно читать в нескольких компонентах или оно меняется в игровом цикле — используй стор (`CarStore` / `MapStore` / `QuestCarStore`).
2. **Запрещено мутировать поля сторов напрямую** (`store.speed = 100`, `store.questCars.push()`). Только через методы класса (`store.pressGas()`, `store.spawnQuestCar()`, `store.updateQuestCars(dt)`).
3. **Запрещено импортировать компоненты из `components/` в `state/`**. Слой стейта — чистая логика без UI-зависимостей. `QuestCarStore.jsx` НЕ должен импортировать `QuestCar.jsx`.
4. **Запрещено использовать inline-стили или CSS-in-JS**. Проект использует Plain CSS-файлы (`style/`). Новые стили добавляй только в `quest_car.css`.
5. **Запрещено менять игровой цикл в `Game.jsx` на `setInterval`**. Только `requestAnimationFrame` с расчётом `deltaTime` через `performance.now()` — это гарантирует плавную физику на любых FPS.
6. **Запрещено добавлять новые npm-пакеты** без явного одобрения в `TECH_SPEC.md`. Текущий стек (React + MobX + Vite) должен покрывать все задачи.
7. **Запрещено удалять или переименовывать существующие сторы** (`CarStore`, `MapStore`, `QuestCarStore`) и их публичные методы без полной проверки зависимостей в компонентах.
8. **Запрещено использовать `console.log` в production-коде**. Допускается только `console.error` в блоках `catch`.

---

_Файл сгенерирован автоматически на основе анализа кодовой базы. Обновляй при изменении структуры проекта._
