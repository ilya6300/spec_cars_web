import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import { Car } from "../car/Car";
import CarStore from "../../state/carStore";
import Cars from "../../state/cars";
import MapsStore from "../../state/maps";
import { Maps } from "../map/Maps";
import { Conntollers } from "../contollers/Conntollers";

export const Game = () => {
  const [activeCarStore] = useState(() => new CarStore(Cars.cars[0]));
  const [activeMapStore] = useState(MapsStore.maps[0]);

  // Состояние для хранения пройденного расстояния (в пикселях)
  const [distance, setDistance] = useState(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationFrameId;

    const gameLoop = (currentTime) => {
      // Считаем дельту времени в секундах
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // 1. Обновляем скорость и топливо внутри стора машины
      activeCarStore.updatePhysics(deltaTime);

      // 2. Рассчитываем, сколько пикселей проехала машина за этот кадр
      const pixelsMoved = activeCarStore.currentSpeed * deltaTime;

      // 3. Накапливаем пройденное расстояние для смещения фона
      setDistance((prev) => prev + pixelsMoved);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCarStore]);

  return (
    <div className="game-viewport">
      {/* Передаем пройденное расстояние в компонент карты */}
      <Maps map={activeMapStore} distance={distance} />
      <Car carStore={activeCarStore} />
      <Conntollers activeCarStore={activeCarStore} />
    </div>
  );
};
