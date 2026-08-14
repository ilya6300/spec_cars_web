import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import atmosphereStore from "../../state/atmosphereStore";

vi.mock("../car/CarModel", () => ({
  CarModel: ({ showHeadlights }) => (
    <div
      data-type="car-model-mock"
      data-show-headlights={showHeadlights ? "true" : "false"}
    />
  ),
}));

vi.mock("../../state/carStore", () => ({
  default: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    wheelRotation: 0,
  })),
}));

vi.mock("../../state/questCarStore", () => ({
  default: vi.fn().mockImplementation(() => ({
    wheelRotation: 0,
  })),
}));

import { QuestArrestModal } from "./QuestArrestModal";

const createMapStore = (overrides = {}) => ({
  questCarForArrest: { id: "enemy-1", enemy: true },
  isQuestArrestActive: true,
  arrestAnimFinished: false,
  ...overrides,
});

const carStore = {
  addHelp: vi.fn(),
  toggleSirena: vi.fn(),
};

describe("QuestArrestModal", () => {
  beforeEach(() => {
    atmosphereStore.setAtmosphere({ timeOfDay: "day", weather: "clear" });
  });

  it("renders night + rain modifiers, rain layer and headlights at night with rain", () => {
    atmosphereStore.setAtmosphere({ timeOfDay: "night", weather: "rain" });
    const { container } = render(
      <QuestArrestModal mapStore={createMapStore()} carStore={carStore} />,
    );

    expect(container.querySelector(".quest-arrest-modal--night")).toBeTruthy();
    expect(container.querySelector(".quest-arrest-modal--rain")).toBeTruthy();
    expect(
      container.querySelector('.quest-arrest-modal [data-type="rain-layer"]'),
    ).toBeTruthy();
    expect(
      container.querySelectorAll('[data-show-headlights="true"]'),
    ).toHaveLength(2);
  });

  it("renders without rain, night class or headlights during day", () => {
    const { container } = render(
      <QuestArrestModal mapStore={createMapStore()} carStore={carStore} />,
    );

    expect(container.querySelector(".quest-arrest-modal--night")).toBeNull();
    expect(container.querySelector(".quest-arrest-modal--rain")).toBeNull();
    expect(
      container.querySelector('.quest-arrest-modal [data-type="rain-layer"]'),
    ).toBeNull();
    expect(
      container.querySelectorAll('[data-show-headlights="true"]'),
    ).toHaveLength(0);
    expect(
      container.querySelector('[data-type="atmosphere-overlay"]'),
    ).toBeNull();
  });

  it("shows CTA with data-type when arrest animation finished", () => {
    atmosphereStore.setAtmosphere({ timeOfDay: "night", weather: "rain" });
    const { container } = render(
      <QuestArrestModal
        mapStore={createMapStore({ arrestAnimFinished: true })}
        carStore={carStore}
      />,
    );

    const cta = container.querySelector('[data-type="arrest-modal-button"]');
    expect(cta).toBeTruthy();
    expect(cta.classList.contains("ui-btn--bloom")).toBe(true);
    expect(cta.classList.contains("ui-btn--mission")).toBe(true);
    expect(cta.textContent).toBe("Арестовать");
  });
});
