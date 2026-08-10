import { expect, test } from "vitest";
import { getCarById, getDefaultCar } from "./cars";

test("getDefaultCar returns police car", () => {
  const car = getDefaultCar();
  expect(car.service).toBe("police");
  expect(car.id).toBe("police-0");
  expect(Array.isArray(car.skins)).toBe(true);
  expect(car.skins[0].id).toBe("default");
});

test("getCarById falls back to default", () => {
  expect(getCarById("unknown").id).toBe("police-0");
  expect(getCarById("police-0").id).toBe("police-0");
});
