import { expect, test, type Page, type Route } from "@playwright/test";

const AUTH_USER_FIXTURE = {
  id: 101,
  username: "admin.user",
  display_name: "Admin User",
  role: "admin",
  status: "active"
} as const;

const MARKETPLACE_FIXTURE = {
  filters: {
    q: "",
    tags: "",
    category: "",
    subcategory: "",
    sort: "quality",
    mode: "prototype"
  },
  stats: {
    total_skills: 3,
    matching_skills: 3
  },
  pagination: {
    page: 1,
    page_size: 18,
    total_items: 3,
    total_pages: 1,
    prev_page: 0,
    next_page: 0
  },
  categories: [],
  top_tags: [
    { name: "ops", count: 2 },
    { name: "quality", count: 1 }
  ],
  items: [
    {
      id: 1,
      name: "Skill One",
      description: "First skill",
      content: "",
      category: "Core",
      subcategory: "Build",
      tags: ["ops"],
      source_type: "git",
      source_url: "https://example.com/one",
      star_count: 5,
      quality_score: 8.8,
      install_command: "install one",
      updated_at: "2025-02-01T10:00:00Z"
    },
    {
      id: 2,
      name: "Skill Two",
      description: "Second skill",
      content: "",
      category: "Core",
      subcategory: "Ship",
      tags: ["quality"],
      source_type: "git",
      source_url: "https://example.com/two",
      star_count: 3,
      quality_score: 7.2,
      install_command: "install two",
      updated_at: "2025-02-02T10:00:00Z"
    }
  ],
  session_user: null,
  can_access_dashboard: true
} as const;

const INTEGRATIONS_FIXTURE = {
  items: [
    {
      id: 10,
      name: "GitHub",
      provider: "github",
      description: "Repository sync",
      base_url: "https://api.github.com",
      enabled: true,
      updated_at: "2025-02-01T10:00:00Z"
    }
  ],
  total: 1,
  webhook_logs: [
    {
      id: 1,
      connector_id: 10,
      event_type: "sync.completed",
      outcome: "ok",
      status_code: 200,
      endpoint: "https://hooks.example.com",
      delivered_at: "2025-02-01T10:30:00Z"
    }
  ],
  webhook_total: 1
} as const;

const SSO_PROVIDERS_FIXTURE = {
  items: [
    {
      id: 301,
      provider_key: "corp_sso",
      display_name: "Corp SSO",
      enabled: true,
      callback_url: "https://example.com/sso/callback",
      updated_at: "2025-02-03T10:00:00Z"
    }
  ],
  total: 1
} as const;

const SYNC_RUNS_FIXTURE = {
  items: [
    {
      id: 9001,
      trigger: "manual",
      scope: "repository",
      status: "partial",
      candidates: 15,
      synced: 13,
      failed: 2,
      duration_ms: 22000,
      started_at: "2025-02-01T10:00:00Z",
      finished_at: "2025-02-01T10:00:22Z",
      error_summary: "2 failed items",
      owner_user: { username: "owner.user" },
      actor_user: { username: "admin.user" }
    }
  ]
} as const;

const SYNC_RUN_DETAIL_FIXTURE = {
  item: {
    id: 9001,
    status: "partial",
    duration_ms: 22000,
    started_at: "2025-02-01T10:00:00Z",
    finished_at: "2025-02-01T10:00:22Z"
  }
} as const;

const SYNC_POLICY_FIXTURE = {
  enabled: true,
  interval: "30m",
  timeout: "10m",
  batch_size: 20
} as const;

const ACCOUNT_FIXTURE = {
  items: [
    {
      id: 101,
      username: "admin.user",
      role: "admin",
      status: "active",
      created_at: "2025-01-02T10:00:00Z",
      updated_at: "2025-02-01T10:00:00Z"
    }
  ],
  total: 1
} as const;

const REGISTRATION_FIXTURE = {
  allow_registration: true
} as const;

const AUTH_PROVIDERS_FIXTURE = {
  auth_providers: ["password", "sso"]
} as const;

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockAuth(page: Page, authenticated: boolean): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: authenticated ? AUTH_USER_FIXTURE : null });
  });
}

async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("skillsindex.locale", "en");
  });
}

async function mockMarketplace(page: Page): Promise<void> {
  await page.route("**/api/v1/public/marketplace**", async (route) => {
    await fulfillJSON(route, 200, MARKETPLACE_FIXTURE);
  });
}

async function mockIntegrationWorkbench(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/integrations?limit=40", async (route) => {
    await fulfillJSON(route, 200, INTEGRATIONS_FIXTURE);
  });
  await page.route("**/api/v1/admin/sso/providers", async (route) => {
    await fulfillJSON(route, 200, SSO_PROVIDERS_FIXTURE);
  });
}

async function mockRecordsSync(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/sync-jobs?**", async (route) => {
    await fulfillJSON(route, 200, SYNC_RUNS_FIXTURE);
  });
  await page.route("**/api/v1/admin/sync-jobs/9001", async (route) => {
    await fulfillJSON(route, 200, SYNC_RUN_DETAIL_FIXTURE);
  });
  await page.route("**/api/v1/admin/sync-policy/repository", async (route) => {
    await fulfillJSON(route, 200, SYNC_POLICY_FIXTURE);
  });
}

async function mockOpsMetrics(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/ops/metrics", async (route) => {
    await fulfillJSON(route, 200, {
      item: {
        open_incidents: 2,
        pending_moderation_cases: 1,
        unresolved_jobs: 0,
        failed_sync_runs_24h: 0,
        disabled_accounts: 0,
        stale_integrations: 1
      }
    });
  });
}

async function mockIncidentWorkbench(page: Page): Promise<void> {
  await mockOpsMetrics(page);
  await page.route("**/api/v1/admin/ops/alerts", async (route) => {
    await fulfillJSON(route, 200, {
      items: [{ title: "High error ratio", severity: "warning", status: "open", updated_at: "2025-02-02T10:00:00Z" }],
      total: 1
    });
  });
  await page.route("**/api/v1/admin/ops/recovery-drills?limit=20", async (route) => {
    await fulfillJSON(route, 200, {
      items: [{ title: "Weekly drill", status: "passed", owner: "ops", updated_at: "2025-02-02T10:00:00Z" }],
      total: 1
    });
  });
  await page.route("**/api/v1/admin/ops/releases?limit=20", async (route) => {
    await fulfillJSON(route, 200, {
      items: [{ title: "Release 2025.02", status: "shipped", reviewer: "admin", released_at: "2025-02-02T10:00:00Z" }],
      total: 1
    });
  });
}

async function mockAccountRoleWorkbench(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/accounts", async (route) => {
    await fulfillJSON(route, 200, ACCOUNT_FIXTURE);
  });
  await page.route("**/api/v1/admin/settings/registration", async (route) => {
    await fulfillJSON(route, 200, REGISTRATION_FIXTURE);
  });
  await page.route("**/api/v1/admin/settings/auth-providers", async (route) => {
    await fulfillJSON(route, 200, AUTH_PROVIDERS_FIXTURE);
  });
}

test.describe("Prototype route completion coverage", () => {
  test("public routes /rollout and /light/workspace render concrete content", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, false);
    await mockMarketplace(page);

    await page.goto("/rollout");
    await expect(page.getByRole("heading", { name: /Install and Rollout Workflow/ })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);

    await page.goto("/light/workspace");
    await expect(page.getByRole("heading", { name: /Team Workspace/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Queue State and Execution", exact: true })).toBeVisible();
    await page.locator(".ant-segmented-item-label", { hasText: "Pending" }).first().click();
    await expect(page.locator("pre").filter({ hasText: "--status pending" })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("state route /states/error renders retry and back actions", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, false);

    await page.goto("/states/error");
    await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Marketplace", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("admin aliases /admin/records/exports and /admin/integrations/list render concrete pages", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockRecordsSync(page);
    await mockIntegrationWorkbench(page);

    await page.goto("/admin/records/exports");
    await expect(page.getByRole("heading", { name: /Records Governance and Remote Sync/ })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);

    await page.goto("/admin/integrations/list");
    await expect(page.getByRole("heading", { name: "Integration Connector List", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("incident aliases render incident operations page", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockIncidentWorkbench(page);

    await page.goto("/admin/incidents/list");
    await expect(page.getByRole("heading", { name: "Incident Management List", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("integration route modes /admin/integrations/new and /admin/integrations/webhooks/logs render concrete content", async ({
    page
  }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockIntegrationWorkbench(page);

    await page.goto("/admin/integrations/new");
    await expect(page.getByRole("heading", { name: "Integration Configuration Form", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);

    await page.goto("/admin/integrations/webhooks/logs");
    await expect(page.getByRole("heading", { name: "Webhook Delivery Logs", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("organization routes /admin/accounts/new and /admin/roles/new render concrete content", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockAccountRoleWorkbench(page);

    await page.goto("/admin/accounts/new");
    await expect(page.getByRole("heading", { name: "Account Configuration Form", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);

    await page.goto("/admin/roles/new");
    await expect(page.getByRole("heading", { name: "Role Configuration Form", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("incident route modes /admin/incidents/1/response and /admin/incidents/1/postmortem render concrete content", async ({
    page
  }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockIncidentWorkbench(page);

    await page.goto("/admin/incidents/1/response");
    await expect(page.getByRole("heading", { name: "Incident Response Console", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);

    await page.goto("/admin/incidents/1/postmortem");
    await expect(page.getByRole("heading", { name: "Incident Postmortem Detail", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });
});
