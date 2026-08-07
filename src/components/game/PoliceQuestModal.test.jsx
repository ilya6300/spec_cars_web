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
    wheelRotation: 0,
    sirena: false,
  })),
}));

vi.mock("../../state/objects", () => ({
  objectConfigByType: {
    human_aggr1: { image: "human-aggr1.png" },
  },
}));

vi.mock("../../state/quests", () => ({
  getHelpTypeForPoliceObject: () => "criminalArrest",
}));

import { PoliceQuestModal } from "./PoliceQuestModal";

const createMapStore = () => ({
  isPoliceQuestActive: true,
  questTargetObject: { uid: "target-1", typeId: "human_aggr1" },
  questCarPosition: 0,
  updateQuestCarPosition: vi.fn(),
  removeObjectByUid: vi.fn(),
  finishQuest: vi.fn(),
});

const carStore = {
  addHelp: vi.fn(),
  toggleSirena: vi.fn(),
  sirena: false,
};

describe("PoliceQuestModal", () => {
  beforeEach(() => {
    atmosphereStore.setAtmosphere({ timeOfDay: "day" });
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("renders night class and atmosphere overlay at night", () => {
    atmosphereStore.setAtmosphere({ timeOfDay: "night" });
    render(<PoliceQuestModal mapStore={createMapStore()} carStore={carStore} />);

    expect(document.querySelector(".police-quest-modal--night")).toBeTruthy();
    expect(
      document.querySelector('[data-type="atmosphere-overlay"]'),
    ).toBeTruthy();
  });

  it("renders without night class and overlay during day", () => {
    render(<PoliceQuestModal mapStore={createMapStore()} carStore={carStore} />);

    expect(document.querySelector(".police-quest-modal--night")).toBeNull();
    expect(
      document.querySelector('[data-type="atmosphere-overlay"]'),
    ).toBeNull();
  });
});
