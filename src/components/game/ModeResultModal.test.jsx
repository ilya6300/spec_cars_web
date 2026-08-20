import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GAME_MODES } from "../../state/modeScoring";

const { mockModeStore, mockBackToMenu } = vi.hoisted(() => ({
  mockModeStore: {
    isComplete: false,
    coinsEarned: 0,
    gameMode: "timed",
    getScoreForCarStore: vi.fn(() => 0),
    getChaseProgress: vi.fn(() => ({ current: 0, target: 3 })),
  },
  mockBackToMenu: vi.fn(),
}));

vi.mock("../../state/modeStore", () => ({
  default: mockModeStore,
}));

vi.mock("../../state/appStore", () => ({
  default: {
    backToMenu: mockBackToMenu,
  },
}));

import { ModeResultModal } from "./ModeResultModal";

const carStore = {
  helpCounts: {
    criminalArrest: 0,
    pedestrianFine: 0,
    enemyChase: 0,
    orientationMatch: 0,
  },
};

describe("ModeResultModal", () => {
  beforeEach(() => {
    mockModeStore.isComplete = false;
    mockModeStore.coinsEarned = 0;
    mockModeStore.gameMode = GAME_MODES.TIMED;
    mockModeStore.getScoreForCarStore.mockReset();
    mockModeStore.getScoreForCarStore.mockReturnValue(0);
    mockModeStore.getChaseProgress.mockReset();
    mockModeStore.getChaseProgress.mockReturnValue({ current: 0, target: 3 });
    mockBackToMenu.mockReset();
  });

  it("renders null when isComplete is false", () => {
    const { container } = render(<ModeResultModal carStore={carStore} />);
    expect(container.firstChild).toBeNull();
    expect(
      document.querySelector('[data-type="mode-result"]'),
    ).toBeNull();
  });

  it("renders timed score and coin fill states", () => {
    mockModeStore.isComplete = true;
    mockModeStore.gameMode = GAME_MODES.TIMED;
    mockModeStore.coinsEarned = 2;
    mockModeStore.getScoreForCarStore.mockReturnValue(10);

    render(<ModeResultModal carStore={carStore} />);

    expect(screen.getByText("Очков: 10").getAttribute("data-type")).toBe(
      "mode-result-score",
    );
    expect(
      document.querySelector('[data-type="mode-result-chase"]'),
    ).toBeNull();

    const coins = document.querySelectorAll('[data-type="mode-result-coin"]');
    expect(coins).toHaveLength(3);
    expect(
      [...coins].filter((el) => el.getAttribute("data-filled") === "true"),
    ).toHaveLength(2);
    expect(
      [...coins].filter((el) => el.getAttribute("data-filled") === "false"),
    ).toHaveLength(1);
  });

  it("renders chase progress without score block", () => {
    mockModeStore.isComplete = true;
    mockModeStore.gameMode = GAME_MODES.CHASE;
    mockModeStore.coinsEarned = 3;
    mockModeStore.getChaseProgress.mockReturnValue({ current: 3, target: 3 });

    render(<ModeResultModal carStore={carStore} />);

    expect(screen.getByText("Поймано: 3 / 3").getAttribute("data-type")).toBe(
      "mode-result-chase",
    );
    expect(
      document.querySelector('[data-type="mode-result-score"]'),
    ).toBeNull();
    expect(document.querySelectorAll('[data-type="mode-result-coin"]')).toHaveLength(
      3,
    );
  });

  it("renders back to menu button", () => {
    mockModeStore.isComplete = true;
    mockModeStore.coinsEarned = 1;

    render(<ModeResultModal carStore={carStore} />);

    expect(
      screen.getByRole("button", { name: "В меню" }).getAttribute("data-type"),
    ).toBe("mode-back-to-menu");
  });

  it("exposes dialog accessibility attributes", () => {
    mockModeStore.isComplete = true;

    render(<ModeResultModal carStore={carStore} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("mode-result-title");
    expect(screen.getByRole("heading", { name: "Молодец!" }).id).toBe(
      "mode-result-title",
    );
  });
});
