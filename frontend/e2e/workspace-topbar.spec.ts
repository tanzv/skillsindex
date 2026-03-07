import { expect, test } from "@playwright/test";

test.describe("workspace topbar", () => {
  test("keeps workspace overflow and user menu mutually exclusive", async ({ page }) => {
    await page.goto("/workspace");

    const overflowToggle = page.locator(".workspace-topbar-toggle-icon-button");
    const overflowWrapper = page.locator(".workspace-topbar-overflow-wrapper");
    const userTrigger = page.getByTestId("workspace-user-center-trigger");
    const userDropdown = page.locator(".workspace-topbar-user-dropdown");

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);

    await userTrigger.click();
    await expect(userDropdown).toBeVisible();
    await expect(overflowWrapper).toHaveClass(/is-collapsed/);

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);
    await expect(userDropdown).toHaveCount(0);
  });

  test("anchors the workspace overflow panel near the toggle on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/workspace");

    const overflowToggle = page.locator(".workspace-topbar-toggle-icon-button");
    const overflowWrapper = page.locator(".workspace-topbar-overflow-wrapper");

    await overflowToggle.click();
    await expect(overflowWrapper).toHaveClass(/is-expanded/);

    const toggleBox = await overflowToggle.boundingBox();
    const wrapperBox = await overflowWrapper.boundingBox();

    expect(toggleBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    const toggleRight = (toggleBox?.x || 0) + (toggleBox?.width || 0);
    const wrapperRight = (wrapperBox?.x || 0) + (wrapperBox?.width || 0);

    expect(wrapperBox?.width || 0).toBeGreaterThan(640);
    expect(wrapperBox?.width || 0).toBeLessThan(820);
    expect(wrapperBox?.x || 0).toBeGreaterThan(120);
    expect(Math.abs(wrapperRight - toggleRight)).toBeLessThan(80);
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
    expect(Math.abs((firstBox?.y || 0) - (secondBox?.y || 0))).toBeLessThan(4);
  });
});
