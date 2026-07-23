import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Car } from "../car/Car";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import MapsStore from "../../state/maps";
import MapStore from "../../state/mapStore";
import { Maps } from "../map/Maps";
import { Controllers } from "../controllers/Controllers";
import { PoliceQuestModal } from "./PoliceQuestModal";
import { PedestrianCrossingModal } from "./PedestrianCrossingModal";
import { QuestArrestModal } from "./QuestArrestModal";
import { QuestCar } from "./QuestCar";

import "../../style/quest_arrest.css";
import { SpeedDisplay } from "./SpeedDisplay";
import FullscreenButton from "./FullscreenButton";

export const Game = observer(() => {
  const [activeCarStore] = useState(() => new CarStore(Cars.cars[0]));
  const [activeMapStore] = useState(() => {
    const store = new MapStore(MapsStore.maps[0]);
    store.carStore = activeCarStore;
    return store;
  });

  // Связываем сторы: CarStore получает ссылку на MapStore
  activeCarStore.mapStore = activeMapStore;

  const [distance, setDistance] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const viewportWidthRef = useRef(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      viewportWidthRef.current = window.innerWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const gameLoop = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      activeCarStore.updatePhysics(deltaTime);

      const pixelsMoved = activeCarStore.currentSpeed * deltaTime;
      setDistance((prev) => prev + pixelsMoved);

      // Обновляем offsetX в MapStore (синхронно с distance)
      activeMapStore.update(activeCarStore.currentSpeed, deltaTime);
      activeCarStore.checkTrafficLight(activeMapStore);
      activeMapStore.spawnObjects(viewportWidthRef.current, deltaTime);
      activeMapStore.despawnObjects(viewportWidthRef.current);
      activeMapStore.triggerAppearEvents(activeCarStore);
      activeMapStore.updateQuestCars(deltaTime);
      activeMapStore.checkQuestCarDistance(
        activeMapStore.questCars,
        viewportWidthRef.current,
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCarStore, activeMapStore]);

  useEffect(() => {
    activeMapStore.startTrafficLightTimer();
    return () => {
      activeMapStore.dispose();
    };
  }, [activeMapStore]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__PLAYWRIGHT__) {
      window.__TEST_STATE__ = { activeMapStore, activeCarStore, distance };
    }
  }, [activeMapStore, activeCarStore, distance]);

  const handleObjectClick = (obj, config, mapStore, carStore) => {
    if (obj.longPressTimeout) {
      clearTimeout(obj.longPressTimeout);
      obj.longPressTimeout = null;
    }

    if (config.onClick) {
      config.onClick(obj, mapStore, carStore);
    }
  };

  return (
    <div className="game-viewport">
      <FullscreenButton />
      <Maps
        map={activeMapStore}
        distance={distance}
        carStore={activeCarStore}
        onClickObject={handleObjectClick}
      />
      <Car carStore={activeCarStore} />
      <Controllers activeCarStore={activeCarStore} />

      {/* Police Quest Modal - для квеста со светофором и human_aggr* */}
      <PoliceQuestModal mapStore={activeMapStore} carStore={activeCarStore} />

      {/* Pedestrian Crossing Quest Modal - для квеста с пешеходным переходом */}
      <PedestrianCrossingModal
        mapStore={activeMapStore}
        carStore={activeCarStore}
      />

      {/* Quest Arrest Modal - для квеста блокировки */}
      {activeMapStore.isQuestArrestActive && (
        <QuestArrestModal mapStore={activeMapStore} carStore={activeCarStore} />
      )}

      {activeMapStore.questCars
        .filter(
          (car) =>
            car.positionX > -150 && car.positionX < viewportWidthRef.current,
        )
        .map((questCar) => (
          <QuestCar
            key={questCar.id}
            questCarStore={questCar}
            mapStore={activeMapStore}
          />
        ))}

      {(() => {
        const visibleCars = activeMapStore.questCars.filter(
          (car) =>
            car.positionX > -150 && car.positionX < viewportWidthRef.current,
        );
        if (visibleCars.length === 0) return null;
        return (
          <SpeedDisplay
            currentSpeed={Math.max(
              ...visibleCars.map((car) => car.currentSpeed),
            )}
          />
        );
      })()}

      {activeMapStore.questCarForArrest &&
        !activeMapStore.isPedestrianCrossingQuestActive &&
        !activeMapStore.isPoliceQuestActive &&
        !activeMapStore.isQuestArrestActive && (
          <button
            className="arrest-button-quest-car-map"
            data-type="arrest-button"
            onClick={() => {
              if (activeMapStore.questCarForArrest) {
                const index = activeMapStore.questCars.indexOf(
                  activeMapStore.questCarForArrest,
                );
                if (index !== -1) {
                  activeCarStore.toggleSirena();
                  activeMapStore.startQuestArrest();
                  activeMapStore.removeQuestCarByIndex(index);
                }
              }
            }}
          >
            Блокировать
          </button>
        )}
    </div>
  );
});
