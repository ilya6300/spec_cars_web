import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import { getPlayerCarInlineStyle } from "../../state/cars";
import garageStore from "../../state/garageStore";
import arrestBgImage from "../../assets/quest_location/police_arrest_modal.png";
import QuestCarStore from "../../state/questCarStore";
import { QuestFinishOverlay } from "./QuestFinishOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import { RainLayer } from "./RainLayer";
import atmosphereStore from "../../state/atmosphereStore";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const WHEEL_SPEED = 450;

export const QuestArrestModal = observer(({ mapStore, carStore }) => {
  const [policeCarStore] = useState(() =>
    new CarStore(garageStore.getResolvedPlayerCar()),
  );
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

  useEffect(
    () => () => {
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => () => policeCarStore.dispose(), [policeCarStore]);

  useEffect(() => {
    if (mapStore.arrestAnimFinished) return undefined;

    let rafId;
    let lastTime = performance.now();

    const tick = (now) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      runInAction(() => {
        policeCarStore.wheelRotation =
          (policeCarStore.wheelRotation + WHEEL_SPEED * deltaTime * 0.75) % 360;
        if (targetCarStore) {
          targetCarStore.wheelRotation =
            (targetCarStore.wheelRotation + WHEEL_SPEED * deltaTime * 0.75) %
            360;
        }
      });

      if (!mapStore.arrestAnimFinished) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mapStore, mapStore.arrestAnimFinished, policeCarStore, targetCarStore]);

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
      className={`quest-arrest-modal${atmosphereStore.isNight ? " quest-arrest-modal--night" : ""}${atmosphereStore.isRainy ? " quest-arrest-modal--rain" : ""}`}
    >
      <div
        className="quest-arrest-background"
        style={{ backgroundImage: `url(${arrestBgImage})` }}
      />

      <AtmosphereOverlay />

      <RainLayer />

      <div className="quest-arrest-target-car">
        {targetCarStore && (
          <CarModel
            carStore={targetCarStore}
            variant="traffic"
            nested
            showHeadlights={atmosphereStore.isNight}
          />
        )}
      </div>

      <div
        className="quest-arrest-police-car"
        style={getPlayerCarInlineStyle(policeCarStore.layoutTokens)}
      >
        <CarModel
          carStore={policeCarStore}
          variant="player"
          nested
          showHeadlights={atmosphereStore.isNight}
        />
      </div>

      {mapStore.arrestAnimFinished && finishPhase === "idle" && (
        <QuestCtaButton
          role="mission"
          className="quest-cta--arrest-modal"
          data-type="arrest-modal-button"
          onClick={handleArrest}
        >
          Арестовать
        </QuestCtaButton>
      )}

      {finishPhase === "overlay" && (
        <QuestFinishOverlay variant="enemy" onDismiss={handleFinishDismiss} />
      )}
    </div>
  );
});
