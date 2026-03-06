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

test.describe("Public skill detail interaction flow", () => {
  test("supports favorite, rating, comment create and delete", async ({ page }) => {
    await forceEnglishLocale(page);

    const state = {
      favorited: false,
      ratingCount: 0,
      ratingAverage: 0,
      rating: 0,
      comments: [] as Array<{
        id: number;
        skill_id: number;
        user_id: number;
        username: string;
        display_name: string;
        content: string;
        created_at: string;
        can_delete: boolean;
      }>
    };

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, {
        user: {
          id: 11,
          username: "member.user",
          display_name: "Member User",
          role: "member",
          status: "active"
        }
      });
    });

    await page.route("**/api/v1/auth/csrf", async (route) => {
      await fulfillJSON(route, 200, { csrf_token: "token-demo" });
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
          favorite_count: state.favorited ? 1 : 0,
          rating_count: state.ratingCount,
          rating_average: state.ratingAverage,
          comment_count: state.comments.length
        },
        viewer_state: {
          can_interact: true,
          favorited: state.favorited,
          rated: state.rating > 0,
          rating: state.rating
        },
        comments: state.comments,
        comments_limit: 80
      });
    });

    await page.route("**/api/v1/skills/902/favorite", async (route) => {
      const requestPayload = route.request().postDataJSON() as { favorite?: boolean };
      state.favorited = Boolean(requestPayload.favorite);
      await fulfillJSON(route, 200, {
        ok: true,
        favorited: state.favorited,
        stats: {
          favorite_count: state.favorited ? 1 : 0,
          rating_count: state.ratingCount,
          rating_average: state.ratingAverage,
          comment_count: state.comments.length
        }
      });
    });

    await page.route("**/api/v1/skills/902/rating", async (route) => {
      const requestPayload = route.request().postDataJSON() as { score: number };
      state.rating = Number(requestPayload.score || 0);
      state.ratingCount = state.rating > 0 ? 1 : 0;
      state.ratingAverage = state.rating > 0 ? state.rating : 0;
      await fulfillJSON(route, 200, {
        ok: true,
        score: state.rating,
        stats: {
          favorite_count: state.favorited ? 1 : 0,
          rating_count: state.ratingCount,
          rating_average: state.ratingAverage,
          comment_count: state.comments.length
        }
      });
    });

    await page.route("**/api/v1/skills/902/comments/*/delete", async (route) => {
      const matched = route.request().url().match(/comments\/(\d+)\/delete/);
      const commentID = Number(matched?.[1] || 0);
      state.comments = state.comments.filter((item) => item.id !== commentID);
      await fulfillJSON(route, 200, { ok: true, comment_id: commentID });
    });

    await page.route("**/api/v1/skills/902/comments", async (route) => {
      const requestPayload = route.request().postDataJSON() as { content?: string };
      const createdID = 1000 + state.comments.length;
      const content = String(requestPayload.content || "").trim();
      const created = {
        id: createdID,
        skill_id: 902,
        user_id: 11,
        username: "member.user",
        display_name: "Member User",
        content,
        created_at: "2026-03-04T09:00:00Z",
        can_delete: true
      };
      state.comments = [created, ...state.comments];
      await fulfillJSON(route, 201, {
        ok: true,
        comment: {
          id: created.id,
          skill_id: created.skill_id,
          user_id: created.user_id,
          content: created.content,
          created_at: created.created_at
        }
      });
    });

    await page.goto("/skills/902?skill_detail_mode=live");
    await expect(page.locator(".skill-detail-top .skill-detail-title")).toHaveText("browser-automation-pro");

    await page.getByRole("button", { name: "Add Favorite", exact: true }).click();
    await expect(page.getByRole("button", { name: "Remove Favorite", exact: true })).toBeVisible();
    await expect(page.locator(".skill-detail-interaction-summary")).toContainText("Favorites 1");

    await page.getByRole("button", { name: "4", exact: true }).click();
    await page.getByRole("button", { name: "Submit Rating", exact: true }).click();
    await expect(page.locator(".skill-detail-interaction-summary")).toContainText("Rating 4.0 (1)");
    await expect(page.locator(".skill-detail-feedback")).toContainText("Rating Submitted");

    await page.locator(".skill-detail-comment-input").fill("Works well for smoke tests.");
    await page.getByRole("button", { name: "Post Comment", exact: true }).click();
    await expect(page.locator(".skill-detail-comment-content")).toContainText("Works well for smoke tests.");
    await expect(page.locator(".skill-detail-feedback")).toContainText("Comment Posted");

    await page.getByRole("button", { name: "Delete", exact: true }).first().click();
    await expect(page.locator(".skill-detail-comments-empty")).toHaveText("No comments yet.");
    const feedbackBanner = page.locator(".skill-detail-feedback");
    if ((await feedbackBanner.count()) > 0) {
      await expect(feedbackBanner).toContainText("Comment Deleted");
    }
  });

  test("renders unified sql detail sections for sql skill payload", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, {
        user: null
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 974,
          name: "sql-performance-lab",
          description: "Optimize SQL plans for reporting workloads",
          content: "SELECT customer_id, SUM(total_amount) AS total_spend FROM orders GROUP BY customer_id;",
          category: "Data Platform",
          subcategory: "SQL Optimization",
          tags: ["sql", "postgresql", "query-plan"],
          source_type: "official",
          source_url: "https://github.com/skillsindex/sql-performance-lab",
          star_count: 932,
          quality_score: 96.4,
          install_command: "npx skillsindex install sql-performance-lab",
          updated_at: "2026-02-20T14:32:00Z"
        },
        stats: {
          favorite_count: 2,
          rating_count: 1,
          rating_average: 4,
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

    await page.goto("/skills/974?skill_detail_mode=live");
    await expect(page.getByRole("heading", { name: "sql-performance-lab", exact: true })).toBeVisible();
    await expect(page.locator(".skill-detail-card.is-summary")).toBeVisible();
    await expect(page.locator(".skill-detail-card.is-quality")).toBeVisible();
    await expect(page.locator(".skill-detail-card.is-metadata")).toBeVisible();
    await expect(page.locator(".skill-detail-code-panel")).toHaveClass(/is-sql/);
    await expect(page.locator(".skill-detail-meta-strip")).toContainText("language sql");

    await page.locator(".skill-detail-top-file-switch .skill-detail-top-file-button", { hasText: "README.md" }).first().click();
    await expect(page.locator(".skill-detail-top-file-switch .skill-detail-top-file-button.is-active")).toContainText("README.md");
    await expect(page.locator(".skill-detail-code-content")).toContainText("Overview");
    await expect(page.locator(".skill-detail-code-head .skill-detail-file-state-hint")).toContainText("/sql-performance-lab/README.md");
    await expect(page.locator(".skill-detail-code-head .skill-detail-file-state-meta")).toContainText("Markdown");
  });

  test("breadcrumb marketplace item navigates back to home route", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, {
        user: null
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 974,
          name: "sql-performance-lab",
          description: "Optimize SQL plans for reporting workloads",
          content: "SELECT customer_id, SUM(total_amount) AS total_spend FROM orders GROUP BY customer_id;",
          category: "Data Platform",
          subcategory: "SQL Optimization",
          tags: ["sql", "postgresql", "query-plan"],
          source_type: "official",
          source_url: "https://github.com/skillsindex/sql-performance-lab",
          star_count: 932,
          quality_score: 96.4,
          install_command: "npx skillsindex install sql-performance-lab",
          updated_at: "2026-02-20T14:32:00Z"
        },
        stats: {
          favorite_count: 2,
          rating_count: 1,
          rating_average: 4,
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

    await page.goto("/skills/974?skill_detail_mode=live");
    await expect(page.getByTestId("skill-detail-breadcrumb-marketplace")).toBeVisible();
    await page.getByTestId("skill-detail-breadcrumb-marketplace").click();
    await expect(page).toHaveURL("/");
  });

  test("shows not-found state when live detail endpoint returns 404", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, {
        user: null
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 404, {
        error: "skill_not_found",
        message: "Skill detail not found"
      });
    });

    await page.goto("/skills/999999?skill_detail_mode=live");

    await expect(page.locator(".skill-detail-empty")).toHaveText("Skill detail not found");
    await expect(page.locator(".skill-detail-main")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "browser-automation-pro", exact: true })).toHaveCount(0);
  });

  test("routes unauthenticated feedback action to login page", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, {
        user: null
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 974,
          name: "sql-performance-lab",
          description: "Optimize SQL plans for reporting workloads",
          content: "SELECT customer_id, SUM(total_amount) AS total_spend FROM orders GROUP BY customer_id;",
          category: "Data Platform",
          subcategory: "SQL Optimization",
          tags: ["sql", "postgresql", "query-plan"],
          source_type: "official",
          source_url: "https://github.com/skillsindex/sql-performance-lab",
          star_count: 932,
          quality_score: 96.4,
          install_command: "npx skillsindex install sql-performance-lab",
          updated_at: "2026-02-20T14:32:00Z"
        },
        stats: {
          favorite_count: 2,
          rating_count: 1,
          rating_average: 4,
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

    await page.goto("/skills/974?skill_detail_mode=live");
    await page.getByRole("button", { name: "Submit Feedback", exact: true }).click();
    await expect(page).toHaveURL("/login");
  });
});
