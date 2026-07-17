# 📖 Инструкция по тестированию игры (для QA Q2 фазы)

## 🎮 Общее описание

Это инструкция по взаимодействию с игрой для автоматизированного тестирования через Playwright. Все правила, кнопки, квесты и последовательности действий, которые должен проверять QA-инспектор.

---

## 🎮 Управление

### 1. Зажигание (Key Icon)
- **Кнопка**: Ключ зажигания внизу экрана
- **Действие**: Клик по значку ключа
- **Результат**: Двигатель заведён/заглушён
- **Важно**: Без включённого зажигания машина не едет

### 2. МКПП (Механическая Коробка Передач)
- **Кнопки**: N, 1, 2, 3, 4
- **Действие**: Клик по кнопке передачи
- **Ограничения**:
- При N машина не должна двигаться
- **Передаточные отношения**: N=0, 1=4, 2=2, 3=1.33, 4=1

### 3.1. Полицейский автомобиль - колёса
- **Колёса полицейского автомобиля** должны крутиться с соответствующей скоростью в зависимости от текущей передачи и скорости движения

### 3. Газ (Pedal Icon)
- **Кнопка**: Педаль газа справа внизу
- **Действия**:
  - `mousedown`: нажать (разгон)
  - `mouseup`: отпустить (торможение)
  - `mouseleave`: отпустить (если курсор ушёл)
  - `touchstart`: нажать (мобильные)
  - `touchend`: отпустить (мобильные)
- **Результат**: Увеличение/уменьшение скорости с учётом топлива

### 4. Сирена (Siren Icon)
- **Кнопка**: Значок сирены внизу экрана
- **Действие**: Клик по значку сирены
- **Результат**: Сирена включается/выключается (аудио + визуальный эффект)
- **Использование**: В квестах полиции

---

## 🚦 Светофор и остановка

### Условия остановки:
- На экране есть светофор (`isTrafficLightOnScreen = true`)
- Цвет красный (`trafficLightColor === "red"`)

### Поведение полицейского автомобиля:
- **С сиреной**: может проезжать на красный
- **Без сирены**: останавливается на расстоянии `STOP_DISTANCE` (определяется в коде), не сразу как появился красный

### Поведение обычного автомобиля:
- Машина **принудительно останавливается** (`forceStop()`)
- Сброс `isGasPressed = false` (если сирена выключена)

### Квест пешеходного перехода:
- При остановке на красном светофоре **50% шанс** запуска квеста
- Выбирается случайный пешеход из `human1`...`human16`
- Если `pedestrianQuestTriggered = true` — квест НЕ запускается

---

## 🎯 Квесты

### Квест 1: Пешеходный переход (Pedestrian Crossing)

#### 📥 Запуск:
- Необходимо его пройти **3 раза**
- Остановка на красном светофоре (50% шанс)
- Создаётся `PedestrianCrossingModal`
- `mapStore.isPedestrianCrossingQuestActive = true`
- `mapStore.pedestrianCrossingTargetObject = { uid, typeId }`
- `mapStore.pedestrianCarPosition = -150`
- `mapStore.pedestrianState = "waiting"`
- `carStore.pedestrianQuestTriggered = true`

#### 🎭 Сценарий (1-3 секунды):
1. В модалке появляется изображение пешехода
2. Через `1-3 сек` (`setTimeout`) пешеход начинает ходить (`walking`)

#### 🏃 Анимация ходьбы:
- Класс `.quest-pedestrian` двигается сверху вниз
- `pedestrianY` увеличивается на `40px * deltaTime`
- Цель: дойти до `Y = 300px`, после чего `finishPedestrianCrossingQuest()`

#### ⏸️ Остановка:
- Клик по пешеходу во время анимации (`walking`)
- Меняется состояние на `stopped`
- Включается сирена (`toggleSirena()`)

#### 🎯 Модальное окно (важно):
- Модальное окно **не просвечивает**
- Автомобиль присутствует, кнопка скрыта
- Human имеет изначальную позицию (не там где его поймали)

#### 🔁 При повторном запуске:
- Human должен начинать с изначальных координат, а не там где его поймали (кликнули)

#### ✅ Финал:
- Машина подъезжает к human и после остановки появляется лишь одна кнопка "Выписать штраф"
- Клик по любой кнопке → `countHelp +1`, `finishPedestrianCrossingQuest()`

#### 📋 Список действий для QA:
- [ ] Если открылась модальное окно
- [ ] Через 1-3 секунды пешеход начинает ходить
- [ ] Клик по пешеходу останавливает анимацию
- [ ] Машина двигается к пешеходу и останавливается
- [ ] После остановки появляется кнопка "Выписать штраф" (одна кнопка)
- [ ] Клик по "Выписать штраф" → `countHelp +1`, модалка закрывается
- [ ] При повторном запуске human начинается с изначальных координат

---

### Квест 2: Полицейский квест (Police Quest)

#### 📥 Запуск:
- Клик по агрессивному пешеходу (`human_aggr1`, `human_aggr2`, `human_aggr3`)
- `mapStore.startQuest(targetObj)`
  - `isPoliceQuestActive = true`
  - `questTargetObject = targetObj`
  - `questCarPosition = -150`
- `carStore.toggleSirena()` (сирена включается, даже если была выключена)

#### 🚗 Анимация машины:
- Полицейский автомобиль подъезжает из левой части экрана в правую
- Двигается вправо со скоростью `300px/сек`
- Целевая позиция: `modalWidth - targetWidth - carWidth - gap`
- При достижении позиции анимация останавливается
- **Колёса полицейского автомобиля должны крутиться с соответствующей скоростью**

#### ✅ Финал:
- Модальное окно убирается
- Счётчик помощи прибавляется
- Human по которому кликнули убирается с карты
- Появляется кнопка **"Арестовать"**
- Клик → `countHelp +1`, `finishQuest()`
  - `isPoliceQuestActive = false`
  - `questTargetObject = null`
  - `questCarPosition = -150`

#### 📋 Список действий для QA:
- [ ] Клик по `human_aggr*` → открывается модалка, сирена включается (если была выключена)
- [ ] Машина двигается из левой части экрана в правую (от `-150` до целевой позиции)
- [ ] При остановке появляется кнопка "Арестовать"
- [ ] При нажатии "Арестовать": модалка убирается, `countHelp +1`, human исчезает с карты

---

### Квест 3: Квест с другими автомобилями (Quest Cars)

#### 📥 Запуск:
- Машины спавнятся **автоматически каждые 5-15 секунд**, независимо от других квестов
- Может быть **несколько машин одновременно** на экране
- Проверка: `!isPedestrianCrossingQuestActive && !questCarActive && !isPoliceQuestActive` — убрана. Машины спавнятся в любом состоянии.
- **Условия запуска**:
  - Нет ограничений по передаче (спавн при любой передаче)
  - Нет ограничений по количеству машин
  - Нет проверки `questCarActive`

#### 🚗 Движение машин (важно):
- Движение рассчитывается **относительно скорости полицейского автомобиля**
- `relativeSpeed = questCar.currentSpeed - policeSpeed`

- **`enemy=false` (не нарушитель):**
  - Спавн справа (`positionX = viewportWidth + 200`)
  - Движение **влево** (отрицательное направление)
  - `positionX -= relativeSpeed * deltaTime`
  - Если `questCar.currentSpeed > policeSpeed`: машина уходит влево (от полицейского)
  - Если `questCar.currentSpeed < policeSpeed`: машина движется вправо (полицейский её догоняет)
  - Если `questCar.currentSpeed === policeSpeed`: машина стоит на месте

- **`enemy=true` (нарушитель):**
  - Спавн слева (`positionX = -200`)
  - Движение **вправо** (положительное направление)
  - `positionX += relativeSpeed * deltaTime`
  - Если `questCar.currentSpeed > policeSpeed`: машина уходит вправо (от полицейского)
  - Если `questCar.currentSpeed < policeSpeed`: машина движется влево (полицейский её догоняет)
  - Если `questCar.currentSpeed === policeSpeed`: машина стоит на месте

#### 🚗 Параметры машины:
- Выбирается случайно из `Cars.otherCars`
- Поле `enemy`:
  - `enemy = true`: нарушитель. Активируется квест с нарушителем при приближении полиции и включается сирена
  - `enemy = false`: не нарушитель. Движение рассчитывается относительно скорости полицейского автомобиля
- **Движение (важно)**:
  - Движение всегда рассчитывается **относительно скорости полицейского автомобиля**
  - Если у полицейского скорость 80, а у авто из otherCars 60, то он смещается вправо как будто его скорость 20 км/ч
  - Если полицейский авто останавливается, авто из otherCars уходит вправо со своей скоростью (пример: 60)
  - Скорость должна варьироваться плавно между `minSpeed` и `maxSpeed` (не мгновенно, с плавным переходом)
- **Светофор**:
  - Полицейский автомобиль может проезжать на красный с включенной сиреной
  - Полицейский автомобиль без включенной сирены должен остановиться перед светофором на указанном в коде расстоянии, не сразу как появился светофор красного цвета

#### 🚗 Новая логика (важное отличие):
- **Машины НЕ удаляются** при уходе за экран
- Машины могут уходить за экран и возвращаться обратно при изменении относительной скорости
- Единственный способ удалить машину — **арест** (кнопка "Арестовать" для `enemy=true`)
- Все машины остаются в массиве `questCars` и продолжают обновлять позиции

#### 📊 SpeedDisplay:
- В правом верхнем углу (`fixed position: top=20px, right=20px`)
- Показывает `questCar.currentSpeed` первой машины в массиве
- Если `currentSpeed > 60`: красный цвет + анимация `scale(1.2)`
- Если `currentSpeed <= 60`: белый цвет
- **Счётчик пройденной дистанции** не должен увеличиваться, если автомобиль не двигается

#### 🛑 Кнопка "Арестовать" (для нарушителя `enemy = true`):
- Появляется, если дистанция между `questCar` и полицейской машиной `< 50px`
- Проверка в `mapStore.checkQuestCarDistance()`
- При аресте:
  - `countHelp +1`
  - `questCar.deactivate()` (`active = false`)
  - `removeQuestCarByIndex(index)`
  - `questCarForArrest = null`

#### 🛑 Критерии завершения квеста (новая логика):

**Для `enemy=true` (нарушитель):**
- Квест завершается **ТОЛЬКО** при аресте (кнопка "Арестовать")
- Уход за границу видимости **НЕ** удаляет машину
- Машина может вернуться на экран после ухода

**Для `enemy=false` (не нарушитель):**
- Машина **НЕ удаляется** при уходе за экран
- Машина остаётся в массиве `questCars` и может вернуться на экран
- Единственный способ убрать машину с экрана — изменить относительную скорость

#### 📝 Для не нарушителя (`enemy = false`):
- Появляется справа (`positionX = viewportWidth + 200`) и едет со своей скоростью
- Движение рассчитывается относительно скорости полицейского автомобиля
- Не удаляется при уходе за экран

#### 📋 Список действий для QA:
- [ ] Quest Cars спавнятся каждые 5-15 секунд (множественные машины)
- [ ] Спавн происходит при любой передаче (нет ограничения)
- [ ] `enemy=false`: машина спавнится справа, движется относительно полицейского
- [ ] `enemy=true`: машина спавнится слева, движется относительно полицейского
- [ ] При `questCar.currentSpeed > policeSpeed` и `enemy=false`: машина уходит влево
- [ ] При `questCar.currentSpeed < policeSpeed` и `enemy=false`: машина движется вправо (полицейский догоняет)
- [ ] При `questCar.currentSpeed === policeSpeed`: машина стоит на месте
- [ ] SpeedDisplay показывает скорость первой машины
- [ ] При `currentSpeed > 60`: красный цвет + анимация
- [ ] Кнопка "Арестовать" появляется при дистанции `< 50px` для `enemy=true`
- [ ] При аресте `countHelp +1`, машина исчезает
- [ ] Машины НЕ удаляются при уходе за экран (возвращаются при изменении относительной скорости)
- [ ] Несколько машин могут быть на экране одновременно

---

## 🧹 Дополнительные взаимодействия

### Заправка (Gas Station):
- Клик по `gas_station` → `refuelCar(10)` (однократная заправка 10л)
- Зажатие (`onLongPress`) → `startRefueling()` (непрерывная заправка 200л/сек)
- Отпускание → `stopRefueling()`

### Здания:
- Клик по `building` → без действия (просто объект декора)

---

## 📊 Проверки для Playwright e2e

### Файл: `tests/e2e/pedestrian-quest.spec.js`
```javascript
test('Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button -> countHelp increases', async ({ page }) => {
  // 1. Клик по пешеходу при красном свете
  // 2. Ждать появления модалки
  // 3. Ждать 1-3 секунды (пешеход начинает ходить)
  // 4. Клик по пешеходу (остановка анимации)
  // 5. Ждать прибытия машины
  // 6. Проверить появление кнопки "Выписать штраф"
  // 7. Клик по кнопке
  // 8. Проверить countHelp +1
});
```

### Файл: `tests/e2e/police-quest.spec.js`
```javascript
test('Police quest: click aggro human, arrest, countHelp increases', async ({ page }) => {
  // 1. Клик по human_aggr*
  // 2. Ждать появления модалки
  // 3. Ждать прибытия машины
  // 4. Клик по кнопке "Арестовать"
  // 5. Проверить countHelp +1
});
```

### Файл: `tests/e2e/quest-cars.spec.js` (новый файл)
```javascript
test('Quest Car movement: enemy=false (right to left)', async ({ page }) => {
  // Проверить, что машина спавнится справа и движется влево
});

test('Quest Car movement: enemy=true (left to right)', async ({ page }) => {
  // Проверить, что машина спавнится слева и движется вправо
});

test('SpeedDisplay: critical speed > 60', async ({ page }) => {
  // Проверить анимацию скорости при превышении 60 km/h
});

test('Quest Car relative movement: police speed 80, other car 60', async ({ page }) => {
  // Проверить, что машина смещается вправо как будто её скорость 20 км/ч
});

test('Quest Car movement when police stops', async ({ page }) => {
  // Проверить, что машина уходит вправо со своей скоростью
});

test('Quest Cars non-intersection: only one active at a time', async ({ page }) => {
  // Проверить, что при активном квесте второй не запускается
});
```

---

## 🎨 Визуальные проверки (QA)

### Z-Index слоёв:
- **Фон**: `z-index = 1` (карта, объекты)
- **QuestCar**: `z-index = 50` (ниже полицейского)
- **Полицейский автомобиль**: `z-index = 100` (выше questCar)
- **UI (SpeedDisplay)**: `z-index = 200` (в правом верхнем углу)
- **Модальные окна**: `z-index = 1000` (перекрывают всё)

### Позиционирование:
- **Модалка пешехода**: `top: 50%` (по центру)
- **Модалка полиции**: `justify-content: flex-end` (справа)
- **QuestCar в модалке полиции**: `bottom: 40%`
- **QuestCar в модалке пешехода**: `bottom: 45%`
- **SpeedDisplay**: `position: fixed`, `top: 20px`, `right: 20px`

---

## 📌 Ключевые условия запуска квестов

| Квест | Условие запуска | Флаг |
|-------|----------------|------|
| Пешеходный переход | Красный светофор + 50% шанс | `pedestrianQuestTriggered = true` |
| Полицейский квест | Клик по `human_aggr*` | `isPoliceQuestActive = true` |
| Quest Cars | Пока нет других квестов + скорость на 2/3 передаче | `questCarActive = false` |

---

## 📊 Обновленные правила для Quest Cars

### Критерии выбора машины:
- Машина всегда выбирается рандомно из списка `otherCars`
- Скорость должна варьироваться от `minSpeed` до `maxSpeed` (плавно, не мгновенно)

---

## 📊 Относительное движение (формулы для QA)

### Формула относительной скорости:
```javascript
relativeSpeed = questCar.currentSpeed - policeSpeed
```

### Примеры расчётов:

| policeSpeed | questCar.currentSpeed | enemy | relativeSpeed | Движение (направление) |
|-------------|-----------------------|-------|---------------|------------------------|
| 80          | 60                    | false | -20           | Вправо (+20*dx)        |
| 80          | 60                    | true  | -20           | Влево (-20*dx)         |
| 0           | 60                    | false | 60            | Влево (-60*dx)         |
| 80          | 80                    | false | 0             | Стоит                  |
| 100         | 120                   | true  | 20            | Вправо (+20*dx)        |

### Сценарии проверки через Playwright:

#### Сценарий 1: Полицейский 80, машина 60, enemy=false
- Условие: `policeSpeed = 80`, `questCar.currentSpeed = 60`
- Ожидание: `relativeSpeed = -20`, машина движется вправо (полицейский догоняет)
- Проверка: `questCar.positionX` увеличивается со временем

#### Сценарий 2: Полицейский остановился, машина 60, enemy=false
- Условие: `policeSpeed = 0`, `questCar.currentSpeed = 60`
- Ожидание: `relativeSpeed = 60`, машина движется влево со своей скоростью
- Проверка: `questCar.positionX` уменьшается со временем

#### Сценарий 3: Одновременный спавн двух машин
- Условие: одна машина уже на карте (`questCars.length > 0`)
- Ожидание: вторая машина НЕ спавнится
- Проверка: длина массива `questCars` не превышает 1

#### Сценарий 4: Спавн при 1-й или 4-й передаче
- Условие: `carStore.gear = "1"` или `carStore.gear = "4"`
- Ожидание: машина НЕ спавнится
- Проверка: длина массива `questCars` остаётся 0

#### Сценарий 5: Спавн при 2-3 передаче
- Условие: `carStore.gear = "2"` или `carStore.gear = "3"`
- Ожидание: машина спавнится
- Проверка: длина массива `questCars` становится 1

#### Сценарий 6: Относительная скорость для enemy=true
- Условие: `policeSpeed = 80`, `questCar.currentSpeed = 100`, `enemy=true`
- Ожидание: `relativeSpeed = 20`, машина движется вправо (от полицейского)
- Проверка: `questCar.positionX` увеличивается со временем

#### Сценарий 7: Нулевая относительная скорость
- Условие: `policeSpeed = 80`, `questCar.currentSpeed = 80`
- Ожидание: `relativeSpeed = 0`, машина стоит на месте
- Проверка: `questCar.positionX` не меняется

#### Сценарий 8: Движение полицейского в обратном направлении (полицейский 60, машина 80)
- Условие: `policeSpeed = 60`, `questCar.currentSpeed = 80`, `enemy=false`
- Ожидание: `relativeSpeed = 20`, машина уходит влево (от полицейского)
- Проверка: `questCar.positionX` уменьшается со временем

---

## 🚫 Запреты для QA при тестировании

1. **Не тестировать логику сторов** — это unit-тесты (`unit-tests/`)
2. **Не тестировать математику координат** — это unit-тесты
3. **Только UI-поведение и визуальные сценарии**
4. **Проверять только то, что видит пользователь** (кнопки, анимации, модалки)

---

## 🎮 Инициализация игры в Playwright e2e-тестах

Все e2e-тесты должны включать **инициализацию игры** перед выполнением сценария:

```javascript
test('Example quest test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });

  await page.waitForTimeout(2000);

  // Инициализация игры:
  // 1. Включить зажигание
  await page.click('.ignition-btn');
  
  // 2. Переключить на 1-ю передачу (или 2-ю/3-ю для квеста с машинами)
  await page.click('.gear-1');
  
  // 3. Нажать педаль газа (зажать)
  await page.mouse.down();
  
  // 4. Подождать, пока машина наберет скорость
  await page.waitForTimeout(1000);

  // Теперь можно выполнять сценарий квеста
  // ...
});
```

### 🚦 Светофор и остановка

Для тестов, требующих остановки на светофоре:

```javascript
// После инициализации игры подождать, пока светофор появится
await page.waitForTimeout(5000);

// Проверить наличие светофора
const trafficLight = await page.$('[data-type="traffic_light"]');
expect(trafficLight).toBeTruthy();

// Проверить цвет (красный/зеленый)
const isRed = await page.$eval('.game-object', (el) => 
  el.style.backgroundImage.includes('traffic_light_red')
);
```

### 🚦 Квест пешеходного перехода

Полный сценарий:

```javascript
test('Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });
  
  await page.waitForTimeout(2000);
  
  await page.click('.ignition-btn');
  await page.click('.gear-1');
  await page.mouse.down();
  await page.waitForTimeout(1000);
  
  await page.waitForTimeout(5000);
  
  const trafficLight = await page.$('[data-type="traffic_light"]');
  expect(trafficLight).toBeTruthy();
  
  await page.click('[data-type="human1"]');
  await page.waitForSelector('.pedestrian-crossing-modal', { state: 'visible' });
  
  await page.click('.quest-pedestrian');
  
  await page.waitForSelector('.quest-car', { state: 'visible' });
  
  await page.waitForSelector('.fine-button', { state: 'visible' });
  
  await page.click('.fine-button');
  await page.waitForSelector('.pedestrian-crossing-modal', { state: 'hidden' });
});
```

### 🚓 Квест полиции (агрессивный пешеход)

```javascript
test('Police quest: click aggro human, arrest, countHelp increases', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });
  
  await page.waitForTimeout(2000);
  
  await page.click('.ignition-btn');
  await page.click('.gear-1');
  await page.mouse.down();
  await page.waitForTimeout(1000);
  
  await page.click('[data-type="human_aggr1"]');
  await page.waitForSelector('.police-quest-modal', { state: 'visible' });
  
  await page.click('.arrest-button');
  await page.waitForSelector('.police-quest-modal', { state: 'hidden' });
});
```

### 🚗 Квест с другими автомобилями (Quest Cars)

```javascript
test('Quest Car movement: enemy=false (civilian, relative to police)', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });
  
  await page.waitForTimeout(2000);
  
  await page.click('.ignition-btn');
  await page.click('.gear-2'); // или 'gear-3' для спавна questCar
  await page.mouse.down();
  await page.waitForTimeout(1000);
  
  await page.waitForTimeout(5000);
  
  const trafficLight = await page.$('[data-type="traffic_light"]');
  expect(trafficLight).toBeTruthy();
  
  const questCar = await page.$('[data-type="car"]');
  expect(questCar).toBeTruthy();
  
  const initialX = await page.$eval('[data-type="car"]', (el) => 
    parseInt(el.style.left) || 0
  );
  
  await page.waitForTimeout(3000);
  
  const finalX = await page.$eval('[data-type="car"]', (el) => 
    parseInt(el.style.left) || 0
  );
  
  // Проверить движение относительно полицейского
  // Для enemy=false при questCarSpeed > policeSpeed: positionX уменьшается
  expect(finalX).toBeLessThan(initialX);
});
```

### 📊 Проверка SpeedDisplay

```javascript
test('SpeedDisplay: critical speed > 60', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.game-viewport', { timeout: 10000 });
  
  await page.waitForTimeout(2000);
  
  await page.click('.ignition-btn');
  await page.click('.gear-1');
  await page.mouse.down();
  await page.waitForTimeout(1000);
  
  const speedDisplay = await page.$('.speed-display');
  expect(speedDisplay).toBeTruthy();
  
  const isCritical = await page.$eval('.speed-display', (el) => 
    el.classList.contains('critical')
  );
  
  expect(isCritical).toBe(false);
  
  await page.waitForTimeout(5000);
  
  // Проверить, что скорость достигла > 60 km/h
  const speedText = await page.$eval('.speed-display', (el) => 
    el.textContent
  );
  const speedValue = parseInt(speedText);
  expect(speedValue).toBeGreaterThan(60);
  
  const isCriticalAfter = await page.$eval('.speed-display', (el) => 
    el.classList.contains('critical')
  );
  expect(isCriticalAfter).toBe(true);
});
```

---

*Файл обновляется Архитектором при добавлении нового функционала*
