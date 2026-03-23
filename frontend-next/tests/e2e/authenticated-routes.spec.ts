import { expect, test } from "@playwright/test";
import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("renders authenticated admin, workspace, and account routes", async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("admin-side-nav")).toBeVisible();
  await expect(page.getByTestId("admin-topbar")).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Administration", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Admin Overview", level: 1 })).toBeVisible();
  await expect(page.getByText("Track catalog scale, access readiness, and operational reach from the central admin landing page.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/access");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Organizations", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Access", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Policy Panel" })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ingestion/repository");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Skills", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Save Policy" }).first().click();
  await expect(page.getByRole("dialog", { name: "Scheduler Policy" })).toBeVisible();
  await page.getByRole("button", { name: "Close Panel" }).click();

  await gotoProtectedRoute(page, "/admin/ops/metrics");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Administration", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Operations Metrics", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Telemetry Context", exact: true })).toBeVisible();

  await gotoProtectedRoute(page, "/workspace/queue");
  await expect(page.getByTestId("workspace-topbar").getByRole("link", { name: "Workspace", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Queue Execution", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Details" }).first()).toBeVisible();

  await gotoProtectedRoute(page, "/account/profile");
  await expect(page.getByTestId("account-shell")).toBeVisible();
  await expect(page.getByTestId("account-side-nav")).toBeVisible();
  await expect(page.getByTestId("account-topbar")).toBeVisible();
  await expect(page.getByTestId("account-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("account-topbar").getByRole("link", { name: "Account", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
});

test("executes authenticated profile and manual ingestion actions", async ({ page }) => {
  await loginAsAdmin(page, "/account/profile");

  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ingestion/manual");
  await expect(page.getByRole("heading", { name: "Manual Intake", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Create Manual Skill" }).first().click();
  const manualDialog = page.getByRole("dialog", { name: "Manual Authoring" });
  await manualDialog.getByLabel("Name").fill("Manual Smoke Skill");
  await manualDialog.getByLabel("Description").fill("Created during authenticated UI smoke.");
  await manualDialog.getByLabel("Content").fill("# Manual Smoke Skill");
  await manualDialog.getByRole("button", { name: "Create Manual Skill" }).click();
  await expect(page.getByText("Manual skill created.")).toBeVisible();
  await expect(page.getByText("Manual Smoke Skill").first()).toBeVisible();
});

test("renders shared drawer toggles across protected shells on tablet widths", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 1200 });
  await loginAsAdmin(page, "/admin/overview");

  await expect(page.getByTestId("admin-topbar-menu-trigger")).toBeVisible();

  await gotoProtectedRoute(page, "/workspace");
  await expect(page.getByTestId("workspace-topbar-menu-trigger")).toBeVisible();

  await gotoProtectedRoute(page, "/account/profile");
  await expect(page.getByTestId("account-topbar-menu-trigger")).toBeVisible();
});
