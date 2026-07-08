class stateApp {
  constructor() {
    makeAutoObservable(this);
  }
  distanceMetersFactor = 20;
  // traffic_light_red = false;

  // setTrafficLightRed(new_value) {
  //   runInAction(() => {
  //     this.traffic_light_red = new_value;
  //   });
  // }
}
export default stateApp;
