import { observer } from "mobx-react-lite";
import stateApp from "../../state/state_app";

export const OrientationDistanceHud = observer(({ mapStore }) => {
  if (!mapStore.orientationQuest.active) {
    return null;
  }

  const meters = Math.max(
    0,
    Math.round(
      (mapStore.orientationQuest.targetWorldX - mapStore.offsetX) /
        stateApp.distanceMetersFactor,
    ),
  );

  return (
    <div
      className="orientation-distance-hud"
      data-type="orientation-distance-hud"
    >
      {meters} м
    </div>
  );
});
