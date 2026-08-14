import { test, expect } from "@playwright/test";
import {
  enablePlaywrightTestState,
  navigateToGameMode,
  setAtmosphere,
  startDriving,
  setFreeWeatherTestConfig,
  advanceFreeWeather,
  getAtmosphere,
  stopFreeWeather,
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
    await expect(page.locator('[data-type="rain-layer"]')).toBeVisible();

    const rainLayer = page.locator('[data-type="rain-layer"]');
    await expect(rainLayer.locator(".game-rain--far")).toHaveCount(1);
    await expect(rainLayer.locator(".game-rain--mid")).toHaveCount(1);
    await expect(rainLayer.locator(".game-rain--near")).toHaveCount(1);

    const rainBackgrounds = await rainLayer.locator(".game-rain").evaluateAll(
      (els) => els.map((el) => getComputedStyle(el).backgroundImage),
    );
    for (const bg of rainBackgrounds) {
      expect(bg).not.toMatch(/repeating-linear-gradient/i);
    }

    const zHud = await page
      .locator(".hud-panel")
      .evaluate((el) => Number(getComputedStyle(el).zIndex));
    const zRain = await page
      .locator(".game-rain-container")
      .evaluate((el) => Number(getComputedStyle(el).zIndex));
    const zPlayer = await page
      .locator(".car_container--player.car_container--standalone")
      .evaluate((el) => Number(getComputedStyle(el).zIndex));
    expect(zHud).toBeGreaterThan(zRain);
    expect(zRain).toBeGreaterThan(zPlayer);

    await startDriving(page, { gear: "2", gasMs: 3000 });
    await expect(page.locator(".car-headlight-beam")).toBeVisible();
    await page.waitForTimeout(12000);

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
    test.setTimeout(90000);
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");
    await startDriving(page, { gear: "2", gasMs: 0 });

    const arrestBtn = page.locator('[data-type="arrest-button"]');
    await arrestBtn.waitFor({ state: "visible", timeout: 60000 });
    await page.mouse.up();
    await arrestBtn.click();

    await expect(page.locator(".quest-arrest-modal--night")).toBeVisible();
    await expect(
      page.locator(".quest-arrest-modal [data-type='atmosphere-overlay']"),
    ).toBeVisible();
    await expect(
      page.locator(".game-viewport > .game-rain-container"),
    ).toHaveCount(1);
    await expect(
      page.locator('.quest-arrest-modal [data-type="rain-layer"]'),
    ).toHaveCount(1);
    await expect(
      page.locator(".quest-arrest-modal .car-headlight-beam"),
    ).toHaveCount(2);

    await page.waitForTimeout(3500);
    await expect(
      page.locator('[data-type="arrest-modal-button"]'),
    ).toBeVisible();
  });

  test("chase: PoliceQuestModal shows rain and headlights for human_aggr", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");
    await startDriving(page, { gear: "2", gasMs: 0 });

    await page.evaluate(() => {
      const mapStore = window.__TEST_STATE__?.activeMapStore;
      if (!mapStore) return;
      mapStore.startQuest({
        uid: "e2e-aggr",
        typeId: "human_aggr1",
        worldX: 1200,
        appeared: true,
      });
    });

    await expect(page.locator(".police-quest-modal--night")).toBeVisible();
    await expect(
      page.locator(".police-quest-modal [data-type='atmosphere-overlay']"),
    ).toBeVisible();
    await expect(
      page.locator('.police-quest-modal [data-type="rain-layer"]'),
    ).toHaveCount(1);
    await expect(
      page.locator(".police-quest-modal .car-headlight-beam"),
    ).toHaveCount(1);
  });

  test("free: day + no rain — no night, rain, wet, or headlights", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, { randomValues: [0.99] });
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");

    await expect(page.locator(".game-viewport--night")).toHaveCount(0);
    await expect(page.locator(".game-viewport--rain")).toHaveCount(0);
    await expect(page.locator('[data-type="rain-layer"]')).toHaveCount(0);
    await expect(page.locator(".car-headlight-beam")).toHaveCount(0);

    const wetOpacity = await page
      .locator('[data-type="road-wet"]')
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(wetOpacity).toBe(0);
  });

  test("free weather: starts with rain when roll below 10%", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, {
      randomValues: [0.05],
      rainDurationSec: 120,
    });
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");

    const atmosphere = await getAtmosphere(page);
    expect(atmosphere).toEqual({ timeOfDay: "day", weather: "rain" });
    await expect(page.locator(".game-viewport--rain")).toBeVisible();
    await expect(page.locator('[data-type="rain-layer"]')).toBeVisible();
  });

  test("free weather: starts clear when roll above 10%", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, { randomValues: [0.99] });
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");

    const atmosphere = await getAtmosphere(page);
    expect(atmosphere).toEqual({ timeOfDay: "day", weather: "clear" });
    await expect(page.locator(".game-viewport--rain")).toHaveCount(0);
    await expect(page.locator('[data-type="rain-layer"]')).toHaveCount(0);
  });

  test("free weather: rain ends after duration", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, {
      randomValues: [0.05],
      rainDurationSec: 2,
    });
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");

    await expect(page.locator(".game-viewport--rain")).toBeVisible();
    await advanceFreeWeather(page, 2.1);

    const atmosphere = await getAtmosphere(page);
    expect(atmosphere).toEqual({ timeOfDay: "day", weather: "clear" });
    await expect(page.locator(".game-viewport--rain")).toHaveCount(0);
    await expect(page.locator('[data-type="rain-layer"]')).toHaveCount(0);
  });

  test("free weather: periodic rain after 60s clear", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, {
      randomValues: [0.99, 0.05],
      rainDurationSec: 120,
    });
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");

    expect(await getAtmosphere(page)).toEqual({
      timeOfDay: "day",
      weather: "clear",
    });
    await advanceFreeWeather(page, 60);

    const atmosphere = await getAtmosphere(page);
    expect(atmosphere).toEqual({ timeOfDay: "day", weather: "rain" });
    await expect(page.locator(".game-viewport--rain")).toBeVisible();
  });

  test("chase: weather unaffected by __WEATHER_TEST__", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await setFreeWeatherTestConfig(page, { randomValues: [0.99] });
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");

    const atmosphere = await getAtmosphere(page);
    expect(atmosphere).toEqual({ timeOfDay: "night", weather: "rain" });
    await expect(page.locator(".game-viewport--night")).toBeVisible();
    await expect(page.locator(".game-viewport--rain")).toBeVisible();
  });

  test("free: day + rain — rain and wet without headlights", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");
    await stopFreeWeather(page);
    await setAtmosphere(page, { timeOfDay: "day", weather: "rain" });

    await expect(page.locator(".game-viewport--rain")).toBeVisible();
    await expect(page.locator(".game-viewport--night")).toHaveCount(0);
    await expect(page.locator('[data-type="rain-layer"]')).toBeVisible();

    const wetOpacity = await page
      .locator('[data-type="road-wet"]')
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(wetOpacity).toBeGreaterThan(0);

    await startDriving(page, { gear: "2", gasMs: 300 });
    await expect(page.locator(".car-headlight-beam")).toHaveCount(0);
  });

  test("free: night + no rain — headlights without rain or wet", async ({
    page,
  }) => {
    await enablePlaywrightTestState(page);
    await page.goto("/");
    await navigateToGameMode(page, "mode-free");
    await stopFreeWeather(page);
    await setAtmosphere(page, { timeOfDay: "night", weather: "clear" });

    await expect(page.locator(".game-viewport--night")).toBeVisible();
    await expect(page.locator(".game-viewport--rain")).toHaveCount(0);
    await expect(page.locator('[data-type="rain-layer"]')).toHaveCount(0);

    const wetOpacity = await page
      .locator('[data-type="road-wet"]')
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(wetOpacity).toBe(0);

    await startDriving(page, { gear: "2", gasMs: 300 });
    await expect(page.locator(".car-headlight-beam")).toBeVisible();
  });

  test("chase: reduced-motion keeps static rain drops", async ({ page }) => {
    await enablePlaywrightTestState(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await navigateToGameMode(page, "mode-chase");

    const rainDrops = page.locator('[data-type="rain-layer"] .game-rain');
    await expect(rainDrops).toHaveCount(3);

    const rainStyles = await rainDrops.evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        return {
          animationName: style.animationName,
          animationDuration: style.animationDuration,
          opacity: Number(style.opacity),
        };
      }),
    );

    for (const style of rainStyles) {
      const noAnimation =
        style.animationName === "none" || style.animationDuration === "0s";
      expect(noAnimation).toBe(true);
      expect(style.opacity).toBeGreaterThan(0);
    }
  });
});
