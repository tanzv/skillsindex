import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";
import {
  expectCategoryReferenceFrame,
  expectCategoryReferenceLayout,
  expectFeaturedGridColumns,
  expectLandingHeroAndSearchLayout,
  expectResultsStageLayout,
  expectSeparateSearchRow,
  expectSingleRow,
  expectSkillDetailHeaderWithinViewport
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
  await expect(page.getByTestId("landing-hero-primary-metric")).toHaveText("3");
  await expect(page.getByTestId("landing-hero-secondary-metric")).toContainText("2");
  await expect(page.getByTestId("landing-hero-secondary-metric")).toContainText("8");
  await expect(page.getByRole("heading", { name: "Curated Picks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest Updates" })).toBeVisible();
  await expect(page.getByTestId("marketplace-pagination-auto-load")).toBeVisible();
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

test("renders the login route with the prototype-aligned auth layout", async ({ page }) => {
  await page.goto("/login?redirect=%2Fadmin%2Foverview");

  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("login-topbar")).toBeVisible();
  await expect(page.getByTestId("login-info-card")).toBeVisible();
  await expect(page.getByTestId("login-info-card-list")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-credentials")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-providers")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-redirect")).toContainText("/admin/overview");
  await expect(page.getByTestId("login-form-card")).toBeVisible();
  await expect(page.getByTestId("login-form-brand")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
  await expect(page.getByTestId("login-username-input")).toBeVisible();
  await expect(page.getByTestId("login-password-input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

  await page.getByTestId("login-locale-zh").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByTestId("login-locale-zh")).toHaveAttribute("aria-pressed", "true");
});

test("renders explicit and implicit system status pages", async ({ page }) => {
  await page.goto("/states/503");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("503");
  await expect(page.getByRole("heading", { name: "Service Unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.goto("/states/server-error");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("500");
  await expect(page.getByRole("heading", { name: "Unexpected Application Error" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.goto("/missing-system-route");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("404");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toBeVisible();
});

test("renders the global error boundary for a diagnostic runtime fault", async ({ page }) => {
  await page.goto("/__diagnostics/runtime-error");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("500");
  await expect(page.getByRole("heading", { name: "Unexpected Application Error" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toBeVisible();
  await expect(page.getByText(/^Error digest:/)).toBeVisible();
});

test("renders the shared loading transition before a delayed diagnostic route settles", async ({ page }) => {
  const navigation = page.goto("/__diagnostics/slow");

  await expect(page.getByTestId("system-status-loading-page")).toBeVisible();

  await navigation;

  await expect(page.getByTestId("diagnostic-slow-page")).toBeVisible();
  await expect(page.getByText("Diagnostic content ready.")).toBeVisible();
});

test("renders localized login errors after switching the login page to Chinese", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("login-locale-zh").click();
  await page.getByTestId("login-username-input").fill("wrong-user");
  await page.getByTestId("login-password-input").fill("wrong-password");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByText("用户名或密码错误。")).toBeVisible();
});

test("redirects authenticated viewers away from the login route", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await page.goto("/login");

  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByTestId("workspace-shell")).toBeVisible();
});

test("renders the light-prefixed marketplace landing route with the light shell state", async ({ page }) => {
  await page.goto("/light");

  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);
  await expect(page.getByTestId("topbar-theme-switch-light")).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("landing-featured-grid").locator(".marketplace-home-deck-card").first()).toBeVisible();
});

test("opens the landing search overlay from the read-only homepage query input", async ({ page }) => {
  await page.goto("/");

  await page.locator(".marketplace-home-search-shell .marketplace-search-input.is-query input").click();
  await expect(page.getByRole("dialog", { name: "Search Results" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent searches" })).toBeVisible();
  await expect(page.getByText("History appears here after you submit a query.")).toBeVisible();
});

test("switches the landing page into the light-prefixed theme when the light icon is clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("topbar-theme-switch-light").click();
  await expect(page).toHaveURL(/\/light$/);
  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);
});

test("carries the light marketplace theme into the protected workspace shell", async ({ page }) => {
  await page.goto("/light");
  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);

  await loginAsAdmin(page, "/workspace");

  await expect(page.getByTestId("workspace-shell")).toHaveAttribute("data-protected-theme", "light");
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
  await page.goto("/categories/operations?subcategory=release&tags=ops");

  const activeRailLink = page.getByTestId("categories-rail").locator(".marketplace-category-nav-item.is-active").first();

  await expect(page.getByRole("navigation", { name: "Category breadcrumb" })).toContainText("Operations");
  await expect(page.locator("main").getByRole("heading", { name: "Operations Results" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Category Results" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("ops");
  await expect(page.getByTestId("category-detail-matching-count")).toContainText("1");
  await expect(activeRailLink).toBeVisible();
  await expect(activeRailLink).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".marketplace-chip-control.is-active").filter({ hasText: "Release" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Release Readiness Checklist" })).toBeVisible();
  await expectCategoryReferenceFrame(page);
  await expectResultsStageLayout(page, {
    layoutTestId: "category-results-layout",
    mainTestId: "category-results-main",
    sideTestId: "category-results-support"
  });
});

test("opens skill detail from category and results list cards", async ({ page }) => {
  await page.goto("/categories/operations?subcategory=release&tags=ops");

  await page.getByRole("link", { name: "Release Readiness Checklist" }).first().click();
  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.getByTestId("skill-detail-page")).toBeVisible();

  await page.goto("/results?tags=ops");

  await page.getByRole("link", { name: "Release Readiness Checklist" }).first().click();
  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
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
  await expect(page.getByTestId("category-hub-stat-categories")).toContainText("2");
  await expect(page.getByTestId("category-hub-stat-skills")).toContainText("3");
  await expect(page.getByTestId("category-hub-stat-tags")).toContainText("8");
  await expect(primaryCategoryLink).toBeVisible();
  await expect(primaryCategoryLink).toHaveAttribute("href", /\/categories\/programming-development$/);
  await expect(audiencePriorityCard).toBeVisible();
  await expect(audiencePriorityCard.getByRole("link", { name: "Search" }).first()).toHaveAttribute("href", /\/results\?q=.+&tags=.+$/);
  await expect(audiencePriorityCard.getByRole("link", { name: /open skill/i })).toHaveAttribute("href", /\/skills\/\d+$/);
  await expect(tagPivotCard.getByRole("link", { name: "Search" }).first()).toHaveAttribute("href", /\/results\?q=.+&tags=.+$/);
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

test("renders the state compatibility route", async ({ page }) => {
  await page.goto("/states/error");

  await expect(page.getByRole("heading", { name: "Error State" })).toBeVisible();
});

test("renders the skill detail route without backend data", async ({ page }) => {
  await page.setViewportSize({ width: 512, height: 720 });
  await page.goto("/skills/101");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
  await expectSkillDetailHeaderWithinViewport(page);
  await expect(page.getByRole("heading", { level: 1, name: "Release Readiness Checklist" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-context-bar")).toBeVisible();
  await expect(page.getByTestId("skill-detail-header-summary")).toBeHidden();
  await expect(page.locator(".skill-detail-overview-card .skill-detail-panel-copy")).toContainText("Track release signals before production cutover.");
  await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Installation Method" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "SKILL.md" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Resources" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Related Skills" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-stage-title").last()).toHaveText("SKILL.md");
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-content")).toContainText("# Release Readiness Checklist");
  await expect(page.getByTestId("skill-detail-installation-card")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Agent" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Human" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-resource-workbench")).toBeVisible();
  await expect(page.getByTestId("skill-detail-sidebar")).toBeVisible();
  await expect(page.getByTestId("skill-detail-interaction-panel")).toHaveCount(0);
  await expect(page.getByTestId("skill-detail-comments-panel")).toHaveCount(0);
});

test("keeps the skill detail context bar, preview stage, and install sidebar synchronized", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/light/skills/101");

  await expect(page.getByTestId("skill-detail-context-bar")).toBeVisible();
  await expect(page.locator(".skill-detail-context-status-value")).toHaveText("overview");
  await expect(page.locator(".skill-detail-installation-card-context-chip")).toHaveText("overview");

  await page.getByRole("tab", { name: "Resources" }).click();
  await expect(page.locator("#skill-detail-panel-resources")).toBeVisible();
  await expect(page.locator(".skill-detail-context-status-value")).toHaveText("SKILL.md");
  await expect(page.locator(".skill-detail-installation-card-context-chip")).toHaveText("SKILL.md");

  await page.getByTestId("skill-detail-resource-tree-row-README.md").click();

  await expect(page.getByTestId("skill-detail-page")).toHaveAttribute("data-active-tab", "skill");
  await expect(page.locator("#skill-detail-panel-skill")).toBeVisible();
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-stage-title")).toHaveText("README.md");
  await expect(page.locator(".skill-detail-context-status-value")).toHaveText("README.md");
  await expect(page.locator(".skill-detail-installation-card-context-chip")).toHaveText("README.md");
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-content")).toContainText("# Release Readiness Checklist");
});

test("redirects protected routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/admin/access");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Faccess/);
});

test("redirects workspace routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/workspace/queue");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fworkspace%2Fqueue/);
});

test("redirects account routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/account/profile");

  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fprofile/);
});

test("renders workspace actions instead of sign-in actions for authenticated viewers on public skill pages", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await page.goto("/skills/101");

  await expect(page.getByRole("link", { name: "Workspace" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In" })).toHaveCount(0);
});

test("returns authenticated viewers to the current public skill page after signing in", async ({ page }) => {
  await page.goto("/skills/101");

  await page.getByRole("link", { name: "Sign In" }).first().click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fskills%2F101/);

  await page.getByTestId("login-username-input").fill("admin");
  await page.getByTestId("login-password-input").fill("Admin123456!");
  await page.locator('form button[type="submit"]').click();

  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.getByRole("link", { name: "Workspace" }).first()).toBeVisible();
});
