import atmosphereStore from "./atmosphereStore";

/**
 * Один тик игрового кадра: физика машины → мир → светофор/квесты → туториал → режим.
 */
export function tickGameFrame({
  carStore,
  mapStore,
  viewportWidth,
  deltaTime,
  tutorialStore = null,
  modeStore = null,
}) {
  if (modeStore?.isPaused) return;

  const suppressDrivingBlocks =
    tutorialStore?.shouldSuppressDrivingBlocks(mapStore, viewportWidth) ??
    false;

  carStore.updatePhysics(deltaTime, { suppressDrivingBlocks });
  mapStore.advance(carStore.currentSpeed, deltaTime);
  carStore.checkTrafficLight(mapStore);
  mapStore.tickWorld(carStore, deltaTime, viewportWidth);
  tutorialStore?.tick(deltaTime, carStore, mapStore, viewportWidth);
  modeStore?.tick(deltaTime, carStore);
  atmosphereStore.tick(deltaTime, modeStore?.gameMode);
}
