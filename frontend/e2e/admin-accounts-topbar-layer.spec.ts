import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function mockAdminAccountsTopbarData(page: Page): Promise<void> {
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

  await page.route("**/api/v1/admin/accounts**", async (route) => {
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
}

test("admin accounts overflow panel stays above the sidebar overlap zone", async ({ page }) => {
  await mockAdminAccountsTopbarData(page);
  await page.setViewportSize({ width: 1440, height: 1100 });

  await page.goto("/admin/accounts");

  const overflowToggle = page.locator(".workspace-topbar-toggle-icon-button");
  const overflowWrapper = page.locator(".workspace-topbar-overflow-wrapper");
  await expect(overflowToggle).toBeVisible();

  await overflowToggle.click();
  await expect(overflowWrapper).toHaveClass(/is-expanded/);

  const overlapHitTest = await page.evaluate(() => {
    const panel = document.querySelector(".marketplace-topbar-overflow-panel");
    const sidebar = document.querySelector("aside");
    if (!(panel instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) {
      return null;
    }

    const panelRect = panel.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const overlapLeft = Math.max(panelRect.left, sidebarRect.left);
    const overlapRight = Math.min(panelRect.right, sidebarRect.right);
    const overlapWidth = overlapRight - overlapLeft;
    if (overlapWidth <= 0) {
      return null;
    }

    const sampleX = Math.round(overlapLeft + Math.max(12, overlapWidth * 0.35));
    const sampleY = Math.round(panelRect.top + Math.min(134, panelRect.height * 0.5));
    const topElement = document.elementFromPoint(sampleX, sampleY);

    return {
      overlapWidth,
      sampleX,
      sampleY,
      topClassName: topElement instanceof HTMLElement ? String(topElement.className || "") : "",
      inOverflowWrapper: Boolean(topElement?.closest(".workspace-topbar-overflow-wrapper"))
    };
  });

  expect(overlapHitTest).not.toBeNull();
  expect(overlapHitTest?.overlapWidth ?? 0).toBeGreaterThan(0);
  expect(overlapHitTest?.inOverflowWrapper).toBe(true);
});
