import React from "react";
import pedestrianBadge from "../../assets/quest_img/finish-badge-pedestrian.jpeg";
import criminalBadge from "../../assets/quest_img/finish-badge-criminal.jpeg";
import enemyBadge from "../../assets/quest_img/finish-badge-enemy.jpeg";

const VARIANT_CONFIG = {
  pedestrian: {
    src: pedestrianBadge,
    alt: "Штраф выписан",
    dataType: "quest-finish-badge-pedestrian",
  },
  criminal: {
    src: criminalBadge,
    alt: "Преступник арестован",
    dataType: "quest-finish-badge-criminal",
  },
  enemy: {
    src: enemyBadge,
    alt: "Нарушитель арестован",
    dataType: "quest-finish-badge-enemy",
  },
};

/**
 * @param {{
 *   variant: 'pedestrian' | 'criminal' | 'enemy',
 *   onDismiss: () => void,
 * }} props
 */
export function QuestFinishOverlay({ variant, onDismiss }) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className="quest-finish-overlay"
      data-type="quest-finish-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="quest-finish-dimmer"
        data-type="quest-finish-dimmer"
        aria-hidden="true"
      />
      <div
        className="quest-finish-card"
        data-type="quest-finish-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="quest-finish-frame" data-type="quest-finish-frame">
          <img
            src={config.src}
            alt={config.alt}
            className="quest-finish-image"
            data-type={config.dataType}
          />
        </div>
        <button
          type="button"
          className="quest-finish-continue"
          data-type="quest-finish-continue"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
