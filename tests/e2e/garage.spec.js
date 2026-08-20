import { test, expect } from "@playwright/test";
import { navigateToFreeMode } from "./helpers.js";

test.describe("Garage", () => {
  test("open and close garage from menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });
    await page.click('[data-type="open-garage"]');
    await page.waitForSelector('[data-type="garage-screen"]', { timeout: 10000 });
    await expect(page.locator('[data-type="garage-tab-wheels"]')).toBeVisible();
    await page.click('[data-type="garage-back"]');
    await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });
  });

  test("wheel selection persists after starting free mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });
    await page.click('[data-type="open-garage"]');
    await page.waitForSelector('[data-type="garage-card-grid"]');
    await page.click('[data-type="garage-card"][data-id="whell_new_4"]');
    await page.click('[data-type="garage-back"]');
    await page.waitForSelector('[data-type="start-menu"]');
    await navigateToFreeMode(page);

    const activeWheel = await page.evaluate(() =>
      localStorage.getItem("spec_cars_active_wheel"),
    );
    expect(activeWheel).toBe("whell_new_4");
  });
});
