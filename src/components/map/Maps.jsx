import React from "react";

import { observer } from "mobx-react-lite";

import Objects, { objectConfigByType } from "../../state/objects";

import { isNightChaseContext } from "../../state/modeScoring";

import { isQuestCrossingType } from "../../state/questCrossingConstants";
import { isParkingZoneType } from "../../state/parkingZoneConstants";

import "../../style/quest_crossing_object.css";



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

        className="road-wet"

        data-type="road-wet"

        aria-hidden="true"

      />

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

            : isQuestCrossingType(obj.typeId)

              ? obj.questCrossing?.trafficLightGreen

                ? Objects.trafficLightGreenQuestHuman

                : Objects.trafficLightRedQuestHuman

              : config.image;



        const isCollectibleStar = obj.typeId === "collectible_star";

        if (isCollectibleStar) return null;

        if (isParkingZoneType(obj.typeId)) return null;



        const isQuestCrossing = isQuestCrossingType(obj.typeId);



        return (

          <div

            key={obj.uid}

            className={`game-object${isQuestCrossing ? " game-object--quest-crossing" : ""}`}

            data-type={obj.typeId}

            data-uid={obj.uid}

            style={{

              backgroundImage: `url(${image})`,

              left: `${screenX}px`,

              ...(isQuestCrossing

                ? {}

                : {

                    bottom: "65%",

                    zIndex: config.zIndex,

                    width: `${config.width}px`,

                    height: `${config.height}px`,

                  }),

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


