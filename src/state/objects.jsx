import house1 from "../assets/objects/house_1.png";
import gasStation from "../assets/objects/gas_station.png";
import trafficLightRed from "../assets/objects/traffic_light_red.png";
import trafficLightGreen from "../assets/objects/traffic_light_green.png";
import trafficLightYellow from "../assets/objects/traffic_light_yellow.png";
import trafficLightRedQuestHuman from "../assets/objects/traffic_light_red_quest_human.png";
import trafficLightGreenQuestHuman from "../assets/objects/traffic_light_green_quest_human.png";
import {
  QUEST_CROSSING_HEIGHT_DESKTOP,
  QUEST_CROSSING_TYPE,
  QUEST_CROSSING_WIDTH_DESKTOP,
  QUEST_CROSSING_Z_INDEX,
} from "./questCrossingConstants";
import { PEDESTRIAN_QUEST_SPAWN_CHANCE } from "./event.config";
import whiteLine from "../assets/objects/road_white_line.png";
import { getDataSubObects, dataObjectsSub } from "./subobject";
import humanAggr1Img from "../assets/objects/\police_quest/human_aggr1.png";
import humanAggr2Img from "../assets/objects/\police_quest/human_aggr2.png";
import humanAggr3Img from "../assets/objects/\police_quest/human_aggr3.png";
import collectibleStarImg from "../assets/ui/collectible-star.svg";

class ObjectsClass {
  white_line = whiteLine;
  trafficLightRed = trafficLightRed;
  trafficLightGreen = trafficLightGreen;
  trafficLightYellow = trafficLightYellow;
  trafficLightRedQuestHuman = trafficLightRedQuestHuman;
  trafficLightGreenQuestHuman = trafficLightGreenQuestHuman;
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
    this.initialSpawnDistance = config.initialSpawnDistance ?? 0;
    this.onClick = config.onClick;
    this.onLongPress = config.onLongPress;
    this.onAppear = config.onAppear;
  }
}

const objectConfigs = [];

const POLICE_AGGRO_DEFS = [
  { type: "human_aggr1", image: humanAggr1Img, initialSpawnDistance: 17700 },
  { type: "human_aggr2", image: humanAggr2Img, initialSpawnDistance: 25000 },
  { type: "human_aggr3", image: humanAggr3Img, initialSpawnDistance: 10500 },
];

function createPoliceAggroConfig({ type, image, initialSpawnDistance }) {
  return new ObjectConfig({
    id: type,
    type,
    image,
    zIndex: 2,
    width: 110,
    height: 100,
    minDistance: 8000,
    maxDistance: 40000,
    initialSpawnDistance,
    onClick: (obj, mapStore, carStore) => {
      carStore.releaseGas();
      mapStore.startQuest(obj);
      carStore.toggleSirena();
    },
    onLongPress: () => {
      /* ничего */
    },
    onAppear: () => {
      // Логика торможения перенесена в carStore.updatePhysics
    },
  });
}

const getPolicequest = () => {
  POLICE_AGGRO_DEFS.forEach((def) => {
    objectConfigs.push(createPoliceAggroConfig(def));
  });
};

const createDataObjects = () => {
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
      maxDistance: 11000,
      initialSpawnDistance: 0,
      onClick: () => {
        /* ничего */
      },
      onLongPress: () => {
        /* ничего */
      },
      onAppear: () => {
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
      minDistance: 10000,
      maxDistance: 30000,
      initialSpawnDistance: 30000,
      onClick: (obj, mapStore) => {
        mapStore.refuelCar(10);
      },
      onLongPress: (obj, mapStore) => {
        mapStore.startRefueling();
      },
      onAppear: () => {
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
      minDistance: 3500,
      maxDistance: 8000,
      initialSpawnDistance: 8000,
      onClick: () => {
        /* ничего */
      },
      onLongPress: () => {
        /* ничего */
      },
      onAppear: () => {
        // Логика торможения перенесена в carStore.updatePhysics
      },
    });

    const trafficLightQuestCrossingObj = new ObjectConfig({
      id: QUEST_CROSSING_TYPE,
      type: QUEST_CROSSING_TYPE,
      image: null,
      zIndex: QUEST_CROSSING_Z_INDEX,
      width: QUEST_CROSSING_WIDTH_DESKTOP,
      height: QUEST_CROSSING_HEIGHT_DESKTOP,
      minDistance: 3500,
      maxDistance: 8000,
      initialSpawnDistance: 12000,
      onClick: () => {
        /* ничего */
      },
      onLongPress: () => {
        /* ничего */
      },
      onAppear: (objData, mapStore) => {
        if (Math.random() >= PEDESTRIAN_QUEST_SPAWN_CHANCE) return "skip";
        const obj = mapStore.activeObjects.find((entry) => entry.uid === objData.uid);
        if (!obj) return "skip";
        return mapStore.initQuestCrossing(obj) ? "done" : "retry";
      },
    });

    objectConfigs.push(
      buildings,
      gasStationObj,
      trafficLightObj,
      trafficLightQuestCrossingObj,
    );

    const collectibleStarObj = new ObjectConfig({
      id: "collectible_star",
      type: "collectible_star",
      image: collectibleStarImg,
      zIndex: 2,
      width: 48,
      height: 48,
      minDistance: 15000,
      maxDistance: 25000,
      initialSpawnDistance: 20000,
      onClick: () => {},
      onLongPress: () => {},
      onAppear: () => {},
    });

    objectConfigs.push(collectibleStarObj);

    dataObjectsSub.forEach((tree) => {
      objectConfigs.push(tree);
    });
  } catch (e) {
    console.error(e);
  }
};

createDataObjects();

/** Карта type → config, строится один раз при загрузке модуля */
export const objectConfigByType = Object.fromEntries(
  objectConfigs.map((config) => [config.type, config]),
);

export function buildInitialNextSpawnDistances(configs = objectConfigs) {
  return Object.fromEntries(
    configs.map((config) => [config.type, config.initialSpawnDistance ?? 0]),
  );
}

const Objects = new ObjectsClass();
export default Objects;
export { objectConfigs };
