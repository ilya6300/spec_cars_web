import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";

export const QuestCar = observer(({ questCarStore, mapStore }) => {
  const screenX = questCarStore.positionX;

  return (
    <div
      className={`quest-car-other ${questCarStore.enemy ? "quest-car-enemy" : "quest-car-civilian"}`}
      data-type="quest-car"
      data-enemy={questCarStore.enemy ? "true" : "false"}
      style={{
        left: `${screenX}px`,
      }}
    >
      <CarModel carStore={questCarStore} typeBody={1}/>
    </div>
  );
});
