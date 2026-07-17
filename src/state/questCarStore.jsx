import { makeAutoObservable } from "mobx";

class QuestCarStore {
  id;
  type;
  name;
  urlBody;
  urlShell;
  maxSpeed;
  minSpeed;
  enemy;
  speedMultiplier;
  currentSpeed;
  positionX;
  active;
  wheelRotation;

  constructor(carData) {
    this.id = carData.id;
    this.type = carData.type;
    this.name = carData.name;
    this.urlBody = carData.urlBody;
    this.urlShell = carData.urlShell;
    this.maxSpeed = carData.maxSpeed;
    this.minSpeed = carData.minSpeed;
    this.enemy = carData.enemy || false;
    this.speedMultiplier = carData.speedMultiplier || 1;
    this.currentSpeed = (this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)) * this.speedMultiplier;
    this.positionX = 0;
    this.active = true;
    this.wheelRotation = 0;

    makeAutoObservable(this);
  }

  spawn(positionX, speed) {
    this.positionX = positionX;
    this.currentSpeed = speed;
    this.active = true;
  }

  updatePosition(deltaTime, policeSpeed) {
    const relativeSpeed = this.currentSpeed - policeSpeed;
    this.positionX += relativeSpeed * deltaTime;
  }

  updateWheelRotation(deltaTime) {
    this.wheelRotation += this.currentSpeed * deltaTime * 5;
    this.wheelRotation %= 360;
  }

  deactivate() {
    this.active = false;
  }
}

export default QuestCarStore;
