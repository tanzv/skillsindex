import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockAnonymousAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: null });
  });
}

async function mockSkillDetail(page: Page): Promise<void> {
  await page.route("**/api/v1/public/skills/**", async (route) => {
    await fulfillJSON(route, 200, {
      skill: {
        id: 901,
        name: "browser-automation-pro",
        description: "Prototype payload",
        content: "name: browser-automation-pro\nversion: 2.4.1",
        category: "development",
        subcategory: "qa",
        tags: ["browser"],
        source_type: "official",
        source_url: "https://github.com/skillsindex/browser-automation-pro",
        star_count: 812,
        quality_score: 97.8,
        install_command: "npx skillsindex install browser-automation-pro",
        updated_at: "2026-02-20T14:32:00Z"
      },
      stats: {
        favorite_count: 0,
        rating_count: 0,
        rating_average: 0,
        comment_count: 0
      },
      viewer_state: {
        can_interact: false,
        favorited: false,
        rated: false,
        rating: 0
      },
      comments: [],
      comments_limit: 80
    });
  });
}

async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("skillsindex.locale", "en");
  });
}

test.describe("Public route prefix navigation", () => {
  test("global theme switch keeps query params when toggling desktop mode", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/rankings?left=901&right=902&q=repo&page=2");
    await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    await expect(page).toHaveURL(/\/light\/rankings\?left=901&right=902&q=repo&page=2$/);

    await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
    await expect(page).toHaveURL(/\/rankings\?left=901&right=902&q=repo&page=2$/);
  });

  test("global theme switch keeps mobile prefix family when toggling mode", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/mobile/light/rankings?left=901&right=902");
    await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
    await expect(page).toHaveURL(/\/mobile\/rankings\?left=901&right=902$/);

    await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    await expect(page).toHaveURL(/\/mobile\/light\/rankings\?left=901&right=902$/);
  });

  test("legacy compare route with query redirects to rankings and keeps light prefix navigation", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/light/compare?left=901&right=902");
    await expect(page).toHaveURL(/\/light\/rankings\?left=901&right=902$/);
    await page.getByRole("button", { name: "View Categories", exact: true }).click();
    await expect(page).toHaveURL("/light/categories");

    await page.goto("/light/compare?left=901&right=902");
    await expect(page).toHaveURL(/\/light\/rankings\?left=901&right=902$/);
    await page.getByRole("button", { name: "Profile", exact: true }).click();
    await expect(page).toHaveURL(/\/light\/login$/);
  });

  test("skill detail keeps light prefix when switching to changelog view", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockSkillDetail(page);

    await page.goto("/light/skills/901");
    await page.getByRole("button", { name: "History", exact: true }).first().click();
    await expect(page).toHaveURL(/\/light\/skills\/901$/);
    await expect(page.getByTestId("skill-detail-directory-row-CHANGELOG.md")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("CHANGELOG.md");
  });

  test("docs route stays stable while legacy compare root redirects with preserved prefix", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/mobile/light/docs#api");
    await expect(page).toHaveURL("/mobile/light/docs#api");
    await expect(page.getByRole("heading", { name: "Documentation Hub" })).toBeVisible();
    await expect(page.getByTestId("docs-page-breadcrumb-current")).toHaveText("Documentation Hub");

    await page.goto("/light/compare?left=901&right=902");
    await expect(page).toHaveURL("/light/rankings?left=901&right=902");
  });

  test("rankings and categories keep light/mobile prefixes during navigation", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/mobile/light/rankings");
    await expect(page.getByTestId("public-global-controls")).toHaveCount(0);
    await expect(page.getByTestId("topbar-theme-switch-dark")).toBeVisible();
    await expect(page.getByTestId("topbar-theme-switch-light")).toBeVisible();
    await expect(page.getByTestId("topbar-locale-switch-zh")).toBeVisible();
    await expect(page.getByTestId("topbar-locale-switch-en")).toBeVisible();
    await page.getByTestId("topbar-theme-switch-dark").click();
    await expect(page).toHaveURL("/mobile/rankings");

    await page.getByTestId("topbar-theme-switch-light").click();
    await expect(page).toHaveURL("/mobile/light/rankings");

    await page.goto("/light/rankings");
    await page.getByRole("button", { name: "View Categories", exact: true }).click();
    await expect(page).toHaveURL("/light/categories");

    await page.getByRole("button", { name: /Open Rankings|Download Ranking/ }).first().click();
    await expect(page).toHaveURL("/light/rankings");
  });
});
