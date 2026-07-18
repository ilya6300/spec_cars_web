import React from "react";
import { observer } from "mobx-react-lite"; // Подключаем observer для обновления в реальном времени


// Оборачиваем в observer, чтобы React перерисовывал компонент при изменении carStore.fuel
export const Bensin = observer(({ carStore }) => {
  return (
    <div className="bensin-container">
      <div 
        className={`canister ${((carStore.fuel / carStore.maxFuel) * 100) < 5 ? "blink-red" : ""}`}
        style={{
          background: `linear-gradient(to top, #c3bf12bd ${Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100)}%, #737373bd ${Math.min(Math.max((carStore.fuel / carStore.maxFuel) * 100, 0), 100)}%)`
        }}
      >
        <span className="fuel-text">
          {Math.floor(carStore.fuel / 1000)}л
        </span>
      </div>
    </div>
  );
});
