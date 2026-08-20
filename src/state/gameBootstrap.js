import CarStore from "./carStore";
import MapStore from "./mapStore";
import { getDefaultMap, getMapById } from "./maps";
import garageStore from "./garageStore";

export function createGameStores({
  mapId = getDefaultMap().id,
  gameMode = "free",
} = {}) {
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 768;
  const carConfig = garageStore.getResolvedPlayerCar(
    viewportWidth,
    viewportHeight,
  );
  const mapConfig = getMapById(mapId);

  const carStore = new CarStore(carConfig);
  const mapStore = new MapStore(mapConfig);
  mapStore.carStore = carStore;
  mapStore.gameMode = gameMode;
  carStore.mapStore = mapStore;
  carStore.gameMode = gameMode;
  carStore.resetSessionHelp();

  return { carStore, mapStore };
}
