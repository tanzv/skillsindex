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

async function mockMarketplacePayload(page: Page): Promise<void> {
  await page.route("**/api/v1/public/marketplace**", async (route) => {
    await fulfillJSON(route, 200, {
      filters: {
        q: "",
        tags: "",
        category: "",
        subcategory: "",
        sort: "recent",
        mode: ""
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
          slug: "development",
          name: "Development",
          description: "Developer workflow automation",
          count: 2,
          subcategories: [
            {
              slug: "qa",
              name: "QA",
              count: 1
            }
          ]
        }
      ],
      top_tags: [],
      items: [
        {
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
        {
          id: 902,
          name: "workspace-governance-kit",
          description: "Governance workflow bundle",
          content: "name: workspace-governance-kit\nversion: 1.0.0",
          category: "development",
          subcategory: "qa",
          tags: ["governance"],
          source_type: "official",
          source_url: "https://github.com/skillsindex/workspace-governance-kit",
          star_count: 420,
          quality_score: 94.2,
          install_command: "npx skillsindex install workspace-governance-kit",
          updated_at: "2026-02-18T14:32:00Z"
        }
      ],
      session_user: null,
      can_access_dashboard: false
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
    await mockMarketplacePayload(page);

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

  test("skill detail live payload keeps a single backend-aligned file preview on mobile viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockSkillDetail(page);

    await page.goto("/skills/901?skill_detail_mode=live");
    await expect(page.locator(".skill-detail-title").first()).toHaveText("browser-automation-pro");
    await expect(page.getByRole("button", { name: "Categories", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Execution", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "History", exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/skills\/901\?skill_detail_mode=live$/);
    await expect(page.getByTestId("skill-detail-directory-row-SKILL.md")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("SKILL.md");
  });

  test("categories and rankings pages remain functional on mobile viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockMarketplacePayload(page);

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

test.describe("Public skill detail topbar responsive layout", () => {
  test.use({
    viewport: {
      width: 1280,
      height: 844
    }
  });

  test("skill detail topbar keeps compact navigation width on narrow desktop viewport", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAnonymousAuth(page);
    await mockSkillDetail(page);

    await page.goto("/skills/901?skill_detail_mode=live");
    await expect(page.locator(".skill-detail-title").first()).toHaveText("browser-automation-pro");
    await expect(page.getByTestId("skill-detail-page")).toHaveClass(/marketplace-home/);

    const nav = page.locator(".marketplace-topbar-light-nav");
    const navButtons = nav.locator(".marketplace-topbar-nav-button");
    await expect(nav).toBeVisible();
    await expect(navButtons).toHaveCount(2);

    const measurement = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>(".marketplace-topbar-light-nav");
      const topbar = document.querySelector<HTMLElement>(".marketplace-topbar");
      const shell = document.querySelector<HTMLElement>(".marketplace-topbar-shell");
      const buttons = Array.from(document.querySelectorAll<HTMLElement>(".marketplace-topbar-light-nav .marketplace-topbar-nav-button"));
      const navRect = nav?.getBoundingClientRect();
      const firstRect = buttons[0]?.getBoundingClientRect();
      const lastRect = buttons[buttons.length - 1]?.getBoundingClientRect();
      const topbarStyle = topbar ? window.getComputedStyle(topbar) : null;
      const shellStyle = shell ? window.getComputedStyle(shell) : null;
      return {
        navWidth: navRect?.width || 0,
        buttonsSpan: firstRect && lastRect ? lastRect.right - firstRect.left : 0,
        topbarDirection: topbarStyle?.flexDirection || "",
        shellBorderBottomWidth: shellStyle?.borderBottomWidth || ""
      };
    });

    expect(measurement.buttonsSpan).toBeGreaterThan(0);
    expect(measurement.navWidth).toBeLessThanOrEqual(measurement.buttonsSpan + 40);
    expect(measurement.topbarDirection).toBe("row");
    expect(measurement.shellBorderBottomWidth).toBe("1px");
  });
});
