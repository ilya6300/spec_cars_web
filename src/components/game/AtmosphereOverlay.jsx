import React from "react";
import { observer } from "mobx-react-lite";
import atmosphereStore from "../../state/atmosphereStore";

export const AtmosphereOverlay = observer(() => {
  if (!atmosphereStore.isNight) return null;

  return (
    <div
      className="atmosphere-overlay game-night-overlay"
      data-type="atmosphere-overlay"
      aria-hidden="true"
    />
  );
});
