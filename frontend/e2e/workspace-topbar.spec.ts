import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockProtectedSession(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 102,
        username: "workspace.user",
        display_name: "Workspace User",
        role: "operator",
        status: "active"
      }
    });
  });

  await page.route("**/api/v1/account/profile", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 102,
        username: "workspace.user",
        display_name: "Workspace User",
        role: "operator",
        status: "active"
      },
      profile: {
        display_name: "Workspace User",
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

async function mockAccountsWorkbench(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/accounts", async (route) => {
    await fulfillJSON(route, 200, {
      total: 3,
      items: [
        {
          id: 1001,
          username: "ops.lead",
          role: "admin",
          status: "active",
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-02T09:00:00Z"
        },
        {
          id: 1002,
          username: "security.audit",
          role: "auditor",
          status: "active",
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-03T09:00:00Z"
        },
        {
          id: 1003,
          username: "readonly.demo",
          role: "viewer",
          status: "disabled",
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-01T09:00:00Z"
        }
      ]
    });
  });

  await page.route("**/api/v1/admin/settings/registration", async (route) => {
    await fulfillJSON(route, 200, {
      allow_registration: true,
      marketplace_public_access: true
    });
  });

  await page.route("**/api/v1/admin/settings/auth-providers", async (route) => {
    await fulfillJSON(route, 200, {
      ok: true,
      auth_providers: ["github", "google"],
      available_auth_providers: ["github", "google", "wecom", "password"]
    });
  });
}

async function mockOperationsWorkbench(page: Page): Promise<void> {
  await page.route("**/api/v1/admin/ops/metrics", async (route) => {
    await fulfillJSON(route, 200, {
      item: {
        open_incidents: 1,
        pending_moderation_cases: 0,
        unresolved_jobs: 2,
        failed_sync_runs_24h: 1,
        disabled_accounts: 0,
        stale_integrations: 1
      }
    });
  });

  await page.route("**/api/v1/admin/integrations?limit=20", async (route) => {
    await fulfillJSON(route, 200, {
      items: [
        {
          id: 10,
          name: "GitHub",
          provider: "github",
          description: "Repository sync",
          base_url: "https://api.github.com",
          enabled: true,
          updated_at: "2026-03-11T10:00:00Z"
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
          delivered_at: "2026-03-11T10:30:00Z"
        }
      ],
      webhook_total: 1
    });
  });
}

async function mockProtectedWorkspaceNavigation(page: Page): Promise<void> {
  await mockProtectedSession(page);
  await mockAccountsWorkbench(page);
  await mockOperationsWorkbench(page);
}

async function readPrimaryNavLabels(page: Page): Promise<string[]> {
  return page.locator(".backend-primary-nav .backend-primary-nav-item").evaluateAll((nodes) =>
    nodes.map((node) => node.textContent?.trim() || "")
  );
}

test.describe("workspace topbar", () => {
  test("renders workspace routes inside the shared backend topbar shell", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);
    await page.setViewportSize({ width: 1440, height: 1100 });

    await page.goto("/workspace");

    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
    await expect(page.locator(".backend-topbar")).toBeVisible();
    await expect(page.getByTestId("backend-primary-overflow-trigger")).toHaveCount(0);
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item")).toHaveText([
      "Workspace",
      "Overview",
      "Catalog",
      "Operations",
      "Users",
      "Security",
      "Account"
    ]);
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Workspace");
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".backend-secondary-nav .backend-secondary-item strong")).toHaveText([
      "Overview",
      "Activity Feed",
      "Queue Execution",
      "Runbook Preview",
      "Policy Summary",
      "Quick Actions"
    ]);
    await expect(page.locator(".backend-secondary-nav .backend-secondary-item.active strong")).toHaveText("Overview");
    await expect(page.locator(".backend-secondary-nav .backend-secondary-item.active .backend-secondary-item-copy")).toHaveAttribute("aria-current", "page");
  });

  test("switches from workspace to admin accounts without replacing the backend topbar", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);

    await page.goto("/workspace");

    const primaryNav = page.locator(".backend-primary-nav");
    const topbar = page.locator(".backend-topbar");
    const secondaryNav = page.locator(".backend-secondary-nav");
    await expect
      .poll(async () => primaryNav.locator(".backend-primary-nav-item").count())
      .toBeGreaterThan(0);
    const labelsBefore = await readPrimaryNavLabels(page);
    const topbarBoxBefore = await topbar.boundingBox();

    expect(topbarBoxBefore).not.toBeNull();

    await primaryNav.getByRole("button", { name: "Users", exact: true }).click();

    await expect(page).toHaveURL(/\/admin\/accounts$/);
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Users");
    await expect(secondaryNav.locator(".backend-secondary-item strong")).toHaveText([
      "Account Management",
      "Role Management",
      "Access",
      "Organizations"
    ]);
    await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Account Management");
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();

    const labelsAfter = await readPrimaryNavLabels(page);
    const topbarBoxAfter = await topbar.boundingBox();

    expect(labelsAfter).toEqual(labelsBefore);
    expect(topbarBoxAfter).not.toBeNull();
    expect(Math.abs((topbarBoxAfter?.x || 0) - (topbarBoxBefore?.x || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((topbarBoxAfter?.width || 0) - (topbarBoxBefore?.width || 0))).toBeLessThanOrEqual(1);
  });

  test("routes operations primary navigation to ops metrics and keeps the section secondary order stable", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);

    await page.goto("/workspace");

    const primaryNav = page.locator(".backend-primary-nav");
    const secondaryNav = page.locator(".backend-secondary-nav");

    await primaryNav.getByRole("button", { name: "Operations", exact: true }).click();

    await expect(page).toHaveURL(/\/admin\/ops\/metrics$/);
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Operations");
    await expect(secondaryNav.locator(".backend-secondary-item strong")).toHaveText([
      "Ops Metrics",
      "Integrations",
      "Ops Alerts",
      "Audit Export",
      "Release Gates",
      "Recovery Drills",
      "Releases",
      "Change Approvals",
      "Backup Plans",
      "Backup Runs"
    ]);
    await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Ops Metrics");
    await expect(page.getByRole("heading", { name: "Operations Command Dashboard", exact: true })).toBeVisible();

    await secondaryNav.getByRole("menuitem", { name: /Integrations/i }).click();

    await expect(page).toHaveURL(/\/admin\/integrations$/);
    await expect(page.locator(".backend-shell")).toBeVisible();
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Operations");
    await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Integrations");
    await expect(page.getByRole("heading", { name: "Integration Command Center", exact: true })).toBeVisible();
  });

  test("moves excess primary navigation entries into an overflow popover on narrower desktop widths", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);
    await page.setViewportSize({ width: 1180, height: 1100 });

    await page.goto("/workspace");

    const primaryNav = page.locator(".backend-primary-nav");
    const overflowTrigger = page.getByTestId("backend-primary-overflow-trigger");

    await expect(primaryNav.locator(".backend-primary-nav-item")).toHaveText([
      "Workspace",
      "Overview",
      "Catalog",
      "Operations"
    ]);
    await expect(overflowTrigger).toBeVisible();
    await expect(overflowTrigger).toContainText("More (3)");

    await overflowTrigger.click();

    const overflowPanel = page.getByTestId("backend-primary-overflow-panel");
    await expect(overflowPanel).toBeVisible();
    await expect(overflowPanel.locator(".backend-primary-overflow-item strong")).toHaveText([
      "Users",
      "Security",
      "Account"
    ]);

    await overflowPanel.getByRole("button", { name: /Users/i }).click();

    await expect(page).toHaveURL(/\/admin\/accounts$/);
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Users");
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();
  });

  test("keeps overflow navigation reachable on compact desktop widths", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);
    await page.setViewportSize({ width: 1024, height: 1100 });

    await page.goto("/workspace");

    const overflowTrigger = page.getByTestId("backend-primary-overflow-trigger");

    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item")).toHaveText([
      "Workspace",
      "Overview",
      "Catalog"
    ]);
    await expect(overflowTrigger).toBeVisible();
    await expect(overflowTrigger).toContainText("More (4)");

    await overflowTrigger.click();

    const overflowPanel = page.getByTestId("backend-primary-overflow-panel");
    await expect(overflowPanel).toBeVisible();
    await expect(overflowPanel.locator(".backend-primary-overflow-item strong")).toHaveText([
      "Operations",
      "Users",
      "Security",
      "Account"
    ]);

    await overflowPanel.getByRole("button", { name: /Users/i }).click();

    await expect(page).toHaveURL(/\/admin\/accounts$/);
    await expect(page.locator(".backend-primary-nav .backend-primary-nav-item.active")).toHaveText("Users");
    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();
  });

  test("keeps theme and language controls on the same preferences row in the backend shell", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);

    await page.goto("/workspace");

    const userTrigger = page.getByTestId("backend-user-center-trigger");
    const panel = page.locator(".backend-user-dropdown .workspace-topbar-user-panel:visible");
    await userTrigger.click();

    const preferenceRow = panel.locator(".workspace-topbar-user-inline-row");
    const segmentedGroups = preferenceRow.locator(".workspace-topbar-user-segmented-group");

    await expect(panel).toBeVisible();
    await expect(preferenceRow).toBeVisible();
    await expect(segmentedGroups).toHaveCount(2);

    const firstBox = await segmentedGroups.nth(0).boundingBox();
    const secondBox = await segmentedGroups.nth(1).boundingBox();

    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(Math.abs((firstBox?.y || 0) - (secondBox?.y || 0))).toBeLessThan(18);
  });

  test("switches backend shell menu colors with the global theme mode", async ({ page }) => {
    await mockProtectedWorkspaceNavigation(page);

    await page.goto("/workspace");
    await expect(page.locator(".backend-shell")).toBeVisible();

    const readMenuThemeState = async () =>
      page.locator(".backend-secondary-item-glyph").first().evaluate((node) => {
        const glyphStyles = window.getComputedStyle(node);
        const nav = document.querySelector(".backend-secondary-nav");
        const navStyles = nav ? window.getComputedStyle(nav) : null;

        return {
          mode: document.documentElement.getAttribute("data-theme-mode"),
          path: window.location.pathname,
          glyphBackground: glyphStyles.backgroundColor,
          glyphBorder: glyphStyles.borderColor,
          navBorder: navStyles?.borderColor || "",
          navBackground: navStyles?.backgroundImage || "",
          navBackgroundColor: navStyles?.backgroundColor || ""
        };
      });

    const darkState = await readMenuThemeState();

    expect(darkState.mode).toBe("dark");
    expect(darkState.path).toBe("/workspace");

    const userTrigger = page.getByTestId("backend-user-center-trigger");
    const userPanel = page.locator(".backend-user-dropdown .workspace-topbar-user-panel:visible");

    await userTrigger.click();
    await expect(userPanel).toBeVisible();
    await userPanel.getByRole("button", { name: /Light|亮色/ }).click();

    await expect(page).toHaveURL(/\/light\/workspace$/);

    const lightState = await readMenuThemeState();

    expect(lightState.mode).toBe("light");
    expect(lightState.path).toBe("/light/workspace");
    expect(lightState.glyphBackground).not.toBe(darkState.glyphBackground);
    expect(lightState.glyphBorder).not.toBe(darkState.glyphBorder);
    expect(lightState.navBorder).not.toBe(darkState.navBorder);
    expect(lightState.navBackgroundColor).not.toBe(darkState.navBackgroundColor);
  });
});
