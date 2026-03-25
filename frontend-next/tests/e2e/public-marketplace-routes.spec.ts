import { expect, test } from "@playwright/test";

import {
  expectCategoryReferenceFrame,
  expectCategoryReferenceLayout,
  expectFeaturedGridColumns,
  expectLandingHeroAndSearchLayout,
  expectResultsStageLayout,
  expectSeparateSearchRow,
  expectSingleRow
} from "./helpers/layout";

test("renders the marketplace landing route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Skills.?Index/i }).first()).toBeVisible();
  await expect(page.getByTestId("landing-hero")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-auth-cluster")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-status")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-categories")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toContainText("TOP");
  await expect(page.getByTestId("landing-hero-primary-metric")).toContainText(/\d+/);
  await expect(page.getByTestId("landing-hero-secondary-metric")).toContainText(/\d+/);
  await expect(page.getByRole("heading", { name: "Curated Picks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
  await expect(page.getByTestId("marketplace-pagination-auto-load")).toHaveCount(0);
  await expect(page.getByTestId("topbar-theme-switch-dark")).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("landing-featured-grid").locator(".marketplace-home-deck-card").first()).toBeVisible();
  await expect(page.getByTestId("landing-latest-rows").locator(".marketplace-home-deck-card").first()).toBeVisible();
  await expect(page.getByTestId("landing-search-strip")).toBeVisible();
  await expect(page.getByText("Continue Exploration")).toHaveCount(0);
  await expect(page.getByText("Recent searches")).toHaveCount(0);
  await expect(page.getByText("Category Directory")).toHaveCount(0);
  await expectSeparateSearchRow(page);
  await expectLandingHeroAndSearchLayout(page);
  await expectFeaturedGridColumns(page);
  await expectSingleRow(page.locator(".marketplace-home-search-shell .marketplace-top-recommendations > *"));
  await expectSingleRow(page.locator(".marketplace-home-search-shell .marketplace-search-utility-left > *"));
});

test("renders the light-prefixed marketplace landing route with the light shell state", async ({ page }) => {
  await page.goto("/light");

  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);
  await expect(page.getByTestId("topbar-theme-switch-light")).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("landing-featured-grid").locator(".marketplace-home-deck-card").first()).toBeVisible();
});

test("focuses the landing search field from the homepage query input", async ({ page }) => {
  await page.goto("/");

  const queryInput = page.locator(".marketplace-home-search-shell .marketplace-search-input.is-query input");
  const landingSearchStrip = page.getByTestId("landing-search-strip");
  await queryInput.click();

  await expect(queryInput).toBeFocused();
  await expect(landingSearchStrip).toBeVisible();
  await expect(landingSearchStrip.getByRole("link").first()).toBeVisible();
});

test("switches the landing page into the light-prefixed theme when the light icon is clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("topbar-theme-switch-light").click();
  await expect(page).toHaveURL(/\/light$/);
  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);
});

test("renders the results compatibility route", async ({ page }) => {
  await page.goto("/results?q=nextjs&tags=react");

  await expect(page.locator("main").getByRole("heading", { name: "Search Results" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Marketplace Snapshot" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("react");
  await expectResultsStageLayout(page, {
    layoutTestId: "results-layout",
    mainTestId: "results-main",
    sideTestId: "results-support"
  });
});

test("navigates results pagination while preserving active filters", async ({ page }) => {
  await page.goto("/results?page=1&page_size=1");

  const pagination = page.getByTestId("marketplace-pagination");
  const nextLink = pagination.getByRole("link", { name: "Next" });

  await expect(pagination).toBeVisible();
  await expect(nextLink).toHaveAttribute("href", /\/results\?page_size=1&page=2$|\/results\?page=2&page_size=1$/);

  await nextLink.click();

  await expect(page).toHaveURL(/\/results\?.*page=2.*page_size=1|\/results\?.*page_size=1.*page=2/);
  await expect(page.locator(".marketplace-search-utility-pill").filter({ hasText: /2 \/ \d+/ }).first()).toBeVisible();
});

test("keeps results sort and mode controls interactive while preserving the active search filters", async ({ page }) => {
  await page.goto("/results?q=release&tags=ops&sort=quality&mode=ai");

  const starsSortLink = page.getByRole("link", { name: "Stars" }).first();
  const keywordModeLink = page.getByRole("link", { name: "Keyword" }).first();
  const qualitySortLink = page.getByRole("link", { name: "Quality" }).first();
  const aiModeLink = page.getByRole("link", { name: "AI" }).first();

  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("ops");
  await expect(qualitySortLink).toHaveAttribute("aria-current", "page");
  await expect(aiModeLink).toHaveAttribute("aria-current", "page");
  await expect(starsSortLink).toHaveAttribute("href", /\/results\?q=release&tags=ops&sort=stars&mode=ai$/);
  await expect(keywordModeLink).toHaveAttribute("href", /\/results\?q=release&tags=ops&sort=quality&mode=keyword$/);

  await keywordModeLink.click();
  await expect(page).toHaveURL(/\/results\?q=release&tags=ops&sort=quality&mode=keyword$/);
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("ops");

  await page.getByRole("link", { name: "Stars" }).first().click();
  await expect(page).toHaveURL(/\/results\?q=release&tags=ops&sort=stars&mode=keyword$/);
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("ops");
});

test("renders the rankings compatibility route", async ({ page }) => {
  await page.goto("/rankings");

  await expect(page.getByRole("heading", { name: "Download Ranking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curated Picks · This Week" })).toBeVisible();
  await expect(page.locator(".marketplace-topbar-status").filter({ hasText: "Rankings" })).toBeVisible();
  await expectResultsStageLayout(page, {
    layoutTestId: "ranking-layout",
    mainTestId: "ranking-main",
    sideTestId: "ranking-support"
  });
});

test("renders category detail as a results-stage route", async ({ page }) => {
  await page.goto("/categories/programming-development?subcategory=devops-cloud&tags=release");

  const activeRailLink = page.getByTestId("categories-rail").locator(".marketplace-category-nav-item.is-active").first();

  await expect(page.getByRole("navigation", { name: "Category breadcrumb" })).toContainText("Programming & Development");
  await expect(page.locator("main").getByRole("heading", { name: "Programming & Development Results" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Category Results" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("release");
  await expect(page.getByTestId("category-detail-matching-count")).toContainText("1");
  await expect(activeRailLink).toBeVisible();
  await expect(activeRailLink).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".marketplace-chip-control.is-active").filter({ hasText: "DevOps & Cloud" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Release Readiness Checklist" })).toBeVisible();
  await expectCategoryReferenceFrame(page);
  await expectResultsStageLayout(page, {
    layoutTestId: "category-results-layout",
    mainTestId: "category-results-main",
    sideTestId: "category-results-support"
  });
});

test("navigates category detail pagination for grouped category routes", async ({ page }) => {
  await page.goto("/categories/programming-development?page=1&page_size=1");

  const pagination = page.getByTestId("marketplace-pagination");
  const nextLink = pagination.getByRole("link", { name: "Next" });

  await expect(pagination).toBeVisible();
  await expect(nextLink).toHaveAttribute(
    "href",
    /\/categories\/programming-development\?page_size=1&page=2$|\/categories\/programming-development\?page=2&page_size=1$/
  );

  await nextLink.click();

  await expect(
    page
  ).toHaveURL(/\/categories\/programming-development\?.*page=2.*page_size=1|\/categories\/programming-development\?.*page_size=1.*page=2/);
  await expect(page.locator(".marketplace-search-utility-pill").filter({ hasText: /2 \/ \d+/ }).first()).toBeVisible();
});

test("keeps the category hub visible when semantic tags are present in the URL", async ({ page }) => {
  await page.goto("/categories?tags=ops");

  await expect(page.getByTestId("categories-page-title")).toBeVisible();
  await expect(page.getByTestId("category-hub-directory")).toBeVisible();
  await expect(page.getByTestId("category-hub-collections")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No matching skills found" })).toHaveCount(0);
});

test("keeps the rankings page visible when semantic tags are present in the URL", async ({ page }) => {
  await page.goto("/rankings?tags=ops");

  await expect(page.getByRole("heading", { name: "Download Ranking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curated Picks · This Week" })).toBeVisible();
  await expect(page.locator(".marketplace-ranking-highlight-card").first()).toBeVisible();
  await expect(page.locator(".marketplace-ranking-table-row").first()).toBeVisible();
});

test("renders the category index as a marketplace shelf hub", async ({ page }) => {
  await page.goto("/categories");

  const primaryCategoryLink = page.getByTestId("categories-rail").getByRole("link", { name: "Programming & Development" }).first();
  const browseHeading = page.getByRole("heading", { name: "Browse by Category" });
  const mostInstalledHeading = page.getByRole("heading", { name: "Most Installed" });
  const allCategoriesLink = page.getByTestId("category-hub-directory").getByRole("link", { name: /All Categories/i }).first();
  const collectionCards = page.locator(".marketplace-category-collection-card");
  const audiencePriorityCard = collectionCards.filter({ hasText: "I'm an Agent" }).first();
  const tagPivotCard = collectionCards.filter({ hasText: "Category Pivots" }).first();
  const categoryShelf = page.getByTestId("category-spotlight-shelf-programming-development");

  await expect(page.getByTestId("categories-page-title")).toBeVisible();
  await expect(page.getByTestId("category-hub-actions")).toBeVisible();
  await expect(page.getByRole("link", { name: "I'm an Agent" })).toBeVisible();
  await expect(page.getByRole("link", { name: "I'm a Human" })).toBeVisible();
  await expect(page.getByTestId("category-hub-search-card").getByRole("textbox", { name: "Search" })).toBeVisible();
  await expect(page.getByTestId("category-hub-submit-skill")).toBeVisible();
  await expect(allCategoriesLink).toBeVisible();
  await expect(page.getByTestId("category-hub-collections")).toBeVisible();
  await expect(page.getByTestId("category-hub-collections").getByRole("link", { name: "View All" })).toHaveAttribute(
    "href",
    /\/rankings$/
  );
  await expect(page.getByTestId("category-hub-collections").locator(".marketplace-section-header h2")).toBeVisible();
  await expect(page.getByTestId("category-hub-directory").getByRole("link", { name: "Design & Art" }).first()).toBeVisible();
  await expect(page.getByTestId("category-hub-stat-categories")).toContainText(/\d+/);
  await expect(page.getByTestId("category-hub-stat-skills")).toContainText(/\d+/);
  await expect(page.getByTestId("category-hub-stat-tags")).toContainText(/\d+/);
  await expect(primaryCategoryLink).toBeVisible();
  await expect(primaryCategoryLink).toHaveAttribute("href", /\/categories\/programming-development$/);
  await expect(audiencePriorityCard).toBeVisible();
  await expect(audiencePriorityCard.getByRole("link", { name: "Search" }).first()).toHaveAttribute("href", /\/results\?q=.+&tags=.+$/);
  await expect(audiencePriorityCard.getByRole("link", { name: /open skill/i })).toHaveAttribute("href", /\/skills\/\d+$/);
  await expect(tagPivotCard.getByRole("link", { name: "Search" }).first()).toHaveAttribute("href", /\/results\?(?:q=.+&)?tags=.+$/);
  await expect(categoryShelf).toBeVisible();
  await expect(categoryShelf.getByRole("link", { name: "All subcategories" })).toHaveAttribute(
    "href",
    /\/categories\/programming-development$/
  );
  await expect(mostInstalledHeading).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recently Updated" })).toBeVisible();
  await expect(browseHeading).toBeVisible();
  await expectCategoryReferenceLayout(page);

  const browseHeadingBox = await browseHeading.boundingBox();
  const mostInstalledHeadingBox = await mostInstalledHeading.boundingBox();

  expect(browseHeadingBox).not.toBeNull();
  expect(mostInstalledHeadingBox).not.toBeNull();

  if (browseHeadingBox && mostInstalledHeadingBox) {
    expect(browseHeadingBox.y).toBeLessThan(mostInstalledHeadingBox.y);
  }

  await page.getByRole("link", { name: "I'm a Human" }).click();
  await expect(page).toHaveURL(/\/categories\?audience=human$/);
  await expect(collectionCards.filter({ hasText: "I'm a Human" }).first()).toBeVisible();
  await expect(
    collectionCards
      .filter({ hasText: "I'm a Human" })
      .first()
      .getByRole("link", { name: "Search" })
      .first()
  ).toHaveAttribute("href", /\/results\?q=.+&tags=.+$/);
});

test("keeps marketplace header navigation active across landing, categories, rankings, and skill detail routes", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("landing-topbar-nav-categories").click();
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByTestId("landing-topbar-nav-categories")).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".marketplace-topbar-status").filter({ hasText: "Categories" })).toBeVisible();

  await page.getByTestId("landing-topbar-nav-rankings").click();
  await expect(page).toHaveURL(/\/rankings$/);
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".marketplace-topbar-status").filter({ hasText: "Rankings" })).toBeVisible();

  await page.goto("/skills/101");
  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
  await expect(page.getByTestId("skill-detail-shell-breadcrumb")).toContainText("Release Readiness Checklist");

  await page.getByTestId("landing-topbar-nav-categories").click();
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByTestId("landing-topbar-nav-categories")).toHaveAttribute("aria-current", "page");
});

test("renders the results route with marketplace breadcrumb context and active shared navigation", async ({ page }) => {
  await page.goto("/results?q=nextjs&tags=react");

  await expect(page.getByTestId("search-shell-breadcrumb")).toContainText("Home");
  await expect(page.getByTestId("search-shell-breadcrumb")).toContainText("Search Results");
  await expect(page.locator(".marketplace-topbar-status").filter({ hasText: "Results" })).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-categories")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toBeVisible();
});
