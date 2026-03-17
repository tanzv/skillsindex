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

async function mockSkillDetailRoutes(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: null });
  });

  await page.route("**/api/v1/public/marketplace**", async (route) => {
    await fulfillJSON(route, 200, {
      filters: {
        q: "",
        tags: "",
        category: "automation",
        subcategory: "browser",
        sort: "recent",
        mode: ""
      },
      stats: {
        total_skills: 2,
        matching_skills: 2
      },
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 2,
        total_pages: 1,
        prev_page: 0,
        next_page: 0
      },
      categories: [],
      top_tags: [],
      items: [
        {
          id: 12,
          name: "browser-automation-pro",
          description: "Drive browser workflows with deterministic scripts.",
          content: "# Browser Automation Pro",
          category: "automation",
          subcategory: "browser",
          tags: ["browser", "automation"],
          source_type: "repository",
          source_url: "https://github.com/example/browser-automation-pro",
          star_count: 820,
          quality_score: 9.4,
          install_command: "codex skill install github:example/browser-automation-pro",
          updated_at: "2026-03-01T09:00:00Z"
        },
        {
          id: 14,
          name: "browser-flow-lite",
          description: "Capture browser flows with minimal setup.",
          content: "# Browser Flow Lite",
          category: "automation",
          subcategory: "browser",
          tags: ["browser", "qa"],
          source_type: "repository",
          source_url: "https://github.com/example/browser-flow-lite",
          star_count: 344,
          quality_score: 8.8,
          install_command: "codex skill install github:example/browser-flow-lite",
          updated_at: "2026-02-20T09:00:00Z"
        }
      ],
      session_user: null,
      can_access_dashboard: false
    });
  });

  await page.route("**/api/v1/public/skills/**", async (route) => {
    await fulfillJSON(route, 200, {
      skill: {
        id: 12,
        name: "browser-automation-pro",
        description: "Drive browser workflows with deterministic scripts.",
        content: "# Browser Automation Pro\n\nAutomate browser tasks with stable steps.",
        category: "automation",
        subcategory: "browser",
        tags: ["browser", "automation"],
        source_type: "repository",
        source_url: "https://github.com/example/browser-automation-pro",
        star_count: 820,
        quality_score: 9.4,
        install_command: "codex skill install github:example/browser-automation-pro",
        updated_at: "2026-03-01T09:00:00Z"
      },
      stats: {
        favorite_count: 4,
        rating_count: 2,
        rating_average: 4.5,
        comment_count: 1
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

test.describe("Public skill detail shell layout", () => {
  test("keeps the marketplace topbar on the shared shell while preserving centered detail content", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 960 });
    await forceEnglishLocale(page);
    await mockSkillDetailRoutes(page);

    await page.goto("/skills/12?skill_detail_mode=live");

    const topbar = page.locator(".marketplace-topbar");
    const hero = page.locator(".skill-detail-top");
    const main = page.locator(".skill-detail-main");

    await expect(topbar).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(main).toBeVisible();

    const [topbarBox, heroBox, mainBox] = await Promise.all([
      topbar.boundingBox(),
      hero.boundingBox(),
      main.boundingBox()
    ]);

    expect(topbarBox).not.toBeNull();
    expect(heroBox).not.toBeNull();
    expect(mainBox).not.toBeNull();

    expect(Math.abs((topbarBox?.x || 0) - 8)).toBeLessThanOrEqual(2);
    expect(Math.abs((topbarBox?.width || 0) - 1264)).toBeLessThanOrEqual(2);

    expect((heroBox?.x || 0)).toBeGreaterThan((topbarBox?.x || 0) + 12);
    expect((heroBox?.width || 0)).toBeLessThan((topbarBox?.width || 0));
    expect(Math.abs((heroBox?.x || 0) - (mainBox?.x || 0))).toBeLessThanOrEqual(2);

    const heroRight = (heroBox?.x || 0) + (heroBox?.width || 0);
    const mainRight = (mainBox?.x || 0) + (mainBox?.width || 0);
    expect(Math.abs(heroRight - mainRight)).toBeLessThanOrEqual(2);
  });
});
