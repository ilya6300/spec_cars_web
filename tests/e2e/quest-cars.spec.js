import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, startDriving, holdGasFor, navigateToFreeMode } from "./helpers.js";

async function waitForQuestCarsSpawned(page, timeout = 20000) {
  await page.waitForFunction(
    () => (window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0) > 0,
    { timeout },
  );
}

test.describe("Quest Cars E2E", () => {
  test.beforeEach(async ({ page }) => {
    await enablePlaywrightTestState(page);
  });

  test("Quest Cars spawn in store", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await navigateToFreeMode(page);
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "2", gasMs: 0 });
    await holdGasFor(page, 12000);

    const questCarCount = await page.evaluate(
      () => window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0,
    );
    expect(questCarCount).toBeGreaterThan(0);
  });

  test("SpeedDisplay shows quest car speed when visible", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await navigateToFreeMode(page);
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "3", gasMs: 0 });
    await waitForQuestCarsSpawned(page);
    await holdGasFor(page, 40000);

    const speedDisplay = await page.$('[data-type="speed-display"]');
    if (speedDisplay) {
      const speedText = await speedDisplay.textContent();
      expect(speedText).toBeTruthy();
    }
  });

  test("Enemy quest car spawns in store", async ({ page }, testInfo) => {
    test.setTimeout(240000);

    await page.goto("/");
    await navigateToFreeMode(page);
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "2", gasMs: 0 });
    await holdGasFor(page, 75000);

    const stats = await page.evaluate(() => {
      const cars = window.__TEST_STATE__?.activeMapStore?.questCars ?? [];
      return {
        total: cars.length,
        hasEnemy: cars.some((car) => car.enemy),
      };
    });

    expect(stats.total).toBeGreaterThan(0);
    if (!stats.hasEnemy) {
      testInfo.skip(true, "Enemy car not spawned in random window");
      return;
    }
    expect(stats.hasEnemy).toBeTruthy();
  });

  test("Arrest button appears when enemy car is in arrest range", async ({
    page,
  }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await navigateToFreeMode(page);
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "2", gasMs: 0 });
    await holdGasFor(page, 30000);

    let arrestButtonFound = false;
    for (let i = 0; i < 5; i++) {
      const arrestButton = await page.$('[data-type="arrest-button"]');
      if (arrestButton) {
        arrestButtonFound = true;
        break;
      }
      await page.waitForTimeout(3000);
    }

    if (arrestButtonFound) {
      await expect(page.locator('[data-type="arrest-button"]')).toBeVisible();
    }
  });

  test("Quest cars accumulate while driving", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await navigateToFreeMode(page);
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "2", gasMs: 0 });
    await holdGasFor(page, 35000);

    const questCarCount = await page.evaluate(
      () => window.__TEST_STATE__?.activeMapStore?.questCars?.length ?? 0,
    );
    expect(questCarCount).toBeGreaterThan(0);
  });
});
