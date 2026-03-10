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

async function readButtonStyles(page: Page, selector: string): Promise<{ color: string; backgroundColor: string; borderColor: string }> {
  return page.locator(selector).evaluate((element) => {
    const styles = window.getComputedStyle(element as HTMLElement);
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor
    };
  });
}

test.describe("Public skill detail Lobehub-style layout", () => {
  test("renders resource tabs and sidebar install/file tree controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, { user: null });
    });

    await page.route("**/api/v1/public/marketplace**", async (route) => {
      await fulfillJSON(route, 200, {
        filters: {
          q: "",
          tags: "",
          category: "research",
          subcategory: "machine-learning",
          sort: "recent",
          mode: ""
        },
        stats: {
          total_skills: 3,
          matching_skills: 3
        },
        pagination: {
          page: 1,
          page_size: 20,
          total_items: 3,
          total_pages: 1,
          prev_page: 0,
          next_page: 0
        },
        categories: [],
        top_tags: [],
        items: [
          {
            id: 12,
            name: "ml-evals-pipeline",
            description: "Evaluate prompt pipelines with repeatable reports.",
            content: "# ML Evals Pipeline",
            category: "research",
            subcategory: "machine-learning",
            tags: ["research", "ml", "pipeline"],
            source_type: "repository",
            source_url: "https://github.com/example/ml-evals-pipeline",
            star_count: 203,
            quality_score: 9.1,
            install_command: "codex skill install github:example/ml-evals-pipeline",
            updated_at: "2026-03-01T09:00:00Z"
          },
          {
            id: 13,
            name: "experiment-sync-agent",
            description: "Sync experiment metadata into your workspace.",
            content: "# Experiment Sync Agent",
            category: "research",
            subcategory: "machine-learning",
            tags: ["research", "ml", "tracking"],
            source_type: "repository",
            source_url: "https://github.com/example/experiment-sync-agent",
            star_count: 178,
            quality_score: 8.8,
            install_command: "codex skill install github:example/experiment-sync-agent",
            updated_at: "2026-02-24T09:00:00Z"
          },
          {
            id: 11,
            name: "paper-to-production",
            description: "Convert ML research papers into reproducible pipelines.",
            content: "# Paper to Production",
            category: "research",
            subcategory: "machine-learning",
            tags: ["research", "ml", "pipeline"],
            source_type: "repository",
            source_url: "https://github.com/example/paper-to-production",
            star_count: 588,
            quality_score: 9,
            install_command: "codex skill install github:example/paper-to-production",
            updated_at: "2026-02-20T10:36:36.909004+08:00"
          }
        ],
        session_user: null,
        can_access_dashboard: false
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 11,
          name: "Paper to Production",
          description: "Convert ML research papers into reproducible pipelines.",
          content: "# Paper to Production\n\nBridge academic insights into production-ready experiments.",
          category: "research",
          subcategory: "machine-learning",
          tags: ["research", "ml", "pipeline"],
          source_type: "repository",
          source_url: "https://github.com/example/paper-to-production",
          star_count: 588,
          quality_score: 9,
          install_command: "codex skill install github:example/paper-to-production",
          updated_at: "2026-02-20T10:36:36.909004+08:00"
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

    await page.goto("/skills/11?skill_detail_mode=live");

    await expect(page.getByRole("tab", { name: "Overview", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Installation Method", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "SKILL.md", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Resources", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Related Skills", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Version History", exact: true })).toBeVisible();

    const installationTab = page.getByTestId("skill-detail-resource-tab-installation");
    await page.mouse.move(0, 0);
    const installationDefaultStyles = await readButtonStyles(page, '[data-testid="skill-detail-resource-tab-installation"]');
    await installationTab.hover();
    const installationHoverStyles = await readButtonStyles(page, '[data-testid="skill-detail-resource-tab-installation"]');
    expect(installationHoverStyles.backgroundColor).not.toBe(installationDefaultStyles.backgroundColor);
    expect(installationHoverStyles.borderColor).not.toBe(installationDefaultStyles.borderColor);

    const breadcrumb = page.locator(".skill-detail-breadcrumb");
    const title = page.locator(".skill-detail-title");
    const titleGroup = page.locator(".skill-detail-title-group");
    const topSummary = page.locator(".skill-detail-top-summary");
    const breadcrumbBox = await breadcrumb.boundingBox();
    const titleBox = await title.boundingBox();
    const titleGroupBox = await titleGroup.boundingBox();
    const topSummaryBox = await topSummary.boundingBox();
    expect(breadcrumbBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(titleGroupBox).not.toBeNull();
    expect(topSummaryBox).not.toBeNull();
    expect((titleBox?.y || 0)).toBeGreaterThan((breadcrumbBox?.y || 0) + (breadcrumbBox?.height || 0) - 1);
    expect((topSummaryBox?.x || 0)).toBeGreaterThan((titleGroupBox?.x || 0) + 80);
    expect(Math.abs((topSummaryBox?.y || 0) - (titleGroupBox?.y || 0))).toBeLessThan(28);

    await expect(page.getByRole("button", { name: "View Details", exact: true })).toBeVisible();
    await expect(page.locator(".skill-detail-top-summary")).toContainText("Install Command");
    await expect(page.locator(".skill-detail-top-summary")).toContainText("Quality Score");
    await expect(page.locator(".skill-detail-top-summary")).toContainText("9.0");
    await expect(page.getByRole("button", { name: "I'm an Agent", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "I'm a Human", exact: true })).toBeVisible();
    await expect(page.getByText("Send this prompt to your agent to install the skill", { exact: true })).toBeVisible();
    await expect(page.getByText("Agent prompt", { exact: true })).toBeVisible();
    await expect(page.getByText("File Tree", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Details", exact: true })).toBeVisible();
    await expect(page.getByTestId("skill-detail-directory-row-SKILL.md")).toBeVisible();

    await page.getByRole("button", { name: "View Details", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Installation Method", exact: true, selected: true })).toBeVisible();
    await expect(page.locator(".skill-detail-installation-panel")).toContainText("codex skill install github:example/paper-to-production");

    await page.getByRole("button", { name: "Details", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Resources", exact: true, selected: true })).toBeVisible();
    await expect(page.locator(".skill-detail-resources-panel")).toContainText("github.com/example/paper-to-production");

    await page.getByRole("tab", { name: "Overview", exact: true }).click();
    await expect(page.locator(".skill-detail-overview-panel")).toContainText("Quality and Maintenance Health");
    await expect(page.locator(".skill-detail-overview-panel")).toContainText("Quality Score");

    await page.getByRole("tab", { name: "Version History", exact: true }).click();
    await expect(page.locator(".skill-detail-history-panel")).toContainText("Version history is not provided");

    await page.getByRole("tab", { name: "Related Skills", exact: true }).click();
    await expect(page.locator(".skill-detail-related-panel")).toContainText("ml-evals-pipeline");

    await page.getByRole("tab", { name: "SKILL.md", exact: true }).click();
    await expect(page.locator(".skill-detail-doc-file-name")).toContainText("SKILL.md");
    await expect(page.locator(".skill-detail-doc-reader-intro")).toContainText("Convert ML research papers into reproducible pipelines.");
    await expect(page.locator(".skill-detail-doc-meta-list")).toContainText("Repository");
    await expect(page.locator(".skill-detail-code-content")).toContainText("Paper to Production");
  });
});


test.describe("Public skill detail locale and theme adaptation", () => {
  test("renders translated tabs and sidebar controls on light zh route", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("skillsindex.locale", "zh");
    });

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, { user: null });
    });

    await page.route("**/api/v1/public/marketplace**", async (route) => {
      await fulfillJSON(route, 200, {
        filters: {
          q: "",
          tags: "",
          category: "research",
          subcategory: "machine-learning",
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
            name: "ml-evals-pipeline",
            description: "Evaluate prompt pipelines with repeatable reports.",
            content: "# ML Evals Pipeline",
            category: "research",
            subcategory: "machine-learning",
            tags: ["research", "ml", "pipeline"],
            source_type: "repository",
            source_url: "https://github.com/example/ml-evals-pipeline",
            star_count: 203,
            quality_score: 9.1,
            install_command: "codex skill install github:example/ml-evals-pipeline",
            updated_at: "2026-03-01T09:00:00Z"
          },
          {
            id: 11,
            name: "paper-to-production",
            description: "Convert ML research papers into reproducible pipelines.",
            content: "# Paper to Production",
            category: "research",
            subcategory: "machine-learning",
            tags: ["research", "ml", "pipeline"],
            source_type: "repository",
            source_url: "https://github.com/example/paper-to-production",
            star_count: 588,
            quality_score: 9,
            install_command: "codex skill install github:example/paper-to-production",
            updated_at: "2026-02-20T10:36:36.909004+08:00"
          }
        ],
        session_user: null,
        can_access_dashboard: false
      });
    });

    await page.route("**/api/v1/public/skills/**", async (route) => {
      await fulfillJSON(route, 200, {
        skill: {
          id: 11,
          name: "Paper to Production",
          description: "Convert ML research papers into reproducible pipelines.",
          content: "# Paper to Production\n\nBridge academic insights into production-ready experiments.",
          category: "research",
          subcategory: "machine-learning",
          tags: ["research", "ml", "pipeline"],
          source_type: "repository",
          source_url: "https://github.com/example/paper-to-production",
          star_count: 588,
          quality_score: 9,
          install_command: "codex skill install github:example/paper-to-production",
          updated_at: "2026-02-20T10:36:36.909004+08:00"
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

    await page.goto("/light/skills/11?skill_detail_mode=live");

    await expect(page.getByTestId("skill-detail-page")).toHaveClass(/is-light/);
    await expect(page.getByTestId("skill-detail-page")).toHaveClass(/is-locale-zh/);
    await expect(page.getByRole("tab", { name: "概览", exact: true })).toBeVisible();
    const installationTab = page.getByTestId("skill-detail-resource-tab-installation");
    await page.mouse.move(0, 0);
    const lightDefaultStyles = await readButtonStyles(page, '[data-testid="skill-detail-resource-tab-installation"]');
    await installationTab.hover();
    const lightHoverStyles = await readButtonStyles(page, '[data-testid="skill-detail-resource-tab-installation"]');
    const lightActiveStyles = await readButtonStyles(page, '[data-testid="skill-detail-resource-tab-overview"]');
    expect(lightHoverStyles.color).not.toBe(lightDefaultStyles.color);
    expect(lightHoverStyles.backgroundColor).not.toBe(lightDefaultStyles.backgroundColor);
    expect(lightActiveStyles.color).not.toBe(lightActiveStyles.backgroundColor);
    await expect(page.locator(".skill-detail-top-summary")).toContainText("质量分");
    await expect(page.locator(".skill-detail-top-summary")).toContainText("9.0");
    await expect(page.getByRole("tab", { name: "安装方式", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "资源", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "相关技能", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "版本历史", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "查看详情", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "详情", exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "SKILL.md", exact: true }).click();
    await expect(page.locator(".skill-detail-doc-reader-intro")).toContainText("Convert ML research papers into reproducible pipelines.");
    await expect(page.locator(".skill-detail-doc-meta-list")).toContainText("仓库");

    await page.getByRole("button", { name: "我是 Agent", exact: true }).click();
    await expect(page.getByText("将此提示发送给你的 Agent 以安装该技能", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "我是 Human", exact: true }).click();
    await expect(page.locator(".skill-detail-human-panel")).toContainText("codex skill install github:example/paper-to-production");
  });
});
