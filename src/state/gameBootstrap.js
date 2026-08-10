import CarStore from "./carStore";
import MapStore from "./mapStore";
import { getCarById, getDefaultCar } from "./cars";
import { getMapById, getDefaultMap } from "./maps";

export function createGameStores({
  carId = getDefaultCar().id,
  mapId = getDefaultMap().id,
  gameMode = "free",
} = {}) {
  const carConfig = getCarById(carId);
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
