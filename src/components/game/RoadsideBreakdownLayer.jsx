import { observer } from "mobx-react-lite";
import { CarModel } from "../car/CarModel";
import { isRoadsideBreakdownType } from "../../state/roadsideBreakdownConstants";
import "../../style/roadside_breakdown_layer.css";

export const RoadsideBreakdownLayer = observer(
  ({ mapStore, tutorialStore = null }) => {
    const breakdowns = mapStore.activeObjects.filter(
      (obj) =>
        isRoadsideBreakdownType(obj.typeId) &&
        obj.roadsideBreakdown &&
        !obj.roadsideBreakdown.helped,
    );

    if (breakdowns.length === 0) {
      return null;
    }

    const questBlocked =
      mapStore.isPoliceQuestActive ||
      mapStore.isPedestrianCrossingQuestActive ||
      mapStore.isQuestArrestActive ||
      mapStore.isEvacuationInProgress();

    const evacuation = mapStore.parkingEvacuation;
    const hasPendingTarget = mapStore.hasPendingEvacuationTarget();

    return (
      <div
        className="roadside-breakdown-layer"
        data-type="roadside-breakdown-layer"
      >
        {breakdowns.map((obj) => {
          const rb = obj.roadsideBreakdown;
          const screenX = obj.worldX - mapStore.offsetX;
          const carOnEvacuator =
            evacuation.carOnPlatform &&
            evacuation.sourceKind === "roadside" &&
            evacuation.targetUid === obj.uid;

          if (carOnEvacuator) {
            return null;
          }

          return (
            <div
              key={obj.uid}
              className={`roadside-breakdown-car${
                rb.selected ? " roadside-breakdown-car--selected" : ""
              }`}
              data-type="roadside-breakdown-car"
              data-uid={obj.uid}
              style={{ left: `${screenX}px` }}
              onClick={(event) => {
                event.stopPropagation();
                if (
                  questBlocked ||
                  hasPendingTarget ||
                  rb.selected ||
                  rb.helped
                ) {
                  return;
                }
                mapStore.selectRoadsideBreakdownTarget(obj);
                tutorialStore?.onRoadsideBreakdownClicked?.();
              }}
            >
              <div
                className="roadside-breakdown-car__steam"
                aria-hidden="true"
              />
              <CarModel carStore={rb.carData} variant="traffic" nested />
            </div>
          );
        })}
      </div>
    );
  },
);
