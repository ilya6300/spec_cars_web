import house1 from "../assets/objects/house_1.png";
import gasStation from "../assets/objects/gas_station.png";
import trafficLightRed from "../assets/objects/traffic_light_red.png";
import trafficLightGreen from "../assets/objects/traffic_light_green.png";
import whiteLine from "../assets/objects/road_white_line.png";

class ObjectsClass {
  white_line = whiteLine;
  trafficLightRed = trafficLightRed;
  trafficLightGreen = trafficLightGreen;
}

export class ObjectConfig {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.image = config.image;
    this.zIndex = config.zIndex;
    this.width = config.width;
    this.height = config.height;
    this.minDistance = config.minDistance;
    this.maxDistance = config.maxDistance;
    this.onClick = config.onClick;
    this.onLongPress = config.onLongPress;
    this.onAppear = config.onAppear;
  }
}

const buildings = new ObjectConfig({
  id: "building",
  type: "building",
  image: house1,
  zIndex: 1,
  width: 300,
  height: 300,
  minDistance: 400,
  maxDistance: 3000,
  onClick: (obj, mapStore, carStore) => {
    /* ничего */
  },
  onLongPress: (obj, mapStore, carStore) => {
    /* ничего */
  },
  onAppear: (obj, mapStore, carStore) => {
    /* ничего */
  },
});

const gasStationObj = new ObjectConfig({
  id: "gas_station",
  type: "gas_station",
  image: gasStation,
  zIndex: 2,
  width: 180,
  height: 200,
  minDistance: 2000,
  maxDistance: 5000,
  onClick: (obj, mapStore, carStore) => {
    mapStore.refuelCar(10);
  },
  onLongPress: (obj, mapStore, carStore) => {
    mapStore.startRefueling();
  },
  onAppear: (obj, mapStore, carStore) => {
    /* ничего */
  },
});

const trafficLightObj = new ObjectConfig({
  id: "traffic_light",
  type: "traffic_light",
  image: null,
  zIndex: 2,
  width: 80,
  height: 160,
  minDistance: 3000,
  maxDistance: 6000,
  onClick: (obj, mapStore, carStore) => {
    /* ничего */
  },
  onLongPress: (obj, mapStore, carStore) => {
    /* ничего */
  },
  onAppear: (obj, mapStore, carStore) => {
    if (mapStore.trafficLightColor === "red" && !carStore.isSirenOn) {
      carStore.forceStop();
    }
  },
});

const objectConfigs = [buildings, gasStationObj, trafficLightObj];

const Objects = new ObjectsClass();
export default Objects;
export { objectConfigs };
