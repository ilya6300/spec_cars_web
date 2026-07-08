import React from "react";
import { observer } from "mobx-react-lite";
import Objects from "../../state/objects";
import { objectConfigs } from "../../state/objects";

export const Maps = observer(({ map, distance, carStore, onClickObject }) => {
  const activeObjects = map.activeObjects || [];
  const configMap = {};
  objectConfigs.forEach((c) => {
    configMap[c.type] = c;
  });

  return (
    <div
      className="game-map"
      style={{
        backgroundImage: `url(${map.url})`,
      }}
    >
      {/* Слой с прерывистой разметкой */}
      <div
        className="road-line"
        style={{
          backgroundImage: `url(${Objects.white_line})`,
          backgroundPositionX: `-${distance}px`,
        }}
      />

      {/* Слой с объектами окружения */}
      {activeObjects.map((obj) => {
        const config = configMap[obj.typeId];
        if (!config) return null;

        // Вычисляем экранную координату из мировой (аналог backgroundPositionX: -distance)
        const screenX = obj.worldX - distance;

        // Для светофора выбираем изображение по цвету
        const image =
          obj.typeId === "traffic_light"
            ? map.trafficLightColor === "red"
              ? Objects.trafficLightRed
              : Objects.trafficLightGreen
            : config.image;

        return (
          <div
            key={obj.uid}
            className="game-object"
            style={{
              backgroundImage: `url(${image})`,
              left: `${screenX}px`,
              bottom: "65%",
              zIndex: config.zIndex,
              width: `${config.width}px`,
              height: `${config.height}px`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClickObject(obj, config, map, carStore);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              const timeout = setTimeout(() => {
                if (config.onLongPress) {
                  config.onLongPress(obj, map, carStore);
                }
              }, 500);
              obj.longPressTimeout = timeout;
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
                obj.longPressTimeout = null;
              }
              // Останавливаем заправку при отпускании
              if (map.isRefueling) {
                map.stopRefueling();
              }
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
                obj.longPressTimeout = null;
              }
            }}
          />
        );
      })}
    </div>
  );
});
