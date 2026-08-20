import { expect, test } from "vitest";

import {
  clampPeacefulWorldXOutsideAllQuestCrossings,
  clampPeacefulWorldXOutsideQuestCrossing,
  getVisibleQuestCrossingExclusionZones,
  isPeacefulHumanOverlappingQuestCrossing,
  QUEST_CROSSING_WIDTH_DESKTOP,
} from "./questCrossingConstants";

const HUMAN_WIDTH = 60;
const ZONE = { left: 1000, right: 1000 + QUEST_CROSSING_WIDTH_DESKTOP };

test("isPeacefulHumanOverlappingQuestCrossing detects overlap", () => {
  expect(isPeacefulHumanOverlappingQuestCrossing(990, HUMAN_WIDTH, ZONE)).toBe(
    true,
  );
  expect(
    isPeacefulHumanOverlappingQuestCrossing(ZONE.right, HUMAN_WIDTH, ZONE),
  ).toBe(false);
  expect(
    isPeacefulHumanOverlappingQuestCrossing(
      ZONE.left - HUMAN_WIDTH,
      HUMAN_WIDTH,
      ZONE,
    ),
  ).toBe(false);
});

test("clampPeacefulWorldXOutsideQuestCrossing stops drift from the right", () => {
  const previousWorldX = ZONE.right + 40;
  const nextWorldX = ZONE.right - 10;

  expect(
    clampPeacefulWorldXOutsideQuestCrossing(
      nextWorldX,
      HUMAN_WIDTH,
      ZONE,
      previousWorldX,
    ),
  ).toBe(ZONE.right);
});

test("clampPeacefulWorldXOutsideQuestCrossing stops drift from the left", () => {
  const previousWorldX = ZONE.left - HUMAN_WIDTH - 20;
  const nextWorldX = ZONE.left - HUMAN_WIDTH + 5;

  expect(
    clampPeacefulWorldXOutsideQuestCrossing(
      nextWorldX,
      HUMAN_WIDTH,
      ZONE,
      previousWorldX,
    ),
  ).toBe(ZONE.left - HUMAN_WIDTH);
});

test("getVisibleQuestCrossingExclusionZones returns only on-screen crossings", () => {
  const zones = getVisibleQuestCrossingExclusionZones(
    [
      {
        typeId: "traffic_light_quest_crossing",
        worldX: 5000,
      },
      {
        typeId: "traffic_light_quest_crossing",
        worldX: 9000,
      },
    ],
    4800,
    1024,
  );

  expect(zones).toEqual([
    {
      left: 5000,
      right: 5000 + QUEST_CROSSING_WIDTH_DESKTOP,
    },
  ]);
});

test("clampPeacefulWorldXOutsideAllQuestCrossings applies every zone", () => {
  const zones = [
    { left: 1000, right: 1230 },
    { left: 2000, right: 2230 },
  ];

  expect(
    clampPeacefulWorldXOutsideAllQuestCrossings(
      1210,
      HUMAN_WIDTH,
      zones,
      1300,
    ),
  ).toBe(1230);
});
