import React from "react";
// 1. Правильный импорт для функциональных компонентов
import { observer } from "mobx-react-lite";
import { CarModel } from "./CarModel";
import Cars from "../../state/cars";
import { Bensin } from "./Bensin";

// 2. Оборачиваем компонент в observer и принимаем store через props
export const Car = observer(({ carStore }) => {
  // Деструктуризация для удобства (все свойства остаются реактивными!)
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

  // Рассчитываем текущую скорость для UI
  const displaySpeed = Math.round(currentSpeed * Cars.speedMultiplierUI);

  // Настройки для полусферы (180 градусов обзора)
  const maxSpeedForGauge = 140;
  const minAngle = -90; // Левый край полусферы (0 км/ч)
  const maxAngle = 90; // Правый край полусферы (140 км/ч)

  // Ограничиваем скорость в диапазоне от 0 до 140
  const boundedSpeed = Math.max(0, Math.min(displaySpeed, maxSpeedForGauge));

  // Вычисляем угол поворота стрелки от -90 до +90 градусов
  const angleRange = maxAngle - minAngle;
  const targetAngle = minAngle + (boundedSpeed / maxSpeedForGauge) * angleRange;

  // Массив для генерации делений и цифр через каждые 20 км/ч
  const speedTicks = [0, 20, 40, 60, 80, 100, 120, 140];

  return (
    <div className="car-ui" data-type="car">
      {/* Стили для увеличенного в 2 раза полукруглого спидометра */}
      <style>{`
        .header_interface {
          display: flex;
          align-items: center;
          gap: 30px;
          background: rgba(255, 255, 255, 0.2);
          padding: 25px 20px 15px 20px;
          border-radius: 12px;
          color: #000;
          font-family: Arial, sans-serif;
        }
        /* Контейнер для спидометра (Размеры увеличены х2) */
        .speedometer-container {
          position: relative;
          width: 110px;
          height: 55px;
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }
        /* Сама полусфера (Размеры увеличены х2) */
        .speedometer-gauge {
          position: absolute;
          bottom: 0;
          width: 110px;
          height: 55px; /* Половина от полной высоты круга */
          border: 1px solid #333;
          border-bottom: none;
          border-top-left-radius: 70px;
          border-top-right-radius: 70px;
          background: #fff;
        }
        /* Стрелка спидометра (Длина увеличена х2) */
        .speedometer-arrow {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 3px;
          height: 50px;
          background: #ff0000;
          transform-origin: bottom center;
          transition: transform 0.1s ease-out;
          z-index: 4;
        }
        /* Центральная точка (Размеры увеличены х2) */
        .speedometer-center {
          position: absolute;
          bottom: -6px;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #333;
          border-radius: 50%;
          transform: translateX(-50%);
          z-index: 6;
        }
        /* Цифры текущей реальной скорости ЗА стрелкой */
        .speedometer-digital-display {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          font-weight: bold;
          color: #333;
          z-index: 5;
          text-align: center;
          pointer-events: none;
        }
        /* Контейнер для вращения черточки деления (Высота увеличена х2) */
        .gauge-tick-wrapper {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 70px; /* Совпадает с новым радиусом полусферы */
          transform-origin: bottom center;
        }
        /* Сама черточка деления (Размеры увеличены х2) */
        .gauge-tick-line {
          position: absolute;
          top: 0;
          left: -1px;
          width: 3px;
          height: 12px;
          background: #333;
          display:none;
        }
        /* Контейнер для вращения текста (Высота увеличена х2) */
        .gauge-label-wrapper {
  position: absolute;
    bottom: 5px;
    left: 50%;
    width: 0;
    height: 50px;
    z-index: 999;
    transform-origin: bottom center;
        }
        /* Сама цифра скорости (Размер шрифта увеличен х2) */
        .gauge-label-text {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .text-stats p {
          margin: 4px 0;
          font-size: 16px;
        }
      `}</style>

      <div className="header_interface">
        <Bensin carStore={carStore} />

        {/* Полукруглый спидометр с делениями */}
        <div className="speedometer-container">
          {/* Генерация делений и цифр */}
          {speedTicks.map((tickValue) => {
            // Вычисляем индивидуальный угол для каждого деления от -90 до +90 градусов
            const tickAngle =
              minAngle + (tickValue / maxSpeedForGauge) * angleRange;

            return (
              <React.Fragment key={tickValue}>
                {/* Короткая черточка деления на шкале */}
                <div
                  className="gauge-tick-wrapper"
                  style={{ transform: `rotate(${tickAngle}deg)` }}
                >
                  <div className="gauge-tick-line" />
                </div>

                {/* Цифра над делением */}
                <div
                  className="gauge-label-wrapper"
                  style={{ transform: `rotate(${tickAngle}deg)` }}
                >
                  <div
                    className="gauge-label-text"
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

          {/* Подложка полусферы, стрелка и цифровой дисплей */}
          <div className="speedometer-gauge">
            {/* Реальная цифровая скорость за стрелкой */}
            <div className="speedometer-digital-display">
              {displaySpeed}
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  marginTop: "-2px",
                }}
              >
                км/ч
              </div>
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

        {/* Текстовая статистика */}
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
