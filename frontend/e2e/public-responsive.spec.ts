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

test.describe("Public pages responsive and functional", () => {
  test.use({
    viewport: {
      width: 390,
      height: 844
    }
  });

  test("home page keeps core interactions available on mobile viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/");
    await expect(page.locator(".marketplace-home")).toHaveClass(/is-mobile/);
    await expect(page.locator(".marketplace-search-input.is-query input")).toBeVisible();

    await page.locator(".marketplace-search-input.is-query input").click();
    await expect(page.locator(".marketplace-results-floating-container")).toBeVisible();
    await expect(page.locator("[data-testid='marketplace-results-modal-context']")).toBeVisible();
    await expect(page.locator("[data-testid='marketplace-results-modal-recent-searches']")).toBeVisible();
    await page.locator(".marketplace-results-modal-input.is-query input").press("Enter");
    await expect(page).toHaveURL(/\/results$/);

    await page.locator(".marketplace-results-list .marketplace-skill-name button").first().click();
    await expect(page).toHaveURL(/\/skills\/\d+$/);
  });

  test("skill detail change history action switches file preset on mobile viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockSkillDetail(page);

    await page.goto("/skills/901");
    await expect(page.locator(".skill-detail-title").first()).toHaveText("browser-automation-pro");
    await expect(page.getByRole("button", { name: "Categories", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Execution", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "History", exact: true }).first().click();
    await expect(page).toHaveURL(/\/skills\/901$/);
    await expect(page.locator(".skill-detail-top-file-switch .skill-detail-top-file-button.is-active")).toHaveText("CHANGELOG.md");
  });

  test("categories and rankings pages remain functional on mobile viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);

    await page.goto("/rankings");
    await expect(page.getByRole("heading", { name: "Top Skills Ranking", exact: true })).toBeVisible();
    await expect(page.getByTestId("ranking-page-breadcrumb-current")).toHaveText("Top Skills Ranking");
    await page.getByTestId("ranking-highlight-skill-button").first().click();
    await expect(page).toHaveURL(/\/skills\/\d+$/);

    await page.goto("/categories");
    await expect(page.getByRole("heading", { name: "Categories", exact: true })).toBeVisible();
    await expect(page.getByTestId("categories-page-breadcrumb-current")).toHaveText("Categories");
    await page.getByRole("button", { name: /Open Rankings|Download Ranking/ }).first().click();
    await expect(page).toHaveURL(/\/rankings$/);
  });
});
