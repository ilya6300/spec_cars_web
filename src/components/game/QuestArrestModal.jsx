import { observer } from "mobx-react-lite";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import { getDefaultCar } from "../../state/cars";
import arrestBgImage from "../../assets/quest_location/police_arrest_modal.png";
import QuestCarStore from "../../state/questCarStore";
import { QuestFinishOverlay } from "./QuestFinishOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import atmosphereStore from "../../state/atmosphereStore";

export const QuestArrestModal = observer(({ mapStore, carStore }) => {
  const [policeCarStore] = useState(() => new CarStore(getDefaultCar()));
  const finishTimerRef = useRef(null);
  const dismissCalledRef = useRef(false);
  const [finishPhase, setFinishPhase] = useState("idle");

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
  }, [mapStore]);

  useEffect(() => {
    setFinishPhase("idle");
    dismissCalledRef.current = false;
  }, [mapStore.isQuestArrestActive, mapStore.questCarForArrest]);

  useEffect(() => {
    if (finishPhase !== "waiting") {
      return undefined;
    }

    finishTimerRef.current = setTimeout(() => {
      setFinishPhase("overlay");
    }, 1000);

    return () => {
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
    };
  }, [finishPhase]);

  useEffect(() => () => {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
    }
  }, []);

  useEffect(() => () => policeCarStore.dispose(), [policeCarStore]);

  const handleFinishDismiss = useCallback(() => {
    if (dismissCalledRef.current) {
      return;
    }
    dismissCalledRef.current = true;

    carStore.addHelp("enemyChase");
    carStore.toggleSirena();
    mapStore.finishQuestArrest();
  }, [mapStore, carStore]);

  const handleArrest = () => {
    setFinishPhase("waiting");
  };

  return (
    <div
      className={`quest-arrest-modal${atmosphereStore.isNight ? " quest-arrest-modal--night" : ""}`}
    >
      <div
        className="quest-arrest-background"
        style={{ backgroundImage: `url(${arrestBgImage})` }}
      />

      <AtmosphereOverlay />

      <div className="quest-arrest-target-car">
        {targetCarStore && <CarModel carStore={targetCarStore} typeBody={0} />}
      </div>

      <div className="quest-arrest-police-car">
        <CarModel carStore={policeCarStore} typeBody={0} />
      </div>

      {mapStore.arrestAnimFinished && finishPhase === "idle" && (
        <button className="arrest-button-quest-car-map" onClick={handleArrest}>
          Арестовать
        </button>
      )}

      {finishPhase === "overlay" && (
        <QuestFinishOverlay variant="enemy" onDismiss={handleFinishDismiss} />
      )}
    </div>
  );
});
