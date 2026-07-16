import React from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";

export const QuestCarArrestButton = observer(({ mapStore, carStore }) => {
  if (!mapStore.questCarForArrest) return null;

  return (
    <button
      className="arrest-button-quest-car"
      onClick={() => {
        if (mapStore.questCarForArrest) {
          const index = mapStore.questCars.indexOf(mapStore.questCarForArrest);
          if (index !== -1) {
            runInAction(() => {
              carStore.countHelp += 1;
            });
            mapStore.removeQuestCarByIndex(index);
            mapStore.questCarForArrest = null;
            if (carStore.sirena) {
              carStore.toggleSirena();
            }
          }
        }
      }}
    >
      Арестовать
    </button>
  );
});
