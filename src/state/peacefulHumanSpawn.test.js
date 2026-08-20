import { expect, test } from "vitest";

import {
  buildPeacefulGroupMembers,
  clampFleeWorldX,
  computeFollowerWorldX,
  computeFleeSpeedX,
  computePeacefulHumanWorldX,
  countVisiblePeacefulCapSlots,
  createPeacefulPedestrianProfile,
  findNearestAggrWithinRadius,
  getPeacefulHumanCap,
  getPeacefulHumanInitialSpawnDistance,
  getPeacefulSpawnInterval,
  getSidewalkBottomPercent,
  isPeacefulHumanCapReached,
  pickDriftSpeedX,
  pickGroupFollowOffsetX,
  pickPeacefulGroupSize,
  pickReactionToAggr,
  pickSidewalkSlot,
  pickYDriftIntervalSec,
  PEACEFUL_REACTION_FLEE_MAX_DISTANCE,
  PEACEFUL_REACTION_FLEE_RADIUS,
  PEACEFUL_REACTION_FLEE_SPEED,
  PEACEFUL_HUMAN_Z_INDEX,
  POLICE_AGGRO_Z_INDEX,
  resolvePeacefulHumanSpawnWorldX,
  resetPeacefulAggrReaction,
  shouldSpawnPeacefulGroup,
  SIDEWALK_SLOT_BOTTOM_PERCENT,
  tickPeacefulDriftX,
  tickPeacefulMovementState,
  tickPeacefulYDriftSlot,
  getEffectiveDriftSpeedX,
  pickIsWalking,
} from "./peacefulHumanSpawn";

test("getSidewalkBottomPercent maps slots 0-4 to SIDEWALK_SLOT_BOTTOM_PERCENT", () => {
  SIDEWALK_SLOT_BOTTOM_PERCENT.forEach((percent, slot) => {
    expect(getSidewalkBottomPercent(slot)).toBe(percent);
  });
});

test("getSidewalkBottomPercent clamps out-of-range slots", () => {
  expect(getSidewalkBottomPercent(-1)).toBe(61);
  expect(getSidewalkBottomPercent(99)).toBe(69);
});

test("POLICE_AGGRO_Z_INDEX is above peaceful humans for click priority", () => {
  expect(POLICE_AGGRO_Z_INDEX).toBeGreaterThan(PEACEFUL_HUMAN_Z_INDEX);
});

test("getPeacefulHumanCap returns 6 desktop / 4 mobile", () => {
  expect(getPeacefulHumanCap(1024)).toBe(6);
  expect(getPeacefulHumanCap(901)).toBe(6);
  expect(getPeacefulHumanCap(900)).toBe(4);
  expect(getPeacefulHumanCap(360)).toBe(4);
});

test("getPeacefulHumanInitialSpawnDistance uses 400 + i*180 + random spread", () => {
  expect(getPeacefulHumanInitialSpawnDistance(0, () => 0)).toBe(400);
  expect(getPeacefulHumanInitialSpawnDistance(0, () => 0.999)).toBe(679);
  expect(getPeacefulHumanInitialSpawnDistance(15, () => 0)).toBe(3100);
});

test("computePeacefulHumanWorldX spawns off the right edge of viewport", () => {
  const worldX = computePeacefulHumanWorldX(5000, 1024, () => 0);
  expect(worldX).toBe(6024);
  const worldXSpread = computePeacefulHumanWorldX(5000, 1024, () => 1);
  expect(worldXSpread).toBe(6264);
});

test("resolvePeacefulHumanSpawnWorldX avoids nearby peaceful humans", () => {
  const activeObjects = [
    { typeId: "human1", worldX: 6000 },
  ];
  const worldX = resolvePeacefulHumanSpawnWorldX(
    activeObjects,
    5000,
    1024,
    () => 0,
  );
  expect(Math.abs(worldX - 6000)).toBeGreaterThanOrEqual(80);
});

test("pickSidewalkSlot returns 0..4", () => {
  expect(pickSidewalkSlot(() => 0)).toBe(0);
  expect(pickSidewalkSlot(() => 0.999)).toBe(4);
});

test("pickDriftSpeedX returns negative range by default", () => {
  expect(pickDriftSpeedX(() => 0.5)).toBeGreaterThanOrEqual(-40);
  expect(pickDriftSpeedX(() => 0.5)).toBeLessThanOrEqual(-8);
});

test("pickDriftSpeedX returns positive range for low random values", () => {
  expect(pickDriftSpeedX(() => 0)).toBeGreaterThanOrEqual(8);
  expect(pickDriftSpeedX(() => 0)).toBeLessThanOrEqual(40);
});

test("pickYDriftIntervalSec returns 12..36 seconds", () => {
  expect(pickYDriftIntervalSec(() => 0)).toBe(12);
  expect(pickYDriftIntervalSec(() => 1)).toBe(36);
});

test("pickGroupFollowOffsetX returns 60..120", () => {
  expect(pickGroupFollowOffsetX(() => 0)).toBe(60);
  expect(pickGroupFollowOffsetX(() => 1)).toBe(120);
});

test("pickPeacefulGroupSize returns 2 or 3", () => {
  expect(pickPeacefulGroupSize(() => 0)).toBe(3);
  expect(pickPeacefulGroupSize(() => 0.99)).toBe(2);
});

test("shouldSpawnPeacefulGroup respects 35% chance", () => {
  expect(shouldSpawnPeacefulGroup(() => 0)).toBe(true);
  expect(shouldSpawnPeacefulGroup(() => 0.35)).toBe(false);
});

test("tickPeacefulDriftX applies driftSpeedX * deltaTime", () => {
  expect(tickPeacefulDriftX(1000, -20, 0.5)).toBe(990);
});

test("tickPeacefulYDriftSlot changes sidewalkSlot when cooldown expires", () => {
  const pedestrian = {
    sidewalkSlot: 2,
    driftSpeedY: 12,
    yDriftCooldownSec: 0.1,
  };

  tickPeacefulYDriftSlot(pedestrian, 0.2, () => 0);

  expect(pedestrian.sidewalkSlot).toBe(1);
  expect(pedestrian.yDriftCooldownSec).toBe(12);
});

test("tickPeacefulYDriftSlot clamps sidewalkSlot to 0..4", () => {
  const pedestrian = {
    sidewalkSlot: 0,
    driftSpeedY: 12,
    yDriftCooldownSec: 0,
  };

  tickPeacefulYDriftSlot(pedestrian, 0.1, () => 0);

  expect(pedestrian.sidewalkSlot).toBe(0);
});

test("computeFollowerWorldX places follower behind leader for negative drift", () => {
  expect(computeFollowerWorldX(1000, -20, 80)).toBe(1080);
});

test("computeFollowerWorldX places follower behind leader for positive drift", () => {
  expect(computeFollowerWorldX(1000, 20, 80)).toBe(920);
});

test("pickReactionToAggr returns watch or flee by chance", () => {
  expect(pickReactionToAggr(() => 0)).toBe("watch");
  expect(pickReactionToAggr(() => 0.5)).toBe("flee");
});

test("computeFleeSpeedX moves away from aggr on X axis", () => {
  expect(computeFleeSpeedX(900, 1000, 60)).toBe(-60);
  expect(computeFleeSpeedX(1100, 1000, 60)).toBe(60);
  expect(computeFleeSpeedX(1000, 1000, 60)).toBe(-60);
});

test("clampFleeWorldX clamps to spawnWorldX +/- fleeMaxDistance", () => {
  expect(clampFleeWorldX(950, 1000, 100)).toBe(950);
  expect(clampFleeWorldX(850, 1000, 100)).toBe(900);
  expect(clampFleeWorldX(1150, 1000, 100)).toBe(1100);
});

test("findNearestAggrWithinRadius finds nearest aggr within radius", () => {
  const aggrs = [
    { worldX: 1200, typeId: "human_aggr1", uid: "a" },
    { worldX: 1050, typeId: "human_aggr2", uid: "b" },
  ];

  expect(findNearestAggrWithinRadius(1000, aggrs, 180)).toEqual(aggrs[1]);
  expect(findNearestAggrWithinRadius(1000, aggrs, 40)).toBeNull();
  expect(findNearestAggrWithinRadius(1000, [], 180)).toBeNull();
});

test("resetPeacefulAggrReaction restores baseDriftSpeedX", () => {
  const pedestrian = {
    baseDriftSpeedX: -20,
    driftSpeedX: 0,
  };

  resetPeacefulAggrReaction(pedestrian);

  expect(pedestrian.driftSpeedX).toBe(-20);
});

test("createPeacefulPedestrianProfile sets solo pedestrian fields", () => {
  const profile = createPeacefulPedestrianProfile({
    uid: "obj_human1_test",
    worldX: 7000,
    sidewalkSlot: 3,
    random: () => 0.5,
  });

  expect(profile).toEqual({
    sidewalkSlot: 3,
    spawnWorldX: 7000,
    spawnSidewalkSlot: 3,
    capSlotId: "obj_human1_test",
    driftSpeedX: expect.any(Number),
    baseDriftSpeedX: expect.any(Number),
    driftSpeedY: expect.any(Number),
    yDriftCooldownSec: expect.any(Number),
    isWalking: expect.any(Boolean),
    movementStateTimerSec: expect.any(Number),
    reactionToAggr: "flee",
    fleeRadius: PEACEFUL_REACTION_FLEE_RADIUS,
    fleeSpeed: PEACEFUL_REACTION_FLEE_SPEED,
    fleeMaxDistance: PEACEFUL_REACTION_FLEE_MAX_DISTANCE,
    groupId: null,
    pairRole: null,
  });
  expect(profile.baseDriftSpeedX).toBe(profile.driftSpeedX);
  expect(profile.driftSpeedX).toBeGreaterThanOrEqual(-40);
  expect(profile.driftSpeedX).toBeLessThanOrEqual(-8);
  expect(profile.driftSpeedY).toBeGreaterThanOrEqual(12);
  expect(profile.driftSpeedY).toBeLessThanOrEqual(36);
  expect(profile.yDriftCooldownSec).toBe(profile.driftSpeedY);
});

test("buildPeacefulGroupMembers creates leader and followers with shared capSlotId", () => {
  let call = 0;
  const random = () => {
    call += 1;
    if (call === 1) return 0.5;
    if (call === 2) return 0.5;
    if (call === 3) return 0;
    if (call === 4) return 0.5;
    if (call === 5) return 0.5;
    return 0.5;
  };

  const members = buildPeacefulGroupMembers({
    groupId: "group_test",
    leaderWorldX: 7000,
    sidewalkSlot: 2,
    leaderTypeId: "human1",
    followerTypeIds: ["human2"],
    random,
  });

  expect(members).toHaveLength(2);
  expect(members[0].typeId).toBe("human1");
  expect(members[0].pedestrian.pairRole).toBe("leader");
  expect(members[1].typeId).toBe("human2");
  expect(members[1].pedestrian.pairRole).toBe("follower");
  expect(members[0].pedestrian.capSlotId).toBe("group_test");
  expect(members[1].pedestrian.capSlotId).toBe("group_test");
  expect(members[1].pedestrian.groupFollowOffsetX).toBeGreaterThanOrEqual(60);
  expect(members[1].pedestrian.groupFollowOffsetX).toBeLessThanOrEqual(120);
});

test("countVisiblePeacefulCapSlots counts unique capSlotId on screen", () => {
  const activeObjects = [
    {
      typeId: "human1",
      worldX: 5100,
      pedestrian: { capSlotId: "a" },
    },
    {
      typeId: "human2",
      worldX: 5200,
      pedestrian: { capSlotId: "a" },
    },
    {
      typeId: "human3",
      worldX: 5300,
      pedestrian: { capSlotId: "b" },
    },
    {
      typeId: "human4",
      worldX: 9000,
      pedestrian: { capSlotId: "offscreen" },
    },
  ];
  expect(countVisiblePeacefulCapSlots(activeObjects, 5000, 1024)).toBe(2);
});

test("countVisiblePeacefulCapSlots counts group as one cap slot", () => {
  const activeObjects = [
    {
      typeId: "human1",
      worldX: 5100,
      pedestrian: { capSlotId: "group_a" },
    },
    {
      typeId: "human2",
      worldX: 5180,
      pedestrian: { capSlotId: "group_a" },
    },
  ];
  expect(countVisiblePeacefulCapSlots(activeObjects, 5000, 1024)).toBe(1);
});

test("isPeacefulHumanCapReached respects desktop cap of 6", () => {
  const activeObjects = Array.from({ length: 6 }, (_, i) => ({
    typeId: "human1",
    worldX: 5100 + i * 10,
    pedestrian: { capSlotId: `slot_${i}` },
  }));
  expect(isPeacefulHumanCapReached(activeObjects, 5000, 1024)).toBe(true);
  expect(
    isPeacefulHumanCapReached(activeObjects.slice(0, 5), 5000, 1024),
  ).toBe(false);
});

test("getPeacefulSpawnInterval respects config min/max", () => {
  const config = { minDistance: 1000, maxDistance: 6000 };
  expect(getPeacefulSpawnInterval(config, () => 0)).toBe(1000);
  expect(getPeacefulSpawnInterval(config, () => 1)).toBe(6000);
});

test("pickIsWalking returns true for 40% chance", () => {
  expect(pickIsWalking(() => 0.39)).toBe(true);
  expect(pickIsWalking(() => 0.4)).toBe(false);
});

test("getEffectiveDriftSpeedX returns 0 when standing", () => {
  expect(
    getEffectiveDriftSpeedX({ isWalking: false, driftSpeedX: -20 }),
  ).toBe(0);
  expect(
    getEffectiveDriftSpeedX({ isWalking: true, driftSpeedX: -20 }),
  ).toBe(-20);
});

test("tickPeacefulMovementState toggles isWalking after timer", () => {
  const pedestrian = {
    isWalking: false,
    movementStateTimerSec: 0.1,
  };
  tickPeacefulMovementState(pedestrian, 0.2, () => 0.1);
  expect(pedestrian.isWalking).toBe(true);
  expect(pedestrian.movementStateTimerSec).toBeGreaterThan(0);
});

test("resolvePeacefulHumanSpawnWorldX avoids quest crossing exclusion zones", () => {
  const zones = [{ left: 1500, right: 1730 }];
  const random = () => 0;

  const worldX = resolvePeacefulHumanSpawnWorldX(
    [],
    1000,
    1024,
    random,
    zones,
  );

  expect(worldX + 60 <= 1500 || worldX >= 1730).toBe(true);
});
