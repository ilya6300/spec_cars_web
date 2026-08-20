import React from "react";
import { observer } from "mobx-react-lite";
import collectibleCoinImg from "../../assets/ui/collectible-coin.svg";
import appStore from "../../state/appStore";
import modeStore from "../../state/modeStore";
import { GAME_MODES } from "../../state/modeScoring";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const COIN_COUNT = 3;
const titleId = "mode-result-title";

export const ModeResultModal = observer(({ carStore }) => {
  if (!modeStore.isComplete) return null;

  const coins = modeStore.coinsEarned;
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
          className="mode-result-card__coins"
          data-type="mode-result-coins"
          aria-label={`Заработано монет: ${coins}`}
        >
          {Array.from({ length: COIN_COUNT }, (_, i) => {
            const filled = i < coins;
            return (
              <img
                key={i}
                src={collectibleCoinImg}
                alt=""
                className={`mode-result-coin${filled ? " mode-result-coin--filled" : " mode-result-coin--empty"}`}
                data-type="mode-result-coin"
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
