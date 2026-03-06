import { expect, test } from "@playwright/test";

const HOME_PATH = "/";

const selectors = {
  homeQueryInput: ".marketplace-search-input.is-query input",
  recentSearchesSection: "[data-testid='marketplace-results-modal-recent-searches']",
  recentSearchChip: ".marketplace-results-modal-recent-searches button",
  recentSearchClear: ".marketplace-results-modal-context-clear"
} as const;

test.describe("Marketplace search overlay recent history", () => {
  test("floating modal uses recent searches and routes to standalone results page", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "skillsindex.marketplace.search-history",
        JSON.stringify([
          {
            q: "repo",
            tags: "workflow",
            timestamp: Date.now()
          }
        ])
      );
    });

    await page.goto(HOME_PATH);
    await page.locator(selectors.homeQueryInput).click();
    await expect(page.locator(selectors.recentSearchesSection)).toBeVisible();
    await page.locator(selectors.recentSearchChip).first().click();
    await expect(page).toHaveURL(/\/results\?q=repo&tags=workflow$/);
  });

  test("floating modal can clear recent searches", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "skillsindex.marketplace.search-history",
        JSON.stringify([
          {
            q: "repo",
            tags: "workflow",
            timestamp: Date.now()
          }
        ])
      );
    });

    await page.goto(HOME_PATH);
    await page.locator(selectors.homeQueryInput).click();
    await expect(page.locator(selectors.recentSearchChip)).toHaveCount(1);
    await page.locator(selectors.recentSearchClear).click();
    await expect(page.locator(selectors.recentSearchChip)).toHaveCount(0);
    await expect
      .poll(async () => {
        return await page.evaluate(() => window.localStorage.getItem("skillsindex.marketplace.search-history"));
      })
      .toBeNull();
  });
});
