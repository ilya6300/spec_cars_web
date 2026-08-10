export async function enablePlaywrightTestState(page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT__ = true;
    localStorage.clear();
  });
}

export async function navigateToFreeMode(page) {
  await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });
  await page.click('[data-type="mode-free"]', { force: true });
  await page.waitForSelector(".game-viewport", { timeout: 10000 });
}

export async function navigateToGameMode(page, dataType) {
  await page.waitForSelector('[data-type="start-menu"]', { timeout: 10000 });
  await page.click(`[data-type="${dataType}"]`, { force: true });
  await page.waitForSelector(".game-viewport", { timeout: 10000 });
}

export async function getHelpCounts(page) {
  return page.evaluate(() => {
    const carStore = window.__TEST_STATE__?.activeCarStore;
    return (
      carStore?.helpCounts ?? {
        criminalArrest: 0,
        pedestrianFine: 0,
        enemyChase: 0,
        orientationMatch: 0,
      }
    );
  });
}

export async function getSessionScore(page) {
  return page.evaluate(
    () => window.__TEST_STATE__?.activeCarStore?.sessionScore ?? 0,
  );
}

export async function startDriving(page, { gear = "2", gasMs = 2000 } = {}) {
  await page.click('[data-type="ignition"]', { force: true });
  await page.waitForTimeout(300);
  await page.click(`[data-type="gear-${gear}"]`, { force: true });
  await page.waitForTimeout(300);

  const gasPedal = page.locator('[data-type="gas-pedal"]');
  await gasPedal.hover();
  await page.mouse.down();
  if (gasMs > 0) {
    await page.waitForTimeout(gasMs);
    await page.mouse.up();
  }
}

export async function holdGasFor(page, ms) {
  const gasPedal = page.locator('[data-type="gas-pedal"]');
  await gasPedal.hover();
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}
