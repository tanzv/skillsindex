import { expect, test, type Locator } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

async function expectSingleRow(locator: Locator, maximumTopDelta = 10) {
  const itemTops = await locator.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top))
  );

  expect(itemTops.length).toBeGreaterThan(1);
  expect(Math.max(...itemTops) - Math.min(...itemTops)).toBeLessThanOrEqual(maximumTopDelta);
}

async function expectFeaturedGridColumns(page: Parameters<typeof test>[0]["page"]) {
  const row = page.getByTestId("landing-latest-rows").locator(".marketplace-results-row").first();
  await expect(row).toBeVisible();

  const layout = await row.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const firstCard = element.querySelector(".marketplace-home-deck-card");
    const firstCardRect = firstCard?.getBoundingClientRect() || null;

    return {
      rowWidth: rect.width,
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      firstCardWidth: firstCardRect?.width || 0,
      firstCardHeight: firstCardRect?.height || 0
    };
  });

  expect(layout.columns).toBe(3);
  expect(layout.firstCardWidth).toBeGreaterThan(layout.rowWidth * 0.25);
  expect(layout.firstCardWidth).toBeLessThan(layout.rowWidth * 0.36);
  expect(layout.firstCardHeight).toBeGreaterThanOrEqual(190);
  expect(layout.firstCardHeight).toBeLessThanOrEqual(202);
}

async function expectSeparateSearchRow(page: Parameters<typeof test>[0]["page"]) {
  const heroBox = await page.getByTestId("landing-hero").boundingBox();
  const searchBox = await page.getByTestId("landing-search-strip").boundingBox();

  expect(heroBox).not.toBeNull();
  expect(searchBox).not.toBeNull();

  if (!heroBox || !searchBox) {
    return;
  }

  expect(searchBox.y).toBeGreaterThan(heroBox.y + heroBox.height - 4);
  expect(Math.abs(searchBox.x - heroBox.x)).toBeLessThanOrEqual(6);
  expect(searchBox.width).toBeGreaterThanOrEqual(heroBox.width - 6);
}

async function expectLandingHeroAndSearchLayout(page: Parameters<typeof test>[0]["page"]) {
  const heroBox = await page.getByTestId("landing-hero").boundingBox();
  const searchBox = await page.getByTestId("landing-search-strip").boundingBox();
  const chartBox = await page.locator(".marketplace-home-hero .marketplace-top-stats-trend-chart").boundingBox();
  const mainRowBox = await page.locator(".marketplace-home-search-shell .marketplace-search-main-row").boundingBox();

  expect(heroBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(chartBox).not.toBeNull();
  expect(mainRowBox).not.toBeNull();

  if (!heroBox || !searchBox || !chartBox || !mainRowBox) {
    return;
  }

  expect(chartBox.width).toBeGreaterThan(heroBox.width * 0.24);
  expect(chartBox.width).toBeLessThan(heroBox.width * 0.44);
  expect(chartBox.x).toBeGreaterThan(heroBox.x + heroBox.width * 0.52);
  expect(searchBox.height).toBeLessThan(210);
  expect(mainRowBox.height).toBeGreaterThanOrEqual(56);
}

async function expectSkillDetailHeaderWithinViewport(page: Parameters<typeof test>[0]["page"]) {
  const headerBox = await page.getByTestId("skill-detail-header").boundingBox();
  const viewport = page.viewportSize();

  expect(headerBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!headerBox || !viewport) {
    return;
  }

  expect(headerBox.y).toBeLessThan(viewport.height - 96);
}

async function expectCategoryReferenceFrame(page: Parameters<typeof test>[0]["page"]) {
  const rail = page.getByTestId("categories-rail");
  const stream = page.getByTestId("categories-stream");

  await expect(rail).toBeVisible();
  await expect(stream).toBeVisible();

  const layout = await page.evaluate(() => {
    const hub = document.querySelector(".marketplace-category-reference-layout");
    const railNode = document.querySelector("[data-testid='categories-rail']");
    const streamNode = document.querySelector("[data-testid='categories-stream']");

    if (!hub || !railNode || !streamNode) {
      return null;
    }

    const hubStyle = window.getComputedStyle(hub);
    const railRect = railNode.getBoundingClientRect();
    const streamRect = streamNode.getBoundingClientRect();

    return {
      hubColumns: hubStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
      railWidth: Math.round(railRect.width),
      streamWidth: Math.round(streamRect.width),
      streamOffset: Math.round(streamRect.x - railRect.x)
    };
  });

  expect(layout).not.toBeNull();

  if (!layout) {
    return;
  }

  expect(layout.hubColumns).toBe(2);
  expect(layout.streamWidth).toBeGreaterThan(layout.railWidth);
  expect(layout.streamOffset).toBeGreaterThan(layout.railWidth - 20);
}

async function expectCategoryReferenceLayout(page: Parameters<typeof test>[0]["page"]) {
  const firstSection = page.locator("[data-testid^='category-skill-section-']").first();

  await expectCategoryReferenceFrame(page);
  await expect(firstSection).toBeVisible();

  const firstSectionBox = await firstSection.boundingBox();
  const railBox = await page.getByTestId("categories-rail").boundingBox();

  expect(firstSectionBox).not.toBeNull();
  expect(railBox).not.toBeNull();

  if (firstSectionBox && railBox) {
    expect(firstSectionBox.width).toBeGreaterThan(railBox.width);
  }
}

async function expectRankingReferenceLayout(page: Parameters<typeof test>[0]["page"]) {
  const layout = page.getByTestId("ranking-layout");
  const main = page.getByTestId("ranking-main");
  const support = page.getByTestId("ranking-support");

  await expect(layout).toBeVisible();
  await expect(main).toBeVisible();
  await expect(support).toBeVisible();

  const metrics = await page.evaluate(() => {
    const layoutNode = document.querySelector("[data-testid='ranking-layout']");
    const mainNode = document.querySelector("[data-testid='ranking-main']");
    const supportNode = document.querySelector("[data-testid='ranking-support']");

    if (!layoutNode || !mainNode || !supportNode) {
      return null;
    }

    const layoutStyle = window.getComputedStyle(layoutNode);
    const mainRect = mainNode.getBoundingClientRect();
    const supportRect = supportNode.getBoundingClientRect();

    return {
      columns: layoutStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
      mainWidth: Math.round(mainRect.width),
      supportWidth: Math.round(supportRect.width),
      supportOffset: Math.round(supportRect.x - mainRect.x)
    };
  });

  expect(metrics).not.toBeNull();

  if (!metrics) {
    return;
  }

  expect(metrics.columns).toBe(2);
  expect(metrics.mainWidth).toBeGreaterThan(metrics.supportWidth);
  expect(metrics.supportOffset).toBeGreaterThan(metrics.mainWidth - 24);
}

test("renders the marketplace landing route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Skills.?Index/i }).first()).toBeVisible();
  await expect(page.getByTestId("landing-hero")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-auth-cluster")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-status")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-categories")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toBeVisible();
  await expect(page.getByTestId("landing-topbar-nav-rankings")).toContainText("TOP");
  await expect(page.getByText("12,480").first()).toBeVisible();
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
  await page.goto("/login");

  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("login-topbar")).toBeVisible();
  await expect(page.getByTestId("login-info-card")).toBeVisible();
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

test("renders the results compatibility route", async ({ page }) => {
  await page.goto("/results?q=nextjs&tags=react");

  await expect(page.locator("main").getByRole("heading", { name: "Search Results" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Marketplace Snapshot" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("react");
});

test("renders the rankings compatibility route", async ({ page }) => {
  await page.goto("/rankings");

  await expect(page.getByRole("heading", { name: "Download Ranking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curated Picks · This Week" })).toBeVisible();
  await expect(page.locator(".marketplace-topbar-status").filter({ hasText: "Rankings" })).toBeVisible();
  await expectRankingReferenceLayout(page);
});

test("renders category detail as a results-stage route", async ({ page }) => {
  await page.goto("/categories/operations?subcategory=release&tags=ops");

  const activeRailLink = page.getByTestId("categories-rail").locator(".marketplace-category-nav-item.is-active").first();

  await expect(page.getByRole("navigation", { name: "Category breadcrumb" })).toContainText("Operations");
  await expect(page.locator("main").getByRole("heading", { name: "Operations Results" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Category Results" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Semantic Filters" })).toHaveValue("ops");
  await expect(activeRailLink).toBeVisible();
  await expect(activeRailLink).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".marketplace-chip-control.is-active").filter({ hasText: "Release" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Release Readiness Checklist" })).toBeVisible();
  await expectCategoryReferenceFrame(page);
});

test("renders the category index as a marketplace shelf hub", async ({ page }) => {
  await page.goto("/categories");

  const primaryCategoryLink = page.getByTestId("categories-rail").getByRole("link", { name: "Programming & Development" }).first();
  const browseHeading = page.getByRole("heading", { name: "Browse by Category" });
  const mostInstalledHeading = page.getByRole("heading", { name: "Most Installed" });

  await expect(page.getByTestId("categories-page-title")).toBeVisible();
  await expect(primaryCategoryLink).toBeVisible();
  await expect(primaryCategoryLink).toHaveAttribute("href", /\/categories\/programming-development$/);
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
  await expect(page.getByText("Skill Detail")).toBeVisible();
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
  await page.setViewportSize({ width: 512, height: 342 });
  await page.goto("/skills/101");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
  await expectSkillDetailHeaderWithinViewport(page);
  await expect(page.getByRole("heading", { level: 1, name: "Release Readiness Checklist" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-header-summary")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Installation Method" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "SKILL.md" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Resources" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Related Skills" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
  await expect(page.locator("main").getByRole("heading", { level: 2, name: "Overview" })).toBeVisible();
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-title").last()).toHaveText("SKILL.md");
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-content")).toContainText("# Release Readiness Checklist");
  await expect(page.getByTestId("skill-detail-installation-card")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Agent" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Human" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-resource-workbench")).toBeVisible();
  await expect(page.getByTestId("skill-detail-sidebar")).toBeVisible();
  await expect(page.getByTestId("skill-detail-comments-panel")).toBeVisible();

  await page.getByRole("tab", { name: "Resources" }).click();
  await expect(page.getByRole("button", { name: "Details" })).toBeVisible();

  const readmeTreeItem = page.getByRole("treeitem", { name: /README\.md/i });
  await readmeTreeItem.scrollIntoViewIfNeeded();
  await readmeTreeItem.click();

  await expect(page.getByRole("tab", { name: "SKILL.md" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-title")).toHaveText("README.md");
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-content")).toContainText("## Quick Start");
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
