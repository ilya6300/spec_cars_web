import React, { useEffect, useRef, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import { getDefaultCar } from "../../state/cars";
import { objectConfigByType } from "../../state/objects";
import { getHelpTypeForPoliceObject } from "../../state/quests";
import { runInAction } from "mobx";
import roadImage from "../../assets/maps/road_1.png";
import { QuestFinishOverlay } from "./QuestFinishOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import atmosphereStore from "../../state/atmosphereStore";

export const PoliceQuestModal = observer(({ mapStore, carStore }) => {
  const policeCarStore = useRef(null);
  if (!policeCarStore.current) {
    policeCarStore.current = new CarStore(getDefaultCar());
  }
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const finishTimerRef = useRef(null);
  const dismissCalledRef = useRef(false);
  const [carArrived, setCarArrived] = useState(false);
  const [finishPhase, setFinishPhase] = useState("idle");

  const handleFinishDismiss = useCallback(() => {
    if (dismissCalledRef.current) {
      return;
    }
    dismissCalledRef.current = true;

    const target = mapStore.questTargetObject;
    if (!target) {
      return;
    }

    mapStore.removeObjectByUid(target.uid);
    const helpType = getHelpTypeForPoliceObject(target.typeId);
    if (helpType) {
      runInAction(() => {
        carStore.addHelp(helpType);
      });
    }
    if (carStore.sirena) {
      carStore.toggleSirena();
    }
    mapStore.finishQuest();
  }, [mapStore, carStore]);

  const handleArrest = useCallback(() => {
    const target = mapStore.questTargetObject;
    if (target) {
      setFinishPhase("waiting");
      return;
    }

    const questCar = mapStore.questCarForArrest;
    if (questCar) {
      const index = mapStore.questCars.indexOf(questCar);
      if (index !== -1) {
        runInAction(() => {
          carStore.addHelp("enemyChase");
        });
        mapStore.removeQuestCarByIndex(index);
        mapStore.questCarForArrest = null;
        if (carStore.sirena) {
          carStore.toggleSirena();
        }
        mapStore.finishQuest();
      }
    }
  }, [mapStore, carStore]);

  useEffect(() => {
    if (!mapStore.isPoliceQuestActive || !mapStore.questTargetObject) {
      return;
    }

    setCarArrived(false);
    setFinishPhase("idle");
    dismissCalledRef.current = false;

    const modalWidth = window.innerWidth;
    const carWidth = 250;
    const targetWidth = 150;
    const gap = 100;
    const endPosition = modalWidth - targetWidth - carWidth - gap;

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const speed = 450;
      const delta = speed * deltaTime;

      if (mapStore.questCarPosition < endPosition) {
        const newPos = Math.min(mapStore.questCarPosition + delta, endPosition);
        mapStore.updateQuestCarPosition(newPos);

        // Вращение колёс пропорционально скорости
        runInAction(() => {
          policeCarStore.current.wheelRotation += speed * deltaTime * 0.75;
          policeCarStore.current.wheelRotation %= 360;
        });

        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCarArrived(true);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      policeCarStore.current?.dispose();
    };
  }, [mapStore.isPoliceQuestActive, mapStore.questTargetObject]);

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

  if (!mapStore.isPoliceQuestActive || !mapStore.questTargetObject) {
    return null;
  }

  const targetObj = mapStore.questTargetObject;
  const targetImage = objectConfigByType[targetObj.typeId]?.image;

  if (!targetImage || !getHelpTypeForPoliceObject(targetObj.typeId)) {
    return null;
  }

  return (
    <div
      className={`police-quest-modal${atmosphereStore.isNight ? " police-quest-modal--night" : ""}`}
    >
      {/* Дорога на фоне */}
      <div
        className="modal-road-background"
        style={{ backgroundImage: `url(${roadImage})` }}
      />

      <AtmosphereOverlay />

      {/* Машина подъезжает слева */}
      <div
        className="quest-car"
        style={{ left: `${mapStore.questCarPosition}px` }}
      >
        <CarModel carStore={policeCarStore.current} variant="player" nested />
      </div>

      {/* Целевой объект справа */}
      <div className="quest-target">
        <img src={targetImage} alt="Target" className="target-image" />
      </div>

      {carArrived && finishPhase === "idle" && (
        <button className="arrest-button" onClick={handleArrest}>
          Арестовать
        </button>
      )}

      {finishPhase === "overlay" && (
        <QuestFinishOverlay variant="criminal" onDismiss={handleFinishDismiss} />
      )}
    </div>
  );
});
