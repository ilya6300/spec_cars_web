import React from "react";
import { observer } from "mobx-react-lite";
import Objects, { objectConfigByType } from "../../state/objects";
import { isNightChaseContext } from "../../state/modeScoring";

export const Maps = observer(({ map, carStore, onClickObject }) => {
  const activeObjects = map.activeObjects || [];
  const scrollX = map.offsetX;

  return (
    <div
      className="game-map"
      style={{
        backgroundImage: `url(${map.url})`,
      }}
    >
      <div
        className="road-line"
        style={{
          backgroundImage: `url(${Objects.white_line})`,
          backgroundPositionX: `-${scrollX}px`,
        }}
      />

      {activeObjects.map((obj) => {
        const config = objectConfigByType[obj.typeId];
        if (!config) return null;

        const screenX = obj.worldX - scrollX;

        const image =
          obj.typeId === "traffic_light"
            ? isNightChaseContext(map)
              ? Objects.trafficLightYellow
              : map.trafficLightColor === "red"
                ? Objects.trafficLightRed
                : Objects.trafficLightGreen
            : config.image;

        const isCollectibleStar = obj.typeId === "collectible_star";
        if (isCollectibleStar) return null;

        return (
          <div
            key={obj.uid}
            className="game-object"
            data-type={obj.typeId}
            data-uid={obj.uid}
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
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
              }
              obj.longPressTimeout = setTimeout(() => {
                config.onLongPress?.(obj, map, carStore);
              }, 500);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (obj.longPressTimeout) {
                clearTimeout(obj.longPressTimeout);
                obj.longPressTimeout = null;
              }
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
