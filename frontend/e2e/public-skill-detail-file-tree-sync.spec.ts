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

test.describe("Public skill detail file tree synchronization", () => {
  test("keeps directory tree and file preview synchronized", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, { user: null });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 902,
          name: "browser-automation-pro",
          description: "Test skill detail payload",
          content: "name: browser-automation-pro\nversion: 2.4.1",
          category: "development",
          subcategory: "qa",
          tags: ["browser", "playwright"],
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

    await page.goto("/skills/902?skill_detail_mode=live");

    await expect(page.getByTestId("skill-detail-directory-row-SKILL.md")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("SKILL.md");

    await page.getByRole("button", { name: "History", exact: true }).first().click();
    await expect(page.getByTestId("skill-detail-directory-row-CHANGELOG.md")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("CHANGELOG.md");

    await page.getByTestId("skill-detail-directory-row-README.md").click();
    await expect(page.getByTestId("skill-detail-directory-row-README.md")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("README.md");

    await page.locator(".skill-detail-directory-row.is-file", { hasText: /\.ya?ml$/i }).first().click();
    await expect(page.locator(".skill-detail-doc-file-name")).toHaveText(/\.ya?ml$/i);
  });
});
