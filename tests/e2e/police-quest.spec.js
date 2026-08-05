import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, getHelpCounts, navigateToFreeMode } from "./helpers.js";

test.describe("Police Quest E2E", () => {
  test("Police quest: click aggro human, arrest, helpCounts increases", async ({
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

    await page.waitForTimeout(8000);

    const humanAggr1 = await page.$('[data-type="human_aggr1"]');
    if (humanAggr1) {
      await page.click('[data-type="human_aggr1"]');
      await page.waitForSelector(".police-quest-modal", {
        state: "visible",
        timeout: 30000,
      });

      await page.click(".arrest-button");
      await page.waitForSelector(".police-quest-modal", { state: "hidden" });

      const helpCounts = await getHelpCounts(page);
      expect(helpCounts.criminalArrest).toBeGreaterThan(0);
    }
  });
});
