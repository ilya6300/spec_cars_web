import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { runInAction } from "mobx";
import { render, screen, fireEvent } from "@testing-library/react";
import appStore from "../../state/appStore";
import { SettingsModal } from "./SettingsModal";

function resetModalState() {
  runInAction(() => {
    appStore.isSettingsModalOpen = false;
    appStore.isControlsHelpOpen = false;
  });
}

describe("SettingsModal", () => {
  beforeEach(() => {
    resetModalState();
  });

  it("is hidden by default", () => {
    render(<SettingsModal />);
    expect(document.querySelector('[data-type="settings-modal"]')).toBeNull();
  });

  it("renders overlay when settings are open", () => {
    appStore.openSettings();
    render(<SettingsModal />);
    expect(document.querySelector('[data-type="settings-modal"]')).not.toBeNull();
  });

  it("exposes dialog accessibility attributes", () => {
    appStore.openSettings();
    render(<SettingsModal />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("settings-modal-title");
    expect(screen.getByRole("heading", { name: "Настройки" }).id).toBe("settings-modal-title");
  });

  it("opens controls help when controls item is clicked", () => {
    appStore.openSettings();
    render(<SettingsModal />);

    fireEvent.click(document.querySelector('[data-type="settings-controls-item"]'));
    expect(appStore.isControlsHelpOpen).toBe(true);
  });

  it("closes both modals when close button is clicked", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    render(<SettingsModal />);

    fireEvent.click(document.querySelector('[data-type="settings-modal-close"]'));
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });

  it("closes settings when backdrop is clicked", () => {
    appStore.openSettings();
    render(<SettingsModal />);

    fireEvent.click(document.querySelector('[data-type="settings-modal-backdrop"]'));
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });
});
