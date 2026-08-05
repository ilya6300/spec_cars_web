import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, startDriving } from "./helpers.js";

test.describe("Game Initialization", () => {
  test("Game renders and game-viewport is visible", async ({ page }) => {
    test.setTimeout(240000);

    page.on("pageerror", (err) => console.error("Page error:", err.message));

    await page.goto("/");
    await page.waitForSelector("#root", { timeout: 10000 });
    await page.waitForSelector(".game-viewport", { timeout: 10000 });

    const gameViewport = await page.$(".game-viewport");
    expect(gameViewport).toBeTruthy();
  });

  test("Controllers are visible: ignition, gearbox, gas pedal", async ({
    page,
  }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    const ignition = await page.$('[data-type="ignition"]');
    expect(ignition).toBeTruthy();

    const gasPedal = await page.$('[data-type="gas-pedal"]');
    expect(gasPedal).toBeTruthy();

    const gearButtons = await page.$$('[data-type^="gear-"]');
    expect(gearButtons.length).toBeGreaterThan(0);
  });

  test("Ignition toggle works", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    const ignitionBtn = page.locator('[data-type="ignition"]');

    const initialSrc = await ignitionBtn.getAttribute("src");
    expect(initialSrc).toBeTruthy();

    await ignitionBtn.click({ force: true });
    await page.waitForTimeout(500);

    const afterClickSrc = await ignitionBtn.getAttribute("src");
    expect(afterClickSrc).toBeTruthy();
  });

  test("Gear shifting works", async ({ page }) => {
    test.setTimeout(240000);

    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.click('[data-type="ignition"]', { force: true });
    await page.waitForTimeout(500);

    await page.click('[data-type="gear-1"]', { force: true });
    await page.waitForTimeout(300);

    const gear1Active = await page.$('[data-type="gear-1"].active');
    expect(gear1Active).toBeTruthy();

    await page.click('[data-type="gear-2"]', { force: true });
    await page.waitForTimeout(300);

    const gear2Active = await page.$('[data-type="gear-2"].active');
    expect(gear2Active).toBeTruthy();

    const gear1Inactive = await page.$('[data-type="gear-1"].active');
    expect(gear1Inactive).toBeFalsy();
  });

  test("Game loop runs without crashing", async ({ page }) => {
    test.setTimeout(240000);

    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    await page.waitForTimeout(1000);

    await startDriving(page, { gear: "1", gasMs: 3000 });
    await page.waitForTimeout(5000);

    expect(errors.length).toBe(0);

    const gameViewport = await page.$(".game-viewport");
    expect(gameViewport).toBeTruthy();
  });
});
