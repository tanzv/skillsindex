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
    await expect(page.getByRole("button", { name: "History", exact: true })).toHaveCount(0);
    await expect(page.locator(".skill-detail-directory-row.is-file")).toHaveCount(1);
    await expect(page.getByTestId("skill-detail-directory-row-README.md")).toHaveCount(0);
    await expect(page.getByTestId("skill-detail-directory-row-CHANGELOG.md")).toHaveCount(0);
  });

  test("renders nested tree hierarchy clearly in prototype mode", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, { user: null });
    });

    await page.goto("/skills/901?skill_detail_mode=prototype");

    const examplesDirectory = page.getByTestId("skill-detail-directory-row-examples");
    await expect(examplesDirectory).toBeVisible();
    await expect(examplesDirectory).toHaveAttribute("aria-expanded", "true");

    const nestedFile = page.getByTestId("skill-detail-directory-row-examples/browser-automation-pro_flow.yaml");
    await expect(nestedFile).toBeVisible();

    await examplesDirectory.click();
    await expect(examplesDirectory).toHaveAttribute("aria-expanded", "false");
    await expect(nestedFile).toHaveCount(0);
    await examplesDirectory.click();
    await expect(examplesDirectory).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("skill-detail-directory-row-examples/browser-automation-pro_flow.yaml")).toBeVisible();

    const selectedRow = page.getByTestId("skill-detail-directory-row-SKILL.md");
    const defaultDirectoryStyles = await examplesDirectory.evaluate((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      return {
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor
      };
    });
    const selectedStyles = await selectedRow.evaluate((element) => {
      const styles = window.getComputedStyle(element as HTMLElement);
      return {
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor
      };
    });
    const nestedIndentWidth = await nestedFile.locator('.skill-detail-directory-row-indent').evaluate((element) => {
      return Math.round((element as HTMLElement).getBoundingClientRect().width);
    });

    expect(nestedIndentWidth).toBeGreaterThan(0);
    expect(selectedStyles.backgroundColor).not.toBe(defaultDirectoryStyles.backgroundColor);
    expect(selectedStyles.borderColor).not.toBe(defaultDirectoryStyles.borderColor);
  });

});
