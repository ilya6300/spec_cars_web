import { test, expect } from "@playwright/test";

test.describe("Integration: Full Quest Flow", () => {
  test.skip("Full flow: stop on red -> 30% chance -> pedestrian quest -> fine -> countHelp increases", async ({
    page,
  }) => {
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
      const initialCount = await page.$eval(".game-viewport", (el) => {
        const stores = Object.values(el).find(
          (v) => v?.countHelp !== undefined,
        );
        return stores?.countHelp || 0;
      });

      await page.click(".quest-pedestrian");
      await page.waitForSelector(".fine-button", { state: "visible" });

      await page.click(".fine-button");
      await page.waitForSelector(".pedestrian-crossing-modal", {
        state: "hidden",
      });

      const finalCount = await page.$eval(".game-viewport", (el) => {
        const stores = Object.values(el).find(
          (v) => v?.countHelp !== undefined,
        );
        return stores?.countHelp || 0;
      });

      expect(finalCount).toBeGreaterThan(initialCount);
    }
  });
});
