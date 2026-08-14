import React from "react";
import { Bensin } from "../car/Bensin";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const titleId = "refuel-modal-title";

export function RefuelModal({ carStore, onWatchVideo }) {
  return (
    <div
      className="refuel-modal-overlay"
      data-type="refuel-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="refuel-modal-card">
        <div className="refuel-modal__canister" data-type="refuel-canister">
          <Bensin carStore={carStore} />
        </div>
        <h2 id={titleId} className="refuel-modal-card__title">
          Бензин кончился!
        </h2>
        <p className="refuel-modal-card__subtitle">
          Посмотри видео — получишь 5 литров
        </p>
        <QuestCtaButton
          role="nav"
          className="quest-cta--refuel"
          data-type="refuel-watch-video"
          onClick={onWatchVideo}
        >
          Смотреть видео
        </QuestCtaButton>
      </div>
    </div>
  );
}
