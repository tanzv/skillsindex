import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders the remaining workspace routes for an authenticated user", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await expect(page.getByTestId("workspace-shell")).toBeVisible();
  await expect(page.getByTestId("workspace-topbar")).toBeVisible();
  await expect(page.getByTestId("workspace-side-nav")).toBeVisible();
  await expect(page.getByTestId("workspace-related-nav")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workspace Overview", level: 1 })).toBeVisible();
  await expect(page.getByTestId("workspace-overview-summary")).toBeVisible();
  await expect(page.getByTestId("workspace-overview-grid")).toBeVisible();
  await expect(page.getByTestId("workspace-section-workspace-signals")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Activity", exact: true })).toBeVisible();
  await expect(page.getByTestId("workspace-section-current-session")).toBeVisible();
  const topbar = page.getByTestId("workspace-topbar");
  await expect(topbar.getByRole("link", { name: "Overview" })).toBeVisible();
  await expect(topbar.getByRole("link", { name: "Activity" })).toBeVisible();
  await expect(page.getByTestId("workspace-topbar-more")).toBeVisible();
  await page.getByTestId("workspace-topbar-more").click();
  const overflowPanel = page.getByTestId("workspace-topbar-overflow-panel");
  await expect(overflowPanel).toBeVisible();
  await expect(overflowPanel.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  await expect(overflowPanel.getByRole("link", { name: /Categories/i })).toBeVisible();
  await expect(overflowPanel.getByRole("link", { name: /Admin/i })).toBeVisible();
  await page.getByTestId("workspace-topbar-more").click();
  await expect(overflowPanel).not.toBeVisible();

  await page.getByTestId("workspace-side-nav").getByRole("link", { name: /Queue/i }).click();
  await page.waitForURL("**/workspace/queue");
  await expect(page.getByRole("heading", { name: "Queue Execution", level: 1 })).toBeVisible();

  await page.goto("/workspace/activity");
  await expect(page.getByRole("heading", { name: "Activity Feed", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Owner Coverage", exact: true })).toBeVisible();

  await page.goto("/workspace/policy");
  await expect(page.getByRole("heading", { name: "Policy Summary", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Priorities", exact: true })).toBeVisible();

  await page.goto("/workspace/runbook");
  await expect(page.getByRole("heading", { name: "Runbook Preview", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Response Script", exact: true })).toBeVisible();

  await page.goto("/workspace/actions");
  await expect(page.getByRole("heading", { name: "Quick Actions", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Linked Surfaces", exact: true })).toBeVisible();
  await expect(page.getByTestId("workspace-topbar").getByRole("link", { name: "Actions" })).toBeVisible();
  await expect(page.getByTestId("workspace-topbar").getByRole("link", { name: "Actions" })).toHaveAttribute("aria-current", "page");
});

test("executes account security and credential management actions", async ({ page }) => {
  await loginAsAdmin(page, "/account/security");

  await expect(page.getByTestId("account-topbar")).toBeVisible();
  await expect(page.getByTestId("account-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("account-topbar").getByRole("link", { name: "Account", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();

  await page.getByPlaceholder("Current password").fill("Admin123456!");
  await page.getByPlaceholder("New password").fill("Admin654321!");
  await page.getByRole("button", { name: "Change Password" }).click();
  await expect(page.getByText("Password updated.")).toBeVisible();

  await page.getByRole("button", { name: "Revoke Other Sessions" }).click();
  await expect(page.getByText("Other sessions revoked.")).toBeVisible();
  await expect(page.getByText("CLI Session")).toHaveCount(0);

  await page.goto("/account/api-credentials");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();

  await page.getByPlaceholder("Credential name").fill("Smoke Credential");
  await page.getByPlaceholder("Purpose").fill("Extended authenticated coverage");
  await page.getByPlaceholder("Scopes separated by commas").fill("skills.read, skills.search.read");
  await page.getByRole("button", { name: "Create Credential" }).click();
  await expect(page.getByText("Credential created.")).toBeVisible();
  await expect(page.getByText("sk_test_created_key")).toBeVisible();

  const credentialCard = page.locator('[data-testid^="account-credential-card-"]').filter({ hasText: "Smoke Credential" }).first();
  await expect(credentialCard).toBeVisible();
  await expect(credentialCard).toContainText("Extended authenticated coverage");
  const scopesInput = credentialCard.getByPlaceholder("Update scopes");
  await scopesInput.fill("skills.ai_search.read");
  await credentialCard.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for credential/)).toBeVisible();

  await credentialCard.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/Credential \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("sk_test_rotated_key")).toBeVisible();

  await credentialCard.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Credential \d+ revoked\./)).toBeVisible();
  await expect(credentialCard).toContainText("revoked");
});

test("executes admin governance actions and renders additional admin routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/accounts/new");

  await expect(page.getByTestId("admin-topbar")).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Users", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Account Provisioning", level: 1 })).toBeVisible();
  await expect(page.getByText("Registration enabled · Marketplace public")).toBeVisible();
  const allowRegistrationCheckbox = page.getByLabel("Allow registration");
  const marketplacePublicAccessCheckbox = page.getByLabel("Marketplace public access");
  await allowRegistrationCheckbox.setChecked(false);
  await marketplacePublicAccessCheckbox.setChecked(false);
  await expect(allowRegistrationCheckbox).not.toBeChecked();
  await expect(marketplacePublicAccessCheckbox).not.toBeChecked();
  await page.getByRole("button", { name: "Save Policy" }).click();
  await expect(page.getByText("Provisioning policy updated.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Allow registration")).not.toBeChecked();
  await expect(page.getByLabel("Marketplace public access")).not.toBeChecked();

  await page.goto("/admin/accounts");
  await expect(page.getByRole("heading", { name: "Accounts", level: 1 })).toBeVisible();
  await page.getByLabel("Search accounts").fill("operator");
  await page.getByLabel("Target user ID").fill("2");
  await page.getByLabel("Target account status").selectOption("disabled");
  await page.getByRole("button", { name: "Apply Status" }).click();
  await expect(page.getByText("Account 2 status updated.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText("disabled");

  await page.getByRole("button", { name: "Force Sign-out" }).click();
  await expect(page.getByText("Force sign-out requested for user 2.")).toBeVisible();

  await page.getByLabel("Target new password").fill("Operator987654!");
  await page.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Password rotated for user 2.")).toBeVisible();

  await page.goto("/admin/roles");
  await expect(page.getByRole("heading", { name: "Roles", level: 1 })).toBeVisible();
  await page.getByLabel("Search accounts").fill("operator");
  await page.getByLabel("Role target user ID").fill("2");
  await page.getByLabel("Target role").selectOption("auditor");
  await page.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 2.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText("auditor");

  await page.goto("/admin/records/imports");
  await expect(page.getByRole("heading", { name: "Import Records", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Import job 81 retry requested.")).toBeVisible();
  const runningJob = page.getByTestId("import-job-card-82");
  await runningJob.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Import job 82 cancel requested.")).toBeVisible();

  await page.goto("/admin/ops/alerts");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Operations", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Operations Alerts", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alert Queue", exact: true })).toBeVisible();
  await expect(page.getByText("sync_failures")).toBeVisible();

  await page.goto("/admin/ops/release-gates");
  await expect(page.getByRole("heading", { name: "Release Gates", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gate Checks", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run Gates" }).click();
  await expect(page.getByText("Release gates executed.")).toBeVisible();
});
