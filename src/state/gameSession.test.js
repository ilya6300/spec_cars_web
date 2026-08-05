import { expect, test, vi } from "vitest";
import { tickGameFrame } from "./gameSession";

test("tickGameFrame: вызывает физику, advance мира и tickWorld в правильном порядке", () => {
  const calls = [];
  const carStore = {
    updatePhysics: vi.fn(() => calls.push("physics")),
    checkTrafficLight: vi.fn(() => calls.push("traffic")),
  };
  const mapStore = {
    advance: vi.fn(() => calls.push("advance")),
    tickWorld: vi.fn(() => calls.push("tickWorld")),
  };

  tickGameFrame({
    carStore,
    mapStore,
    viewportWidth: 800,
    deltaTime: 0.016,
  });

  expect(calls).toEqual(["physics", "advance", "traffic", "tickWorld"]);
  expect(carStore.updatePhysics).toHaveBeenCalledWith(0.016);
  expect(mapStore.advance).toHaveBeenCalledWith(carStore.currentSpeed, 0.016);
  expect(carStore.checkTrafficLight).toHaveBeenCalledWith(mapStore);
  expect(mapStore.tickWorld).toHaveBeenCalledWith(carStore, 0.016, 800);
});
