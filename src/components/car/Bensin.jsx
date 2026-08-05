import React from "react";
import { observer } from "mobx-react-lite";

export const Bensin = observer(({ carStore }) => {
  const fuelPercent = Math.min(
    Math.max((carStore.fuel / carStore.maxFuel) * 100, 0),
    100,
  );
  const liters = Math.floor(carStore.fuel / 1000);
  const isLow = fuelPercent < 5;
  const isWarning = fuelPercent < 25 && !isLow;

  return (
    <div className="bensin-container" data-type="fuel-gauge">
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
});
