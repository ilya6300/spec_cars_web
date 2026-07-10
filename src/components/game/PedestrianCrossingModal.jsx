import { useEffect, useRef, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import { runInAction } from "mobx";
import { dataObjectsSub } from "../../state/subobject";
import crossingImage from "../../assets/quest_location/police_pedestrian crossing.png";

export const PedestrianCrossingModal = observer(({ mapStore, carStore }) => {
  const pedRafRef = useRef(null);
  const carRafRef = useRef(null);
  const timerRef = useRef(null);
  const [pedestrianImage, setPedestrianImage] = useState(null);
  const [pedestrianY, setPedestrianY] = useState(-50);

  const handleFine = useCallback(() => {
    if (carRafRef.current) {
      cancelAnimationFrame(carRafRef.current);
      carRafRef.current = null;
    }
    mapStore.finishPedestrianCrossingQuest();
    runInAction(() => {
      carStore.countHelp += 1;
    });
  }, [mapStore, carStore]);

  const handlePedestrianClick = useCallback(() => {
    if (mapStore.pedestrianState !== "walking") return;

    if (!carStore.sirena) {
      carStore.toggleSirena();
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const targetX = window.innerWidth / 2 - 70;
    let startTime = performance.now();
    let startPos = -150;

    runInAction(() => {
      mapStore.pedestrianState = "stopped";
      mapStore.pedestrianCarPosition = startPos;
    });

    console.error("Car anim start:", { targetX, startTime });

    const animateCar = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const pos = startPos + 400 * elapsed;
      
      console.error("Car anim tick:", { elapsed, pos, targetX });
      
      if (pos < targetX) {
        mapStore.updatePedestrianCarPosition(pos);
        carRafRef.current = requestAnimationFrame(animateCar);
      } else {
        mapStore.updatePedestrianCarPosition(targetX);
        console.error("Car arrived!");
        mapStore.pedestrianIsCarArrived = true;
      }
    };

    carRafRef.current = requestAnimationFrame(animateCar);
  }, [mapStore, carStore]);

  useEffect(() => {
    if (!mapStore.isPedestrianCrossingQuestActive) return;
    const targetObj = mapStore.pedestrianCrossingTargetObject;
    if (targetObj) {
      const found = dataObjectsSub.find(
        (obj) => obj.type === targetObj.typeId,
      );
      setPedestrianImage(found ? found.image : null);
    }
    if (!pedestrianImage) return;

    const delay = 1000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      runInAction(() => {
        mapStore.pedestrianState = "walking";
      });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mapStore.isPedestrianCrossingQuestActive, pedestrianImage]);

  useEffect(() => {
    if (mapStore.pedestrianState !== "walking") return;

    const endY = 380;
    let prevTime = performance.now();
    let animId = null;

    const animate = (currentTime) => {

      const dt = (currentTime - prevTime) / 1000;
      prevTime = currentTime;
      if (mapStore.pedestrianState === "walking") {
        setPedestrianY((prev) => {
          const next = prev + 40 * dt;
          console.log('animate', prev, pedestrianY, next, dt)
          return next >= endY ? -30 : next;
        });
        animId = requestAnimationFrame(animate);
        pedRafRef.current = animId;
      }
    };

    animId = requestAnimationFrame(animate);
    pedRafRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mapStore.pedestrianState]);

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
        <CarModel carStore={carStore} />
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
