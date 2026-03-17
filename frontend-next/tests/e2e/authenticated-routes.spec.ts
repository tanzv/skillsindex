import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("renders authenticated admin, workspace, and account routes", async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("admin-side-nav")).toBeVisible();
  await expect(page.getByTestId("admin-topbar")).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Overview", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Admin Overview", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Capability Envelope", exact: true })).toBeVisible();

  await page.goto("/admin/access");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Users", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Access", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Account Directory", exact: true })).toBeVisible();

  await page.goto("/admin/ingestion/repository");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Catalog", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scheduler Policy", exact: true })).toBeVisible();

  await page.goto("/admin/ops/metrics");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Operations", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Operations Metrics", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Telemetry Context", exact: true })).toBeVisible();

  await page.goto("/workspace/queue");
  await expect(page.getByTestId("workspace-topbar").getByRole("link", { name: "Queue", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Queue Execution", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Execution Spotlight", exact: true })).toBeVisible();

  await page.goto("/account/profile");
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

  const displayNameInput = page.getByPlaceholder("Display name");
  const nextDisplayName = `Admin Operator ${Date.now()}`;

  await expect(displayNameInput).toHaveValue(/.+/);
  await displayNameInput.fill(nextDisplayName);
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();
  await expect(displayNameInput).toHaveValue(nextDisplayName);

  await page.goto("/admin/ingestion/manual");
  await expect(page.getByRole("heading", { name: "Manual Intake", level: 1 })).toBeVisible();
  await page.getByLabel("Name").fill("Manual Smoke Skill");
  await page.getByLabel("Description").fill("Created during authenticated UI smoke.");
  await page.getByLabel("Content").fill("# Manual Smoke Skill");
  await page.getByRole("button", { name: "Create Manual Skill" }).click();
  await expect(page.getByText("Manual skill created.")).toBeVisible();
  await expect(page.getByText("Manual Smoke Skill")).toBeVisible();
});
