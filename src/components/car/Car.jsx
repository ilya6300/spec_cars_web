import React from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "./CarModel";
import { Bensin } from "./Bensin";
import { HelpBadges } from "./HelpBadges";
import Cars from "../../state/cars";

export const Car = observer(({ carStore, showHeadlights = false }) => {
  const { currentSpeed, distanceMeters } = carStore;

  const displaySpeed = Math.round(currentSpeed * Cars.speedMultiplierUI);

  const maxSpeedForGauge = 140;
  const minAngle = -90;
  const maxAngle = 90;

  const boundedSpeed = Math.max(0, Math.min(displaySpeed, maxSpeedForGauge));
  const angleRange = maxAngle - minAngle;
  const targetAngle = minAngle + (boundedSpeed / maxSpeedForGauge) * angleRange;

  const speedTicks = [0, 20, 40, 60, 80, 100, 120, 140];

  return (
    <div className="car-ui" data-type="car">
      <div className="hud-panel" data-type="hud-panel">
        <div className="hud-panel__main">
          <Bensin carStore={carStore} />

          <div className="speedometer-container">
            {speedTicks.map((tickValue) => {
              const tickAngle =
                minAngle + (tickValue / maxSpeedForGauge) * angleRange;

              return (
                <React.Fragment key={tickValue}>
                  <div
                    className="gauge-tick-wrapper"
                    style={{ transform: `rotate(${tickAngle}deg)` }}
                  >
                    <div className="gauge-tick-line" />
                  </div>
                  <div
                    className="gauge-label-wrapper"
                    style={{ transform: `rotate(${tickAngle}deg)` }}
                  >
                    <div
                      className={`gauge-label-text${tickValue % 40 === 0 ? " gauge-label-text--major" : ""}`}
                      style={{
                        transform: `translateX(-50%) rotate(${-tickAngle}deg)`,
                      }}
                    >
                      {tickValue}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            <div className="speedometer-gauge">
              <div className="speedometer-digital-display">
                {displaySpeed}
                <div className="speedometer-unit">км/ч</div>
              </div>
              <div
                className="speedometer-arrow"
                style={{
                  transform: `translateX(-50%) rotate(${targetAngle}deg)`,
                }}
              />
              <div className="speedometer-center" />
            </div>
          </div>

          <div className="hud-panel__stats">
            <p className="hud-distance" data-type="hud-distance">
              <span className="hud-distance__label">Пройдено: </span>
              <span className="hud-distance__value">
                {(distanceMeters / 1000).toFixed(3)} км
              </span>
            </p>
            <HelpBadges carStore={carStore} />
          </div>
        </div>
      </div>

      <CarModel
        carStore={carStore}
        variant="player"
        showHeadlights={showHeadlights}
      />
    </div>
  );
});
