import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockExactListRoute(page: Page, path: string, body: unknown): Promise<void> {
  await page.route(`**${path}**`, async (route) => {
    if (new URL(route.request().url()).pathname !== path) {
      await route.fallback();
      return;
    }

    await fulfillJSON(route, 200, body);
  });
}

async function mockWorkspaceShell(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 1,
        username: "alice",
        display_name: "Alice",
        role: "admin",
        status: "active"
      }
    });
  });

  await page.route("**/api/v1/account/profile", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 1,
        username: "alice",
        display_name: "Alice",
        role: "admin",
        status: "active"
      },
      profile: {
        display_name: "Alice",
        avatar_url: "https://example.com/avatar.png",
        bio: "Operations owner"
      }
    });
  });

  await page.route("**/api/v1/account/sessions", async (route) => {
    await fulfillJSON(route, 200, {
      current_session_id: "session-current",
      session_issued_at: "2026-03-07T08:00:00Z",
      session_expires_at: "2026-03-08T08:00:00Z",
      total: 1,
      items: [
        {
          session_id: "session-current",
          user_agent: "Chrome",
          issued_ip: "127.0.0.1",
          last_seen: "2026-03-07T08:00:00Z",
          expires_at: "2026-03-08T08:00:00Z",
          is_current: true
        }
      ]
    });
  });
}

async function mockRepositoryIngestionData(page: Page): Promise<void> {
  const syncRuns = [
    {
      id: 9001,
      trigger: "manual",
      scope: "repository",
      status: "partial",
      candidates: 3,
      synced: 2,
      failed: 1,
      duration_ms: 1200,
      started_at: "2026-03-11T10:00:00Z",
      finished_at: "2026-03-11T10:00:01Z",
      error_summary: "one repository failed"
    }
  ];

  await page.route("**/api/v1/admin/sync-jobs?limit=20", async (route) => {
    await fulfillJSON(route, 200, {
      items: syncRuns
    });
  });

  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, {
      items: [
        {
          id: 88,
          name: "Repo Skill",
          description: "Repository managed skill",
          source_type: "repository",
          visibility: "private",
          owner_username: "alice",
          updated_at: "2026-03-11T10:00:00Z"
        }
      ]
    });
  });

  await page.route("**/api/v1/admin/jobs?limit=40", async (route) => {
    await fulfillJSON(route, 200, {
      items: []
    });
  });

  await page.route("**/api/v1/admin/sync-jobs/9001", async (route) => {
    await fulfillJSON(route, 200, {
      item: {
        ...syncRuns[0],
        items: [
          {
            id: 88,
            name: "Repo Skill",
            status: "synced",
            message: "Repository skill refreshed"
          }
        ]
      }
    });
  });

  await page.route("**/api/v1/admin/sync-policy/repository", async (route) => {
    if (route.request().method() === "POST") {
      await fulfillJSON(route, 200, { ok: true });
      return;
    }

    await fulfillJSON(route, 200, {
      item: {
        enabled: true,
        interval: "daily",
        timeout: "30m",
        batch_size: 50
      }
    });
  });
}

async function mockAccountsPageData(page: Page): Promise<void> {
  const ok = (body: unknown) => ({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body)
  });

  await page.route("**/api/v1/admin/accounts/summary", async (route) => {
    await route.fulfill(
      ok({
        item: {
          total: 12,
          active: 10,
          pending: 1,
          suspended: 1
        }
      })
    );
  });

  await page.route("**/api/v1/admin/accounts", async (route) => {
    await route.fulfill(ok({ items: [] }));
  });

  await page.route("**/api/v1/admin/settings/registration", async (route) => {
    await route.fulfill(
      ok({
        allow_registration: true,
        marketplace_public_access: true
      })
    );
  });

  await page.route("**/api/v1/admin/settings/auth-providers", async (route) => {
    await route.fulfill(
      ok({
        ok: true,
        auth_providers: ["github", "google"],
        available_auth_providers: ["github", "google", "wecom", "password"]
      })
    );
  });

  await mockExactListRoute(page, "/api/v1/admin/organizations", { items: [] });
  await mockExactListRoute(page, "/api/v1/admin/roles", { items: [] });
  await mockExactListRoute(page, "/api/v1/admin/access-policies", { items: [] });
  await page.route("**/api/v1/admin/organizations/*/members", async (route) => {
    await route.fulfill(ok({ items: [] }));
  });

  await page.route("**/api/v1/admin/access/summary**", async (route) => {
    await route.fulfill(
      ok({
        item: {
          accounts: 12,
          roles: 4,
          organizations: 3
        }
      })
    );
  });
}

async function measureBackendShell(page: Page, path: string) {
  await page.goto(path);

  const topbar = page.locator(".backend-topbar");
  const shellBody = page.locator(".backend-shell-body");
  const secondaryNav = page.locator(".backend-secondary-nav");
  const mainPanel = page.locator(".backend-main-panel");

  await expect(topbar).toBeVisible();
  await expect(shellBody).toBeVisible();
  await expect(secondaryNav).toBeVisible();
  await expect(mainPanel).toBeVisible();
  await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);

  const topbarBox = await topbar.boundingBox();
  const shellBodyBox = await shellBody.boundingBox();
  const secondaryNavBox = await secondaryNav.boundingBox();
  const mainPanelBox = await mainPanel.boundingBox();

  expect(topbarBox).not.toBeNull();
  expect(shellBodyBox).not.toBeNull();
  expect(secondaryNavBox).not.toBeNull();
  expect(mainPanelBox).not.toBeNull();

  return {
    topbarBox,
    shellBodyBox,
    secondaryNavBox,
    mainPanelBox
  };
}

const userManagementRoutes = [
  "/admin/accounts/new",
  "/admin/access",
  "/admin/roles",
  "/admin/roles/new",
  "/admin/organizations"
] as const;

test.describe("workspace sidebar layout", () => {
  test("keeps the repository sidebar aligned with the accounts page baseline", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const repository = await measureBackendShell(page, "/admin/ingestion/repository");
    const accounts = await measureBackendShell(page, "/admin/accounts");

    expect(Math.abs((repository.shellBodyBox?.x || 0) - (accounts.shellBodyBox?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.shellBodyBox?.width || 0) - (accounts.shellBodyBox?.width || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.secondaryNavBox?.x || 0) - (accounts.secondaryNavBox?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.mainPanelBox?.x || 0) - (accounts.mainPanelBox?.x || 0))).toBeLessThanOrEqual(1);
  });

  test("keeps explicit backend shell contracts for workspace and admin layouts", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const workspace = await measureBackendShell(page, "/workspace");
    const accounts = await measureBackendShell(page, "/admin/accounts");

    expect(Math.abs((workspace.topbarBox?.x || 0) - (workspace.shellBodyBox?.x || 0))).toBeLessThanOrEqual(12);
    expect(Math.abs((workspace.topbarBox?.width || 0) - (workspace.shellBodyBox?.width || 0))).toBeLessThanOrEqual(40);

    expect((accounts.shellBodyBox?.width || 0)).toBeGreaterThan(1300);
    expect((accounts.secondaryNavBox?.width || 0)).toBeGreaterThan(240);
    expect((accounts.mainPanelBox?.width || 0)).toBeGreaterThan(1000);
  });

  test("keeps every users secondary route on the shared accounts baseline", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const accounts = await measureBackendShell(page, "/admin/accounts");

    for (const route of userManagementRoutes) {
      const current = await measureBackendShell(page, route);

      expect(Math.abs((current.shellBodyBox?.x || 0) - (accounts.shellBodyBox?.x || 0)), `${route} shell x`).toBeLessThanOrEqual(1);
      expect(Math.abs((current.shellBodyBox?.width || 0) - (accounts.shellBodyBox?.width || 0)), `${route} shell width`).toBeLessThanOrEqual(1);
      expect(Math.abs((current.secondaryNavBox?.x || 0) - (accounts.secondaryNavBox?.x || 0)), `${route} sidebar x`).toBeLessThanOrEqual(1);
      expect(Math.abs((current.mainPanelBox?.x || 0) - (accounts.mainPanelBox?.x || 0)), `${route} main panel x`).toBeLessThanOrEqual(1);
    }
  });

  test("collapses the backend secondary navigation into an integrated rail", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/admin/accounts");

    const shellBody = page.locator(".backend-shell-body");
    const secondaryNav = page.locator(".backend-secondary-nav");
    const mainPanel = page.locator(".backend-main-panel");
    const collapseToggle = page.getByTestId("backend-secondary-collapse-toggle");

    const sidebarWidthBefore = await secondaryNav.evaluate((node) => Math.round(node.getBoundingClientRect().width));
    const mainPanelXBefore = await mainPanel.evaluate((node) => Math.round(node.getBoundingClientRect().x));

    await collapseToggle.click();

    await expect(shellBody).toHaveClass(/is-sidebar-collapsed/);
    await expect(secondaryNav).toHaveClass(/is-collapsed/);
    await expect(collapseToggle).toHaveAttribute("aria-expanded", "false");
    await expect(secondaryNav.locator(".backend-secondary-item-copy")).toHaveCount(4);
    await expect(secondaryNav.locator(".backend-secondary-item-copy").first()).not.toBeVisible();

    const sidebarWidthAfter = await secondaryNav.evaluate((node) => Math.round(node.getBoundingClientRect().width));
    const mainPanelXAfter = await mainPanel.evaluate((node) => Math.round(node.getBoundingClientRect().x));

    expect(sidebarWidthBefore).toBeGreaterThan(240);
    expect(sidebarWidthAfter).toBeLessThan(100);
    expect(mainPanelXAfter).toBeLessThan(mainPanelXBefore);
  });
});
