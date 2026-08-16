# План spec_cars_web

**Статус:** Approved (16 авг. 2026)

## Новые квесты

### Квест «Штраф за неправильную парковку» (TASK-059)

- Зона 4–8 парковочных мест на обочине (`unit_parking.png`)
- Машины из `Cars.otherCars` (civilian); 20% шанс неправильной парковки на занятом месте
- Клик по нарушителю на карте → 1 с → `QuestFinishOverlay` (`variant="pedestrian"`)
- 1 штраф = 1 звезда (`parkingFine: 4` очков)
- Без новых модалок; доступен в `free` и `timed`, не в `chase`/night
