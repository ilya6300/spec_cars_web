import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import {
  getParkingIllegalClass,
  isParkingZoneType,
  PARKING_UNIT_IMAGE,
} from "../../state/parkingZoneConstants";
import "../../style/parking_zone_layer.css";

export const ParkingZoneLayer = observer(({ mapStore }) => {
  const parkingZones = mapStore.activeObjects.filter(
    (obj) => isParkingZoneType(obj.typeId) && obj.parkingZone,
  );

  if (parkingZones.length === 0) {
    return null;
  }

  const questBlocked =
    mapStore.isPoliceQuestActive ||
    mapStore.isPedestrianCrossingQuestActive ||
    mapStore.isQuestArrestActive ||
    mapStore.isParkingFineActive();

  const evacuation = mapStore.parkingEvacuation;

  return (
    <div className="parking-zone-layer" data-type="parking-zone-layer">
      {parkingZones.map((zoneObj) => {
        const pz = zoneObj.parkingZone;
        const screenX = zoneObj.worldX - mapStore.offsetX;
        const overlayActive = pz.pendingSpotIndex !== null;

        return (
          <div
            key={zoneObj.uid}
            className="parking-zone"
            data-type="parking-zone"
            data-uid={zoneObj.uid}
            style={{
              left: `${screenX}px`,
              width: `${pz.totalWidth}px`,
              height: `${pz.spotHeight}px`,
            }}
          >
            {pz.spots.map((spot) => {
              const carOnEvacuator =
                evacuation.carOnPlatform &&
                evacuation.zoneUid === zoneObj.uid &&
                evacuation.spotIndex === spot.index;

              return (
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
                  {spot.carData && !carOnEvacuator && (
                    <div
                      className={`parking-zone-car${
                        spot.status === "illegal"
                          ? ` parking-zone-car--illegal ${getParkingIllegalClass(spot.violationType)}`
                          : ""
                      }${spot.fining ? " parking-violation-car--fining" : ""}`}
                      data-type={
                        spot.status === "illegal"
                          ? "parking-violation-car"
                          : "parking-zone-car"
                      }
                      data-spot-index={spot.index}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (
                          questBlocked ||
                          overlayActive ||
                          spot.status !== "illegal" ||
                          spot.fined ||
                          spot.fining
                        ) {
                          return;
                        }
                        mapStore.handleParkingViolationClick(
                          zoneObj,
                          spot.index,
                        );
                      }}
                    >
                      <CarModel
                        carStore={spot.carData}
                        variant="traffic"
                        nested
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
