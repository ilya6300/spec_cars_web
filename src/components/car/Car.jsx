import React from "react";
// 1. Правильный импорт для функциональных компонентов
import { observer } from "mobx-react-lite";

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

  return (
    <div className="car-ui">
      <h3>{name}</h3>
      <p>Скорость: {Math.round(currentSpeed / 7.5)} км/ч</p>
      <p>Топливо: {Math.round(fuel).toLocaleString("de-DE")} л.</p>
      <p>Пройдено: {(distanceMeters / 1000).toFixed(3)} км</p>
      <p>Счётчик помощи: {countHelp}</p>
      {/* Отрендерим кузов автомобиля */}
      <div className="car_container">
        <div className={carStore.sirena ? "sirena-car-on" : null}></div>
        <img src={urlBody} alt="Кузов" className="car-body" />
        <img
          src={urlShell}
          alt="Колесо"
          className="left-shell"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        />
        <img
          src={urlShell}
          alt="Колесо"
          className="right-shell"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        />
      </div>
    </div>
  );
});
