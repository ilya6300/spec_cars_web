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

  return (
    <div className="car-ui" data-type="car">
      <div className="header_interface">
        {/* <h3>{name}</h3> */}
      <Bensin carStore={carStore}/>
      <div>
      <p>Скорость: {Math.round(currentSpeed * Cars.speedMultiplierUI)} км/ч</p>
      <p>Пройдено: {(distanceMeters / 1000).toFixed(3)} км</p>
      <p>Счётчик помощи: {countHelp}</p></div>
      </div>
      <CarModel carStore={carStore} typeBody={0} />
    </div>
  );
});
