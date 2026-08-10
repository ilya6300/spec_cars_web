import { test, expect } from "@playwright/test";
import { enablePlaywrightTestState, navigateToFreeMode } from "./helpers.js";

test("debug collectible star visibility", async ({ page }) => {
  await enablePlaywrightTestState(page);
  await navigateToFreeMode(page);

  const report = await page.evaluate(async () => {
    const mapStore = window.__TEST_STATE__?.activeMapStore;
    const carStore = window.__TEST_STATE__?.activeCarStore;
    if (!mapStore || !carStore) return { error: "no test state" };

    carStore.helpCounts.criminalArrest = 2;
    carStore.helpCounts.pedestrianFine = 0;
    carStore.helpCounts.enemyChase = 0;

    const viewportWidth = window.innerWidth;
    mapStore.spawnCollectibleStar(viewportWidth);

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const star = mapStore.activeObjects.find(
      (o) => o.typeId === "collectible_star",
    );
    if (!star) return { error: "star not spawned" };

    const el = document.querySelector(`[data-uid="${star.uid}"]`);
    const rect = el?.getBoundingClientRect();
    const cs = el ? getComputedStyle(el) : null;
    const screenX = star.worldX - mapStore.offsetX;
    const centerX = rect ? rect.left + rect.width / 2 : null;
    const centerY = rect ? rect.top + rect.height / 2 : null;
    const stack =
      centerX != null && centerY != null
        ? document.elementsFromPoint(centerX, centerY).slice(0, 8).map((node) => ({
            tag: node.tagName,
            className: node.className,
            dataType: node.getAttribute?.("data-type"),
            dataUid: node.getAttribute?.("data-uid"),
            zIndex: getComputedStyle(node).zIndex,
          }))
        : [];

    const gameMap = document.querySelector(".game-map");
    const carUi = document.querySelector(".car-ui");
    const atmosphere = document.querySelector(".atmosphere-overlay");

    return {
      viewportWidth,
      screenX,
      worldX: star.worldX,
      offsetX: mapStore.offsetX,
      domFound: Boolean(el),
      rect: rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null,
      styles: cs
        ? {
            zIndex: cs.zIndex,
            opacity: cs.opacity,
            visibility: cs.visibility,
            display: cs.display,
            top: cs.top,
            left: cs.left,
            transform: cs.transform,
            backgroundImage: cs.backgroundImage?.slice(0, 80),
          }
        : null,
      stack,
      layers: {
        gameMapZ: gameMap ? getComputedStyle(gameMap).zIndex : null,
        carUiZ: carUi ? getComputedStyle(carUi).zIndex : null,
        atmosphereZ: atmosphere ? getComputedStyle(atmosphere).zIndex : null,
      },
    };
  });

  console.log("STAR_DEBUG_REPORT", JSON.stringify(report, null, 2));
  expect(report.error).toBeUndefined();
  expect(report.domFound).toBe(true);
  expect(report.rect?.width).toBeGreaterThan(0);
});
