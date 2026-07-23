import { observer } from "mobx-lite";
import React from "react";

export const CarModel = observer(({ carStore, typeBody }) => {
  return (
    // transform: translateY(-45%);
    <div
      className="car_container"
      style={{
        transform: typeBody === 0 ? "translateY(-50%)" : "translateY(-175%)",
      }}
    >
      <div className={carStore.sirena ? "sirena-car-on" : null}></div>
      <img src={carStore.urlBody} alt="Кузов" className="car-body" />
      <img
        src={carStore.urlShell}
        alt="Колесо"
        className="left-shell"
        style={{
          transform: `rotate(${carStore.wheelRotation}deg)`,
          bottom: "-11%",
        }}
      />
      <img
        src={carStore.urlShell}
        alt="Колесо"
        className="right-shell"
        style={{
          transform: `rotate(${carStore.wheelRotation}deg)`,
          bottom: "-11%",
        }}
      />
    </div>
  );
});
