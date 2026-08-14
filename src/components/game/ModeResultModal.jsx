import React from "react";
import { observer } from "mobx-react-lite";
import collectibleStarImg from "../../assets/ui/collectible-star.svg";
import appStore from "../../state/appStore";
import modeStore from "../../state/modeStore";
import { GAME_MODES } from "../../state/modeScoring";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const STAR_COUNT = 3;
const titleId = "mode-result-title";

export const ModeResultModal = observer(({ carStore }) => {
  if (!modeStore.isComplete) return null;

  const stars = modeStore.starsEarned;
  const score =
    modeStore.gameMode === GAME_MODES.TIMED
      ? modeStore.getScoreForCarStore(carStore)
      : null;
  const chaseProgress =
    modeStore.gameMode === GAME_MODES.CHASE
      ? modeStore.getChaseProgress(carStore)
      : null;

  return (
    <div
      className="mode-result-overlay"
      data-type="mode-result"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="mode-result-card" data-type="mode-result-card">
        <h2 id={titleId} className="mode-result-card__title">
          Молодец!
        </h2>
        <div
          className="mode-result-card__stars"
          data-type="mode-result-stars"
          aria-label={`Заработано звёзд: ${stars}`}
        >
          {Array.from({ length: STAR_COUNT }, (_, i) => {
            const filled = i < stars;
            return (
              <img
                key={i}
                src={collectibleStarImg}
                alt=""
                className={`mode-result-star${filled ? " mode-result-star--filled" : " mode-result-star--empty"}`}
                data-type="mode-result-star"
                data-filled={filled ? "true" : "false"}
                aria-hidden="true"
              />
            );
          })}
        </div>
        {score !== null && (
          <p className="mode-result-card__score" data-type="mode-result-score">
            Очков: {score}
          </p>
        )}
        {chaseProgress !== null && (
          <p className="mode-result-card__chase" data-type="mode-result-chase">
            Поймано: {chaseProgress.current} / {chaseProgress.target}
          </p>
        )}
        <QuestCtaButton
          role="nav"
          data-type="mode-back-to-menu"
          onClick={() => appStore.backToMenu()}
        >
          В меню
        </QuestCtaButton>
      </div>
    </div>
  );
});
