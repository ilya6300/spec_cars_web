import React from "react";
import { observer } from "mobx-react-lite";
import atmosphereStore from "../../state/atmosphereStore";
import rainSvg from "../../assets/effects/rain.svg";

export const RainLayer = observer(() => {
  if (!atmosphereStore.isRainy) return null;

  return (
    <div
      className="game-rain-container"
      data-type="rain-layer"
      aria-hidden="true"
      style={{ "--rain-texture": `url(${rainSvg})` }}
    >
      <div className="game-rain game-rain--far" />
      <div className="game-rain game-rain--mid" />
      <div className="game-rain game-rain--near" />
    </div>
  );
});
