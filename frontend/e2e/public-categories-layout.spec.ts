import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("skillsindex.locale", "en");
  });
}

async function mockAnonymousAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: null });
  });
}

async function mockMarketplacePayload(page: Page): Promise<void> {
  await page.route("**/api/v1/public/marketplace**", async (route) => {
    await fulfillJSON(route, 200, {
      filters: {
        q: "",
        tags: "",
        category: "",
        subcategory: "",
        sort: "recent",
        mode: "keyword"
      },
      stats: {
        total_skills: 2,
        matching_skills: 2
      },
      pagination: {
        page: 1,
        page_size: 24,
        total_items: 2,
        total_pages: 1,
        prev_page: 0,
        next_page: 0
      },
      categories: [
        {
          slug: "testing-automation",
          name: "Testing Automation",
          description: "Regression and confidence workflows",
          count: 12,
          subcategories: [
            {
              slug: "workflow-regression",
              name: "Workflow Regression",
              count: 5
            },
            {
              slug: "release-policy",
              name: "Release Policy",
              count: 3
            }
          ]
        }
      ],
      top_tags: [],
      items: [],
      session_user: null,
      can_access_dashboard: false
    });
  });
}

test.describe("Public categories layout", () => {
  test("uses marketplace shell styles and keeps topbar items aligned on desktop", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockMarketplacePayload(page);

    await page.goto("/categories");

    const shell = page.locator(".marketplace-home");
    const topbar = page.locator(".marketplace-home .marketplace-topbar");
    const brand = page.locator(".marketplace-home .marketplace-topbar-brand");
    const categoryNavButton = page.locator(".marketplace-home .marketplace-topbar-nav-button.is-category-action").first();
    const rankingNavButton = page.locator(".marketplace-home .marketplace-topbar-nav-button.is-download-ranking-action").first();
    const topbarThemeDarkSwitch = page.getByTestId("topbar-theme-switch-dark");
    const topbarThemeLightSwitch = page.getByTestId("topbar-theme-switch-light");
    const topbarLocaleZhSwitch = page.getByTestId("topbar-locale-switch-zh");
    const topbarLocaleEnSwitch = page.getByTestId("topbar-locale-switch-en");
    const topbarWorkspaceCta = page.locator(".marketplace-home .marketplace-topbar-secondary-cta").first();
    const topbarAuthCta = page.locator(".marketplace-home .marketplace-topbar-cta").first();
    const categoriesBreadcrumbHome = page.getByTestId("categories-page-breadcrumb-home");
    const categoriesBreadcrumbCurrent = page.getByTestId("categories-page-breadcrumb-current");
    const firstCategoryCard = page.locator(".marketplace-home .marketplace-skill-row").first();
    const firstCategoryIconPlaceholder = page.getByTestId("category-icon-placeholder").first();
    const firstCategoryCardCountChip = page.locator(".marketplace-home .marketplace-card-cover-chip").first();
    const firstCategorySummaryChips = page.locator(".marketplace-home .marketplace-skill-chip-row span").first();

    await expect(shell).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(brand).toBeVisible();
    await expect(categoryNavButton).toBeVisible();
    await expect(rankingNavButton).toBeVisible();
    await expect(topbarThemeDarkSwitch).toBeVisible();
    await expect(topbarThemeLightSwitch).toBeVisible();
    await expect(topbarLocaleZhSwitch).toBeVisible();
    await expect(topbarLocaleEnSwitch).toBeVisible();
    await expect(topbarWorkspaceCta).toBeVisible();
    await expect(topbarWorkspaceCta).toHaveText("Workspace");
    await expect(topbarAuthCta).toBeVisible();
    await expect(topbarAuthCta).toHaveText("Sign In");
    await expect(categoriesBreadcrumbHome).toBeVisible();
    await expect(categoriesBreadcrumbCurrent).toHaveText("Categories");
    await expect(page.getByTestId("public-global-controls")).toHaveCount(0);
    await expect(firstCategoryCard).toBeVisible();
    await expect(firstCategoryIconPlaceholder).toHaveText("TA");
    await expect(firstCategoryCardCountChip).toHaveText(/\d+/);
    await expect(firstCategorySummaryChips).toHaveText(/Skills \d+/);

    const topbarHeight = await topbar.evaluate((element) => Number.parseFloat(window.getComputedStyle(element).height));
    expect(topbarHeight).toBeGreaterThanOrEqual(80);

    const hasOverlap = await page.evaluate(() => {
      const brandElement = document.querySelector(".marketplace-topbar-brand");
      const navButtonElement = document.querySelector(".marketplace-topbar-nav-button");
      if (!brandElement || !navButtonElement) {
        return true;
      }
      const brandRect = brandElement.getBoundingClientRect();
      const navRect = navButtonElement.getBoundingClientRect();
      return !(
        brandRect.right <= navRect.left ||
        navRect.right <= brandRect.left ||
        brandRect.bottom <= navRect.top ||
        navRect.bottom <= brandRect.top
      );
    });

    expect(hasOverlap).toBe(false);

    await firstCategoryCard.click();
    await expect(page).toHaveURL(/\/categories\/[^/?#]+\?(?:category=[^&#]+&page=1|page=1&category=[^&#]+)/);
    await expect(page.getByTestId("marketplace-category-detail-page")).toBeVisible();
    await expect(page.locator(".marketplace-results-overlay")).toHaveCount(0);
    await expect(page.locator(".marketplace-results-floating-container")).toHaveCount(0);
    await expect(page.locator(".marketplace-search-filter-btn")).toHaveCount(0);

    const subcategoryFilterRow = page.locator(".marketplace-home .marketplace-subcategory-row");
    const categoryFilterRow = page.locator(".marketplace-home .marketplace-category-filter-row");
    const categorySearchQueryInput = page.locator(".marketplace-home .marketplace-search-input.is-query input");
    const categorySearchSemanticInput = page.locator(".marketplace-home .marketplace-search-input.is-semantic input");
    const allSubcategoriesButton = subcategoryFilterRow.getByRole("button", { name: "All subcategories" });
    const subcategoryButtons = subcategoryFilterRow.locator(".marketplace-subcategory-chips button");
    const sortByStarsButton = categoryFilterRow.getByRole("button", { name: "Sort: Stars" });
    const modeAiButton = categoryFilterRow.getByRole("button", { name: "Mode: AI" });
    const resultsToolbarTitle = page.locator(".marketplace-home.is-category-detail-page .marketplace-results-toolbar h2").first();
    const resultsToolbarChips = page.locator(".marketplace-home.is-category-detail-page .marketplace-results-toolbar .marketplace-toolbar-chips span");
    const categoryDetailBreadcrumbHome = page.getByTestId("category-detail-breadcrumb-home");
    const categoryDetailBreadcrumbCategories = page.getByTestId("category-detail-breadcrumb-categories");
    const categoryDetailBreadcrumbCurrent = page.getByTestId("category-detail-breadcrumb-current");

    await expect(subcategoryFilterRow).toBeVisible();
    await expect(categoryFilterRow).toBeVisible();
    await expect(categorySearchQueryInput).toBeVisible();
    await expect(categorySearchSemanticInput).toHaveCount(0);
    await expect(page.locator(".marketplace-home .marketplace-top-recommend-row")).toHaveCount(0);
    await expect(allSubcategoriesButton).toBeVisible();
    await expect(sortByStarsButton).toBeVisible();
    await expect(modeAiButton).toBeVisible();
    await expect(categoryDetailBreadcrumbHome).toBeVisible();
    await expect(categoryDetailBreadcrumbCategories).toHaveText("Categories");
    await expect(categoryDetailBreadcrumbCurrent).toContainText("Testing Automation");
    await expect(resultsToolbarTitle).toContainText("Testing Automation");
    await expect(resultsToolbarTitle).not.toHaveText("Category Results");
    await expect(resultsToolbarTitle).toContainText(/Matched \d+/);
    await expect(resultsToolbarChips).toHaveCount(0);

    const hasLargeGapBetweenSearchAndResults = await page.evaluate(() => {
      const searchStripElement = document.querySelector(".marketplace-home.is-category-detail-page .marketplace-search-strip");
      const resultsToolbarElement = document.querySelector(".marketplace-home.is-category-detail-page .marketplace-results-toolbar");
      if (!searchStripElement || !resultsToolbarElement) {
        return true;
      }
      const searchStripRect = searchStripElement.getBoundingClientRect();
      const resultsToolbarRect = resultsToolbarElement.getBoundingClientRect();
      return resultsToolbarRect.top - searchStripRect.bottom > 24;
    });
    expect(hasLargeGapBetweenSearchAndResults).toBe(false);

    const subcategoryButtonCount = await subcategoryButtons.count();
    expect(subcategoryButtonCount).toBeGreaterThan(1);

    await subcategoryButtons.nth(1).click();
    await expect(page).toHaveURL(/[?&]subcategory=/);

    await sortByStarsButton.click();
    await expect(page).toHaveURL(/sort=stars/);

    await modeAiButton.click();
    await expect(page).toHaveURL(/mode=ai/);

    await allSubcategoriesButton.click();
    await expect(page).not.toHaveURL(/[?&]subcategory=/);

    await categorySearchQueryInput.fill("pipeline");
    await categorySearchQueryInput.press("Enter");
    await expect(page).toHaveURL(/\/categories\/[^/?#]+\?(?=.*q=pipeline)(?=.*category=)/);
    await expect(page.locator(".marketplace-results-overlay")).toHaveCount(0);
  });
});
