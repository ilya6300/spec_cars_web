import { expect, test } from "vitest";
import Cars, {
  getEffectiveLayoutTokens,
  getWheelById,
  layoutTokensToCssVars,
  PLAYER_LAYOUT_TOKENS,
} from "./cars";

test("cars.jsx: wheels count is 17", () => {
  expect(Cars.wheels).toHaveLength(17);
});

test("cars.jsx: police-0 has layoutTokens", () => {
  expect(Cars.cars[0].layoutTokens).toEqual(PLAYER_LAYOUT_TOKENS);
});

test("getWheelById returns wheel by id", () => {
  expect(getWheelById("shell_1")?.id).toBe("shell_1");
  expect(getWheelById("whell_new_16")?.id).toBe("whell_new_16");
});

test("getEffectiveLayoutTokens merges mobile width", () => {
  expect(getEffectiveLayoutTokens(PLAYER_LAYOUT_TOKENS, 1200, 800).width).toBe(
    "250px",
  );
  expect(getEffectiveLayoutTokens(PLAYER_LAYOUT_TOKENS, 800, 500).width).toBe(
    "220px",
  );
});

test("layoutTokensToCssVars maps player car vars", () => {
  expect(layoutTokensToCssVars(PLAYER_LAYOUT_TOKENS)).toEqual({
    "--player-car-width": "250px",
    "--player-car-wheel-offset": "11%",
    "--player-car-body-lift": "-1%",
    "--player-car-wheel-bottom": "-11%",
    "--player-car-wheel-size": "20.5%",
    "--player-car-wheel-left": "9%",
    "--player-car-wheel-right": "69%",
  });
});
