import React from "react";

import { observer } from "mobx-react-lite";

import Objects, { objectConfigByType } from "../../state/objects";

import {
  isNightChaseContext,
  isPeacefulHumanType,
} from "../../state/modeScoring";
import { getPeacefulIdleAnimationStyle } from "../../state/peacefulHumanIdle";
import { getSidewalkBottomPercent } from "../../state/peacefulHumanSpawn";

import { isQuestCrossingType } from "../../state/questCrossingConstants";
import {
  isParkingZoneType,
  PARKING_UNIT_IMAGE,
} from "../../state/parkingZoneConstants";
import { isRoadsideBreakdownType } from "../../state/roadsideBreakdownConstants";

import { useMapScrollSync } from "../../hooks/useMapScrollSync";

import "../../style/quest_crossing_object.css";
import "../../style/peaceful_human_idle.css";
import "../../style/parking_zone_layer.css";



export const Maps = observer(({ map, carStore, onClickObject }) => {

  const activeObjects = map.activeObjects || [];

  const scrollRef = useMapScrollSync(map);



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

      <div ref={scrollRef} className="game-map-scroll">

        {(map.roadMarkings || []).map((mark) => (

          <div

            key={mark.uid}

            className="road-marking"

            style={{

              left: `${mark.worldX}px`,

              backgroundImage: `url(${Objects.white_line})`,

            }}

          />

        ))}



        {activeObjects
          .filter((obj) => isParkingZoneType(obj.typeId) && obj.parkingZone)
          .map((zoneObj) => {
            const pz = zoneObj.parkingZone;

            return (
              <div
                key={`parking-markings-${zoneObj.uid}`}
                className="parking-zone-markings-in-map"
                data-type="parking-zone-markings"
                data-uid={zoneObj.uid}
                style={{
                  left: `${zoneObj.worldX}px`,
                  width: `${pz.totalWidth}px`,
                  height: `${pz.spotHeight}px`,
                }}
              >
                {pz.spots.map((spot) => (
                  <div
                    key={spot.index}
                    className="parking-zone-spot"
                    style={{
                      left: `${spot.index * pz.spotWidth}px`,
                      width: `${pz.spotWidth}px`,
                      height: `${pz.spotHeight}px`,
                    }}
                  >
                    <img
                      src={PARKING_UNIT_IMAGE}
                      alt=""
                      className="parking-zone-spot-marking"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            );
          })}



        {activeObjects.map((obj) => {

          const config = objectConfigByType[obj.typeId];

          if (!config) return null;



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
          if (isRoadsideBreakdownType(obj.typeId)) return null;

          const isQuestCrossing = isQuestCrossingType(obj.typeId);
          const isPeacefulIdle =
            isPeacefulHumanType(obj.typeId) &&
            !isQuestCrossing &&
            !isNightChaseContext(map);

          return (

            <div

              key={obj.uid}

              className={`game-object${isQuestCrossing ? " game-object--quest-crossing" : ""}${isPeacefulIdle ? " game-object--peaceful-idle" : ""}`}

              data-type={obj.typeId}

              data-uid={obj.uid}

              style={{

                backgroundImage: `url(${image})`,

                left: `${obj.worldX}px`,

                ...(isQuestCrossing

                  ? {}

                  : isPeacefulIdle

                    ? {

                        bottom: `${getSidewalkBottomPercent(obj.pedestrian?.sidewalkSlot)}%`,

                        zIndex: config.zIndex,

                        width: `${config.width}px`,

                        height: `${config.height}px`,

                      }

                    : {

                        bottom: "65%",

                        zIndex: config.zIndex,

                        width: `${config.width}px`,

                        height: `${config.height}px`,

                      }),

                backgroundSize: "contain",

                backgroundRepeat: "no-repeat",

                ...(isPeacefulIdle ? getPeacefulIdleAnimationStyle(obj.uid) : {}),

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

    </div>

  );

});

