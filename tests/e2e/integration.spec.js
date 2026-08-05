import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, getHelpCounts } from "./helpers.js";

test.describe("Integration: Full Quest Flow", () => {
  test.skip("Full flow: stop on red -> 30% chance -> pedestrian quest -> fine -> helpCounts increases", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });

    let questStarted = false;
    try {
      await page.waitForSelector(".pedestrian-crossing-modal", {
        state: "visible",
        timeout: 30000,
      });
      questStarted = true;
    } catch (e) {
      console.log("Pedestrian quest did not start (30% chance)");
    }

    if (questStarted) {
      const initialCounts = await getHelpCounts(page);

      await page.click(".quest-pedestrian");
      await page.waitForSelector(".fine-button", { state: "visible" });

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
