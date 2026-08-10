import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import atmosphereStore from "../../state/atmosphereStore";

vi.mock("../car/CarModel", () => ({
  CarModel: () => <div data-type="car-model-mock" />,
}));

vi.mock("../../state/carStore", () => ({
  default: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
  })),
}));

vi.mock("../../state/questCarStore", () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

import { QuestArrestModal } from "./QuestArrestModal";

const createMapStore = () => ({
  questCarForArrest: { id: "enemy-1", enemy: true },
  isQuestArrestActive: true,
  arrestAnimFinished: false,
});

const carStore = {
  addHelp: vi.fn(),
  toggleSirena: vi.fn(),
};

describe("QuestArrestModal", () => {
  beforeEach(() => {
    atmosphereStore.setAtmosphere({ timeOfDay: "day" });
  });

  it("renders night class and atmosphere overlay at night", () => {
    atmosphereStore.setAtmosphere({ timeOfDay: "night" });
    render(<QuestArrestModal mapStore={createMapStore()} carStore={carStore} />);

    expect(document.querySelector(".quest-arrest-modal--night")).toBeTruthy();
    expect(
      document.querySelector('[data-type="atmosphere-overlay"]'),
    ).toBeTruthy();
  });

  it("renders without night class and overlay during day", () => {
    render(<QuestArrestModal mapStore={createMapStore()} carStore={carStore} />);

    expect(document.querySelector(".quest-arrest-modal--night")).toBeNull();
    expect(
      document.querySelector('[data-type="atmosphere-overlay"]'),
    ).toBeNull();
  });
});
