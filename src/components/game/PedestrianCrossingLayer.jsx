import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { dataObjectsSub } from "../../state/subobject";
import { QuestFinishOverlay } from "./QuestFinishOverlay";
import "../../style/pedestrian_crossing_layer.css";

export const PedestrianCrossingLayer = observer(({ mapStore, carStore }) => {
  const targetObj = mapStore.pedestrianCrossingTargetObject;
  const questCrossing = targetObj?.questCrossing;

  if (!mapStore.isPedestrianCrossingQuestActive || !targetObj || !questCrossing) {
    return null;
  }

  if (mapStore.isPoliceQuestActive || mapStore.isQuestArrestActive) {
    return null;
  }

  const humanConfig = dataObjectsSub.find(
    (entry) => entry.type === questCrossing.humanType,
  );
  if (!humanConfig) return null;

  const humanScreenX = questCrossing.humanWorldX - mapStore.offsetX;
  const isClickable =
    questCrossing.crossesOnRed &&
    (questCrossing.phase === "walking" || questCrossing.phase === "stopped") &&
    !questCrossing.showFinishOverlay;

  const handleHumanClick = () => {
    if (!isClickable) return;
    mapStore.handlePedestrianCrossingClick(targetObj);
  };

  const handleFinishDismiss = () => {
    mapStore.finishPedestrianCrossingQuest();
    runInAction(() => {
      carStore.addHelp("pedestrianFine");
    });
  };

  return (
    <div
      className="pedestrian-crossing-layer"
      data-type="pedestrian-crossing-layer"
    >
      <img
        src={humanConfig.image}
        alt="Pedestrian"
        className={`quest-crossing-human${isClickable ? " quest-crossing-human--clickable" : ""}`}
        data-type="quest-crossing-human"
        data-human-type={questCrossing.humanType}
        style={{
          left: `${humanScreenX}px`,
          width: humanConfig.width,
          height: humanConfig.height,
        }}
        onClick={handleHumanClick}
      />

      {questCrossing.showFinishOverlay && (
        <QuestFinishOverlay variant="pedestrian" onDismiss={handleFinishDismiss} />
      )}
    </div>
  );
});
