import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  getHelpCounts,
  navigateToFreeMode,
  startDriving,
} from "./helpers.js";

test.describe("Integration: Full Quest Flow", () => {
  test.skip("Full flow: quest crossing spawn -> pedestrian fine -> helpCounts increases", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToFreeMode(page);

    await startDriving(page, { gear: "1", gasMs: 2000 });

    await page.evaluate(() => {
      const mapStore = window.__TEST_STATE__?.activeMapStore;
      if (!mapStore) return;
      mapStore.__forcePedestrianCrossOnRed = true;
      mapStore.nextSpawnDistances.traffic_light_quest_crossing = 0;
      mapStore.offsetX = 15000;
    });

    await page.waitForSelector('[data-type="traffic_light_quest_crossing"]', {
      timeout: 30000,
    });
    await page.waitForSelector('[data-type="quest-crossing-human"]', {
      timeout: 10000,
    });

    const initialCounts = await getHelpCounts(page);

    await page.click('[data-type="quest-crossing-human"]');
    await page.waitForSelector('[data-type="pedestrian-fine-button"]', {
      state: "visible",
    });
    await page.click('[data-type="pedestrian-fine-button"]');
    await page.waitForSelector('[data-type="quest-finish-overlay"]');
    await page.click('[data-type="quest-finish-continue"]');

    const finalCounts = await getHelpCounts(page);

    expect(finalCounts.pedestrianFine).toBeGreaterThan(
      initialCounts.pedestrianFine,
    );
  });
});
