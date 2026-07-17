import { useEffect, useRef, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import Objects from "../../state/objects";
import { runInAction } from "mobx";
import roadImage from "../../assets/maps/road_1.png";

export const PoliceQuestModal = observer(({ mapStore, carStore }) => {
  const policeCarStore = useRef(null);
  if (!policeCarStore.current) {
    policeCarStore.current = new CarStore(Cars.cars[0]);
  }
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const [carArrived, setCarArrived] = useState(false);

  const handleArrest = useCallback(() => {
    const target = mapStore.questTargetObject;
    if (target) {
      mapStore.removeObjectByUid(target.uid);
      runInAction(() => {
        carStore.countHelp += 1;
      });
      if (carStore.sirena) {
        carStore.toggleSirena();
      }
      mapStore.finishQuest();
    }

    const questCar = mapStore.questCarForArrest;
    if (questCar) {
      const index = mapStore.questCars.indexOf(questCar);
      if (index !== -1) {
        runInAction(() => {
          carStore.countHelp += 1;
        });
        mapStore.removeQuestCarByIndex(index);
        mapStore.questCarForArrest = null;
        mapStore.questCarActive = false;
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

      if (mapStore.questCarPosition < endPosition) {
        const newPos = Math.min(mapStore.questCarPosition + delta, endPosition);
        mapStore.updateQuestCarPosition(newPos);

        // Вращение колёс пропорционально скорости
        runInAction(() => {
          policeCarStore.current.wheelRotation += speed * deltaTime * 1.5;
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
    };
  }, [mapStore.isPoliceQuestActive, mapStore.questTargetObject]);

  if (!mapStore.isPoliceQuestActive || !mapStore.questTargetObject) {
    return null;
  }

  const targetObj = mapStore.questTargetObject;
  let targetImage = null;
  if (targetObj.typeId === "human_aggr1") {
    targetImage = Objects.humanAggr1Img;
  } else if (targetObj.typeId === "human_aggr2") {
    targetImage = Objects.humanAggr2Img;
  } else if (targetObj.typeId === "human_aggr3") {
    targetImage = Objects.humanAggr3Img;
  }

  if (!targetImage) {
    return null;
  }

  return (
    <div className="police-quest-modal">
      {/* Дорога на фоне */}
      <div
        className="modal-road-background"
        style={{ backgroundImage: `url(${roadImage})` }}
      />

      {/* Машина подъезжает слева */}
      <div
        className="quest-car"
        style={{ left: `${mapStore.questCarPosition}px`, zIndex: 100 }}
      >
        <CarModel carStore={policeCarStore.current} />
      </div>

      {/* Целевой объект справа */}
      <div className="quest-target">
        <img src={targetImage} alt="Target" className="target-image" />
      </div>

      {carArrived && (
        <button className="arrest-button" onClick={handleArrest}>
          Арестовать
        </button>
      )}
    </div>
  );
});
