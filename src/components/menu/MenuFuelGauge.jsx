import React from "react";
import { loadFuel } from "../../state/persistence";

export function MenuFuelGauge({ maxFuel, carId, className = "" }) {
  const fuel = loadFuel(maxFuel, carId) ?? maxFuel;
  const fuelPercent = Math.min(
    Math.max((fuel / maxFuel) * 100, 0),
    100,
  );
  const liters = Math.floor(fuel / 1000);
  const isLow = fuelPercent < 5;
  const isWarning = fuelPercent < 25 && !isLow;

  return (
    <div
      className={`bensin-container ${className}`.trim()}
      data-type="menu-fuel-gauge"
    >
      <div
        className={`canister ${isLow ? "canister--low" : ""} ${isWarning ? "canister--warning" : ""}`}
        style={{ "--fuel-percent": `${fuelPercent}%` }}
        data-fuel-percent={Math.round(fuelPercent)}
      >
        {isLow && (
          <span className="canister-warning-icon" aria-hidden="true">
            !
          </span>
        )}
        <span className="fuel-text">{liters}л</span>
      </div>
    </div>
  );
}
