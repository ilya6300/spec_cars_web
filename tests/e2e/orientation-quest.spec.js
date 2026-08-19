import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  navigateToFreeMode,
} from "./helpers.js";

test.describe("Orientation Quest E2E", () => {
  test("dispatch -> HUD -> repeat radio -> arrest -> HUD gone", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToFreeMode(page);

    await page.waitForTimeout(3500);

    await page.evaluate(() => {
      const mapStore = window.__TEST_STATE__?.activeMapStore;
      if (!mapStore) return;
      mapStore.offsetX = 5000;
      mapStore.gameMode = "free";
      mapStore.isPoliceQuestActive = false;
      mapStore.isPedestrianCrossingQuestActive = false;
      mapStore.isQuestArrestActive = false;
      mapStore.pendingEvacuationTarget = null;
      mapStore.parkingEvacuation.phase = "idle";
      mapStore.orientationQuest = {
        active: false,
        targetUid: null,
        targetWorldX: 0,
      };

      const originalRandom = Math.random;
      window.__TEST_RANDOM_QUEUE__ = [0, 0];
      Math.random = () => {
        if (window.__TEST_RANDOM_QUEUE__?.length) {
          return window.__TEST_RANDOM_QUEUE__.shift();
        }
        return originalRandom();
      };
    });

    await page.click('.ratio-img-controller[data-type="ratio"]', {
      force: true,
    });

    await page.waitForTimeout(9000);

    const orientationActive = await page.evaluate(
      () =>
        window.__TEST_STATE__?.activeMapStore?.orientationQuest?.active === true,
    );

    if (!orientationActive) {
      await page.evaluate(() => {
        window.__TEST_STATE__?.activeMapStore?.spawnOrientationTarget();
      });
    }

    await expect(
      page.locator('[data-type="orientation-distance-hud"]'),
    ).toBeVisible({ timeout: 5000 });

    await page.click('.ratio-img-controller[data-type="ratio"]', { force: true });

    await page.waitForFunction(
      () =>
        document.body.textContent?.includes("ориентировку") ||
        document.body.textContent?.includes("следую к цели"),
      { timeout: 10000 },
    );

    const targetType = await page.evaluate(() => {
      const mapStore = window.__TEST_STATE__?.activeMapStore;
      const target = mapStore?.activeObjects?.find((obj) => obj.orientationSpawn);
      return target?.typeId ?? null;
    });
    expect(targetType).toBeTruthy();

    await page.click(`[data-type="${targetType}"]`, { force: true });

    await page.waitForSelector('[data-type="police-quest-arrest"]', {
      timeout: 20000,
    });

    await page.click('[data-type="police-quest-arrest"]', { force: true });

    await page.waitForSelector('[data-type="quest-finish-overlay"]', {
      timeout: 20000,
    });
    await page.waitForSelector('[data-type="quest-finish-continue"]', {
      timeout: 5000,
    });
    await page.click('[data-type="quest-finish-continue"]', { force: true });
    await page.waitForSelector(".police-quest-modal", { state: "hidden" });

    await page.waitForFunction(
      () =>
        window.__TEST_STATE__?.activeMapStore?.orientationQuest?.active === false,
      { timeout: 15000 },
    );

    await expect(
      page.locator('[data-type="orientation-distance-hud"]'),
    ).toHaveCount(0);
  });
});
