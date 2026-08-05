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

  carStore.updatePhysics(deltaTime);
  mapStore.advance(carStore.currentSpeed, deltaTime);
  carStore.checkTrafficLight(mapStore);
  mapStore.tickWorld(carStore, deltaTime, viewportWidth);
  tutorialStore?.tick(deltaTime, carStore, mapStore);
  modeStore?.tick(deltaTime, carStore);
}
