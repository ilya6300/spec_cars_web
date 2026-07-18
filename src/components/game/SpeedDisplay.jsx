import { observer } from "mobx-react-lite";

export const SpeedDisplay = observer(({ currentSpeed }) => {
  const isCritical = Math.round(currentSpeed / 6.43) > 60;

  const className = `speed-display${isCritical ? " critical" : ""}`;

  return (
    <div className={className} data-type="speed-display">
      {Math.round(currentSpeed / 6.43)} км/ч
    </div>
  );
});
