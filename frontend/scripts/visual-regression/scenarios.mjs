import path from "node:path";
import process from "node:process";

export const defaultVisualScenarioKey = "home";

export const visualScenarios = {
  home: {
    routePath: "/",
    waitSelector: ".marketplace-home",
    baselineRelativePath: "prototype-baselines/marketplace_home.png",
    outputPrefix: "home",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });

      await page.route("**/api/v1/public/marketplace**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            filters: {
              q: "",
              tags: "",
              category: "",
              subcategory: "",
              sort: "recent",
              mode: "keyword"
            },
            stats: {
              total_skills: 0,
              matching_skills: 0
            },
            pagination: {
              page: 1,
              page_size: 24,
              total_items: 0,
              total_pages: 1,
              prev_page: 0,
              next_page: 0
            },
            categories: [],
            top_tags: [],
            items: [],
            session_user: null,
            can_access_dashboard: false
          })
        });
      });
    }
  },
  login: {
    routePath: "/login",
    waitSelector: ".auth-shell.auth-shell-prototype",
    baselineRelativePath: "public/prototypes/previews/login_page_prototype.png",
    outputPrefix: "login",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });
    }
  },
  "skill-detail": {
    routePath: "/skills/1049",
    waitSelector: "[data-testid='skill-detail-page']",
    baselineRelativePath: "public/prototypes/previews/skill_detail.png",
    outputPrefix: "skill-detail",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });
    }
  },
  "skill-detail-light": {
    routePath: "/light/skills/1049",
    waitSelector: "[data-testid='skill-detail-page']",
    baselineRelativePath: "public/prototypes/previews/skill_detail_light.png",
    outputPrefix: "skill-detail-light",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });
    }
  },
  "admin-overview": {
    routePath: "/admin/overview",
    waitSelector: "[data-testid='admin-overview-stage']",
    baselineRelativePath: "prototype-baselines/admin_dashboard.png",
    outputPrefix: "admin-overview",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: 101,
              username: "admin.user",
              display_name: "Admin User",
              role: "admin",
              status: "active"
            }
          })
        });
      });

      await page.route("**/api/v1/admin/overview", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: 101,
              username: "admin.user",
              role: "admin"
            },
            counts: {
              total: 24,
              public: 9,
              private: 15,
              syncable: 12,
              org_count: 5,
              account_count: 48
            },
            capabilities: {
              can_manage_users: true,
              can_view_all: true
            }
          })
        });
      });
    }
  },
  "workspace-activity": {
    routePath: "/workspace/activity",
    waitSelector: "#workspace-activity",
    baselineRelativePath: "prototype-baselines/workspace_activity.png",
    outputPrefix: "workspace-activity",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: 102,
              username: "workspace.user",
              display_name: "Workspace User",
              role: "operator",
              status: "active"
            }
          })
        });
      });
    }
  }
};

export function listVisualScenarioKeys() {
  return Object.keys(visualScenarios);
}

export function normalizeVisualScenarioKey(rawScenarioKey = process.env.VISUAL_SCENARIO ?? defaultVisualScenarioKey) {
  return String(rawScenarioKey).trim().toLowerCase();
}

export function resolveVisualScenario(rawScenarioKey = process.env.VISUAL_SCENARIO ?? defaultVisualScenarioKey) {
  const scenarioKey = normalizeVisualScenarioKey(rawScenarioKey);
  const scenario = visualScenarios[scenarioKey];
  if (!scenario) {
    throw new Error(`Unknown VISUAL_SCENARIO: ${scenarioKey}. Supported: ${listVisualScenarioKeys().join(", ")}`);
  }
  return { scenarioKey, scenario };
}

export function resolveVisualBaselinePath(frontendRoot, scenario, overrideRelativePath = process.env.VISUAL_BASELINE_PATH) {
  const targetRelativePath = overrideRelativePath || scenario.baselineRelativePath;
  return path.resolve(frontendRoot, targetRelativePath);
}

export async function stabilizeVisualCapture(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Ignore font readiness failures and continue with best effort stabilization.
      }
    }
  });

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `
  });

  await page.waitForTimeout(200);
}
