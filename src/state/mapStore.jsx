import { makeAutoObservable, runInAction } from "mobx";

class MapStore {
  id = 0;
  name = "";
  url = "";

  // Текущее смещение дороги в пикселях
  offsetX = 0;

  constructor(mapData) {
    Object.assign(this, mapData);
    makeAutoObservable(this);
  }

  // Метод принимает скорость машины (px/сек) и дельту времени
  update(carSpeed, deltaTime) {
    runInAction(() => {
      // Сдвигаем фон влево навстречу машине
      this.offsetX += carSpeed * deltaTime;
    });
  }
}

export default MapStore;
