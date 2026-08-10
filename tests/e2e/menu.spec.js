import { test, expect } from "@playwright/test";

test.describe("Start Menu", () => {
  test("Menu renders with three mode cards and global stars", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });

    expect(await page.$('[data-type="mode-free"]')).toBeTruthy();
    expect(await page.$('[data-type="mode-timed"]')).toBeTruthy();
    expect(await page.$('[data-type="mode-chase"]')).toBeTruthy();
    expect(await page.$('[data-type="global-stars"]')).toBeTruthy();
  });

  test("Selecting free mode opens game viewport", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-type="mode-free"]', { force: true });
    await page.waitForSelector(".game-viewport", { timeout: 10000 });
    expect(await page.$(".game-viewport")).toBeTruthy();
  });

  test("Selecting chase mode shows night overlay", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-type="mode-chase"]', { force: true });
    await page.waitForSelector('[data-type="atmosphere-overlay"]', {
      timeout: 10000,
    });
    expect(await page.$('[data-type="atmosphere-overlay"]')).toBeTruthy();
  });
});
