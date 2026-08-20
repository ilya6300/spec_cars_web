import { expect, test } from "vitest";

import { getPeacefulIdleAnimationStyle, hashUidString } from "./peacefulHumanIdle";

test("hashUidString is deterministic", () => {
  const uid = "obj_human1_1234567890_0.123";
  expect(hashUidString(uid)).toBe(hashUidString(uid));
});

test("hashUidString handles empty and undefined without throwing", () => {
  expect(() => hashUidString("")).not.toThrow();
  expect(() => hashUidString(undefined)).not.toThrow();
  expect(hashUidString("")).toBe(0);
  expect(hashUidString(undefined)).toBe(0);
});

test("getPeacefulIdleAnimationStyle amplitude is 2-4px", () => {
  const uids = [
    "",
    "obj_human1_1",
    "obj_human2_2",
    "obj_human3_3",
    "obj_human4_4",
    "obj_human5_5",
  ];
  for (const uid of uids) {
    const style = getPeacefulIdleAnimationStyle(uid);
    const amplitude = parseInt(style["--peaceful-idle-amplitude"], 10);
    expect(amplitude).toBeGreaterThanOrEqual(2);
    expect(amplitude).toBeLessThanOrEqual(4);
  }
});

test("getPeacefulIdleAnimationStyle animationDuration is 2.5-3.5s", () => {
  const uids = [
    "",
    "obj_human1_1",
    "obj_human2_2",
    "obj_human3_3",
    "obj_human4_4",
    "obj_human5_5",
  ];
  for (const uid of uids) {
    const style = getPeacefulIdleAnimationStyle(uid);
    const duration = parseFloat(style.animationDuration);
    expect(duration).toBeGreaterThanOrEqual(2.5);
    expect(duration).toBeLessThanOrEqual(3.5);
  }
});

test("getPeacefulIdleAnimationStyle animationDelay is negative", () => {
  const style = getPeacefulIdleAnimationStyle("obj_human1_1234567890_0.456");
  expect(style.animationDelay.startsWith("-")).toBe(true);
});

test("different uids produce different animationDelay", () => {
  const styleA = getPeacefulIdleAnimationStyle("obj_human1_111_0.1");
  const styleB = getPeacefulIdleAnimationStyle("obj_human2_222_0.2");
  expect(styleA.animationDelay).not.toBe(styleB.animationDelay);
});
