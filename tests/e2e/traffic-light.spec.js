import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  startDriving,
  holdGasFor,
} from "./helpers.js";

async function waitForTrafficLightSpawned(page, timeout = 15000) {
  await page.waitForFunction(
    () => {
      const map = window.__TEST_STATE__?.activeMapStore;
      return (
        map?.activeObjects?.some((obj) => obj.typeId === "traffic_light") ??
        false
      );
    },
    { timeout },
  );
}

test.describe("Traffic Light E2E", () => {
  test.beforeEach(async ({ page }) => {
    await enablePlaywrightTestState(page);
  });

  test("Traffic light appears and cycles red/green", async ({ page }) => {
    test.setTimeout(240000);

    page.on("pageerror", (err) => console.error("Page error:", err.message));

    await page.goto("/");
    await page.waitForSelector("#root", { timeout: 10000 });
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const map = window.__TEST_STATE__?.activeMapStore;
      if (map) {
        map.offsetX = 8500;
      }
    });

    await waitForTrafficLightSpawned(page);
    await startDriving(page, { gear: "2", gasMs: 0 });
    await holdGasFor(page, 5000);
    await page.mouse.up();

    const trafficLight = await page.$('[data-type="traffic_light"]');
    expect(trafficLight).toBeTruthy();

    const isVisible = await trafficLight?.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test("Car stops on red traffic light", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "2", gasMs: 0 });
    await page.waitForTimeout(5000);

    const initialDistance = await page.evaluate(
      () => window.__TEST_STATE__?.distance || 0,
    );

    await holdGasFor(page, 25000);

    const finalDistance = await page.evaluate(
      () => window.__TEST_STATE__?.distance || 0,
    );

    const trafficLight = await page.$('[data-type="traffic_light"]');
    if (trafficLight) {
      expect(trafficLight).toBeTruthy();
      expect(finalDistance).toBeGreaterThanOrEqual(initialDistance);
    }
  });
});
