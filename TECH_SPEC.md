# TECH_SPEC.md (Техническое задание на реализацию)

## 🎯 Цель итерации

Исправить прерывистый звук двигателя при переключении loop и устранить утечки памяти аудиообъектов.

## 📦 Новые зависимости

- **npm-пакеты**: Не требуются.
- **Ассеты**: src/assets/audio/effects/car_start.mp3, src/assets/audio/effects/the_engine_is_running.wav (уже существуют)

## 🛠️ Детальные шаги реализации

### Проблема 1: Прерывистый звук двигателя

При переключении `loop = true` на уже играющем аудио происходит пауза, так как браузер пересоздает поток воспроизведения.

**Решение:**

1. Создать аудиообъект двигателя с `loop = true` сразу при инициализации CarStore.
2. В `toggleIgnition()` вместо создания нового `audioEngine` просто вызывать `play()` на существующем объекте.
3. При выключении зажигания вызывать `pause()`, но не уничтожать объект.
4. При повторном включении снова `play()` — звук продолжится бесшовно.

### Проблема 2: Утечки памяти

Текущий код создает новые `Audio` объекты при каждом переключении зажигания, но:

- `audioStart` может не освободиться корректно при быстром переключении.
- `audioEngine` не уничтожается при размонтировании компонента.
- `ignitionTimeoutId` может сработать после размонтирования.

**Решение:**

1. Инициализировать `audioEngine` с `loop = true` в конструкторе CarStore (но не запускать).
2. В `toggleIgnition()` управлять только состоянием `play/pause`, не создавая новые объекты.
3. Добавить метод `destroy()` в CarStore для очистки всех аудиообъектов.
4. В `Game.jsx` добавить `useEffect` с cleanup, который вызывает `store.destroy()` и `clearTimeout()`.

### Изменения в @carStore.jsx

```javascript
// В конструкторе:
this.audioEngine = new Audio(theEngineIsRunning);
this.audioEngine.loop = true;
this.audioEngine.volume = 0.5; // Начальная громкость

// В toggleIgnition():
toggleIgnition() {
  this.isIgnitionOn = !this.isIgnitionOn;

  if (this.isIgnitionOn) {
    // Звук стартера (однократно)
    this.audioStart = new Audio(carStartSound);
    this.audioStart.play().catch(() => {});

    // Запуск двигателя через 1 секунду
    this.ignitionTimeoutId = setTimeout(() => {
      if (this.isIgnitionOn && this.audioEngine) {
        this.audioEngine.play().catch(() => {});
      }
    }, 1000);
  } else {
    // Остановка двигателя
    if (this.ignitionTimeoutId) {
      clearTimeout(this.ignitionTimeoutId);
      this.ignitionTimeoutId = null;
    }

    if (this.audioStart) {
      this.audioStart.pause();
      this.audioStart = null;
    }

    // Бесшовная остановка двигателя
    if (this.audioEngine) {
      this.audioEngine.pause();
      // НЕ обнуляем audioEngine! Он остается готовым к следующему запуску
    }

    this.isGasPressed = false;
  }
}

// Новый метод:
destroy() {
  if (this.ignitionTimeoutId) {
    clearTimeout(this.ignitionTimeoutId);
    this.ignitionTimeoutId = null;
  }

  if (this.audioStart) {
    this.audioStart.pause();
    this.audioStart = null;
  }

  if (this.audioEngine) {
    this.audioEngine.pause();
    this.audioEngine = null;
  }
}
```

### Изменения в @Game.jsx

```javascript
// Добавить useEffect для очистки:
useEffect(() => {
  return () => {
    activeCarStore.destroy();
  };
}, []);
```

## ✅ Definition of Done (DoD)

1. Звук двигателя работает бесшовно при многократных включениях/выключениях зажигания
2. Нет пауз и прерывистостей при переключении loop
3. При размонтировании Game.jsx все аудиообъекты корректно уничтожаются
4. Нет утечек памяти (проверить через DevTools Memory)
5. Ошибки воспроизведения игнорируются (catch block)
