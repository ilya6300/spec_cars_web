# TECH_SPEC.md: Квест «Блокировка» (QuestArrestModal)

## 📋 Ссылки

- **CONCEPT.md**: Квест «Блокировка» — модальное окно с CSS-анимацией обгона полицейской машиной.
- **@TODO.md**: #1–#8

## 🎯 Цель

Реализовать новый этап квеста поимки машины-нарушителя: после нажатия кнопки «Блокировать» появляется модалка с CSS-анимацией обгона, по завершении которой игрок нажимает «Арестовать» для завершения квеста.

---

## 📝 Список изменений

### Файл: `src/state/mapStore.jsx`

#### Изменение 1: Observable-поля (строка ~79, после `questCarForArrest`)

**Добавить:**

```javascript
// Quest Arrest modal state
isQuestArrestActive = false;
arrestAnimFinished = false;
```

**Обоснование:** Флаг для условного рендеринга модалки в Game.jsx и флаг для показа финальной кнопки в модалке.

---

#### Изменение 2: Методы `startQuestArrest()` и `finishQuestArrest()` (после `checkQuestCarDistance`, ~строка 381)

**Добавить:**

```javascript
startQuestArrest() {
  runInAction(() => {
    this.isQuestArrestActive = true;
    this.arrestAnimFinished = false;
  });
}

finishQuestArrest() {
  runInAction(() => {
    this.isQuestArrestActive = false;
    this.arrestAnimFinished = false;
  });
}
```

**Обоснование:** Управление жизненным циклом модалки блокировки.

---

### Файл: `src/components/game/Game.jsx`

#### Изменение 3: Импорт компонента и стилей (в начало файла)

**Добавить:**

```jsx
import { QuestArrestModal } from "./QuestArrestModal";
import "../../style/quest_arrest.css";
```

#### Изменение 4: Переименование кнопки и изменение логики

**Было:**

```jsx
<button className="arrest-button-quest-car-map">Арестовать</button>
```

**Стало:**

```jsx
<button
  className="arrest-button-quest-car-map"
  onClick={() => {
    if (mapStore.questCarForArrest) {
      const index = mapStore.questCars.indexOf(mapStore.questCarForArrest);
      carStore.toggleSirena();
      mapStore.startQuestArrest();
      mapStore.removeQuestCarByIndex(index);
      mapStore.questCarForArrest = null;
    }
  }}
>
  Блокировать
</button>
```

**Обоснование:** При нажатии включаем сирену, запускаем модалку, удаляем машину из массива, сбрасываем ссылку.

#### Изменение 5: Conditional рендеринг модалки

**Добавить в JSX (после рендера кнопок управления, перед закрывающим тегом):**

```jsx
{
  mapStore.isQuestArrestActive && (
    <QuestArrestModal mapStore={mapStore} carStore={carStore} />
  );
}
```

---

### Файл: `src/components/game/QuestArrestModal.jsx` (НОВЫЙ)

#### Структура компонента

```jsx
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { CarModel } from "../car/CarModel";
import arrestBgImage from "../../assets/quest_location/police_arrest_modal.png";
import QuestCarStore from "../../state/questCarStore";

export const QuestArrestModal = observer(({ mapStore, carStore }) => {
  const [policeCarStore] = useState(() => {
    const store = new carStore.constructor(carStore._carData || carStore);
    return store;
  });

  const targetCarData = mapStore.questCarForArrest;
  const [targetCarStore] = useState(() => {
    if (targetCarData) {
      return new QuestCarStore(targetCarData);
    }
    return null;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      mapStore.arrestAnimFinished = true;
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleArrest = () => {
    carStore.countHelp += 1;
    carStore.toggleSirena();
    mapStore.finishQuestArrest();
  };

  return (
    <div className="quest-arrest-modal">
      <div
        className="quest-arrest-background"
        style={{ backgroundImage: `url(${arrestBgImage})` }}
      />

      <div className="quest-arrest-target-car">
        {targetCarStore && <CarModel carStore={targetCarStore} typeBody={1} />}
      </div>

      <div className="quest-arrest-police-car">
        <CarModel carStore={policeCarStore} typeBody={0} />
      </div>

      {mapStore.arrestAnimFinished && (
        <button className="arrest-button-final" onClick={handleArrest}>
          Арестовать
        </button>
      )}
    </div>
  );
});
```

**Обоснование:** Observer-обёртка, локальные stores для анимации, CSS-анимация через setTimeout для показа кнопки, клик вызывает finishQuestArrest.

---

### Файл: `src/style/quest_arrest.css` (НОВЫЙ)

```css
.quest-arrest-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 400px;
  z-index: 1100;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
}

.quest-arrest-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.quest-arrest-target-car,
.quest-arrest-police-car {
  position: absolute;
  z-index: 1;
  width: 200px;
  height: 100px;
}

.quest-arrest-target-car {
  animation: targetCarDrive 3s ease-out forwards;
  top: 60%;
}

.quest-arrest-police-car {
  animation: policeCarDrive 2.5s ease-out forwards;
  top: 45%;
}

@keyframes targetCarDrive {
  0% {
    left: -250px;
  }
  100% {
    left: 60%;
  }
}

@keyframes policeCarDrive {
  0% {
    left: -250px;
  }
  100% {
    left: 85%;
  }
}

.arrest-button-final {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  font-size: 18px;
  font-weight: bold;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}

.arrest-button-final:hover {
  background: #c0392b;
}
```

**Обоснование:** Контейнер фиксированный по центру, z-index=1100 (выше UI=200 и модальных=1000), CSS-анимации keyframes для двух машин, финальная кнопка внизу по центру.

---

### Файл: `src/components/game/PedestrianCrossingModal.jsx` (НЕ ИЗМЕНЯТЬ)

**⚠️ Запрещено изменять.**

### Файл: `src/components/game/PoliceQuestModal.jsx` (НЕ ИЗМЕНЯТЬ)

**⚠️ Запрещено изменять.**

---

## 🔍 Зависимые файлы (читать перед изменением)

- `src/state/mapStore.jsx` — добавление полей и методов
- `src/components/game/Game.jsx` — интеграция модалки
- `src/components/game/PoliceQuestModal.jsx` — читать для понимания паттерна модалок (не изменять)
- `src/components/game/CarModel.jsx` — понять пропсы для рендера машин
- `src/state/questCarStore.jsx` — для создания целевой машины в модалке

## 🚫 Новые зависимости

Нет. Новые npm-пакеты не требуются.

## ✅ Критерии приёмки

1. Кнопка в Game.jsx имеет текст «Блокировать».
2. При нажатии на «Блокировать» включается сирена, появляется модалка, машина удаляется из questCars.
3. В модалке две машины анимируются CSS-keyframes (полиция обгоняет целевую).
4. Через 3 секунды появляется кнопка «Арестовать».
5. При нажатии «Арестовать» countHelp увеличивается, сирена выключается, модалка закрывается.
6. isQuestArrestActive управляет показом модалки.
7. arrestAnimFinished управляет показом финальной кнопки.
8. Не затронуты PoliceQuestModal.jsx и PedestrianCrossingModal.jsx.
9. Нет console.log в продакшн-коде.
10. Нет утечки памяти — clearTimeout корректно очищается в useEffect cleanup.
