## Техническая спецификация: Редизайн UI спидометра

**Зависимые задачи из `.ai/tasks.md`:** #1 — #10
**Новые npm-пакеты:** Нет. Все изменения — Pure CSS + JSX в существующих компонентах.

---

### Этап 1: Шрифты (задача #1)

**Файлы:** `index.html`

**Действия:**
1. Добавить `<link>` в `<head>` файла `index.html` для Google Fonts:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;700&display=swap" rel="stylesheet">
   ```
2. `font-display: swap` уже включён через параметр `display=swap` в URL.

**DoD:** Шрифты загружаются, нет ошибок в консоли.

---

### Этап 2: Редизайн Car.jsx (задачи #2, #3, #4, #5, #6, #7, #8)

**Файл:** `src/components/car/Car.jsx`

**Изменения в секции `<style>`:**

#### 2.1. Контейнер `.header_interface` (задачи #2, #10)
Заменить текущие стили:
```css
.header_interface {
  display: flex;
  align-items: center;
  gap: 30px;
  background: rgba(18,18,18,.72);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  padding: 20px 30px;
  box-shadow: 0 12px 30px rgba(0,0,0,.55);
  color: #ffffff;
}
```

#### 2.2. Текстовая статистика `.text-stats` (задача #10)
Добавить:
```css
.text-stats p {
  margin: 4px 0;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  color: #cccccc;
}
```

#### 2.3. Спидометр `.speedometer-container` (задача #2)
Увеличить размеры (сохранить текущие пропорции):
```css
.speedometer-container {
  position: relative;
  width: 120px;
  height: 60px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
```

#### 2.4. Полусфера `.speedometer-gauge` (задача #2)
Заменить:
```css
.speedometer-gauge {
  position: absolute;
  bottom: 0;
  width: 120px;
  height: 60px;
  border: 1px solid rgba(255,255,255,.12);
  border-bottom: none;
  border-top-left-radius: 75px;
  border-top-right-radius: 75px;
  background: linear-gradient(180deg, rgba(35,35,35,.95), rgba(10,10,10,.98));
  box-shadow:
    0 0 25px rgba(0,0,0,.6),
    inset 0 2px 8px rgba(255,255,255,.08),
    inset 0 -10px 20px rgba(0,0,0,.7);
}
```

#### 2.5. Стрелка `.speedometer-arrow` (задачи #3, #11)
Заменить:
```css
.speedometer-arrow {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4px;
  height: 55px;
  background: linear-gradient(90deg, #d8d8d8, #ffffff, #bcbcbc);
  border-radius: 4px;
  transform-origin: bottom center;
  transition: transform 0.22s cubic-bezier(.2,.9,.1,1);
  z-index: 4;
  box-shadow: 0 0 10px rgba(255,60,60,.6);
}

/* Красный наконечник */
.speedometer-arrow::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #ff3a3a;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255,60,60,.8);
}
```

#### 2.6. Центр `.speedometer-center` (задача #4)
Заменить:
```css
.speedometer-center {
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 14px;
  height: 14px;
  background: radial-gradient(circle, #ffffff 0%, #d9d9d9 35%, #555 70%, #222 100%);
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 6;
  box-shadow: 0 0 12px rgba(255,255,255,.15);
}
```

#### 2.7. Деления `.gauge-tick-line` (задача #5)
Заменить `display: none` на:
```css
.gauge-tick-line {
  position: absolute;
  top: 0;
  left: -1px;
  width: 2px;
  height: 14px;
  background: #ffffff;
}

/* Короткие деления (каждые 10 км/ч, не кратные 20) */
.gauge-tick-line--short {
  height: 8px;
  width: 1px;
  left: -0.5px;
}

/* Красная зона (120, 130, 140) */
.gauge-tick-line--red {
  background: #ff3a3a;
}
```

#### 2.8. Цифры шкалы `.gauge-label-text` (задачи #6, #8)
Заменить:
```css
.gauge-label-text {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Orbitron', sans-serif;
}
```

#### 2.9. Цифровой дисплей `.speedometer-digital-display` (задачи #7, #8)
Заменить:
```css
.speedometer-digital-display {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  color: #ffffff;
  z-index: 5;
  text-align: center;
  pointer-events: none;
}

.speed-value {
  font-size: 32px;
  letter-spacing: 2px;
  display: block;
  line-height: 1;
}

.speed-unit {
  font-size: 10px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  margin-top: 2px;
  color: #aaaaaa;
}
```

**Изменения в JSX:**

#### 2.10. JSX: Деления (задача #5)
Заменить массив `speedTicks` с `0,20,40...` на:
```js
const speedTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
```

В рендере делений добавить условные классы:
```jsx
<div
  className={`gauge-tick-line ${tickValue % 20 === 0 ? '' : 'gauge-tick-line--short'} ${tickValue >= 120 ? 'gauge-tick-line--red' : ''}`}
/>
```

#### 2.11. JSX: Цифровой дисплей (задача #7)
Заменить структуру:
```jsx
<div className="speedometer-digital-display" style={{ color: speedColor }}>
  <span className="speed-value">{displaySpeed}</span>
  <span className="speed-unit">KM/H</span>
</div>
```

#### 2.12. JSX: Цветовая индикация (задача #8)
Добавить computed-переменную перед return:
```js
const speedColor = displaySpeed <= 80
  ? '#ffffff'
  : displaySpeed <= 120
    ? '#ffb400'
    : '#ff3a3a';
```

Применить `speedColor` к:
- `.speedometer-digital-display` (inline style `color`)
- `.gauge-label-text` (inline style `color`)
- `.gauge-tick-line` (inline style `color`)

#### 2.13. JSX: Цифры шкалы — цвет (задача #8)
В рендере `.gauge-label-text` добавить inline style:
```jsx
className="gauge-label-text"
style={{ color: speedColor }}
```

#### 2.14. JSX: Деления — цвет (задача #8)
В рендере `.gauge-tick-line` добавить inline style:
```jsx
className={`gauge-tick-line ${...}`}
style={{ color: speedColor }}
```

---

### Этап 3: Редизайн Bensin.jsx (задача #9)

**Файл:** `src/components/car/Bensin.jsx`

**Новая структура компонента:**
```jsx
export const Bensin = observer(({ carStore }) => {
  const fuelPercent = Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100);
  
  const fuelColor = fuelPercent > 20
    ? '#4ade80'
    : fuelPercent > 10
      ? '#f59e0b'
      : fuelPercent > 5
        ? '#ef4444'
        : '#ef4444';
  
  const isCritical = fuelPercent <= 5;

  return (
    <div className="bensin-container">
      <div
        className={`canister ${isCritical ? 'canister--critical' : ''}`}
        style={{ '--fuel-percent': fuelPercent, '--fuel-color': fuelColor }}
      >
        <div className="fuel-fill" />
        <div className="canister-glare" />
        <div className="canister-shadow" />
        <span className="fuel-text">
          {Math.floor(carStore.fuel / 1000)}л
        </span>
      </div>
    </div>
  );
});
```

**Новые CSS-классы** (добавить в `<style>` в Car.jsx или в отдельный файл `style/bensin.css`):

```css
.bensin-container {
  display: flex;
  align-items: center;
}

.canister {
  position: relative;
  width: 36px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,.15);
  background: rgba(30,30,30,.6);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fuel-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(var(--fuel-percent) * 1%);
  background: linear-gradient(to top, var(--fuel-color), color-mix(in srgb, var(--fuel-color) 70%, white));
  transition: height 0.3s ease;
}

.canister-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255,255,255,.12), transparent);
  pointer-events: none;
  z-index: 2;
}

.canister-shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,.3), transparent);
  pointer-events: none;
  z-index: 2;
}

.fuel-text {
  position: relative;
  z-index: 3;
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0,0,0,.8);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(239,68,68,.4); }
  50% { box-shadow: 0 0 20px rgba(239,68,68,.8); }
}

.canister--critical {
  animation: pulse 1s infinite;
}
```

---

### Этап 4: Финальная интеграция

**Файл:** `src/components/car/Car.jsx`

**Порядок изменений в файле:**
1. Добавить `<link>` для шрифтов в `index.html`
2. Обновить секцию `<style>` в Car.jsx (все CSS-замены из Этапа 2)
3. Обновить JSX структуру спидометра (деления, цифровой дисплей, цветовая индикация)
4. Добавить computed `speedColor`
5. Обновить компонент `Bensin` (Этап 3)
6. Обновить `.text-stats` стили

**Зависимости между этапами:**
- Этап 1 → обязателен перед Этапом 2 (шрифты нужны для стилей)
- Этап 2 → обязателен перед Этапом 4
- Этап 3 → может выполняться параллельно с Этапом 2
- Этап 4 → финальная проверка всех изменений

---

### Чек-лист QA (подготовка к Фазе 4)

- [ ] Шрифты Orbitron и Rajdhani загружаются
- [ ] Спидометр тёмный с эффектом стекла
- [ ] Стрелка металлическая с красным наконечником
- [ ] Стрелка плавно двигается (0.22s cubic-bezier)
- [ ] Центр — металлическая шайба
- [ ] Деления отображаются (длинные/короткие)
- [ ] Красная зона 120-140
- [ ] Цифры шрифтом Orbitron
- [ ] Цифровой дисплей крупный с KM/H
- [ ] Цветовая индикация скорости работает (белый/жёлтый/красный)
- [ ] Канистра топлива стеклянная с плавным заполнением
- [ ] Канистра пульсирует при < 5%
- [ ] Контейнер тёмный с backdrop-filter
- [ ] Нет console.log в коде
- [ ] Нет неиспользуемых импортов
- [ ] observer используется корректно
- [ ] CSS-классы в JSX соответствуют CSS
