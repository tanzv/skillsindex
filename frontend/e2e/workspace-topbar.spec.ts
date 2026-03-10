import { expect, test, type Page } from "@playwright/test";

async function mockAuthenticatedWorkspaceUser(page: Page): Promise<void> {
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

  await page.route("**/api/v1/account/profile", async (route) => {
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
        },
        profile: {
          display_name: "Workspace User",
          avatar_url: "https://example.com/avatar.png",
          bio: "Operations owner"
        }
      })
    });
  });

  await page.route("**/api/v1/account/sessions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
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
      })
    });
  });
}

test.describe("workspace topbar", () => {
  test("keeps workspace overflow and user menu mutually exclusive", async ({ page }) => {
    await page.goto("/workspace");

    const overflowToggle = page.locator(".workspace-topbar-toggle-icon-button");
    const overflowWrapper = page.locator(".workspace-topbar-overflow-wrapper");
    const userTrigger = page.getByTestId("workspace-user-center-trigger");
    const userDropdown = page.locator(".workspace-topbar-user-dropdown");
    const userPanel = page.getByTestId("workspace-user-center-panel");

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);

    await userTrigger.click();
    await expect(userDropdown).toBeVisible();
    await expect(overflowWrapper).toHaveClass(/is-collapsed/);

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);
    await expect(userDropdown).toHaveCount(1);
    await expect(userPanel).not.toBeVisible();
    await expect(userTrigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keeps primary nav buttons clear of the overflow toggle on medium widths", async ({ page }) => {
    for (const [viewportWidth, expectedVisibleButtons] of [
      [1440, 4],
      [1280, 4],
      [1180, 3],
      [1024, 2]
    ] as const) {
      await page.setViewportSize({ width: viewportWidth, height: 1000 });
      await page.goto("/workspace");

      const visibleButtons = page.locator(".workspace-topbar-primary-groups .marketplace-topbar-nav-button");
      const toggleButton = page.locator(".workspace-topbar-toggle-icon-button");
      await expect(visibleButtons).toHaveCount(expectedVisibleButtons);
      await expect(toggleButton).toBeVisible();

      const visibleCount = await visibleButtons.count();
      const lastButtonBox = await visibleButtons.nth(visibleCount - 1).boundingBox();
      const toggleButtonBox = await toggleButton.boundingBox();

      expect(lastButtonBox).not.toBeNull();
      expect(toggleButtonBox).not.toBeNull();

      const lastButtonRight = (lastButtonBox?.x || 0) + (lastButtonBox?.width || 0);
      const toggleButtonLeft = toggleButtonBox?.x || 0;
      expect(lastButtonRight + 8).toBeLessThan(toggleButtonLeft);
    }
  });

  test("opens a large floating overflow panel without shifting the content area", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/workspace");

    const primaryShell = page.locator(".workspace-topbar-primary-groups-shell");
    const overflowToggle = page.locator(".workspace-topbar-toggle-icon-button");
    const overflowWrapper = page.locator(".workspace-topbar-overflow-wrapper");
    const contentHeading = page.getByRole("heading", { name: /Queue Insights|队列洞察/ }).first();

    await expect(primaryShell).toBeVisible();
    await expect(contentHeading).toBeVisible();

    const primaryShellBox = await primaryShell.boundingBox();
    const contentHeadingBefore = await contentHeading.boundingBox();
    expect(primaryShellBox).not.toBeNull();
    expect(contentHeadingBefore).not.toBeNull();
    expect(primaryShellBox?.width || 0).toBeGreaterThan(780);
    expect(primaryShellBox?.width || 0).toBeLessThan(822);

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);

    const toggleBox = await overflowToggle.boundingBox();
    const wrapperBox = await overflowWrapper.boundingBox();
    const contentHeadingAfter = await contentHeading.boundingBox();

    expect(toggleBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();
    expect(contentHeadingAfter).not.toBeNull();

    expect(wrapperBox?.width || 0).toBeGreaterThan(1000);
    expect(wrapperBox?.width || 0).toBeLessThan(1450);
    expect(wrapperBox?.y || 0).toBeGreaterThan((toggleBox?.y || 0) + (toggleBox?.height || 0));
    expect(Math.abs((contentHeadingAfter?.y || 0) - (contentHeadingBefore?.y || 0))).toBeLessThan(4);
    expect(Math.abs((contentHeadingAfter?.height || 0) - (contentHeadingBefore?.height || 0))).toBeLessThan(2);
  });

  test("keeps theme and language controls on the same preferences row", async ({ page }) => {
    await page.goto("/workspace");

    const userTrigger = page.getByTestId("workspace-user-center-trigger");
    await userTrigger.click();

    const panel = page.getByTestId("workspace-user-center-panel");
    const preferenceRow = panel.locator(".workspace-topbar-user-inline-row");
    const segmentedGroups = preferenceRow.locator(".workspace-topbar-user-segmented-group");

    await expect(panel).toBeVisible();
    await expect(preferenceRow).toBeVisible();
    await expect(segmentedGroups).toHaveCount(2);

    const firstBox = await segmentedGroups.nth(0).boundingBox();
    const secondBox = await segmentedGroups.nth(1).boundingBox();

    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(Math.abs((firstBox?.y || 0) - (secondBox?.y || 0))).toBeLessThan(8);
  });

  test("opens governance from the top-level system settings entry on workspace", async ({ page }) => {
    await page.goto("/workspace");

    const primaryNavigation = page.locator('.workspace-topbar-primary-groups');
    const systemSettingsButton = primaryNavigation.getByRole("button", { name: "System Settings", exact: true });

    await expect(systemSettingsButton).toBeVisible();
    await systemSettingsButton.click();

    await expect(page).toHaveURL(/\/governance$/);
    await expect(page.getByRole("heading", { name: "Governance Center", exact: true })).toBeVisible();
  });

  test("navigates to account center from registered user control actions when a session exists", async ({ page }) => {
    await mockAuthenticatedWorkspaceUser(page);
    await page.goto("/workspace");

    const userTrigger = page.getByTestId("workspace-user-center-trigger");
    await expect(userTrigger).toContainText("Workspace User");
    await userTrigger.click();

    const panel = page.getByTestId("workspace-user-center-panel");
    const accountSection = panel.locator('[data-section-id="account"]');

    await expect(accountSection.getByRole("button", { name: /Account Center|账号中心|账户中心/, exact: false })).toBeVisible();
    await expect(accountSection.getByRole("button", { name: /Security|安全/, exact: false })).toBeVisible();
    await expect(accountSection.getByRole("button", { name: /Sessions|会话管理/, exact: false })).toBeVisible();

    await accountSection.getByRole("button", { name: /Account Center|账号中心|账户中心/, exact: false }).click();
    await expect(page).toHaveURL(/\/account\/profile$/);
    await expect(page.getByRole("heading", { name: /Account Center|账号中心|账户中心/, exact: false })).toBeVisible();
  });
});
