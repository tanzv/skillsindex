import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockProtectedWorkspaceSession(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 101,
        username: "admin.user",
        display_name: "Admin User",
        role: "super_admin",
        status: "active"
      }
    });
  });

  await page.route("**/api/v1/account/profile", async (route) => {
    await fulfillJSON(route, 200, {
      user: {
        id: 101,
        username: "admin.user",
        display_name: "Admin User",
        role: "super_admin",
        status: "active"
      },
      profile: {
        display_name: "Admin User",
        avatar_url: "https://example.com/avatar.png",
        bio: "Admin owner"
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
}

test("workspace stays inside the protected backend shell when switching primary navigation", async ({ page }) => {
  await mockProtectedWorkspaceSession(page);
  await page.setViewportSize({ width: 1440, height: 1100 });

  await page.goto("/workspace");

  const primaryNav = page.locator(".backend-primary-nav");
  const secondaryNav = page.locator(".backend-secondary-nav");

  await expect(page.locator(".backend-shell")).toBeVisible();
  await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
  await expect(primaryNav.getByRole("button", { name: "Workspace" })).toHaveAttribute("aria-pressed", "true");
  await expect(secondaryNav.locator(".backend-secondary-item strong")).toHaveText([
    "Overview",
    "Activity Feed",
    "Queue Execution",
    "Runbook Preview",
    "Policy Summary",
    "Quick Actions"
  ]);
  await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Overview");

  await secondaryNav.getByRole("menuitem", { name: /Activity Feed/i }).click();

  await expect(page).toHaveURL(/\/workspace\/activity$/);
  await expect(page.locator(".backend-shell")).toBeVisible();
  await expect(primaryNav.getByRole("button", { name: "Workspace" })).toHaveAttribute("aria-pressed", "true");
  await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Activity Feed");

  await primaryNav.getByRole("button", { name: "Users" }).click();

  await expect(page).toHaveURL(/\/admin\/accounts$/);
  await expect(page.locator(".backend-shell")).toBeVisible();
  await expect(page.locator(".workspace-prototype-utility-frame")).toHaveCount(0);
  await expect(primaryNav.getByRole("button", { name: "Users" })).toHaveAttribute("aria-pressed", "true");
  await expect(secondaryNav.locator(".backend-secondary-item strong")).toHaveText([
    "Account Management",
    "Role Management",
    "Access",
    "Organizations"
  ]);
  await expect(secondaryNav.locator(".backend-secondary-item.active strong")).toHaveText("Account Management");
  await expect(page.getByRole("heading", { name: "Account Management List", exact: true })).toBeVisible();
  await expect(page.getByText("Live backend data", { exact: true })).toBeVisible();
  await expect(page.getByText("Fallback prototype data", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Loading account and role workbench...", { exact: true })).toHaveCount(0);
});
