import { useEffect, useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import Objects from "../../state/objects";
import { runInAction } from "mobx";
import roadImage from "../../assets/maps/road_1.png";

export const PedestrianQuestModal = observer(({ mapStore, carStore }) => {
  const policeCarStore = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  if (!policeCarStore.current) {
    policeCarStore.current = new CarStore(Cars.cars[0]);
  }

  const handleArrest = useCallback(() => {
    const target = mapStore.pedestrianCrossingTargetObject;
    if (target) {
      mapStore.removeObjectByUid(target.uid);
      runInAction(() => {
        carStore.countHelp += 1;
      });
      if (carStore.sirena) {
        carStore.toggleSirena();
      }
      mapStore.finishPedestrianCrossingQuest();
    }
  }, [mapStore, carStore]);

  useEffect(() => {
    if (!mapStore.isPedestrianCrossingQuestActive || !mapStore.pedestrianCrossingTargetObject) {
      return;
    }

    const modalWidth = window.innerWidth;
    const carWidth = 120;
    const targetWidth = 150;
    const gap = 100;

    const endPosition = modalWidth - targetWidth - carWidth - gap;

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const speed = 300;
      const delta = speed * deltaTime;

      if (mapStore.pedestrianCarPosition < endPosition) {
        mapStore.updatePedestrianCarPosition(
          Math.min(mapStore.pedestrianCarPosition + delta, endPosition),
        );
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mapStore.isPedestrianCrossingQuestActive, mapStore.pedestrianCarPosition]);

  if (!mapStore.isPedestrianCrossingQuestActive || !mapStore.pedestrianCrossingTargetObject) {
    return null;
  }

  const targetObj = mapStore.pedestrianCrossingTargetObject;
  let targetImage = null;
  if (targetObj.typeId === "human1") {
    targetImage = Objects.human1Img;
  } else if (targetObj.typeId === "human2") {
    targetImage = Objects.human2Img;
  } else if (targetObj.typeId === "human3") {
    targetImage = Objects.human3Img;
  } else if (targetObj.typeId === "human4") {
    targetImage = Objects.human4Img;
  } else if (targetObj.typeId === "human5") {
    targetImage = Objects.human5Img;
  } else if (targetObj.typeId === "human6") {
    targetImage = Objects.human6Img;
  } else if (targetObj.typeId === "human7") {
    targetImage = Objects.human7Img;
  } else if (targetObj.typeId === "human8") {
    targetImage = Objects.human8Img;
  } else if (targetObj.typeId === "human9") {
    targetImage = Objects.human9Img;
  } else if (targetObj.typeId === "human10") {
    targetImage = Objects.human10Img;
  } else if (targetObj.typeId === "human11") {
    targetImage = Objects.human11Img;
  } else if (targetObj.typeId === "human12") {
    targetImage = Objects.human12Img;
  } else if (targetObj.typeId === "human13") {
    targetImage = Objects.human13Img;
  } else if (targetObj.typeId === "human14") {
    targetImage = Objects.human14Img;
  } else if (targetObj.typeId === "human15") {
    targetImage = Objects.human15Img;
  } else if (targetObj.typeId === "human16") {
    targetImage = Objects.human16Img;
  }

  if (!targetImage) {
    return null;
  }

  return (
    <div className="police-quest-modal">
      <div
        className="modal-road-background"
        style={{ backgroundImage: `url(${roadImage})` }}
      />

      <div
        className="quest-car"
        style={{ left: `${mapStore.pedestrianCarPosition}px`, zIndex: 100 }}
      >
        <CarModel carStore={policeCarStore.current} />
      </div>

      <div className="quest-target">
        <img src={targetImage} alt="Target" className="target-image" />
      </div>

      <button className="arrest-button" onClick={handleArrest}>
        Арестовать
      </button>
    </div>
  );
});
