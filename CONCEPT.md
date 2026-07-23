Реализованный функционал который сейчас делал
Кнопка «Блокировать» — переименована в Game.jsx, при нажатии: сирена включается, модалка появляется, машина удаляется
Модалка QuestArrestModal — CSS-анимация обгона полицейской машиной (2.5s vs 3s), финальная кнопка «Арестовать» появляется через 3 секунды
Завершение квеста — при нажатии «Арестовать»: countHelp +1, сирена выключается, модалка закрывается
🚫 Guardrails соблюдены
PoliceQuestModal.jsx и PedestrianCrossingModal.jsx не изменены
Анимация исключительно через CSS (без requestAnimationFrame)
Нет console.log в продакшн-коде
Нет утечки памяти (clearTimeout в useEffect cleanup)
Новые npm-пакеты не устанавливались
Сам новый элемент из dom
<div class="quest-arrest-modal"><div class="quest-arrest-background" style="background-image: url(&quot;/spec_cars_web/src/assets/quest_location/police_arrest_modal.png&quot;);"></div><div class="quest-arrest-target-car"></div><div class="quest-arrest-police-car"><div class="car_container" style="transform: translateY(-50%);"><div></div><img alt="Кузов" class="car-body" src="/spec_cars_web/src/assets/cars/police/body.png"><img alt="Колесо" class="left-shell" src="/spec_cars_web/src/assets/cars/police/shell_1.png" style="transform: rotate(93.3801deg); bottom: -11%;"><img alt="Колесо" class="right-shell" src="/spec_cars_web/src/assets/cars/police/shell_1.png" style="transform: rotate(93.3801deg); bottom: -11%;"></div></div><button class="arrest-button-final">Арестовать</button></div>
По реализации есть следующие проблемы
--- БАГИ ---
1) Ты сделал нговому одальному окну фиксированную ширину и величину, а он должен занимать весь экран
2) проверка z-index у одалки, 
3) если ты посмотришь элемент из dom то увидишь ,что полицейская машина заполнена, а quest-arrest-target-car имеет лишь div
4) Так же, полицейская машина уезжает слишком далеко, не вимдно капота
