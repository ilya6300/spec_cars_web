# TECH_SPEC.md: Исправление бага — Кнопка "Арестовать" не появляется после долгого отсутствия

## 📌 Описание бага

**CONCEPT.md:**
> Когда `enemy=true` машина уезжает за границу экрана на долго, и потом когда мы его догоняем, кнопка "Арестовать" перестаёт появляться, возможно где то или неправельны таимер или машина не уничтожается по истечению квеста где кончается 8 секунд

**Поведение:**
- `enemy=true` машина деактивируется **либо после ареста, либо если её не видно 8 секунд**
- После деактивации `active = false`
- `checkQuestCarDistance()` проверяет `if (questCar.enemy && questCar.active)` → пропускает неактивные машины → кнопка не появляется

---

## 📝 Список файлов для изменений

| Файл | Тип изменений | Описание |
|------|--------------|----------|
| `src/state/mapStore.jsx` | Изменение | Убрать проверку `questCar.active` в `checkQuestCarDistance()` |
| `src/state/mapStore.jsx` | Изменение | Сброс `questCarActive` в `updateQuestCars()`, когда нет активных машин |

---

## 🔧 Детальный план реализации

### Шаг 1: `MapStore.checkQuestCarDistance()` — убрать проверку `active`

**Текущий код (строки 397–421):**
```javascript
checkQuestCarDistance(questCarStores, viewportWidth, distance) {
  const policeScreenX = 30;
  const policeWidth = 250;
  const policeRightEdge = policeScreenX + policeWidth * 0.5;
  const maxDistance = policeRightEdge + 200;

  let closestQuestCar = null;

  for (const questCar of questCarStores) {
    if (questCar.enemy && questCar.active) {  // ← ПРОБЛЕМА: active
      try {
        const questCarScreenX = questCar.positionX - distance;
        if (questCarScreenX > policeRightEdge && questCarScreenX <= maxDistance) {
          if (!closestQuestCar || questCarScreenX < closestQuestCar.positionX - distance) {
            closestQuestCar = questCar;
          }
        }
      } catch (error) {
        console.error("Error checking quest car distance:", error);
      }
    }
  }

  this.questCarForArrest = closestQuestCar;
}
```

**Проблема:**
- `enemy=true` машина уехала за экран → `updateVisibility()` → `active = false`
- `checkQuestCarDistance()` пропускает машину из-за `&& questCar.active`
- Кнопка "Арестовать" не появляется

**Решение:** Убрать `&& questCar.active` — проверка только по `questCar.enemy`.

**Почему безопасно:**
- Когда машина на экране, `updateQuestCars()` → `updateVisibility()` → `active = true`
- `checkQuestCarDistance()` вызывается ПОСЛЕ `updateQuestCars()` → машина уже активна
- Когда машина не на экране, её координаты не попадут в радиус `[policeRightEdge, maxDistance]`

**Новый код:**
```javascript
checkQuestCarDistance(questCarStores, viewportWidth, distance) {
  const policeScreenX = 30;
  const policeWidth = 250;
  const policeRightEdge = policeScreenX + policeWidth * 0.5;
  const maxDistance = policeRightEdge + 200;

  let closestQuestCar = null;

  for (const questCar of questCarStores) {
    if (questCar.enemy) {  // Убрана проверка active
      try {
        const questCarScreenX = questCar.positionX - distance;
        if (questCarScreenX > policeRightEdge && questCarScreenX <= maxDistance) {
          if (!closestQuestCar || questCarScreenX < closestQuestCar.positionX - distance) {
            closestQuestCar = questCar;
          }
        }
      } catch (error) {
        console.error("Error checking quest car distance:", error);
      }
    }
  }

  this.questCarForArrest = closestQuestCar;
}
```

---

### Шаг 2: `MapStore.updateQuestCars()` — сброс `questCarActive`

**Проблема:**
- `enemy=true` машина деактивировалась (скрылась 8 сек) → `active = false`
- `questCarActive` остаётся `true` → новый спавн заблокирован
- Новая `enemy=true` машина не может заспавниться

**Текущий код (строки 351–379):**
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
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
        questCar.updateVisibility(deltaTime, viewportWidth, this.offsetX);
      }
    }

    this.questCars = this.questCars.filter((questCar) => {
      if (!questCar.active && !questCar.enemy) return false;
      return true;
    });
  });
}
```

**Изменение:** Добавить сброс `questCarActive`, когда нет активных машин.

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
        questCar.updatePosition(deltaTime, policeSpeed);
        questCar.updateWheelRotation(deltaTime);
        questCar.updateVisibility(deltaTime, viewportWidth, this.offsetX);
      }
    }

    this.questCars = this.questCars.filter((questCar) => {
      if (!questCar.active && !questCar.enemy) return false;
      return true;
    });

    // Сброс questCarActive, если нет активных машин
    const hasActiveCars = this.questCars.some((qc) => qc.active);
    if (!hasActiveCars && this.questCarActive) {
      this.questCarActive = false;
      this.questCarSpawnTimer = 3 + Math.random() * 5;
    }
  });
}
```

---

## 📋 Итоговый чек-лист изменений

| # | Файл | Изменение | Приоритет |
|---|------|-----------|-----------|
| 1 | `src/state/mapStore.jsx` | Убрать `&& questCar.active` в `checkQuestCarDistance()` | Критический |
| 2 | `src/state/mapStore.jsx` | Сброс `questCarActive` в `updateQuestCars()` | Высокий |

---

## 🧪 Тестирование

### Ручная проверка
1. Запустить игру
2. Включить зажигание, 2-3 передача, газ
3. Дождаться спавна `enemy=true` машины (красный гоночный автомобиль)
4. Уехать вправо, чтобы машина ушла за экран
5. Подождать 8+ секунд (машина деактивируется)
6. Поехать назад — машина появится на экране справа
7. Приблизиться к машине — кнопка "Арестовать" должна появиться

---

## 📦 Зависимости
Новые npm-пакеты **не требуются**.
