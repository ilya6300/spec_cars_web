import { isPeacefulHumanType } from "./modeScoring";
import { isPeacefulHumanOverlappingQuestCrossing } from "./questCrossingConstants";

export const SIDEWALK_SLOT_BOTTOM_PERCENT = [61, 63, 65, 67, 69];
export const PEACEFUL_HUMAN_WIDTH_PX = 60;

export const PEACEFUL_SPAWN_TIERS = {
  frequent: { minDistance: 600, maxDistance: 3600 },
  medium: { minDistance: 1000, maxDistance: 6000 },
  rare: { minDistance: 1600, maxDistance: 8000 },
};

export const PEACEFUL_HUMAN_CAP_DESKTOP = 6;
export const PEACEFUL_HUMAN_CAP_MOBILE = 4;
export const PEACEFUL_HUMAN_CAP_VIEWPORT_BREAKPOINT = 900;

export const PEACEFUL_DRIFT_SPEED_X_MIN = -40;
export const PEACEFUL_DRIFT_SPEED_X_MAX = -8;
export const PEACEFUL_DRIFT_SPEED_X_POSITIVE_CHANCE = 0.15;
export const PEACEFUL_Y_DRIFT_INTERVAL_MIN_SEC = 12;
export const PEACEFUL_Y_DRIFT_INTERVAL_MAX_SEC = 36;
export const PEACEFUL_GROUP_SPAWN_CHANCE = 0.25;
export const PEACEFUL_GROUP_SIZE_3_CHANCE = 0.25;
export const PEACEFUL_GROUP_FOLLOW_OFFSET_MIN = 60;
export const PEACEFUL_GROUP_FOLLOW_OFFSET_MAX = 120;

export const PEACEFUL_HUMAN_Z_INDEX = 3;
/** Выше мирных пешеходов — иначе human1…16 перехватывают клик по human_aggr* */
export const POLICE_AGGRO_Z_INDEX = PEACEFUL_HUMAN_Z_INDEX + 1;
export const PEACEFUL_SPAWN_MIN_SEPARATION_PX = 80;
export const PEACEFUL_MOVEMENT_WALK_CHANCE = 0.4;
export const PEACEFUL_MOVEMENT_STATE_MIN_SEC = 2;
export const PEACEFUL_MOVEMENT_STATE_MAX_SEC = 7;

export const PEACEFUL_REACTION_FLEE_RADIUS = 180;
export const PEACEFUL_REACTION_FLEE_MAX_DISTANCE = 100;
export const PEACEFUL_REACTION_FLEE_SPEED = 60;
export const PEACEFUL_REACTION_WATCH_CHANCE = 0.3;
export const PEACEFUL_HUMAN_AGGR_WIDTH = 110;

export function getSidewalkBottomPercent(sidewalkSlot) {
  const slot = Math.max(0, Math.min(4, Math.floor(sidewalkSlot ?? 2)));
  return SIDEWALK_SLOT_BOTTOM_PERCENT[slot];
}

export function getPeacefulHumanCap(viewportWidth) {
  return viewportWidth > PEACEFUL_HUMAN_CAP_VIEWPORT_BREAKPOINT
    ? PEACEFUL_HUMAN_CAP_DESKTOP
    : PEACEFUL_HUMAN_CAP_MOBILE;
}

export function getPeacefulHumanInitialSpawnDistance(humanIndex, random = Math.random) {
  const i = Math.max(0, Math.min(15, Math.floor(humanIndex)));
  return 400 + i * 180 + Math.floor(random() * 280);
}

export function computePeacefulHumanWorldX(offsetX, viewportWidth, random = Math.random) {
  const edgeSpread = Math.min(240, viewportWidth * 0.25);
  const minX = offsetX + viewportWidth;
  const maxX = minX + edgeSpread;
  return minX + random() * (maxX - minX);
}

export function resolvePeacefulHumanSpawnWorldX(
  activeObjects,
  offsetX,
  viewportWidth,
  random = Math.random,
  questCrossingZones = [],
) {
  const baseX = computePeacefulHumanWorldX(offsetX, viewportWidth, random);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate =
      attempt === 0
        ? baseX
        : baseX + (random() - 0.5) * 500;

    const tooClose = activeObjects.some((obj) => {
      if (!isPeacefulHumanType(obj.typeId)) return false;
      return (
        Math.abs(obj.worldX - candidate) < PEACEFUL_SPAWN_MIN_SEPARATION_PX
      );
    });

    const overlapsCrossing = questCrossingZones.some((zone) =>
      isPeacefulHumanOverlappingQuestCrossing(
        candidate,
        PEACEFUL_HUMAN_WIDTH_PX,
        zone,
      ),
    );

    if (!tooClose && !overlapsCrossing) {
      return candidate;
    }
  }

  return baseX + random() * 300;
}

export function pickSidewalkSlot(random = Math.random) {
  return Math.floor(random() * 5);
}

export function pickDriftSpeedX(random = Math.random) {
  if (random() < PEACEFUL_DRIFT_SPEED_X_POSITIVE_CHANCE) {
    return (
      8 +
      random() *
        (Math.abs(PEACEFUL_DRIFT_SPEED_X_MIN) - 8)
    );
  }
  return (
    PEACEFUL_DRIFT_SPEED_X_MIN +
    random() * (PEACEFUL_DRIFT_SPEED_X_MAX - PEACEFUL_DRIFT_SPEED_X_MIN)
  );
}

export function pickYDriftIntervalSec(random = Math.random) {
  return (
    PEACEFUL_Y_DRIFT_INTERVAL_MIN_SEC +
    random() *
      (PEACEFUL_Y_DRIFT_INTERVAL_MAX_SEC - PEACEFUL_Y_DRIFT_INTERVAL_MIN_SEC)
  );
}

export function pickReactionToAggr(random = Math.random) {
  return random() < PEACEFUL_REACTION_WATCH_CHANCE ? "watch" : "flee";
}

export function getVisibleHumanAggrObjects(activeObjects, offsetX, viewportWidth) {
  const result = [];
  for (const obj of activeObjects) {
    if (!/^human_aggr\d+$/.test(obj.typeId)) continue;
    const screenX = obj.worldX - offsetX;
    if (
      screenX < viewportWidth &&
      screenX + PEACEFUL_HUMAN_AGGR_WIDTH > 0
    ) {
      result.push({ worldX: obj.worldX, typeId: obj.typeId, uid: obj.uid });
    }
  }
  return result;
}

export function findNearestAggrWithinRadius(pedWorldX, visibleAggrs, fleeRadius) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const aggr of visibleAggrs) {
    const distance = Math.abs(pedWorldX - aggr.worldX);
    if (distance <= fleeRadius && distance < nearestDistance) {
      nearest = aggr;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function computeFleeSpeedX(pedWorldX, aggrWorldX, fleeSpeed) {
  const sign = pedWorldX <= aggrWorldX ? -1 : 1;
  return sign * fleeSpeed;
}

export function clampFleeWorldX(worldX, spawnWorldX, fleeMaxDistance) {
  const min = spawnWorldX - fleeMaxDistance;
  const max = spawnWorldX + fleeMaxDistance;
  return Math.max(min, Math.min(max, worldX));
}

export function resetPeacefulAggrReaction(pedestrian) {
  if (pedestrian.baseDriftSpeedX !== undefined) {
    pedestrian.driftSpeedX = pedestrian.baseDriftSpeedX;
  }
}

export function pickIsWalking(random = Math.random) {
  return random() < PEACEFUL_MOVEMENT_WALK_CHANCE;
}

export function pickMovementStateDurationSec(random = Math.random) {
  return (
    PEACEFUL_MOVEMENT_STATE_MIN_SEC +
    random() *
      (PEACEFUL_MOVEMENT_STATE_MAX_SEC - PEACEFUL_MOVEMENT_STATE_MIN_SEC)
  );
}

export function tickPeacefulMovementState(pedestrian, deltaTime, random = Math.random) {
  pedestrian.movementStateTimerSec -= deltaTime;
  if (pedestrian.movementStateTimerSec > 0) {
    return;
  }
  pedestrian.isWalking = pickIsWalking(random);
  pedestrian.movementStateTimerSec = pickMovementStateDurationSec(random);
}

export function getEffectiveDriftSpeedX(pedestrian) {
  if (!pedestrian?.isWalking) {
    return 0;
  }
  return pedestrian.driftSpeedX ?? 0;
}

export function pickGroupFollowOffsetX(random = Math.random) {
  const range =
    PEACEFUL_GROUP_FOLLOW_OFFSET_MAX - PEACEFUL_GROUP_FOLLOW_OFFSET_MIN;
  return Math.min(
    PEACEFUL_GROUP_FOLLOW_OFFSET_MAX,
    PEACEFUL_GROUP_FOLLOW_OFFSET_MIN + Math.floor(random() * (range + 1)),
  );
}

export function pickPeacefulGroupSize(random = Math.random) {
  return random() < PEACEFUL_GROUP_SIZE_3_CHANCE ? 3 : 2;
}

export function shouldSpawnPeacefulGroup(random = Math.random) {
  return random() < PEACEFUL_GROUP_SPAWN_CHANCE;
}

export function createGroupId(prefix = "peaceful_group") {
  return `${prefix}_${Date.now()}_${Math.random()}`;
}

export function tickPeacefulDriftX(worldX, driftSpeedX, deltaTime) {
  return worldX + driftSpeedX * deltaTime;
}

export function tickPeacefulYDriftSlot(pedestrian, deltaTime, random = Math.random) {
  pedestrian.yDriftCooldownSec -= deltaTime;
  if (pedestrian.yDriftCooldownSec > 0) {
    return;
  }

  const current = pedestrian.sidewalkSlot;
  const direction = random() < 0.5 ? -1 : 1;
  pedestrian.sidewalkSlot = Math.max(0, Math.min(4, current + direction));
  pedestrian.yDriftCooldownSec = pedestrian.driftSpeedY;
}

export function computeFollowerWorldX(leaderWorldX, driftSpeedX, offsetX) {
  const sign = Math.sign(driftSpeedX) || -1;
  return leaderWorldX - sign * offsetX;
}

export function createPeacefulPedestrianProfile({
  uid,
  worldX,
  sidewalkSlot,
  groupId = null,
  pairRole = null,
  groupFollowOffsetX,
  capSlotId,
  driftSpeedX,
  driftSpeedY,
  random = Math.random,
}) {
  const slot = Math.max(0, Math.min(4, Math.floor(sidewalkSlot)));
  const resolvedDriftSpeedX = driftSpeedX ?? pickDriftSpeedX(random);
  const resolvedDriftSpeedY = driftSpeedY ?? pickYDriftIntervalSec(random);
  const resolvedCapSlotId = capSlotId ?? groupId ?? uid;
  const resolvedReactionToAggr = pickReactionToAggr(random);

  const profile = {
    sidewalkSlot: slot,
    spawnWorldX: worldX,
    spawnSidewalkSlot: slot,
    capSlotId: resolvedCapSlotId,
    driftSpeedX: resolvedDriftSpeedX,
    baseDriftSpeedX: resolvedDriftSpeedX,
    driftSpeedY: resolvedDriftSpeedY,
    yDriftCooldownSec: resolvedDriftSpeedY,
    isWalking: pickIsWalking(random),
    movementStateTimerSec: pickMovementStateDurationSec(random),
    reactionToAggr: resolvedReactionToAggr,
    fleeRadius: PEACEFUL_REACTION_FLEE_RADIUS,
    fleeSpeed: PEACEFUL_REACTION_FLEE_SPEED,
    fleeMaxDistance: PEACEFUL_REACTION_FLEE_MAX_DISTANCE,
    groupId,
    pairRole,
  };

  if (groupFollowOffsetX !== undefined) {
    profile.groupFollowOffsetX = groupFollowOffsetX;
  }

  return profile;
}

export function buildPeacefulGroupMembers({
  groupId,
  leaderWorldX,
  sidewalkSlot,
  leaderTypeId,
  followerTypeIds,
  random = Math.random,
}) {
  const leaderDriftSpeedX = pickDriftSpeedX(random);
  const leaderDriftSpeedY = pickYDriftIntervalSec(random);
  const baseFollowOffsetX = pickGroupFollowOffsetX(random);
  const members = [];

  const leaderUid = `obj_${leaderTypeId}_${Date.now()}_${random()}`;
  members.push({
    uid: leaderUid,
    typeId: leaderTypeId,
    worldX: leaderWorldX,
    pedestrian: createPeacefulPedestrianProfile({
      uid: leaderUid,
      worldX: leaderWorldX,
      sidewalkSlot,
      groupId,
      pairRole: "leader",
      capSlotId: groupId,
      driftSpeedX: leaderDriftSpeedX,
      driftSpeedY: leaderDriftSpeedY,
      random,
    }),
  });

  for (let i = 0; i < followerTypeIds.length; i += 1) {
    const followerTypeId = followerTypeIds[i];
    const followOffsetX = baseFollowOffsetX * (i + 1);
    const followerWorldX =
      computeFollowerWorldX(
        leaderWorldX,
        leaderDriftSpeedX,
        followOffsetX,
      ) + (random() - 0.5) * 80;
    const followerUid = `obj_${followerTypeId}_${Date.now()}_${random()}`;
    const followerSlot = pickSidewalkSlot(random);

    members.push({
      uid: followerUid,
      typeId: followerTypeId,
      worldX: followerWorldX,
      pedestrian: createPeacefulPedestrianProfile({
        uid: followerUid,
        worldX: followerWorldX,
        sidewalkSlot: followerSlot,
        groupId,
        pairRole: "follower",
        capSlotId: groupId,
        driftSpeedX: leaderDriftSpeedX,
        driftSpeedY: leaderDriftSpeedY,
        groupFollowOffsetX: followOffsetX,
        random,
      }),
    });
  }

  return members;
}

export function getPeacefulSpawnInterval(config, random = Math.random) {
  return (
    config.minDistance + random() * (config.maxDistance - config.minDistance)
  );
}

export function isPeacefulHumanVisibleOnScreen(obj, offsetX, viewportWidth) {
  const screenX = obj.worldX - offsetX;
  return screenX > -PEACEFUL_HUMAN_WIDTH_PX && screenX < viewportWidth;
}

export function countVisiblePeacefulCapSlots(
  activeObjects,
  offsetX,
  viewportWidth,
) {
  const capSlotIds = new Set();
  for (const obj of activeObjects) {
    if (!isPeacefulHumanType(obj.typeId)) continue;
    if (!isPeacefulHumanVisibleOnScreen(obj, offsetX, viewportWidth)) {
      continue;
    }
    const capSlotId = obj.pedestrian?.capSlotId;
    if (capSlotId) capSlotIds.add(capSlotId);
  }
  return capSlotIds.size;
}

export function isPeacefulHumanCapReached(activeObjects, offsetX, viewportWidth) {
  return (
    countVisiblePeacefulCapSlots(activeObjects, offsetX, viewportWidth) >=
    getPeacefulHumanCap(viewportWidth)
  );
}
