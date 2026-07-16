# TECH_SPEC.md (Техническое задание для Quest Cars Logic Update)

## 📋 Общее описание

Обновить логику квеста с другими автомобилями (Quest Cars) для реализации многократного спавна (каждые 3-8 сек) и корректных условий сброса квеста.

---

## 🎯 Цель

Исправить следующие проблемы в текущей реализации:
1. Quest Cars спавнится только один раз (не возобновляется через 3-8 сек после завершения)
2. Для `enemy=true`: квест сбрасывается при уходе машины за границу видимости (должен сбрасываться только при аресте)
3. Для `enemy=false`: нет таймера 5 секунд видимости перед сбросом квеста

---

## 🧠 Изменения в стейте

### 🔹 QuestCarStore (расширение контракта)

**Добавить поля:**
```javascript
lastVisibleTime: number | null  // Время последней видимости машины (для enemy=false)
```

**Добавить методы:**
```javascript
/**
 * Обновляет позицию и отслеживает время видимости
 * @param {number} deltaTime - Дельта времени в секундах
 * @param {number} policeSpeed - Скорость полицейского автомобиля
 * @param {number} viewportWidth - Ширина экрана
 * @returns {boolean} - true если машина осталась активной, false если её нужно удалить
 */
updateVisibility(deltaTime, policeSpeed, viewportWidth)
```

---

### 🔹 MapStore (расширение контракта)

**Изменить поля:**
```javascript
questCarSpawnTimer: number  // Теперь таймер сбрасывается при каждом завершении квеста (3-8 сек после сброса)
questCarActive: boolean     // Обновляется при сбросе квеста (false после всех условий сброса)
```

**Изменить методы:**

#### `spawnQuestCar()`
```javascript
// Добавить сброс таймера при успешном спавне
this.questCarSpawnTimer = 3 + Math.random() * 5;
```

#### `updateQuestCars(deltaTime)`
```javascript
// Обновить фильтрацию для учёта условий сброса
this.questCars = this.questCars.filter((questCar, index) => {
  if (!questCar.active) return false;
  
  // Обновление видимости
  const stillActive = questCar.updateVisibility(deltaTime, this.carStore.currentSpeed, viewportWidth);
  if (!stillActive) {
    // Если машина стала неактивной, проверить условия сброса квеста
    if (questCar.enemy) {
      // enemy=true: квест сбрасывается ТОЛЬКО при аресте, уход за экран не сбрасывает
      return true;
    } else {
      // enemy=false: уход за экран + 5 секунд = сброс квеста
      return true;
    }
  }
  
  return questCar.enemy 
    ? questCar.positionX < viewportWidth + 200 
    : questCar.positionX > -200;
});
```

#### `removeQuestCarByIndex(index)`
```javascript
// Добавить сброс флага questCarActive после удаления
runInAction(() => {
  if (index >= 0 && index < this.questCars.length) {
    this.questCars.splice(index, 1);
    // Сбросить questCarActive если массив стал пустым
    if (this.questCars.length === 0) {
      this.questCarActive = false;
    }
  }
});
```

---

## 🔗 Интеграция компонентов

### Game.jsx (изменения)

**В игровом цикле (requestAnimationFrame):**
```javascript
// После updateQuestCars проверить условия сброса
if (mapStore.questCars.length === 0 && mapStore.questCarActive) {
  mapStore.questCarActive = false;
}
```

---

## 📝 Изменения в instructions.md

### Обновить раздел "Квест 3: Квест с другими автомобилями"

#### 🛑 Критерии сброса квеста:

**Для `enemy=true` (нарушитель):**
- Квест сбрасывается **ТОЛЬКО** при аресте (кнопка "Арестовать")
- Уход за границу видимости **НЕ** сбрасывает квест
- Машина может вернуться на экран после ухода

**Для `enemy=false` (не нарушитель):**
- Квест сбрасывается при уходе за границу видимости на **5 секунд**
- Добавлен таймер `lastVisibleTime` для отслеживания времени скрытия
- Если машина возвращается на экран до истечения 5 сек — таймер сбрасывается

#### 📋 Список действий для QA:

- [ ] Quest Cars появляется каждые 3-8 секунд после завершения предыдущего квеста
- [ ] `enemy=true`: квест НЕ сбрасывается при уходе за экран (только при аресте)
- [ ] `enemy=false`: квест сбрасывается через 5 секунд после ухода за экран
- [ ] `questCarActive = false` после сброса квеста (массив questCars пуст)

---

## 🛠️ Последовательность реализации

### Фаза 3: Разработчик

**Шаг 1: Обновление QuestCarStore**
- Добавить поле `lastVisibleTime: number | null`
- Добавить метод `updateVisibility()`

**Шаг 2: Обновление MapStore**
- Изменить `spawnQuestCar()` для сброса таймера
- Изменить `updateQuestCars()` для проверки видимости
- Изменить `removeQuestCarByIndex()` для сброса `questCarActive`

**Шаг 3: Обновление Game.jsx**
- Добавить проверку сброса `questCarActive` после `updateQuestCars()`

**Шаг 4: Обновление instructions.md**
- Добавить новые правила сброса квеста
- Обновить чек-лист для QA

---

## 📊 Примеры поведения

### Сценарий 1: enemy=true, уход за экран
- Машину спавнили (enemy=true)
- Машина ушла за правую границу экрана
- **Ожидание**: квест НЕ сбрасывается, `questCarActive = true`
- Машина может вернуться на экран через несколько секунд

### Сценарий 2: enemy=false, уход за экран
- Машину спавнили (enemy=false)
- Машина ушла за левую границу экрана
- Запускается таймер `lastVisibleTime`
- Через 5 секунд таймер истекает
- **Ожидание**: квест сбрасывается, `questCarActive = false`

### Сценарий 3: Многократный спавн
- Квест завершился (машина арестована или ушла за экран + 5 сек)
- `questCarActive = false`
- Через 3-8 секунд таймер `questCarSpawnTimer` истекает
- **Ожидание**: новая машина спавнится, `questCarActive = true`

---

## ✅ Критерии готовности

- [ ] Quest Cars спавнится многократно (каждые 3-8 сек после завершения)
- [ ] Для `enemy=true`: квест сбрасывается только при аресте
- [ ] Для `enemy=false`: квест сбрасывается через 5 сек после ухода за экран
- [ ] `questCarActive` корректно обновляется при сбросе квеста
- [ ] `instructions.md` обновлён с новыми правилами
- [ ] Unit-тесты покрывают новые сценарии (таймер видимости, многократный спавн)

---

## 📚 Зависимости

- TODO.md: Задачи #1, #2, #3
- ARCHITECTURE.md: Правила MobX и структура сторов
- instructions.md: Обновление правил QA

---

## 🚫 Ограничения

- **Запрещено** менять игровой цикл в `Game.jsx` на `setInterval`
- **Запрещено** удалять существующие методы сторов без проверки зависимостей
- **Запрещено** использовать `console.log` (только `console.error` в catch)
- **Запрещено** добавлять новые npm-пакеты без одобрения в TECH_SPEC.md

---

_Файл сгенерирован автоматически Архитектором на основе CONCEPT.md и TODO.md._