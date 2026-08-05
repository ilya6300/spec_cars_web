import CarStore from "./carStore";
import MapStore from "./mapStore";
import { getCarById, getDefaultCar } from "./cars";
import { getMapById, getDefaultMap } from "./maps";

export function createGameStores({
  carId = getDefaultCar().id,
  mapId = getDefaultMap().id,
} = {}) {
  const carConfig = getCarById(carId);
  const mapConfig = getMapById(mapId);

  const carStore = new CarStore(carConfig);
  const mapStore = new MapStore(mapConfig);
  mapStore.carStore = carStore;
  carStore.mapStore = mapStore;
  carStore.resetSessionHelp();

  return { carStore, mapStore };
}
