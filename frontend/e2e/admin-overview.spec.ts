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

  await page.route("**/api/v1/admin/overview", async (route) => {
    const status = options?.overviewStatus ?? 200;
    const body = options?.overviewBody ?? OVERVIEW_FIXTURE;
    await fulfillJSON(route, status, body);
  });

  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, { items: [], total: 0 });
  });
}

async function resolveLocaleSwitch(
  roleLocator: ReturnType<Page["getByRole"]>,
  testIDLocator: ReturnType<Page["getByTestId"]>
) {
  if ((await roleLocator.count()) > 0) {
    const firstRoleLocator = roleLocator.first();
    await expect(firstRoleLocator).toBeVisible();
    return firstRoleLocator;
  }
  await expect(testIDLocator).toBeVisible();
  return testIDLocator;
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

  test("sidebar locale switch uses icon controls and toggles active locale", async ({ page }) => {
    await mockAuthAndOverview(page);
    await page.goto(ADMIN_SIDEBAR_ROUTE);

    const englishLocaleSwitch = await resolveLocaleSwitch(
      page.getByRole("button", { name: "Switch to English locale", exact: true }),
      page.getByTestId("sidebar-locale-switch-en")
    );
    const chineseLocaleSwitch = await resolveLocaleSwitch(
      page.getByRole("button", { name: "Switch to Chinese locale", exact: true }),
      page.getByTestId("sidebar-locale-switch-zh")
    );

    if (await englishLocaleSwitch.isDisabled()) {
      await chineseLocaleSwitch.click();
      await expect(chineseLocaleSwitch).toBeDisabled();
      await expect(englishLocaleSwitch).toBeEnabled();
      return;
    }

    await englishLocaleSwitch.click();
    await expect(englishLocaleSwitch).toBeDisabled();
    await expect(chineseLocaleSwitch).toBeEnabled();
  });
});
