const FUEL_KEY_PREFIX = "spec_cars_fuel";
const TOTAL_STARS_KEY = "spec_cars_total_stars";
const TOTAL_COINS_KEY = "spec_cars_total_coins";
const ACTIVE_SKIN_KEY = "spec_cars_active_skin";
const ACTIVE_WHEEL_KEY = "spec_cars_active_wheel";
const RECORDS_KEY_PREFIX = "spec_cars_records";
const SAVE_DELAY_MS = 1500;

let pendingFuel = null;
let pendingCarId = null;
let saveTimerId = null;

function fuelKey(carId) {
  return carId ? `${FUEL_KEY_PREFIX}_${carId}` : FUEL_KEY_PREFIX;
}

function recordsKey(mode) {
  return `${RECORDS_KEY_PREFIX}_${mode}`;
}

function normalizeFreeRecord(record) {
  if (!record || typeof record !== "object") return null;

  const coins = record.coins ?? record.stars;
  if (
    !Number.isFinite(record.timeSec) ||
    record.timeSec < 0 ||
    !Number.isFinite(record.km) ||
    record.km < 0 ||
    !Number.isFinite(coins) ||
    coins < 0
  ) {
    return null;
  }

  return {
    timeSec: record.timeSec,
    km: record.km,
    coins,
  };
}

function isValidFreeRecord(record) {
  return normalizeFreeRecord(record) !== null;
}

function isValidTimedRecord(record) {
  return (
    record &&
    typeof record === "object" &&
    Number.isFinite(record.score) &&
    record.score >= 0
  );
}

function isValidChaseRecord(record) {
  return (
    record &&
    typeof record === "object" &&
    Number.isFinite(record.timeSec) &&
    record.timeSec >= 0
  );
}

function isValidRecord(mode, record) {
  if (mode === "free") return isValidFreeRecord(record);
  if (mode === "timed") return isValidTimedRecord(record);
  if (mode === "chase") return isValidChaseRecord(record);
  return false;
}

export function loadFuel(maxFuel, carId) {
  try {
    const raw = localStorage.getItem(fuelKey(carId));
    if (raw === null) return null;

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > maxFuel) {
      return maxFuel;
    }
    return value;
  } catch {
    return null;
  }
}

function flushFuel() {
  if (pendingFuel === null) return;
  try {
    localStorage.setItem(fuelKey(pendingCarId), String(pendingFuel));
  } catch {
    /* private mode / quota */
  }
  pendingFuel = null;
  pendingCarId = null;
  saveTimerId = null;
}

export function scheduleFuelSave(value, carId) {
  pendingFuel = value;
  pendingCarId = carId;
  if (saveTimerId) clearTimeout(saveTimerId);
  saveTimerId = setTimeout(flushFuel, SAVE_DELAY_MS);
}

export function flushPendingFuelSave(value, carId) {
  if (value !== undefined && value !== null) {
    pendingFuel = value;
    pendingCarId = carId ?? pendingCarId;
  }
  if (saveTimerId) {
    clearTimeout(saveTimerId);
    saveTimerId = null;
  }
  flushFuel();
}

export function loadTotalCoins() {
  try {
    const raw = localStorage.getItem(TOTAL_COINS_KEY);
    if (raw !== null) {
      const value = Number(raw);
      if (Number.isFinite(value) && value >= 0) {
        return Math.floor(value);
      }
    }

    const legacyRaw = localStorage.getItem(TOTAL_STARS_KEY);
    if (legacyRaw !== null) {
      const legacyValue = Number(legacyRaw);
      if (Number.isFinite(legacyValue) && legacyValue >= 0) {
        const migrated = Math.floor(legacyValue);
        saveTotalCoins(migrated);
        return migrated;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}

export function saveTotalCoins(value) {
  try {
    localStorage.setItem(
      TOTAL_COINS_KEY,
      String(Math.max(0, Math.floor(value))),
    );
  } catch {
    /* private mode / quota */
  }
}

export function loadActiveSkin() {
  try {
    const raw = localStorage.getItem(ACTIVE_SKIN_KEY);
    return raw ?? "default";
  } catch {
    return "default";
  }
}

export function saveActiveSkin(skinId) {
  try {
    localStorage.setItem(ACTIVE_SKIN_KEY, String(skinId));
  } catch {
    /* private mode / quota */
  }
}

export function loadActiveWheel() {
  try {
    const raw = localStorage.getItem(ACTIVE_WHEEL_KEY);
    return raw ?? "shell_1";
  } catch {
    return "shell_1";
  }
}

export function saveActiveWheel(wheelId) {
  try {
    localStorage.setItem(ACTIVE_WHEEL_KEY, String(wheelId));
  } catch {
    /* private mode / quota */
  }
}

export function loadRecords(mode) {
  try {
    const raw = localStorage.getItem(recordsKey(mode));
    if (raw === null) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((record) => {
        if (mode === "free") {
          return normalizeFreeRecord(record);
        }
        if (isValidRecord(mode, record)) {
          return record;
        }
        return null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function saveRecords(mode, records) {
  try {
    localStorage.setItem(recordsKey(mode), JSON.stringify(records));
  } catch {
    /* private mode / quota */
  }
}

export function registerFuelSaveOnUnload() {
  if (typeof window === "undefined") return () => {};

  const handleUnload = () => flushFuel();
  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}
