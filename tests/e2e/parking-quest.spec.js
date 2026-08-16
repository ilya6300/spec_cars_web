import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  getHelpCounts,
  navigateToFreeMode,
  startDriving,
} from "./helpers.js";

test.describe("Parking Quest E2E", () => {
  test("Parking quest: spawn zone -> click violation -> wait 1s -> finish overlay -> parkingFine++", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToFreeMode(page);

    await startDriving(page, { gear: "1", gasMs: 2000 });

    await page.evaluate(() => {
      const mapStore = window.__TEST_STATE__?.activeMapStore;
      if (!mapStore) return;
      mapStore.__forceParkingIllegal = true;
      mapStore.nextSpawnDistances.parking_zone = 0;
      mapStore.nextSpawnDistances.traffic_light_quest_crossing = 999999;
      mapStore.isPedestrianCrossingQuestActive = false;
      mapStore.pedestrianCrossingTargetObject = null;
      mapStore.offsetX = 16000;
    });

    await page.waitForSelector('[data-type="parking-zone-layer"]', {
      timeout: 30000,
    });

    await page.waitForSelector('[data-type="parking-violation-car"]', {
      timeout: 15000,
    });

    const initialCounts = await getHelpCounts(page);

    await page.click('[data-type="parking-violation-car"]', { force: true });

    await page.waitForFunction(
      () =>
        window.__TEST_STATE__?.activeMapStore?.parkingFineTargetZone?.parkingZone
          ?.showFinishOverlay === true,
      { timeout: 5000 },
    );

    await page.waitForSelector('[data-type="quest-finish-overlay"]', {
      timeout: 5000,
    });

    await page.click('[data-type="quest-finish-continue"]');

    const finalCounts = await getHelpCounts(page);

    expect(finalCounts.parkingFine).toBeGreaterThan(initialCounts.parkingFine);
  });
});
