Project Backlog

# Bugfix: Кнопка «Арестовать» для квестовых машин (enemy=true) не появляется

Источник: `CONCEPT.md` — кнопка должна появляться, когда `enemy=true` машина сравняется с полицейским по X + 250px. Сейчас кнопка не появляется.

## 📋 Список задач

- [x] 1. [Критический] Исправить условие рендера кнопки «Арестовать» в `@components/game/Game.jsx`: убрать ошибочное `&& activeMapStore.isPedestrianCrossingQuestActive` (кнопка привязана к квесту пешеходного перехода, с которым никак не связана) и заменить на `&& !activeMapStore.isPedestrianCrossingQuestActive && !activeMapStore.isPoliceQuestActive` (не показывать кнопку поверх модалок). DoD: кнопка рендерится, когда `questCarForArrest` установлен и нет активных модальных квестов. Зависимости: нет.
- [x] 2. [Критический] Исправить порог сближения в `@state/mapStore.jsx` → `checkQuestCarDistance`: заменить `maxDistance = policeRightEdge + 400` на `maxDistance = policeScreenX + 250` (соответствие `CONCEPT.md`: +250px от X-координаты полицейского); нижняя граница — `policeScreenX` (момент «сравнялись»). DoD: `questCarForArrest` устанавливается для `enemy=true` машины при попадании `positionX` в диапазон `[30, 280]`. Зависимости: #1.
- [x] 3. [Высокий] Проверить стили кнопки `.arrest-button-quest-car-map` в `@style/quest_car.css`: убедиться, что `position: fixed`, `z-index: 1003`, видимые `bottom/left/padding` — корректны и не скрывают кнопку. DoD: стили не содержат `display:none`/`visibility:hidden`/`opacity:0`; кнопка видна поверх игровых слоёв. Зависимости: #2.
- [x] 4. [Высокий] Актуализировать `@instructions.md`: исправить секцию «Кнопка Арестовать» — условие появления (диапазон `[policeScreenX, policeScreenX + 250]`, без привязки к квесту пешеходного перехода) и список действий QA. DoD: инструкция соответствует исправленной логике. Зависимости: #2.
- [x] 5. [Средний] Проверить unit-тесты (`mapStore.test.jsx`, `questCarStore.test.jsx`) на соответствие исправлению. DoD: тесты проходят; при необходимости добавить unit-тест для `checkQuestCarDistance` (без изменения логики стора). Зависимости: #2.
- [x] 6. [Критический] QA: запустить `npm run test` (vitest) и `npm run build` (Vite). DoD: все существующие тесты зелёные, билд без ошибок. Зависимости: #5.
