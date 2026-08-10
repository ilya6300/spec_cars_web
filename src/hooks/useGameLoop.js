import { useEffect, useRef } from "react";
import { tickGameFrame } from "../state/gameSession";

export function useGameLoop(
  carStore,
  mapStore,
  viewportWidthRef,
  tutorialStore,
  modeStore,
) {
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationFrameId;
    let running = true;

    const gameLoop = (currentTime) => {
      if (!running) return;

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      tickGameFrame({
        carStore,
        mapStore,
        viewportWidth: viewportWidthRef.current,
        deltaTime,
        tutorialStore,
        modeStore,
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [carStore, mapStore, viewportWidthRef, tutorialStore, modeStore]);
}
