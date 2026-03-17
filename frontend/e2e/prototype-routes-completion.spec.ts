import { expect, test, type Locator, type Page, type Route } from "@playwright/test";
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
const SKILL_INVENTORY_FIXTURE = {
  items: [
    {
      id: 88,
      name: "Repo Skill",
      description: "Imported from repository",
      source_type: "repository",
      visibility: "private",
      owner_username: "admin.user",
      updated_at: "2025-02-01T10:00:00Z"
    }
  ]
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
async function expectSidebarButtonHeightAtMost(locator: Locator, maxHeight: number): Promise<void> {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    return;
  }
  expect(bounds.height).toBeLessThanOrEqual(maxHeight);
}
async function expectSidebarHeightRatioAtMost(page: Page, locator: Locator, maxRatio: number): Promise<void> {
  const [bounds, viewport] = await Promise.all([locator.boundingBox(), page.viewportSize()]);
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!bounds || !viewport) {
    return;
  }
  expect(bounds.height).toBeLessThanOrEqual(viewport.height * maxRatio);
}
async function expectTopOffsetAtMost(reference: Locator, target: Locator, maxOffset: number): Promise<void> {
  const [referenceBounds, targetBounds] = await Promise.all([reference.boundingBox(), target.boundingBox()]);
  expect(referenceBounds).not.toBeNull();
  expect(targetBounds).not.toBeNull();
  if (!referenceBounds || !targetBounds) {
    return;
  }
  const delta = Math.abs(targetBounds.y - referenceBounds.y);
  expect(delta).toBeLessThanOrEqual(maxOffset);
}
interface PanelThemeVisual {
  mode: string | null;
  panelToken: string;
  backgroundColor: string;
  foundPanel: boolean;
}
async function readPanelThemeVisual(page: Page, panelSelector: string): Promise<PanelThemeVisual> {
  return page.evaluate((selector) => {
    const panel = document.querySelector(selector);
    const panelStyle = panel ? window.getComputedStyle(panel) : null;
    const rawBackgroundColor = panelStyle?.backgroundColor || "";
    const normalizedBackgroundColor = (() => {
      if (!rawBackgroundColor) {
        return "";
      }
      const probe = document.createElement("span");
      probe.style.color = rawBackgroundColor;
      document.body.appendChild(probe);
      const normalized = window.getComputedStyle(probe).color || rawBackgroundColor;
      probe.remove();
      return normalized;
    })();
    return {
      mode: document.documentElement.getAttribute("data-theme-mode"),
      panelToken: window.getComputedStyle(document.documentElement).getPropertyValue("--si-color-panel").trim(),
      backgroundColor: normalizedBackgroundColor,
      foundPanel: Boolean(panel)
    };
  }, panelSelector);
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
  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, SKILL_INVENTORY_FIXTURE);
  });
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
  await page.route("**/api/v1/auth/csrf", async (route) => {
    await fulfillJSON(route, 200, { csrf_token: "test-csrf-token" });
  });
  await page.route("**/api/v1/admin/accounts", async (route) => {
    await fulfillJSON(route, 200, ACCOUNT_FIXTURE);
  });
  await page.route("**/api/v1/admin/accounts/*/status", async (route) => {
    await fulfillJSON(route, 200, { ok: true });
  });
  await page.route("**/api/v1/admin/users/*/role", async (route) => {
    await fulfillJSON(route, 200, { ok: true });
  });
  await page.route("**/api/v1/admin/settings/registration", async (route) => {
    await fulfillJSON(route, 200, REGISTRATION_FIXTURE);
  });
  await page.route("**/api/v1/admin/settings/auth-providers", async (route) => {
    await fulfillJSON(route, 200, AUTH_PROVIDERS_FIXTURE);
  });
}
async function mockAccessGovernancePage(page: Page): Promise<void> {
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
test.describe("backend and prototype route completion coverage", () => {
  test("public route /rollout falls back to workspace dashboard", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, false);
    await mockMarketplace(page);

    await page.goto("/rollout");
    await expect(page.getByRole("heading", { name: "Team Workspace", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Queue Insights", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Risk Watchlist", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Team Activity Feed", exact: true })).toHaveCount(0);
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("protected light workspace route renders inside the backend shell", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);

    await page.goto("/light/workspace");
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
    await expect(page.locator(".backend-primary-nav").getByRole("button", { name: "Workspace" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".backend-secondary-item.active strong")).toHaveText("Overview");
    await expect(page.getByRole("heading", { name: "Queue Insights", exact: true })).toBeVisible();
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
  test("repository ingestion route renders repository sync data instead of a prototype placeholder", async ({ page }) => {
    await forceEnglishLocale(page); await mockAuth(page, true); await mockRecordsSync(page); await page.goto("/admin/ingestion/repository");
    await expect(page.getByRole("heading", { name: "Repository Ingestion", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Latest Sync Runs", exact: true })).toBeVisible();
    await expect(page.getByText("Repo Skill", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Repository Sync", exact: true })).toBeVisible();
    await expect(page.getByText("Failed to fetch", { exact: true })).toHaveCount(0);
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

  test("users routes keep backend users sidebar navigation for account, access, and role subpages", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockAccountRoleWorkbench(page);
    await mockAccessGovernancePage(page);
    const sidebar = page.locator(".backend-secondary-nav");
    const primaryNavigation = page.locator(".backend-primary-nav");
    const mainPanel = page.locator(".backend-main-panel");

    await page.goto("/admin/accounts/new");
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account Configuration Form", exact: true }).first()).toBeVisible();
    await expect(primaryNavigation.locator(".backend-primary-nav-item")).toHaveText([
      "Workspace",
      "Overview",
      "Catalog",
      "Operations",
      "Users"
    ]);
    await expect(page.getByTestId("backend-primary-overflow-trigger")).toContainText("More (2)");
    await expect(primaryNavigation.locator(".backend-primary-nav-item.active")).toHaveText("Users");
    await expect(sidebar.locator(".backend-secondary-item strong")).toHaveText([
      "Account Management",
      "Role Management",
      "Access",
      "Organizations"
    ]);
    const accountManagementButton = sidebar.getByRole("menuitem", { name: /Account Management/i });
    const accessButton = sidebar.getByRole("menuitem", { name: /Access/i });
    const roleManagementButton = sidebar.getByRole("menuitem", { name: /Role Management/i });

    await expect(sidebar.locator(".backend-secondary-item.active strong")).toHaveCount(0);
    await expect(accessButton).toBeVisible();
    await expect(roleManagementButton).toBeVisible();
    await expectSidebarButtonHeightAtMost(accountManagementButton, 80);
    await expectSidebarButtonHeightAtMost(accessButton, 80);
    await expectSidebarButtonHeightAtMost(roleManagementButton, 80);
    await expect(sidebar.getByRole("menuitem", { name: "Overview", exact: true })).toHaveCount(0);
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
    await expectSidebarHeightRatioAtMost(page, sidebar, 0.9);
    await expectTopOffsetAtMost(sidebar, mainPanel, 10);
    const darkAccountPanelVisual = await readPanelThemeVisual(page, ".account-workbench .panel");
    expect(darkAccountPanelVisual.foundPanel).toBe(true);
    expect(darkAccountPanelVisual.mode).toBe("dark");
    expect(darkAccountPanelVisual.panelToken).toBe("#111111");
    expect(darkAccountPanelVisual.backgroundColor).not.toBe("rgb(255, 255, 255)");

    await page.goto("/light/admin/accounts");
    await expect(page).toHaveURL(/\/light\/admin\/accounts$/);
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();
    const lightAccountPanelVisual = await readPanelThemeVisual(page, ".account-workbench .panel");
    expect(lightAccountPanelVisual.foundPanel).toBe(true);
    expect(lightAccountPanelVisual.mode).toBe("light");
    expect(lightAccountPanelVisual.panelToken).toBe("#ffffff");
    expect(lightAccountPanelVisual.backgroundColor).not.toBe(darkAccountPanelVisual.backgroundColor);

    await page.goto("/admin/accounts/new");
    await expect(page.getByRole("heading", { name: "Account Configuration Form", exact: true }).first()).toBeVisible();
    await expectTopOffsetAtMost(sidebar, mainPanel, 10);

    await accessButton.click();
    await expect(page).toHaveURL(/\/admin\/access$/);
    await expect(page.getByRole("heading", { name: "Access Governance", exact: true })).toBeVisible();
    await expect(primaryNavigation.locator(".backend-primary-nav-item.active")).toHaveText("Users");
    await expect(sidebar.locator(".backend-secondary-item.active strong")).toHaveText("Access");
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
    const darkAccessPanelVisual = await readPanelThemeVisual(page, ".panel");
    expect(darkAccessPanelVisual.foundPanel).toBe(true);
    expect(darkAccessPanelVisual.mode).toBe("dark");
    expect(darkAccessPanelVisual.panelToken).toBe("#111111");
    expect(darkAccessPanelVisual.backgroundColor).not.toBe("rgb(255, 255, 255)");

    await page.goto("/light/admin/access");
    await expect(page).toHaveURL(/\/light\/admin\/access$/);
    await expect(page.getByRole("heading", { name: "Access Governance", exact: true })).toBeVisible();
    const lightAccessPanelVisual = await readPanelThemeVisual(page, ".panel");
    expect(lightAccessPanelVisual.foundPanel).toBe(true);
    expect(lightAccessPanelVisual.mode).toBe("light");
    expect(lightAccessPanelVisual.panelToken).toBe("#ffffff");
    expect(lightAccessPanelVisual.backgroundColor).not.toBe(darkAccessPanelVisual.backgroundColor);

    await page.goto("/admin/access");
    await expect(page.getByRole("heading", { name: "Access Governance", exact: true })).toBeVisible();

    await roleManagementButton.click();
    await expect(page).toHaveURL(/\/admin\/roles$/);
    await expect(page.getByRole("heading", { name: "Role Management List", exact: true }).first()).toBeVisible();
    await expect(primaryNavigation.locator(".backend-primary-nav-item.active")).toHaveText("Users");
    await expect(sidebar.locator(".backend-secondary-item.active strong")).toHaveText("Role Management");
    await expectSidebarHeightRatioAtMost(page, sidebar, 0.9);
    await expectTopOffsetAtMost(sidebar, mainPanel, 10);
    const darkRolePanelVisual = await readPanelThemeVisual(page, ".account-workbench .panel");
    expect(darkRolePanelVisual.foundPanel).toBe(true);
    expect(darkRolePanelVisual.mode).toBe("dark");
    expect(darkRolePanelVisual.panelToken).toBe("#111111");
    expect(darkRolePanelVisual.backgroundColor).not.toBe("rgb(255, 255, 255)");

    await page.goto("/light/admin/roles");
    await expect(page).toHaveURL(/\/light\/admin\/roles$/);
    await expect(page.getByRole("heading", { name: "Role Management List", exact: true }).first()).toBeVisible();
    const lightRolePanelVisual = await readPanelThemeVisual(page, ".account-workbench .panel");
    expect(lightRolePanelVisual.foundPanel).toBe(true);
    expect(lightRolePanelVisual.mode).toBe("light");
    expect(lightRolePanelVisual.panelToken).toBe("#ffffff");
    expect(lightRolePanelVisual.backgroundColor).not.toBe(darkRolePanelVisual.backgroundColor);

    await accountManagementButton.click();
    await expect(page).toHaveURL(/\/admin\/accounts$/);
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();
    await expect(primaryNavigation.locator(".backend-primary-nav-item.active")).toHaveText("Users");
    await expect(sidebar.locator(".backend-secondary-item.active strong")).toHaveText("Account Management");
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });

  test("permissions accounts alias route renders account list with modal form editor", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);
    await mockAccountRoleWorkbench(page);

    await page.goto("/admin/permissions/accounts");
    await expect(page).toHaveURL(/\/admin\/permissions\/accounts$/);
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account Snapshot", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Edit / }).first().click();

    const dialog = page.getByRole("dialog", { name: "Edit Account", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Username", { exact: true })).toBeVisible();
    await expect(dialog.locator("input[disabled]")).toHaveCount(1);
    await expect(dialog.getByRole("combobox", { name: "Role", exact: true })).toBeVisible();
    await expect(dialog.getByRole("combobox", { name: "Status", exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
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

test.describe("Workspace section route navigation", () => {
  test("workspace route renders inside the protected backend shell", async ({ page }) => {
    await forceEnglishLocale(page);
    await mockAuth(page, true);

    await page.goto("/workspace");
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.locator(".backend-primary-nav").getByRole("button", { name: "Workspace" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".backend-secondary-item strong")).toHaveText(["Overview", "Activity Feed", "Queue Execution", "Runbook Preview", "Policy Summary", "Quick Actions"]);
    await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
    await expect(page.getByText("Installed Skills", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue Insights", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Risk Watchlist", exact: true })).toBeVisible();
    await expect(page.getByText("Prototype Replica", { exact: true })).toHaveCount(0);
  });
});
