import React, { useState, useEffect, useRef } from "react";
import { Car } from "../car/Car";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import MapsStore from "../../state/maps";
import MapStore from "../../state/mapStore";
import { Maps } from "../map/Maps";
import { Conntollers } from "../contollers/Conntollers";

export const Game = () => {
  const [activeCarStore] = useState(() => new CarStore(Cars.cars[0]));
  const [activeMapStore] = useState(() => {
    const store = new MapStore(MapsStore.maps[0]);
    store.carStore = activeCarStore;
    return store;
  });

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
      activeMapStore.spawnObjects(viewportWidthRef.current);
      activeMapStore.despawnObjects();
      activeMapStore.triggerAppearEvents(activeCarStore);
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
      <Maps
        map={activeMapStore}
        distance={distance}
        carStore={activeCarStore}
        onClickObject={handleObjectClick}
      />
      <Car carStore={activeCarStore} />
      <Conntollers activeCarStore={activeCarStore} />
    </div>
  );
};
