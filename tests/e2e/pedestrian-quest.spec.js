import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  getHelpCounts,
  navigateToFreeMode,
  startDriving,
} from "./helpers.js";

test.describe("Pedestrian Quest E2E", () => {
  test("Pedestrian quest: quest crossing -> click pedestrian -> finish overlay -> helpCounts increases", async ({
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

    await page.waitForFunction(() => {
      const obj = window.__TEST_STATE__?.activeMapStore?.pedestrianCrossingTargetObject;
      const phase = obj?.questCrossing?.phase;
      return phase === "walking" || phase === "stopped";
    }, { timeout: 15000 });

    const initialCounts = await getHelpCounts(page);

    await page.click('[data-type="quest-crossing-human"]');

    await page.waitForSelector('[data-type="quest-finish-overlay"]', {
      timeout: 10000,
    });
    await page.click('[data-type="quest-finish-continue"]');

    await expect(page.locator('[data-type="pedestrian-crossing-layer"]')).toHaveCount(0);

    const finalCounts = await getHelpCounts(page);

    expect(finalCounts.pedestrianFine).toBeGreaterThan(
      initialCounts.pedestrianFine,
    );
  });
});
