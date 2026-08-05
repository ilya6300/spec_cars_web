import { observer } from "mobx-react-lite";
import modeStore from "../../state/modeStore";
import { GAME_MODES } from "../../state/modeScoring";

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export const ModeTimer = observer(({ carStore }) => {
  if (modeStore.gameMode !== GAME_MODES.TIMED) return null;

  const score = modeStore.getScoreForCarStore(carStore);

  return (
    <div className="mode-hud" data-type="mode-hud">
      <div className="mode-hud__timer" data-type="mode-timer">
        {formatTime(modeStore.timeRemainingSec)}
      </div>
      <div className="mode-hud__goal" data-type="mode-score">
        Очки: {score} / 10
      </div>
    </div>
  );
});

export const ModeChaseProgress = observer(({ carStore }) => {
  if (modeStore.gameMode !== GAME_MODES.CHASE) return null;

  const { current, target } = modeStore.getChaseProgress(carStore);

  return (
    <div className="mode-hud" data-type="mode-hud">
      <div className="mode-hud__goal" data-type="mode-chase-progress">
        Поймано: {current} / {target}
      </div>
    </div>
  );
});
