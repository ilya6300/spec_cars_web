import { useEffect, useRef, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import { runInAction } from "mobx";
import { dataObjectsSub } from "../../state/subobject";

export const PedestrianCrossingModal = observer(({ mapStore, carStore }) => {
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const timerRef = useRef(null);
  const [pedestrianImage, setPedestrianImage] = useState(null);
  const [showFineButton, setShowFineButton] = useState(false);
  const [pedestrianY, setPedestrianY] = useState(0);

  const handleFine = useCallback(() => {
    mapStore.finishPedestrianCrossingQuest();
    runInAction(() => {
      carStore.countHelp += 1;
    });
    setShowFineButton(false);
  }, [mapStore, carStore]);

  const handlePedestrianClick = useCallback(() => {
    if (mapStore.pedestrianState !== "walking") return;
    if (!carStore.sirena) {
      carStore.toggleSirena();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    runInAction(() => {
      mapStore.pedestrianState = "stopped";
    });
    const modalWidth = window.innerWidth;
    const carWidth = 120;
    const centerPosition = (modalWidth - carWidth) / 2;
    const animateCar = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const speed = 400;
      const delta = speed * deltaTime;
      if (mapStore.pedestrianCarPosition < centerPosition) {
        mapStore.updatePedestrianCarPosition(
          Math.min(mapStore.pedestrianCarPosition + delta, centerPosition),
        );
        animationRef.current = requestAnimationFrame(animateCar);
      } else {
        setShowFineButton(true);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animateCar);
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

    const startY = 0;
    const endY = 200;

    const animatePedestrian = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const speed = 80;
      const delta = speed * deltaTime;
      if (mapStore.pedestrianState === "walking") {
        setPedestrianY((prev) => {
          const newY = prev + delta;
          if (newY >= endY - startY) return 0;
          return newY;
        });
        animationRef.current = requestAnimationFrame(animatePedestrian);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animatePedestrian);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mapStore.pedestrianState]);

  if (!mapStore.isPedestrianCrossingQuestActive || !mapStore.pedestrianCrossingTargetObject) {
    return null;
  }
  if (!pedestrianImage) return null;

  return (
    <div className="pedestrian-crossing-modal">
      {/* Фон — полосатый пешеходный переход (CSS-заглушка, пока нет изображения) */}
      <div className="modal-background" />

      {/* Машина по центру, чуть выше центра экрана */}
      <div
        className="quest-car"
        style={{
          left: `${mapStore.pedestrianCarPosition}px`,
          bottom: "45%",
        }}
      >
        <CarModel carStore={carStore} />
      </div>

      {/* Пешеход по центру X, чуть выше центра Y, идёт вниз по оси Y */}
      <div
        className="quest-pedestrian"
        onClick={handlePedestrianClick}
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: `calc(50% + ${pedestrianY}px)`,
        }}
      >
        <img src={pedestrianImage} alt="Pedestrian" className="pedestrian-image" />
      </div>

      {showFineButton && (
        <button className="fine-button" onClick={handleFine}>
          Выписать штраф
        </button>
      )}
    </div>
  );
});
