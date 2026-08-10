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
    this.zIndex = 1;
    this.width = 60;
    this.height = 100;
    this.minDistance = 50;
    this.maxDistance = 6000;
    this.initialSpawnDistance = config.initialSpawnDistance ?? 0;
  }
}

const TREE_DEFS = [
  { id: 1, type: "tree1", image: tree1Img, initialSpawnDistance: 350 },
  { id: 2, type: "tree2", image: tree2Img, initialSpawnDistance: 450 },
  { id: 3, type: "tree3", image: tree3Img, initialSpawnDistance: 750 },
];

const HUMAN_DEFS = [
  { id: 4, type: "human1", image: human1, initialSpawnDistance: 150 },
  { id: 5, type: "human2", image: human2, initialSpawnDistance: 50 },
  { id: 6, type: "human3", image: human3, initialSpawnDistance: 350 },
  { id: 7, type: "human4", image: human4, initialSpawnDistance: 550 },
  { id: 8, type: "human5", image: human5, initialSpawnDistance: 250 },
  { id: 9, type: "human6", image: human6, initialSpawnDistance: 180 },
  { id: 10, type: "human7", image: human7, initialSpawnDistance: 800 },
  { id: 11, type: "human8", image: human8, initialSpawnDistance: 100 },
  { id: 12, type: "human9", image: human9, initialSpawnDistance: 50 },
  { id: 13, type: "human10", image: human10, initialSpawnDistance: 550 },
  { id: 15, type: "human11", image: human11, initialSpawnDistance: 1000 },
  { id: 16, type: "human12", image: human12, initialSpawnDistance: 250 },
  { id: 17, type: "human13", image: human13, initialSpawnDistance: 80 },
  { id: 18, type: "human14", image: human14, initialSpawnDistance: 1950 },
  { id: 19, type: "human15", image: human15, initialSpawnDistance: 400 },
  { id: 20, type: "human16", image: human16, initialSpawnDistance: 200 },
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
