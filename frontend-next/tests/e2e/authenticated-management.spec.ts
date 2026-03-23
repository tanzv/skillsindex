import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 180_000 });

test("renders the remaining workspace routes for an authenticated user", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await expect(page.getByTestId("workspace-shell")).toBeVisible();
  await expect(page.getByTestId("workspace-topbar")).toBeVisible();
  await expect(page.getByTestId("workspace-side-nav")).toBeVisible();
  await expect(page.getByTestId("workspace-secondary-sidebar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workspace Overview", level: 1 })).toBeVisible();
  await expect(page.getByTestId("workspace-overview-summary")).toBeVisible();
  await expect(page.getByTestId("workspace-overview-grid")).toBeVisible();
  await expect(page.getByTestId("workspace-section-workspace-signals")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Activity", exact: true })).toBeVisible();
  await expect(page.getByTestId("workspace-section-current-session")).toBeVisible();
  const topbarNavRow = page.getByTestId("workspace-topbar-nav-row");
  await expect(topbarNavRow.getByRole("link", { name: "Workspace", exact: true })).toBeVisible();
  await expect(topbarNavRow.getByRole("link", { name: "Skills", exact: true })).toBeVisible();
  await expect(topbarNavRow.getByRole("link", { name: "Organizations", exact: true })).toBeVisible();
  await expect(topbarNavRow.getByRole("link", { name: "Administration", exact: true })).toBeVisible();

  await page.getByTestId("workspace-side-nav").getByRole("link", { name: /Queue/i }).click();
  await page.waitForURL("**/workspace/queue");
  await expect(page.getByRole("heading", { name: "Queue Execution", level: 1 })).toBeVisible();

  await gotoProtectedRoute(page, "/workspace/activity");
  await expect(page.getByRole("heading", { name: "Activity Feed", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Owner Coverage", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Details" }).first()).toBeVisible();

  await gotoProtectedRoute(page, "/workspace/policy");
  await expect(page.getByRole("heading", { name: "Policy Summary", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Priorities", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Details" }).first()).toBeVisible();

  await gotoProtectedRoute(page, "/workspace/runbook");
  await expect(page.getByRole("heading", { name: "Runbook Preview", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Details" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Escalation Checklist", exact: true })).toBeVisible();

  await gotoProtectedRoute(page, "/workspace/actions");
  await expect(page.getByRole("heading", { name: "Quick Actions", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Linked Surfaces", exact: true })).toBeVisible();
  await expect(topbarNavRow.getByRole("link", { name: "Workspace", exact: true })).toHaveAttribute("aria-current", "page");
});

test("opens workspace detail drawers across queue, activity, policy, and runbook routes", async ({ page }) => {
  await loginAsAdmin(page, "/workspace/queue");

  await page.getByRole("button", { name: "Open Details" }).first().click();
  const queueDialog = page.getByRole("dialog");
  await expect(queueDialog).toBeVisible();
  await expect(queueDialog.getByRole("link", { name: "Open Skill Detail" })).toBeVisible();
  await page.getByRole("button", { name: "Close Panel" }).click();
  await expect(queueDialog).toHaveCount(0);

  await gotoProtectedRoute(page, "/workspace/activity");
  await page.getByRole("button", { name: "Open Details" }).first().click();
  const activityDialog = page.getByRole("dialog");
  await expect(activityDialog).toBeVisible();
  await expect(activityDialog.getByRole("link", { name: "Open Queue" })).toBeVisible();
  await page.getByRole("button", { name: "Close Panel" }).click();
  await expect(activityDialog).toHaveCount(0);

  await gotoProtectedRoute(page, "/workspace/policy");
  await page.getByRole("button", { name: "Open Details" }).first().click();
  const policyDialog = page.getByRole("dialog");
  await expect(policyDialog).toBeVisible();
  await expect(policyDialog.getByRole("link", { name: "Open Queue" })).toBeVisible();
  await page.getByRole("button", { name: "Close Panel" }).click();
  await expect(policyDialog).toHaveCount(0);

  await gotoProtectedRoute(page, "/workspace/runbook");
  await page.getByRole("button", { name: "Open Details" }).first().click();
  const runbookDialog = page.getByRole("dialog");
  await expect(runbookDialog).toBeVisible();
  await expect(runbookDialog.getByRole("heading", { name: "Response Script", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close Panel" }).click();
  await expect(runbookDialog).toHaveCount(0);
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

  await gotoProtectedRoute(page, "/account/api-credentials");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Create Credential" }).click();
  const createCredentialDialog = page.getByRole("dialog", { name: "Credential Factory" });
  await createCredentialDialog.getByPlaceholder("Credential name").fill("Smoke Credential");
  await createCredentialDialog.getByPlaceholder("Purpose").fill("Extended authenticated coverage");
  await createCredentialDialog.getByPlaceholder("Scopes separated by commas").fill("skills.read, skills.search.read");
  await createCredentialDialog.getByRole("button", { name: "Create Credential" }).click();
  await expect(page.getByText("Credential created.")).toBeVisible();
  await expect(page.getByText("sk_test_created_key")).toBeVisible();

  const credentialCard = page.locator('[data-testid^="account-credential-card-"]').filter({ hasText: "Smoke Credential" }).first();
  await expect(credentialCard).toBeVisible();
  await expect(credentialCard).toContainText("Extended authenticated coverage");
  await credentialCard.getByRole("button", { name: "Open Details" }).click();
  const credentialDetailDialog = page.getByRole("dialog", { name: "Smoke Credential" });
  const scopesInput = credentialDetailDialog.getByPlaceholder("Update scopes");
  await scopesInput.fill("skills.ai_search.read");
  await credentialDetailDialog.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for credential/)).toBeVisible();

  await credentialDetailDialog.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/Credential \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("sk_test_rotated_key")).toBeVisible();

  await credentialDetailDialog.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Credential \d+ revoked\./)).toBeVisible();
  await expect(credentialCard).toContainText(/revoked/i);
});

test("executes admin governance actions and renders additional admin routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/accounts/new");

  await expect(page.getByTestId("admin-topbar")).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Marketplace", exact: true })).toBeVisible();
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Organizations", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByTestId("admin-topbar-account-trigger").click();
  const accountCenterMenu = page.getByTestId("admin-topbar-account-menu");
  await expect(accountCenterMenu).toBeVisible();
  await expect(accountCenterMenu.getByRole("button", { name: /Access/i })).toBeVisible();
  await expect(accountCenterMenu.getByRole("button", { name: /Roles/i })).toBeVisible();
  await expect(accountCenterMenu.getByRole("button", { name: /Integrations/i })).toBeVisible();
  await accountCenterMenu.getByRole("button", { name: /Access/i }).click();
  const accessEntryDialog = page.getByRole("dialog", { name: "Access" });
  await expect(accessEntryDialog).toBeVisible();
  await expect(accessEntryDialog.getByText("/admin/access")).toBeVisible();
  await accessEntryDialog.getByRole("button", { name: "Close account center" }).click();
  await expect(accessEntryDialog).not.toBeVisible();
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

  await gotoProtectedRoute(page, "/admin/accounts");
  await expect(page.getByRole("heading", { name: "Accounts", level: 1 })).toBeVisible();
  await page.getByLabel("Search accounts").fill("operator");
  const accountActionDialog = page.getByRole("dialog", { name: "Account Actions" });
  await accountActionDialog.getByLabel("Target user ID").fill("2");
  await accountActionDialog.getByLabel("Target account status").selectOption("disabled");
  await accountActionDialog.getByRole("button", { name: "Apply Status" }).click();
  await expect(page.getByText("Account 2 status updated.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/disabled/i);

  await accountActionDialog.getByRole("button", { name: "Force Sign-out" }).click();
  await expect(page.getByText("Force sign-out requested for user 2.")).toBeVisible();

  await accountActionDialog.getByLabel("Target new password").fill("Operator987654!");
  await accountActionDialog.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Password rotated for user 2.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/roles");
  await expect(page.getByRole("heading", { name: "Roles", level: 1 })).toBeVisible();
  await page.getByLabel("Search accounts").fill("operator");
  const roleActionDialog = page.getByRole("dialog", { name: "Role Assignment" });
  await roleActionDialog.getByLabel("Role target user ID").fill("2");
  await roleActionDialog.getByLabel("Target role").selectOption("auditor");
  await roleActionDialog.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 2.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/auditor/i);

  await gotoProtectedRoute(page, "/admin/records/imports");
  await expect(page.getByRole("heading", { name: "Import Records", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Import job 81 retry requested.")).toBeVisible();
  const runningJob = page.getByTestId("import-job-card-82");
  await runningJob.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Import job 82 cancel requested.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ops/alerts");
  await expect(page.getByTestId("admin-topbar").getByRole("link", { name: "Administration", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Operations Alerts", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alert Queue", exact: true })).toBeVisible();
  await expect(page.getByText("sync_failures")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ops/release-gates");
  await expect(page.getByRole("heading", { name: "Release Gates", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gate Checks", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run Gates" }).click();
  await expect(page.getByText("Release gates executed.")).toBeVisible();
});

test("opens the workspace navigation drawer on tablet widths", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 1200 });
  await loginAsAdmin(page, "/workspace");

  const toggle = page.getByTestId("workspace-topbar-menu-trigger");
  await expect(toggle).toBeVisible();
  await toggle.click();

  const drawer = page.getByTestId("workspace-side-nav-drawer");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: /Queue/i }).click();
  await page.waitForURL("**/workspace/queue");
  await expect(page.getByRole("heading", { name: "Queue Execution", level: 1 })).toBeVisible();
});

test("keeps the protected navigation on the header leading side and the account menu on the trailing side", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await loginAsAdmin(page, "/admin/overview");

  const headerRow = page.getByTestId("admin-topbar-header-row");
  const navRow = page.getByTestId("admin-topbar-nav-row");
  const utilityRow = page.getByTestId("admin-topbar-utility");
  const accountTrigger = page.getByTestId("admin-topbar-account-trigger");

  await expect(headerRow).toBeVisible();
  await expect(navRow).toBeVisible();
  await expect(utilityRow).toBeVisible();
  await expect(accountTrigger).toBeVisible();

  const headerBox = await headerRow.boundingBox();
  const navBox = await navRow.boundingBox();
  const accountBox = await accountTrigger.boundingBox();

  expect(headerBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  expect(accountBox).not.toBeNull();

  if (!headerBox || !navBox || !accountBox) {
    return;
  }

  expect(navBox.y).toBeGreaterThanOrEqual(headerBox.y - 2);
  expect(navBox.y + navBox.height).toBeLessThanOrEqual(headerBox.y + headerBox.height + 2);
  expect(navBox.width).toBeGreaterThan(280);
  expect(accountBox.x).toBeGreaterThan(navBox.x + navBox.width);
  await expect(utilityRow.getByRole("link", { name: "Marketplace" })).toBeVisible();
});

test("uses the right account avatar as the protected personal center trigger", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await loginAsAdmin(page, "/workspace");

  const shell = page.getByTestId("workspace-shell");
  const trigger = page.getByTestId("workspace-topbar-account-trigger");
  const menu = page.getByTestId("workspace-topbar-account-menu");
  const navRow = page.getByTestId("workspace-topbar-nav-row");

  await expect(trigger).toBeVisible();
  const triggerBox = await trigger.boundingBox();
  const navBox = await navRow.boundingBox();

  expect(triggerBox).not.toBeNull();
  expect(navBox).not.toBeNull();

  if (!triggerBox || !navBox) {
    return;
  }

  expect(triggerBox.x).toBeGreaterThan(navBox.x + navBox.width);
  expect(triggerBox.width).toBeGreaterThanOrEqual(40);
  expect(triggerBox.width).toBeLessThan(70);
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("button", { name: /Profile/i })).toBeVisible();
  await expect(menu.getByRole("button", { name: /Security/i })).toBeVisible();
  await expect(menu.getByRole("button", { name: /Sessions/i })).toBeVisible();
  await expect(menu.getByRole("button", { name: /API Credentials/i })).toBeVisible();
  await menu.getByRole("button", { name: /Profile/i }).click();

  const profileEntryDialog = page.getByRole("dialog", { name: "Profile" });
  await expect(profileEntryDialog).toBeVisible();
  await expect(profileEntryDialog.getByRole("button", { name: "Open Profile" })).toBeVisible();
  await expect(profileEntryDialog.getByText("/account/profile")).toBeVisible();
  await profileEntryDialog.getByRole("button", { name: "Close account center" }).click();
  await expect(profileEntryDialog).not.toBeVisible();

  await page.getByTestId("workspace-topbar-theme-dark").click();
  await expect(shell).toHaveAttribute("data-protected-theme", "dark");

  await page.getByTestId("workspace-topbar-theme-light").click();
  await expect(shell).toHaveAttribute("data-protected-theme", "light");
});
