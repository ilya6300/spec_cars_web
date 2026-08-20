import tree1Img from "../assets/objects/tree_1.png";
import tree2Img from "../assets/objects/tree_2.png";
import tree3Img from "../assets/objects/tree_3.png";
import human1 from "../assets/objects/\human/\human_1.png";
import human2 from "../assets/objects/\human/\human_2.png";
import human3 from "../assets/objects/\human/\human_3.png";
import human4 from "../assets/objects/\human/\human_4.png";
import human5 from "../assets/objects/\human/\human_5.png";
import human6 from "../assets/objects/\human/\human_6.png";
import human7 from "../assets/objects/\human/\human_7.png";
import human8 from "../assets/objects/\human/\human_8.png";
import human9 from "../assets/objects/\human/\human_9.png";
import human10 from "../assets/objects/\human/\human_10.png";
import human11 from "../assets/objects/\human/\human_11.png";
import human12 from "../assets/objects/\human/\human_12.png";
import human13 from "../assets/objects/\human/\human_13.png";
import human14 from "../assets/objects/\human/\human_14.png";
import human15 from "../assets/objects/\human/\human_15.png";
import human16 from "../assets/objects/\human/\human_16.png";
import {
  getPeacefulHumanInitialSpawnDistance,
  PEACEFUL_HUMAN_Z_INDEX,
  PEACEFUL_SPAWN_TIERS,
} from "./peacefulHumanSpawn";

const dataObjectsSub = [];

class ObjectConfigTree {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.image = config.image;
    this.zIndex = 1;
    this.width = 100;
    this.height = 170;
    this.minDistance = 50;
    this.maxDistance = 3000;
    this.initialSpawnDistance = config.initialSpawnDistance ?? 0;
  }
}

class ObjectConfigHuman {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.image = config.image;
    this.zIndex = PEACEFUL_HUMAN_Z_INDEX;
    this.width = 60;
    this.height = 100;
    const tier =
      PEACEFUL_SPAWN_TIERS[config.spawnTier] ?? PEACEFUL_SPAWN_TIERS.medium;
    this.minDistance = tier.minDistance;
    this.maxDistance = tier.maxDistance;
    const humanIndex = parseInt(config.type.replace("human", ""), 10) - 1;
    this.initialSpawnDistance = getPeacefulHumanInitialSpawnDistance(humanIndex);
  }
}

const TREE_DEFS = [
  { id: 1, type: "tree1", image: tree1Img, initialSpawnDistance: 350 },
  { id: 2, type: "tree2", image: tree2Img, initialSpawnDistance: 450 },
  { id: 3, type: "tree3", image: tree3Img, initialSpawnDistance: 750 },
];

const HUMAN_DEFS = [
  { id: 4, type: "human1", image: human1, spawnTier: "medium" },
  { id: 5, type: "human2", image: human2, spawnTier: "frequent" },
  { id: 6, type: "human3", image: human3, spawnTier: "medium" },
  { id: 7, type: "human4", image: human4, spawnTier: "rare" },
  { id: 8, type: "human5", image: human5, spawnTier: "medium" },
  { id: 9, type: "human6", image: human6, spawnTier: "medium" },
  { id: 10, type: "human7", image: human7, spawnTier: "rare" },
  { id: 11, type: "human8", image: human8, spawnTier: "frequent" },
  { id: 12, type: "human9", image: human9, spawnTier: "frequent" },
  { id: 13, type: "human10", image: human10, spawnTier: "rare" },
  { id: 15, type: "human11", image: human11, spawnTier: "rare" },
  { id: 16, type: "human12", image: human12, spawnTier: "medium" },
  { id: 17, type: "human13", image: human13, spawnTier: "frequent" },
  { id: 18, type: "human14", image: human14, spawnTier: "rare" },
  { id: 19, type: "human15", image: human15, spawnTier: "rare" },
  { id: 20, type: "human16", image: human16, spawnTier: "medium" },
];

const getDataSubObects = () => {
  TREE_DEFS.forEach((def) => {
    dataObjectsSub.push(new ObjectConfigTree(def));
  });
  HUMAN_DEFS.forEach((def) => {
    dataObjectsSub.push(new ObjectConfigHuman(def));
  });
};

export { getDataSubObects, dataObjectsSub };
