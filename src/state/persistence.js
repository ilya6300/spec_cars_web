const FUEL_KEY_PREFIX = "spec_cars_fuel";
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

export function registerFuelSaveOnUnload() {
  if (typeof window === "undefined") return () => {};

  const handleUnload = () => flushFuel();
  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}
