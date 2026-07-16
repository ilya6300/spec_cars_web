import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";

export const QuestCar = observer(({ questCarStore, mapStore, distance }) => {
  const screenX = questCarStore.positionX - distance;

  return (
    <div
      className={`quest-car ${questCarStore.enemy ? "quest-car-enemy" : "quest-car-civilian"}`}
      style={{
        left: `${screenX}px`,
      }}
    >
      <span>{String(questCarStore.enemy)}</span>
      <CarModel carStore={questCarStore} />
    </div>
  );
});
