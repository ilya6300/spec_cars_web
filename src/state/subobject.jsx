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
  }
}

const getDataSubObects = () => {
  dataObjectsSub.push(
    new ObjectConfigTree({ id: 1, type: "tree1", image: tree1Img }),
    new ObjectConfigTree({ id: 2, type: "tree2", image: tree2Img }),
    new ObjectConfigTree({ id: 3, type: "tree3", image: tree3Img }),
    new ObjectConfigHuman({ id: 4, type: "human1", image: human1 }),
    new ObjectConfigHuman({ id: 5, type: "human2", image: human2 }),
    new ObjectConfigHuman({ id: 6, type: "human3", image: human3 }),
    new ObjectConfigHuman({ id: 7, type: "human4", image: human4 }),
    new ObjectConfigHuman({ id: 8, type: "human5", image: human5 }),
    new ObjectConfigHuman({ id: 9, type: "human6", image: human6 }),
    new ObjectConfigHuman({ id: 10, type: "human7", image: human7 }),
    new ObjectConfigHuman({ id: 11, type: "human8", image: human8 }),
    new ObjectConfigHuman({ id: 12, type: "human9", image: human9 }),
    new ObjectConfigHuman({ id: 13, type: "human10", image: human10 }),
    new ObjectConfigHuman({ id: 15, type: "human11", image: human11 }),
    new ObjectConfigHuman({ id: 16, type: "human12", image: human12 }),
    new ObjectConfigHuman({ id: 17, type: "human13", image: human13 }),
    new ObjectConfigHuman({ id: 18, type: "human14", image: human14 }),
    new ObjectConfigHuman({ id: 19, type: "human15", image: human15 }),
    new ObjectConfigHuman({ id: 20, type: "human16", image: human16 }),
  );
};

export { getDataSubObects, dataObjectsSub };
