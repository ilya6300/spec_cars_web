import { observer } from "mobx-react-lite";

export const SpeedDisplay = observer(({ currentSpeed }) => {
  const isCritical = currentSpeed > 60;

  const className = `speed-display${isCritical ? " critical" : ""}`;

  return (
    <div className={className}>
      {Math.round(currentSpeed)} km/h
    </div>
  );
});
