import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { CarModel } from "../car/CarModel";
import arrestBgImage from "../../assets/quest_location/police_arrest_modal.png";
import QuestCarStore from "../../state/questCarStore";

export const QuestArrestModal = observer(({ mapStore, carStore }) => {
  const [policeCarStore] = useState(() => {
    const store = new carStore.constructor(carStore);
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
        {targetCarStore && <CarModel carStore={targetCarStore} typeBody={0} />}
      </div>

      <div className="quest-arrest-police-car">
        <CarModel carStore={policeCarStore} typeBody={0} />
      </div>

      {mapStore.arrestAnimFinished && (
        <button className="arrest-button-quest-car-map" onClick={handleArrest}>
          Арестовать
        </button>
      )}
    </div>
  );
});
