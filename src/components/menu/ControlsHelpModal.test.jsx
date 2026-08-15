import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { runInAction } from "mobx";
import { render, fireEvent } from "@testing-library/react";
import appStore from "../../state/appStore";
import { ControlsHelpModal } from "./ControlsHelpModal";

function resetModalState() {
  runInAction(() => {
    appStore.isSettingsModalOpen = false;
    appStore.isControlsHelpOpen = false;
  });
}

describe("ControlsHelpModal", () => {
  beforeEach(() => {
    resetModalState();
  });

  it("is hidden by default", () => {
    render(<ControlsHelpModal />);
    expect(document.querySelector('[data-type="controls-help-modal"]')).toBeNull();
  });

  it("renders sections in correct order", () => {
    appStore.openControlsHelp();
    render(<ControlsHelpModal />);

    const mouse = document.querySelector('[data-type="controls-help-section-mouse"]');
    const keyboard = document.querySelector('[data-type="controls-help-section-keyboard"]');
    expect(mouse).not.toBeNull();
    expect(keyboard).not.toBeNull();
    expect(
      mouse.compareDocumentPosition(keyboard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("contains key help phrases", () => {
    appStore.openControlsHelp();
    render(<ControlsHelpModal />);

    expect(document.body.textContent).toContain("Сначала включи зажигание");
    expect(document.body.textContent).toContain("Left Ctrl");
    expect(document.body.textContent).toContain("C");
  });

  it("renders keyboard table with 9 rows", () => {
    appStore.openControlsHelp();
    render(<ControlsHelpModal />);

    const rows = document.querySelectorAll(
      '[data-type="controls-help-section-keyboard"] table tbody tr',
    );
    expect(rows.length).toBe(9);
  });

  it("back button closes L2 and keeps L1 open", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    render(<ControlsHelpModal />);

    fireEvent.click(document.querySelector('[data-type="controls-help-back"]'));
    expect(appStore.isControlsHelpOpen).toBe(false);
    expect(appStore.isSettingsModalOpen).toBe(true);
  });

  it("close button closes both modals", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    render(<ControlsHelpModal />);

    fireEvent.click(document.querySelector('[data-type="controls-help-close"]'));
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });
});
