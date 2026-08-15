import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const titleId = "settings-modal-title";

export const SettingsModal = observer(() => {
  const controlsItemRef = useRef(null);

  useEffect(() => {
    if (appStore.isSettingsModalOpen && !appStore.isControlsHelpOpen) {
      controlsItemRef.current?.focus();
    }
  }, [appStore.isSettingsModalOpen, appStore.isControlsHelpOpen]);

  if (!appStore.isSettingsModalOpen) {
    return null;
  }

  return (
    <div
      className="settings-modal-overlay"
      data-type="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="settings-modal-backdrop"
        data-type="settings-modal-backdrop"
        aria-hidden="true"
        onClick={() => appStore.closeSettings()}
      />
      <div className="settings-modal-card" data-type="settings-modal-card">
        <h2 id={titleId} className="settings-modal-card__title">
          Настройки
        </h2>
        <ul className="settings-modal__list">
          <li>
            <button
              ref={controlsItemRef}
              type="button"
              className="settings-modal__item"
              data-type="settings-controls-item"
              onClick={() => appStore.openControlsHelp()}
            >
              <span>Управление</span>
              <span className="settings-modal__item-chevron" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        </ul>
        <QuestCtaButton
          role="nav"
          className="settings-modal__close"
          data-type="settings-modal-close"
          onClick={() => appStore.closeSettings()}
        >
          Закрыть
        </QuestCtaButton>
      </div>
    </div>
  );
});
