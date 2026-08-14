import { makeAutoObservable } from "mobx";
import {
  getNearestTrafficLightScreenX,
  getQuestCarFrontEdgePx,
  getTrafficLightGapToStop,
  POLICE_GEAR2_ACCELERATION,
  randomGreenResumeDelay,
  TRAFFIC_LIGHT_DETECT_GAP_PX,
  TRAFFIC_LIGHT_MAX_BRAKE,
  TRAFFIC_LIGHT_STOP_TOLERANCE_PX,
} from "./trafficLightConstants";

/** Минимальная relative-скорость мирной машины — не «прилипать» к полиции при совпадении скоростей */
const CIVILIAN_MIN_RELATIVE_SPEED = 25;

let questCarInstanceSeq = 0;

class QuestCarStore {
  uid;
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
  targetSpeed;
  positionX;
  active;
  wheelRotation;
  sirena;
  stoppedAtRedLight = false;
  greenResumeDelay = null;
  trafficLightResuming = false;

  constructor(carData) {
    this.uid = `quest_car_${questCarInstanceSeq++}`;
    this.id = carData.id;
    this.type = carData.type;
    this.name = carData.name;
    this.urlBody = carData.urlBody;
    this.urlShell = carData.urlShell;
    this.maxSpeed = carData.maxSpeed;
    this.minSpeed = carData.minSpeed;
    this.enemy = carData.enemy || false;
    this.speedMultiplier = carData.speedMultiplier || 1;
    this.currentSpeed =
      (this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)) *
      this.speedMultiplier;
    this.targetSpeed = this.currentSpeed;
    this.positionX = 0;
    this.active = true;
    this.wheelRotation = 0;
    this.sirena = false;

    makeAutoObservable(this);
  }

  spawn(positionX, speed) {
    this.positionX = positionX;
    this.currentSpeed = speed;
    this.targetSpeed = speed;
    this.active = true;
    this.stoppedAtRedLight = false;
    this.greenResumeDelay = null;
    this.trafficLightResuming = false;
  }

  resetTrafficLightState() {
    this.stoppedAtRedLight = false;
    this.greenResumeDelay = null;
    this.trafficLightResuming = false;
  }

  brakeForTrafficLight(approachRemaining, deltaTime) {
    if (approachRemaining <= TRAFFIC_LIGHT_STOP_TOLERANCE_PX) {
      this.currentSpeed = 0;
      return;
    }

    if (this.currentSpeed <= 0) {
      return;
    }

    const remaining = approachRemaining;
    const brakingDistance =
      (this.currentSpeed * this.currentSpeed) / (2 * TRAFFIC_LIGHT_MAX_BRAKE);
    const brakeMargin = 35;

    if (remaining > brakingDistance + brakeMargin) {
      return;
    }

    const requiredDecel =
      (this.currentSpeed * this.currentSpeed) / (2 * remaining);
    const deceleration = Math.min(requiredDecel, TRAFFIC_LIGHT_MAX_BRAKE);
    this.currentSpeed = Math.max(
      0,
      this.currentSpeed - deceleration * deltaTime,
    );
  }

  accelerateAfterTrafficLight(deltaTime) {
    if (this.currentSpeed >= this.targetSpeed) {
      this.trafficLightResuming = false;
      return;
    }

    this.currentSpeed = Math.min(
      this.targetSpeed,
      this.currentSpeed + POLICE_GEAR2_ACCELERATION * deltaTime,
    );

    if (this.currentSpeed >= this.targetSpeed) {
      this.trafficLightResuming = false;
    }
  }

  updateCivilianTrafficLight(deltaTime, mapStore) {
    if (this.enemy) return;

    if (!mapStore.trafficLightOnTheMap) {
      this.resetTrafficLightState();
      return;
    }

    const lightScreenX = getNearestTrafficLightScreenX(mapStore);
    if (lightScreenX === null) {
      this.resetTrafficLightState();
      return;
    }

    const viewportWidth = mapStore.lastViewportWidth ?? 1024;
    const frontEdge = getQuestCarFrontEdgePx(this.positionX, viewportWidth);
    const gapToLight = lightScreenX - frontEdge;
    const approachRemaining = getTrafficLightGapToStop(lightScreenX, frontEdge);

    if (
      gapToLight <= -80 ||
      gapToLight > TRAFFIC_LIGHT_DETECT_GAP_PX
    ) {
      this.resetTrafficLightState();
      return;
    }

    if (this.trafficLightResuming) {
      this.accelerateAfterTrafficLight(deltaTime);
      return;
    }

    if (mapStore.trafficLightColor === "red") {
      this.brakeForTrafficLight(approachRemaining, deltaTime);
      if (this.currentSpeed === 0) {
        this.stoppedAtRedLight = true;
        this.greenResumeDelay = null;
      }
      return;
    }

    if (mapStore.trafficLightColor === "green" && this.stoppedAtRedLight) {
      if (this.greenResumeDelay === null) {
        this.greenResumeDelay = randomGreenResumeDelay();
      }

      if (this.greenResumeDelay > 0) {
        this.greenResumeDelay -= deltaTime;
        this.currentSpeed = 0;
        return;
      }

      this.stoppedAtRedLight = false;
      this.greenResumeDelay = null;
      this.trafficLightResuming = true;
      this.accelerateAfterTrafficLight(deltaTime);
    }
  }

  updatePosition(deltaTime, policeSpeed) {
    let relativeSpeed = this.currentSpeed - policeSpeed;

    if (
      !this.enemy &&
      this.currentSpeed > 0 &&
      Math.abs(relativeSpeed) < CIVILIAN_MIN_RELATIVE_SPEED
    ) {
      relativeSpeed = -CIVILIAN_MIN_RELATIVE_SPEED;
    }

    this.positionX += relativeSpeed * deltaTime;
  }

  updateWheelRotation(deltaTime) {
    this.wheelRotation += this.currentSpeed * deltaTime * 2.5;
    this.wheelRotation %= 360;
  }

  deactivate() {
    this.active = false;
  }
}

export default QuestCarStore;
