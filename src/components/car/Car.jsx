import React from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "./CarModel";
import Cars from "../../state/cars";
import { Bensin } from "./Bensin";

export const Car = observer(({ carStore }) => {
  const {
    name,
    currentSpeed,
    fuel,
    urlBody,
    urlShell,
    wheelRotation,
    distanceMeters,
    countHelp,
  } = carStore;

  const displaySpeed = Math.round(currentSpeed * Cars.speedMultiplierUI);

  const maxSpeedForGauge = 140;
  const minAngle = -90;
  const maxAngle = 90;

  const boundedSpeed = Math.max(0, Math.min(displaySpeed, maxSpeedForGauge));

  const angleRange = maxAngle - minAngle;
  const targetAngle = minAngle + (boundedSpeed / maxSpeedForGauge) * angleRange;

  const speedTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];

  const speedColor = displaySpeed <= 80
    ? "#ffffff"
    : displaySpeed <= 120
      ? "#ffb400"
      : "#ff3a3a";

  return (
    <div className="car-ui" data-type="car">
      <style>{`
        .header_interface {
          display: flex;
          align-items: center;
          gap: 30px;
          color: #ffffff;
        }
        @media (min-width: 901px) {
          .header_interface {
            background: rgba(18,18,18,.72);
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 16px;
            padding: 20px 30px;
            box-shadow: 0 12px 30px rgba(0,0,0,.55);
          }
        }
        .text-stats p {
          margin: 4px 0;
          font-size: 14px;
          font-family: 'Rajdhani', sans-serif;
          color: #cccccc;
        }
        .speedometer-container {
          position: relative;
          width: 120px;
          height: 60px;
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }
        .speedometer-gauge {
          position: absolute;
          bottom: 0;
          width: 120px;
          height: 60px;
          border: 1px solid rgba(255,255,255,.12);
          border-bottom: none;
          border-top-left-radius: 75px;
          border-top-right-radius: 75px;
          background: linear-gradient(180deg, rgba(35,35,35,.95), rgba(10,10,10,.98));
          box-shadow:
            0 0 25px rgba(0,0,0,.6),
            inset 0 2px 8px rgba(255,255,255,.08),
            inset 0 -10px 20px rgba(0,0,0,.7);
        }
        .speedometer-arrow {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 4px;
          height: 55px;
          background: linear-gradient(90deg, #d8d8d8, #ffffff, #bcbcbc);
          border-radius: 4px;
          transform-origin: bottom center;
          transition: transform 0.22s cubic-bezier(.2,.9,.1,1);
          z-index: 4;
          box-shadow: 0 0 10px rgba(255,60,60,.6);
        }
        .speedometer-arrow::after {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #ff3a3a;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255,60,60,.8);
        }
        .speedometer-center {
          position: absolute;
          bottom: -6px;
          left: 50%;
          width: 14px;
          height: 14px;
          background: radial-gradient(circle, #ffffff 0%, #d9d9d9 35%, #555 70%, #222 100%);
          border-radius: 50%;
          transform: translateX(-50%);
          z-index: 6;
          box-shadow: 0 0 12px rgba(255,255,255,.15);
        }
        .speedometer-digital-display {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          color: #ffffff;
          z-index: 5;
          text-align: center;
          pointer-events: none;
        }
        .speed-value {
          font-size: 32px;
          letter-spacing: 2px;
          display: block;
          line-height: 1;
        }
        .speed-unit {
          font-size: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-top: 2px;
          color: #aaaaaa;
        }
        .gauge-tick-wrapper {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 75px;
          transform-origin: bottom center;
        }
        .gauge-tick-line {
          position: absolute;
          top: 0;
          left: -1px;
          width: 2px;
          height: 14px;
          background: #ffffff;
        }
        .gauge-tick-line--short {
          height: 8px;
          width: 1px;
          left: -0.5px;
        }
        .gauge-tick-line--red {
          background: #ff3a3a;
        }
        .gauge-label-wrapper {
          position: absolute;
          bottom: 5px;
          left: 50%;
          width: 0;
          height: 55px;
          z-index: 999;
          transform-origin: bottom center;
        }
        .gauge-label-text {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 7px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
        }
        .bensin-container {
          display: flex;
          align-items: center;
        }
        .canister {
          position: relative;
          width: 36px;
          height: 48px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(30,30,30,.6);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fuel-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: calc(var(--fuel-percent) * 1%);
          background: linear-gradient(to top, var(--fuel-color), color-mix(in srgb, var(--fuel-color) 70%, white));
          transition: height 0.3s ease;
        }
        .canister-glare {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background: linear-gradient(to bottom, rgba(255,255,255,.12), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .canister-shadow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30%;
          background: linear-gradient(to top, rgba(0,0,0,.3), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .fuel-text {
          position: relative;
          z-index: 3;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 1px 3px rgba(0,0,0,.8);
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 5px rgba(239,68,68,.4); }
          50% { box-shadow: 0 0 20px rgba(239,68,68,.8); }
        }
        .canister--critical {
          animation: pulse 1s infinite;
        }
      `}</style>

      <div className="header_interface">
        <Bensin carStore={carStore} />

        <div className="speedometer-container">
          {speedTicks.map((tickValue) => {
            const tickAngle =
              minAngle + (tickValue / maxSpeedForGauge) * angleRange;

            const isLong = tickValue % 20 === 0;
            const isRed = tickValue >= 120;
            const tickClassName = [
              "gauge-tick-line",
              !isLong && "gauge-tick-line--short",
              isRed && "gauge-tick-line--red",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <React.Fragment key={tickValue}>
                <div
                  className="gauge-tick-wrapper"
                  style={{ transform: `rotate(${tickAngle}deg)` }}
                >
                  <div
                    className={tickClassName}
                    style={{ color: speedColor }}
                  />
                </div>

                <div
                  className="gauge-label-wrapper"
                  style={{ transform: `rotate(${tickAngle}deg)` }}
                >
                  <div
                    className="gauge-label-text"
                    style={{
                      color: speedColor,
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
            <div className="speedometer-digital-display" style={{ color: speedColor }}>
              <span className="speed-value">{displaySpeed}</span>
              <span className="speed-unit">KM/H</span>
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

        <div className="text-stats">
          <p>Скорость: {displaySpeed} км/ч</p>
          <p>Пройдено: {(distanceMeters / 1000).toFixed(3)} км</p>
          <p>Счётчик помощи: {countHelp}</p>
        </div>
      </div>

      <CarModel carStore={carStore} typeBody={0} />
    </div>
  );
});
