import { observer } from "mobx-lite";
import React from "react";

export const CarModel = observer(({ carStore, typeBody, showHeadlights = false }) => {
  const containerClass =
    typeBody === 1
      ? "car_container car_container--nested"
      : "car_container car_container--player";

  return (
    <div
      className={`${containerClass}${showHeadlights ? " car_container--headlights" : ""}`}
    >
      {showHeadlights && <div className="car-headlight-beam" aria-hidden="true" />}
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
