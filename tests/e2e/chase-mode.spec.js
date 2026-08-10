import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  navigateToGameMode,
  startDriving,
} from "./helpers.js";

test.describe("Chase mode night fixes", () => {
  test("chase: night overlay, no pedestrian modal, yellow traffic lights", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");

    await expect(page.locator(".game-viewport--night")).toBeVisible();
    await expect(
      page.locator('[data-type="atmosphere-overlay"]'),
    ).toBeVisible();

    await startDriving(page, { gear: "2", gasMs: 3000 });
    await page.waitForTimeout(15000);

    await expect(page.locator(".pedestrian-crossing-layer")).toHaveCount(0);

    const trafficLight = page.locator('[data-type="traffic_light"]').first();
    if ((await trafficLight.count()) > 0) {
      const bg = await trafficLight.evaluate((el) =>
        getComputedStyle(el).backgroundImage,
      );
      expect(bg).toMatch(/traffic_light_yellow/i);
    }

    const humans = await page.locator('[data-type^="human"]').all();
    for (const h of humans) {
      const type = await h.getAttribute("data-type");
      expect(type).not.toMatch(/^human\d+$/);
    }
  });

  test("chase: QuestArrestModal shows night overlay", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");
    await startDriving(page, { gear: "2", gasMs: 5000 });

    const arrestBtn = page.locator('[data-type="arrest-button"]');
    await arrestBtn.waitFor({ state: "visible", timeout: 60000 });
    await arrestBtn.click();

    await expect(page.locator(".quest-arrest-modal--night")).toBeVisible();
    await expect(
      page.locator(".quest-arrest-modal [data-type='atmosphere-overlay']"),
    ).toBeVisible();
  });
});
