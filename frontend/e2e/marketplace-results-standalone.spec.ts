import { expect, test } from "@playwright/test";

const HOME_PATH = "/";
const RESULTS_PATH = "/results";

const selectors = {
  resultsPageRoot: ".marketplace-home.is-results-page",
  resultsFloatingMask: "[data-testid='marketplace-results-floating-mask'], .marketplace-results-floating-mask",
  resultsFloatingClose: "[data-testid='marketplace-results-floating-close'], .marketplace-results-floating-close",
  resultsList: ".marketplace-results-list",
  topbarBrand: ".marketplace-topbar-brand",
  topbarCta: ".marketplace-topbar-cta",
  resultsSearchButton: ".marketplace-home.is-results-page .marketplace-search-submit"
} as const;

test.describe("Marketplace results standalone page interactions", () => {
  test("results route renders dedicated results page without floating layers", async ({ page }) => {
    await page.goto(RESULTS_PATH);

    await expect(page.locator(selectors.resultsPageRoot).first()).toBeVisible();
    await expect(page.locator(selectors.resultsList).first()).toBeVisible();
    await expect(page.locator(selectors.resultsFloatingMask)).toHaveCount(0);
    await expect(page.locator(selectors.resultsFloatingClose)).toHaveCount(0);
  });

  test("topbar brand returns standalone results route back to home", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.topbarBrand).click();

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("topbar brand clears query params when returning to home route", async ({ page }) => {
    await page.goto("/results?q=odoo&tags=workflow&page=3&sort=quality");
    await page.locator(selectors.topbarBrand).click();

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("escape closes standalone results page back to home route", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("escape keeps current query params when returning to home route", async ({ page }) => {
    await page.goto("/results?q=repo&mode=ai");
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/\/\?q=repo&mode=ai$/);
  });

  test("standalone results page does not render floating close controls", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await expect(page.locator(selectors.resultsFloatingClose)).toHaveCount(0);
  });

  test("repeated search submit with identical query does not push duplicate history", async ({ page }) => {
    await page.goto("/results?q=repo");
    await page.evaluate(() => {
      (window as Window & { __beforeHistoryLength?: number }).__beforeHistoryLength = window.history.length;
    });
    await page.locator(selectors.resultsSearchButton).click();
    await page.waitForTimeout(150);
    const historySnapshot = await page.evaluate(() => {
      const value = (window as Window & { __beforeHistoryLength?: number }).__beforeHistoryLength;
      return {
        before: Number(value || 0),
        after: window.history.length
      };
    });
    expect(historySnapshot.after).toBe(historySnapshot.before);
  });

  test("light results page follows light theme tokens", async ({ page }) => {
    await page.goto("/light/results");
    await expect(page.locator(selectors.resultsPageRoot).first()).toBeVisible();

    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          const rootStyle = window.getComputedStyle(document.documentElement);
          return {
            mode: document.documentElement.getAttribute("data-theme-mode"),
            panelToken: rootStyle.getPropertyValue("--si-color-panel").trim(),
            canvasToken: rootStyle.getPropertyValue("--si-color-canvas").trim()
          };
        });
      })
      .toMatchObject({
        mode: "light",
        panelToken: "#ffffff",
        canvasToken: "#eef1f5"
      });
  });
});

test.describe("Marketplace auth CTA interactions", () => {
  test("topbar auth action switches to logout in signed-in state", async ({ page }) => {
    let logoutCallCount = 0;
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: 7,
            username: "ops",
            display_name: "Ops User",
            role: "admin",
            status: "active"
          }
        })
      });
    });
    await page.route("**/api/v1/auth/csrf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ csrf_token: "test-csrf-token" })
      });
    });
    await page.route("**/api/v1/auth/logout", async (route) => {
      logoutCallCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true })
      });
    });

    await page.goto(HOME_PATH);
    const authAction = page.locator(selectors.topbarCta);
    await expect(authAction).toBeVisible();
    await expect(authAction).toHaveText(/\u9000\u51fa\u767b\u5f55|Sign Out/);

    await authAction.click();
    await expect.poll(() => logoutCallCount).toBe(1);
    await expect
      .poll(async () => new URL(page.url()).pathname)
      .toMatch(/^\/(?:login)?$/);
  });
});
