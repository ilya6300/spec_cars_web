import { useEffect, useRef, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import { getDefaultCar } from "../../state/cars";
import { runInAction } from "mobx";
import { dataObjectsSub } from "../../state/subobject";
import crossingImage from "../../assets/quest_location/police_pedestrian crossing.png";

export const PedestrianCrossingModal = observer(({ mapStore, carStore }) => {
  const modalCarStore = useRef(null);
  if (!modalCarStore.current) {
    modalCarStore.current = new CarStore(getDefaultCar());
  }

  const pedRafRef = useRef(null);
  const carRafRef = useRef(null);
  const timerRef = useRef(null);
  const [pedestrianImage, setPedestrianImage] = useState(null);
  const [pedestrianY, setPedestrianY] = useState(-50);

  const stopAnimations = useCallback(() => {
    if (carRafRef.current) {
      cancelAnimationFrame(carRafRef.current);
      carRafRef.current = null;
    }
    if (pedRafRef.current) {
      cancelAnimationFrame(pedRafRef.current);
      pedRafRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishQuestWithHelp = useCallback(() => {
    stopAnimations();
    mapStore.finishPedestrianCrossingQuest();
    runInAction(() => {
      carStore.addHelp("pedestrianFine");
      if (carStore.sirena) {
        carStore.toggleSirena();
      }
    });
  }, [mapStore, carStore, stopAnimations]);

  const handleFine = useCallback(() => {
    finishQuestWithHelp();
  }, [finishQuestWithHelp]);

  const handlePedestrianClick = useCallback(() => {
    if (mapStore.pedestrianState !== "walking") return;

    if (!carStore.sirena) {
      carStore.toggleSirena();
    }

    stopAnimations();

    const targetX = window.innerWidth / 4.5;
    const startPos = mapStore.pedestrianCarPosition;
    const startTime = performance.now();

    runInAction(() => {
      mapStore.pedestrianState = "stopped";
      mapStore.pedestrianCarPosition = startPos;
    });

    let prevTime = performance.now();

    const animateCar = (currentTime) => {
      const dt = (currentTime - prevTime) / 1000;
      prevTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const pos = startPos + 400 * elapsed;

      runInAction(() => {
        modalCarStore.current.wheelRotation += 400 * dt * 0.75;
        modalCarStore.current.wheelRotation %= 360;
      });

      if (pos < targetX) {
        mapStore.updatePedestrianCarPosition(pos);
        carRafRef.current = requestAnimationFrame(animateCar);
      } else {
        mapStore.updatePedestrianCarPosition(targetX);
        mapStore.pedestrianIsCarArrived = true;
        carRafRef.current = null;
      }
    };

    carRafRef.current = requestAnimationFrame(animateCar);
  }, [mapStore, carStore, stopAnimations]);

  useEffect(() => {
    if (!mapStore.isPedestrianCrossingQuestActive) {
      stopAnimations();
      return undefined;
    }

    setPedestrianY(-50);

    const targetObj = mapStore.pedestrianCrossingTargetObject;
    if (targetObj) {
      const found = dataObjectsSub.find(
        (obj) => obj.type === targetObj.typeId,
      );
      setPedestrianImage(found ? found.image : null);
    }

    return () => stopAnimations();
  }, [mapStore.isPedestrianCrossingQuestActive, mapStore.pedestrianCrossingTargetObject, stopAnimations]);

  useEffect(() => {
    if (!mapStore.isPedestrianCrossingQuestActive || !pedestrianImage) return undefined;

    const delay = 1000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      runInAction(() => {
        mapStore.pedestrianState = "walking";
      });
      timerRef.current = null;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mapStore.isPedestrianCrossingQuestActive, pedestrianImage, mapStore]);

  useEffect(() => {
    if (mapStore.pedestrianState !== "walking") return undefined;

    const endY = 300;
    let prevTime = performance.now();

    const animate = (currentTime) => {
      const dt = (currentTime - prevTime) / 1000;
      prevTime = currentTime;

      if (mapStore.pedestrianState !== "walking") {
        pedRafRef.current = null;
        return;
      }

      setPedestrianY((prev) => {
        const next = prev + 40 * dt;
        if (next >= endY) {
          stopAnimations();
          mapStore.finishPedestrianCrossingQuest();
          return endY;
        }
        return next;
      });

      pedRafRef.current = requestAnimationFrame(animate);
    };

    pedRafRef.current = requestAnimationFrame(animate);

    return () => {
      if (pedRafRef.current) {
        cancelAnimationFrame(pedRafRef.current);
        pedRafRef.current = null;
      }
    };
  }, [mapStore.pedestrianState, mapStore, stopAnimations]);

  useEffect(() => () => {
    stopAnimations();
    modalCarStore.current?.dispose();
  }, [stopAnimations]);

  if (!mapStore.isPedestrianCrossingQuestActive || !mapStore.pedestrianCrossingTargetObject) {
    return null;
  }
  if (!pedestrianImage) return null;

  return (
    <div className="pedestrian-crossing-modal">
      <div
        className="modal-background"
        style={{ backgroundImage: `url(${crossingImage})` }}
      />
      <div
        className="quest-car"
        style={{
          left: `${mapStore.pedestrianCarPosition}px`,
          bottom: "45%",
        }}
      >
        <CarModel carStore={modalCarStore.current} />
      </div>
      <div
        className="quest-pedestrian"
        onClick={handlePedestrianClick}
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: `calc(20% + ${pedestrianY}px)`,
        }}
      >
        <img src={pedestrianImage} alt="Pedestrian" className="pedestrian-image" />
      </div>
      {mapStore.pedestrianIsCarArrived && (
        <button className="fine-button" onClick={handleFine}>
          Выписать штраф
        </button>
      )}
    </div>
  );
});
