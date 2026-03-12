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

  await mockExactListRoute(page, "/api/v1/admin/organizations", { items: [] });
  await mockExactListRoute(page, "/api/v1/admin/roles", { items: [] });
  await mockExactListRoute(page, "/api/v1/admin/access-policies", { items: [] });

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

async function measureSidebarFrame(page: Page, path: string, options?: { requireSidebar?: boolean }) {
  await page.goto(path);

  const topbar = page.locator(".workspace-topbar-shell .marketplace-topbar");
  const utilityFrame = page.locator(".workspace-prototype-utility-frame");
  const sidebarCard = page.locator(".workspace-prototype-utility-frame aside").first();
  const contentScroll = page.locator(".workspace-shell-content-scroll");
  const requireSidebar = options?.requireSidebar !== false;

  await expect(topbar).toBeVisible();
  await expect(utilityFrame).toBeVisible();
  if (requireSidebar) {
    await expect(sidebarCard).toBeVisible();
  }
  await expect(contentScroll).toBeVisible();

  const topbarBox = await topbar.boundingBox();
  const utilityFrameBox = await utilityFrame.boundingBox();
  const sidebarCardBox = requireSidebar ? await sidebarCard.boundingBox() : null;
  const contentScrollBox = await contentScroll.boundingBox();

  expect(topbarBox).not.toBeNull();
  expect(utilityFrameBox).not.toBeNull();
  if (requireSidebar) {
    expect(sidebarCardBox).not.toBeNull();
  }
  expect(contentScrollBox).not.toBeNull();

  return {
    topbarBox,
    utilityFrameBox,
    sidebarCardBox,
    contentScrollBox
  };
}

const adminSecondarySidebarRoutes = [
  "/admin/accounts/new",
  "/admin/access",
  "/admin/roles",
  "/admin/roles/new",
  "/admin/ingestion/repository",
  "/admin/records/sync-jobs",
  "/admin/records/exports"
] as const;

test.describe("workspace sidebar layout", () => {
  test("keeps the repository sidebar aligned with the accounts page baseline", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const repository = await measureSidebarFrame(page, "/admin/ingestion/repository");
    const accounts = await measureSidebarFrame(page, "/admin/accounts");

    expect(Math.abs((repository.utilityFrameBox?.x || 0) - (accounts.utilityFrameBox?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.utilityFrameBox?.width || 0) - (accounts.utilityFrameBox?.width || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.sidebarCardBox?.x || 0) - (accounts.sidebarCardBox?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((repository.contentScrollBox?.x || 0) - (accounts.contentScrollBox?.x || 0))).toBeLessThanOrEqual(1);
  });

  test("keeps explicit shell contracts for workspace default and admin secondary layouts", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const workspace = await measureSidebarFrame(page, "/workspace", { requireSidebar: false });
    const accounts = await measureSidebarFrame(page, "/admin/accounts");

    expect(Math.abs((workspace.topbarBox?.x || 0) - (workspace.utilityFrameBox?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((workspace.topbarBox?.width || 0) - (workspace.utilityFrameBox?.width || 0))).toBeLessThanOrEqual(1);

    expect((accounts.utilityFrameBox?.width || 0)).toBeGreaterThan(accounts.topbarBox?.width || 0);
    expect((accounts.utilityFrameBox?.x || 0)).toBeLessThan(accounts.topbarBox?.x || 0);
  });

  test("keeps every admin secondary-sidebar route on the shared accounts baseline", async ({ page }) => {
    await mockWorkspaceShell(page);
    await mockRepositoryIngestionData(page);
    await mockAccountsPageData(page);

    await page.setViewportSize({ width: 1440, height: 1100 });

    const accounts = await measureSidebarFrame(page, "/admin/accounts");

    for (const route of adminSecondarySidebarRoutes) {
      const current = await measureSidebarFrame(page, route);

      expect(Math.abs((current.utilityFrameBox?.x || 0) - (accounts.utilityFrameBox?.x || 0)), `${route} utility x`).toBeLessThanOrEqual(1);
      expect(Math.abs((current.utilityFrameBox?.width || 0) - (accounts.utilityFrameBox?.width || 0)), `${route} utility width`).toBeLessThanOrEqual(1);
      expect(Math.abs((current.sidebarCardBox?.x || 0) - (accounts.sidebarCardBox?.x || 0)), `${route} sidebar x`).toBeLessThanOrEqual(1);
    }
  });
});
