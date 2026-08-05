import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import modeStore from "../../state/modeStore";

export const ModeResultModal = observer(({ carStore }) => {
  if (!modeStore.isComplete) return null;

  const stars = modeStore.starsEarned;
  const score =
    modeStore.gameMode === "timed"
      ? modeStore.getScoreForCarStore(carStore)
      : null;

  return (
    <div className="mode-result-overlay" data-type="mode-result">
      <div className="mode-result-card">
        <h2 className="mode-result-card__title">Молодец!</h2>
        <div
          className="mode-result-card__stars"
          data-type="mode-result-stars"
          aria-label={`Заработано звёзд: ${stars}`}
        >
          {"★".repeat(stars)}
          {"☆".repeat(3 - stars)}
        </div>
        {score !== null && (
          <p className="mode-result-card__score">Очков: {score}</p>
        )}
        <button
          type="button"
          className="mode-result-card__button"
          data-type="mode-back-to-menu"
          onClick={() => appStore.backToMenu()}
        >
          В меню
        </button>
      </div>
    </div>
  );
});
