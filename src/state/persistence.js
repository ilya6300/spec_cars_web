const FUEL_KEY_PREFIX = "spec_cars_fuel";
const TOTAL_STARS_KEY = "spec_cars_total_stars";
const SAVE_DELAY_MS = 1500;

let pendingFuel = null;
let pendingCarId = null;
let saveTimerId = null;

function fuelKey(carId) {
  return carId ? `${FUEL_KEY_PREFIX}_${carId}` : FUEL_KEY_PREFIX;
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

export function loadTotalStars() {
  try {
    const raw = localStorage.getItem(TOTAL_STARS_KEY);
    if (raw === null) return 0;

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.floor(value);
  } catch {
    return 0;
  }
}

export function saveTotalStars(value) {
  try {
    localStorage.setItem(TOTAL_STARS_KEY, String(Math.max(0, Math.floor(value))));
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
