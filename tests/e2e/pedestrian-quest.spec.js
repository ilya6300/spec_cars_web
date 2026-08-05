import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, getHelpCounts, navigateToFreeMode } from "./helpers.js";

test.describe("Pedestrian Quest E2E", () => {
  test("Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button -> helpCounts increases", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToFreeMode(page);

    await page.waitForTimeout(2000);

    await page.click('[data-type="ignition"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gear-1"]');
    await page.waitForTimeout(1000);
    await page.click('[data-type="gas-pedal"]');
    await page.waitForTimeout(2000);

    const ignitionBtn = await page.$('[data-type="ignition"]');
    expect(ignitionBtn).toBeTruthy();

    await page.waitForTimeout(5000);

    const human1 = await page.$('[data-type="human1"]');
    if (human1) {
      await page.click('[data-type="human1"]');
      await page.waitForSelector(".pedestrian-crossing-modal", {
        state: "visible",
        timeout: 30000,
      });

      await page.click(".quest-pedestrian");

      await page.waitForSelector(".quest-car", { state: "visible" });

      await page.waitForSelector(".fine-button", { state: "visible" });

      const initialCounts = await getHelpCounts(page);

      await page.click(".fine-button");
      await page.waitForSelector(".pedestrian-crossing-modal", {
        state: "hidden",
      });

      const finalCounts = await getHelpCounts(page);

      expect(finalCounts.pedestrianFine).toBeGreaterThan(
        initialCounts.pedestrianFine,
      );
    }
  });
});
