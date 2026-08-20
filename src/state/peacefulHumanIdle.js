export function hashUidString(uid) {
  const str = String(uid ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getPeacefulIdleAnimationStyle(uid) {
  const hash = hashUidString(uid);
  return {
    "--peaceful-idle-amplitude": `${2 + (hash % 3)}px`,
    animationDuration: `${(25 + (hash % 11)) / 10}s`,
    animationDelay: `-${((hash >> 4) % 35) / 10}s`,
  };
}
