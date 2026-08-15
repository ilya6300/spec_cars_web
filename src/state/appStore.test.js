import { describe, it, expect, beforeEach, vi } from "vitest";
import { runInAction } from "mobx";
import appStore from "./appStore";
import { GAME_MODES } from "./modeScoring";

vi.mock("./atmosphereStore", () => ({
  default: {
    initFreeWeather: vi.fn(),
    stopFreeWeather: vi.fn(),
    setAtmosphere: vi.fn(),
  },
}));

vi.mock("./modeStore", () => ({
  default: {
    init: vi.fn(),
  },
}));

function resetModalState() {
  runInAction(() => {
    appStore.isSettingsModalOpen = false;
    appStore.isControlsHelpOpen = false;
    appStore.screen = "menu";
  });
}

describe("appStore settings modals", () => {
  beforeEach(() => {
    resetModalState();
  });

  it("initial state has both modal flags false", () => {
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });

  it("openSettings sets isSettingsModalOpen to true", () => {
    appStore.openSettings();
    expect(appStore.isSettingsModalOpen).toBe(true);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });

  it("openControlsHelp opens L2 while L1 stays open", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    expect(appStore.isSettingsModalOpen).toBe(true);
    expect(appStore.isControlsHelpOpen).toBe(true);
  });

  it("backFromControlsHelp closes L2 and keeps L1 open", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    appStore.backFromControlsHelp();
    expect(appStore.isSettingsModalOpen).toBe(true);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });

  it("closeSettings closes both modals", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    appStore.closeSettings();
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });

  it("startGame resets both modal flags", () => {
    appStore.openSettings();
    appStore.openControlsHelp();
    appStore.startGame(GAME_MODES.FREE);
    expect(appStore.isSettingsModalOpen).toBe(false);
    expect(appStore.isControlsHelpOpen).toBe(false);
  });
});
