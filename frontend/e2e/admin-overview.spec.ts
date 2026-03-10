import { expect, test, type Page, type Route } from "@playwright/test";

const ADMIN_OVERVIEW_PATH = "/admin/overview";
const ADMIN_SIDEBAR_ROUTE = "/admin/skills";
const AUTH_USER_FIXTURE = {
  id: 101,
  username: "admin.user",
  display_name: "Admin User",
  role: "admin",
  status: "active"
} as const;

const OVERVIEW_FIXTURE = {
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
} as const;

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockAuthAndOverview(page: Page, options?: { overviewStatus?: number; overviewBody?: unknown }): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: AUTH_USER_FIXTURE });
  });

  await page.route("**/api/v1/auth/csrf", async (route) => {
    await fulfillJSON(route, 200, { csrf_token: "test-csrf-token" });
  });

  await page.route("**/api/v1/admin/overview", async (route) => {
    const status = options?.overviewStatus ?? 200;
    const body = options?.overviewBody ?? OVERVIEW_FIXTURE;
    await fulfillJSON(route, status, body);
  });

  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, { items: [], total: 0 });
  });
}

async function mockAccountManagementData(page: Page): Promise<void> {
  let allowRegistration = true;
  let enabledAuthProviders = ["github", "google"];
  const availableAuthProviders = ["dingtalk", "github", "google", "wecom", "microsoft", "password", "oidc"];

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
    if (route.request().method().toUpperCase() === "POST") {
      const payload = route.request().postDataJSON() as { allow_registration?: unknown } | null;
      allowRegistration = Boolean(payload?.allow_registration);
      await fulfillJSON(route, 200, {
        allow_registration: allowRegistration
      });
      return;
    }
    await fulfillJSON(route, 200, {
      allow_registration: allowRegistration
    });
  });

  await page.route("**/api/v1/admin/settings/auth-providers", async (route) => {
    if (route.request().method().toUpperCase() === "POST") {
      const payload = route.request().postDataJSON() as { auth_providers?: unknown } | null;
      const rawProviders = Array.isArray(payload?.auth_providers)
        ? payload?.auth_providers
        : String(payload?.auth_providers || "")
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
      enabledAuthProviders = Array.from(new Set(rawProviders.map((item) => String(item).trim().toLowerCase()))).filter((provider) =>
        availableAuthProviders.includes(provider)
      );
      await fulfillJSON(route, 200, {
        ok: true,
        auth_providers: enabledAuthProviders,
        available_auth_providers: availableAuthProviders
      });
      return;
    }

    await fulfillJSON(route, 200, {
      ok: true,
      auth_providers: enabledAuthProviders,
      available_auth_providers: availableAuthProviders
    });
  });

  await page.route("**/api/v1/admin/users/*/role", async (route) => {
    await fulfillJSON(route, 200, { ok: true });
  });

  await page.route("**/api/v1/admin/accounts/*/force-signout", async (route) => {
    await fulfillJSON(route, 200, { ok: true });
  });
}

test.describe("Admin overview interactions", () => {
  test("keeps protected route and renders core overview sections", async ({ page }) => {
    await mockAuthAndOverview(page);

    await page.goto(ADMIN_OVERVIEW_PATH);

    await expect(page).toHaveURL(/\/admin\/overview$/);
    await expect(page.getByText("Admin Navigation Dashboard", { exact: true })).toBeVisible();
    await expect(page.getByText("Core Modules", { exact: true })).toBeVisible();
    await expect(page.getByText("Release Audit Timeline", { exact: true })).toBeVisible();
    await expect(page.getByText("Security and Ops Entry", { exact: true })).toBeVisible();
  });

  test("quick route button navigates to expected admin path", async ({ page }) => {
    await mockAuthAndOverview(page);
    await page.route("**/api/v1/admin/ops/metrics", async (route) => {
      await fulfillJSON(route, 200, {
        item: {
          open_incidents: 0,
          pending_moderation_cases: 0,
          unresolved_jobs: 0,
          failed_sync_runs_24h: 0,
          disabled_accounts: 0,
          stale_integrations: 0
        }
      });
    });

    await page.goto(ADMIN_OVERVIEW_PATH);
    await page
      .locator("article")
      .filter({ hasText: "Security and Ops Entry" })
      .getByRole("button", { name: "Open Route Map", exact: true })
      .click();

    await expect(page).toHaveURL(/\/admin\/ops\/metrics$/);
  });

  test("module card action navigates to account route", async ({ page }) => {
    await mockAuthAndOverview(page);

    await page.goto(ADMIN_OVERVIEW_PATH);
    await page.getByRole("button", { name: "Account Center" }).click();

    await expect(page).toHaveURL(/\/admin\/accounts$/);
  });

  test("renders the shared backend user center dropdown with account and preference controls", async ({ page }) => {
    await mockAuthAndOverview(page);

    await page.goto(ADMIN_OVERVIEW_PATH);

    const userCenterTrigger = page.getByTestId("backend-user-center-trigger");
    await expect(userCenterTrigger).toBeVisible();
    await expect(page.getByTestId("sidebar-locale-switch-en")).toHaveCount(0);
    await expect(page.getByTestId("sidebar-locale-switch-zh")).toHaveCount(0);

    await userCenterTrigger.click();

    const userCenterPanel = page.getByTestId("workspace-user-center-panel");
    await expect(userCenterPanel).toBeVisible();
    await expect(userCenterPanel.locator(".workspace-topbar-user-section")).toHaveCount(3);
    await expect(userCenterPanel.locator(".workspace-topbar-user-inline-row .workspace-topbar-user-segmented-group")).toHaveCount(2);
    const themeGroup = userCenterPanel.getByRole("group", { name: /Theme|主题/ });
    await expect(themeGroup).toBeVisible();
    await expect(themeGroup.getByRole("button", { name: /Dark|暗色/ })).toBeVisible();
    await expect(themeGroup.getByRole("button", { name: /Light|亮色/ })).toBeVisible();
    const languageGroup = userCenterPanel.getByRole("group", { name: /Language|语言/ });
    await expect(languageGroup).toBeVisible();
    await expect(languageGroup.getByRole("button", { name: /EN/ })).toBeVisible();
    await expect(languageGroup.getByRole("button", { name: /ZH|中文/ })).toBeVisible();
    await expect(userCenterPanel.getByRole("button", { name: /Account Center|账户中心/ })).toBeVisible();
    await expect(userCenterPanel.getByRole("button", { name: /Security|安全设置/ })).toBeVisible();
    await expect(userCenterPanel.getByRole("button", { name: /Sessions|会话管理/ })).toBeVisible();
    await expect(userCenterPanel.getByRole("button", { name: /Sign Out|注销/ })).toBeVisible();
  });

  test("shows request error state when overview request fails", async ({ page }) => {
    await mockAuthAndOverview(page, {
      overviewStatus: 500,
      overviewBody: { message: "overview backend unavailable" }
    });

    await page.goto(ADMIN_OVERVIEW_PATH);

    await expect(page).toHaveURL(/\/admin\/overview$/);
    await expect(page.getByText("Admin overview request failed", { exact: true })).toBeVisible();
    await expect(page.getByText("overview backend unavailable", { exact: true })).toBeVisible();
  });

  test("backend user center locale controls switch locale without restoring legacy sidebar buttons", async ({ page }) => {
    await mockAuthAndOverview(page);
    await page.goto(ADMIN_SIDEBAR_ROUTE);

    const userCenterTrigger = page.getByTestId("backend-user-center-trigger");
    await expect(userCenterTrigger).toBeVisible();
    await expect(page.getByTestId("sidebar-locale-switch-en")).toHaveCount(0);
    await expect(page.getByTestId("sidebar-locale-switch-zh")).toHaveCount(0);
    await userCenterTrigger.click();

    const userCenterPanel = page.getByTestId("workspace-user-center-panel");
    await expect(userCenterPanel).toBeVisible();

    const languageGroup = userCenterPanel.getByRole("group", { name: /Language|语言/ });
    await expect(languageGroup).toBeVisible();

    const englishLocaleSwitch = languageGroup.getByRole("button", { name: /EN$/ });
    const chineseLocaleSwitch = languageGroup.getByRole("button", { name: /(ZH|中文)$/ });

    if (await englishLocaleSwitch.isDisabled()) {
      await chineseLocaleSwitch.click();
      await expect(userCenterTrigger).toHaveAttribute("aria-label", "用户中心面板");
      await userCenterTrigger.click();
      const reopenedPanel = page.getByTestId("workspace-user-center-panel");
      const reopenedLanguageGroup = reopenedPanel.getByRole("group", { name: /Language|语言/ });
      await expect(reopenedLanguageGroup.getByRole("button", { name: /(ZH|中文)$/ })).toBeDisabled();
      await expect(reopenedLanguageGroup.getByRole("button", { name: /EN$/ })).toBeEnabled();
      return;
    }

    await englishLocaleSwitch.click();
    await expect(userCenterTrigger).toHaveAttribute("aria-label", "User center panel");
    await userCenterTrigger.click();
    const reopenedPanel = page.getByTestId("workspace-user-center-panel");
    const reopenedLanguageGroup = reopenedPanel.getByRole("group", { name: /Language|语言/ });
    await expect(reopenedLanguageGroup.getByRole("button", { name: /EN$/ })).toBeDisabled();
    await expect(reopenedLanguageGroup.getByRole("button", { name: /(ZH|中文)$/ })).toBeEnabled();
  });

  test("account management list supports search and status filtering", async ({ page }) => {
    await mockAuthAndOverview(page);
    await mockAccountManagementData(page);

    await page.goto("/admin/accounts");

    await expect(page.getByRole("heading", { name: "Account Management List", exact: true }).first()).toBeVisible();

    const searchInput = page.getByPlaceholder("Search by username, role, or status");
    await searchInput.fill("security");
    await expect(page.getByRole("cell", { name: "security.audit", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "ops.lead", exact: true })).toHaveCount(0);

    await searchInput.fill("");
    await page.getByRole("button", { name: "Disabled", exact: true }).click();
    await expect(page.getByRole("cell", { name: "readonly.demo", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "security.audit", exact: true })).toHaveCount(0);
  });

  test("account configuration subpage updates registration and auth providers", async ({ page }) => {
    await mockAuthAndOverview(page);
    await mockAccountManagementData(page);

    await page.goto("/admin/accounts/new");

    await expect(page.getByRole("heading", { name: "Account Configuration Form", exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("account-config-form")).toBeVisible();

    const registrationToggle = page.getByLabel("Allow self-registration");
    await registrationToggle.uncheck();

    const wecomToggle = page.getByTestId("account-provider-toggle-wecom");
    await wecomToggle.check();

    await page.getByTestId("account-config-save-button").click();
    await expect(page.getByText("Access settings updated.", { exact: true })).toBeVisible();
  });

  test("role configuration subpage submits assignment form", async ({ page }) => {
    await mockAuthAndOverview(page);
    await mockAccountManagementData(page);

    await page.goto("/admin/roles/new");

    await expect(page.getByRole("heading", { name: "Role Configuration Form", exact: true }).first()).toBeVisible();
    await page.getByPlaceholder("Enter user ID").fill("1003");
    await page.locator(".account-workbench-select-input").selectOption("admin");
    await page.getByTestId("role-assignment-submit-button").click();

    await expect(page.getByText("Role assignment updated for user #1003.", { exact: true })).toBeVisible();
  });

  test("organization accounts shell uses full-width utility frame on wide viewports", async ({ page }) => {
    await mockAuthAndOverview(page);
    await mockAccountManagementData(page);
    await page.setViewportSize({ width: 1800, height: 920 });

    await page.goto("/admin/accounts");
    await expect(page.locator(".workspace-prototype-utility-frame")).toBeVisible();

    const layoutMetrics = await page.evaluate(() => {
      const utilityFrame = document.querySelector(".workspace-prototype-utility-frame");
      if (!utilityFrame) {
        return null;
      }
      const utilityRect = utilityFrame.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      return {
        utilityWidth: utilityRect.width,
        viewportWidth
      };
    });

    expect(layoutMetrics).not.toBeNull();
    if (!layoutMetrics) {
      return;
    }
    expect(layoutMetrics.utilityWidth).toBeGreaterThan(layoutMetrics.viewportWidth - 60);
  });
});
