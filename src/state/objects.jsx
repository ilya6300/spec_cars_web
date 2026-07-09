import house1 from "../assets/objects/house_1.png";
import gasStation from "../assets/objects/gas_station.png";
import trafficLightRed from "../assets/objects/traffic_light_red.png";
import trafficLightGreen from "../assets/objects/traffic_light_green.png";
import whiteLine from "../assets/objects/road_white_line.png";
import { getDataSubObects, dataObjectsSub } from "./subobject";
// полиция
import humanAggr1Img from "../assets/objects/\police_quest/human_aggr1.png";
import humanAggr2Img from "../assets/objects/\police_quest/human_aggr2.png";
import humanAggr3Img from "../assets/objects/\police_quest/human_aggr3.png";

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

const objectConfigs = [];

const getPolicequest = () => {
  const humanAggr1Obj = new ObjectConfig({
    id: "human_aggr1",
    type: "human_aggr1",
    image: humanAggr1Img,
    zIndex: 2,
    width: 110,
    height: 100,
    minDistance: 3000,
    maxDistance: 6000,
    onClick: (obj, mapStore, carStore) => {
      console.log("Поймал", obj);
      /* ничего */
    },
    onLongPress: (obj, mapStore, carStore) => {
      /* ничего */
    },
    onAppear: () => {
      // Логика торможения перенесена в carStore.updatePhysics
      // и привязана к видимости светофора на экране
    },
  });

  objectConfigs.push(humanAggr1Obj);
};

const createDataObjects = () => {
  // Инициализируем lthtdmz при загрузке модуля
  getDataSubObects();
  getPolicequest();
  try {
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
      height: 100,
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
      onAppear: () => {
        // Логика торможения перенесена в carStore.updatePhysics
        // и привязана к видимости светофора на экране
      },
    });

    objectConfigs.push(buildings, gasStationObj, trafficLightObj);

    dataObjectsSub.forEach((tree) => {
      objectConfigs.push(tree);
    });
  } catch (e) {
    console.error(e);
  }
};

createDataObjects();

const Objects = new ObjectsClass();
export default Objects;
export { objectConfigs };
