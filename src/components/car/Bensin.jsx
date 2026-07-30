import React from "react";
import { observer } from "mobx-react-lite";

export const Bensin = observer(({ carStore }) => {
  const fuelPercent = Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100);

  const fuelColor = fuelPercent > 20
    ? "#4ade80"
    : fuelPercent > 10
      ? "#f59e0b"
      : "#ef4444";

  const isCritical = fuelPercent <= 5;

  return (
    <div className="bensin-container">
      <div
        className={`canister ${isCritical ? "canister--critical" : ""}`}
        style={{ "--fuel-percent": fuelPercent, "--fuel-color": fuelColor }}
      >
        <div className="fuel-fill" />
        <div className="canister-glare" />
        <div className="canister-shadow" />
        <span className="fuel-text">
          {Math.floor(carStore.fuel / 1000)}л
        </span>
      </div>
    </div>
  );
});
