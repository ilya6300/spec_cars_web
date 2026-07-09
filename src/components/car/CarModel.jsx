import { observer } from "mobx-lite";
import React from "react";

export const CarModel = observer(({ carStore }) => {
  return (
    <div className="car_container">
      <div className={carStore.sirena ? "sirena-car-on" : null}></div>
      <img src={carStore.urlBody} alt="Кузов" className="car-body" />
      <img
        src={carStore.urlShell}
        alt="Колесо"
        className="left-shell"
        style={{ transform: `rotate(${carStore.wheelRotation}deg)` }}
      />
      <img
        src={carStore.urlShell}
        alt="Колесо"
        className="right-shell"
        style={{ transform: `rotate(${carStore.wheelRotation}deg)` }}
      />
    </div>
  );
});
