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
  lastVisibleTime;

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
    this.lastVisibleTime = null;

    makeAutoObservable(this);
  }

  spawn(positionX, speed) {
    this.positionX = positionX;
    this.currentSpeed = speed;
    this.active = true;
  }

  updatePosition(deltaTime, policeSpeed) {
    const relativeSpeed = this.currentSpeed - policeSpeed;

    if (this.enemy) {
      this.positionX += relativeSpeed * deltaTime;
    } else {
      this.positionX -= relativeSpeed * deltaTime;
    }
  }

  updateVisibility(deltaTime, viewportWidth, distance) {
    const screenX = this.positionX - distance;
    const isOffScreen = this.enemy 
      ? screenX >= viewportWidth + 200 
      : screenX <= -200;

    if (!isOffScreen) {
      this.lastVisibleTime = null;
    } else if (this.lastVisibleTime === null) {
      this.lastVisibleTime = performance.now() / 1000;
    }

    if (isOffScreen && this.lastVisibleTime !== null) {
      const timeOffScreen = (performance.now() / 1000) - this.lastVisibleTime;
      if (timeOffScreen > 5) {
        this.active = false;
      }
    }

    return this.active;
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
