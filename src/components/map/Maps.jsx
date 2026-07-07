import React from "react";
import Objects from "../../state/objects"; // Импортируем путь к белой линии

export const Maps = ({ map, distance }) => {
  return (
    <div
      className="game-map"
      style={{
        backgroundImage: `url(${map.url})`,
        // Если сама текстура карты тоже должна двигаться, раскомментируйте строку ниже:
        // backgroundPositionX: `-${distance}px`
      }}
    >
      {/* Слой с прерывистой разметкой */}
      <div
        className="road-line"
        style={{
          backgroundImage: `url(${Objects.white_line})`,
          // Отрицательное смещение двигает линию справа налево
          backgroundPositionX: `-${distance}px`,
        }}
      />
    </div>
  );
};
