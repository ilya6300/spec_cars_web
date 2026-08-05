/**
 * Один тик игрового кадра: физика машины → мир → светофор/квесты → туториал.
 */
export function tickGameFrame({
  carStore,
  mapStore,
  viewportWidth,
  deltaTime,
  tutorialStore = null,
}) {
  carStore.updatePhysics(deltaTime);
  mapStore.advance(carStore.currentSpeed, deltaTime);
  carStore.checkTrafficLight(mapStore);
  mapStore.tickWorld(carStore, deltaTime, viewportWidth);
  tutorialStore?.tick(deltaTime, carStore, mapStore);
}
