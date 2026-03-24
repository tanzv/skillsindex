import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("redirects /admin to overview and keeps overview quick links working", async ({ page }) => {
  await loginAsAdmin(page, "/admin/overview");

  await gotoProtectedRoute(page, "/admin", "/admin/overview");
  await expect(page.getByRole("heading", { name: "Admin Overview", level: 1 })).toBeVisible();
  await expect(page.getByTestId("admin-overview-nav-grid")).toBeVisible();

  await page.getByTestId("admin-overview-nav-grid").getByRole("link", { name: /Skill Governance/i }).click();
  await page.waitForURL("**/admin/skills");
  await expect(page.getByRole("heading", { name: "Skill Governance", level: 1 })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/overview");
  await page.getByTestId("admin-overview-nav-grid").getByRole("link", { name: /Repository Intake/i }).click();
  await page.waitForURL("**/admin/ingestion/repository");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/overview");
  await page.getByTestId("admin-overview-nav-grid").getByRole("link", { name: /Access Control/i }).click();
  await page.waitForURL("**/admin/access");
  await expect(page.getByRole("heading", { name: "Access", level: 1 })).toBeVisible();
});

test("covers admin access filtering and catalog read contracts", async ({ page }) => {
  await loginAsAdmin(page, "/admin/access");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Search accounts").fill("reviewer");
  await expect(page.getByTestId("admin-access-account-3")).toBeVisible();
  await expect(page.getByTestId("admin-access-account-1")).toHaveCount(0);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByTestId("admin-access-account-1")).toBeVisible();

  await page.getByRole("button", { name: "Open Policy Panel" }).click();
  const policyPane = page.getByTestId("admin-access-policy-pane");
  await expect(policyPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await policyPane.getByLabel("Allow registration").uncheck();
  await policyPane.getByLabel("Marketplace public access").uncheck();
  await policyPane.getByLabel("Provider google").check();
  await policyPane.getByRole("button", { name: "Save Access Policy" }).click();
  await expect(page.getByText("Access policy updated.")).toBeVisible();
  await policyPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(policyPane).toHaveCount(0);

  await page.getByRole("button", { name: "Refresh" }).click();
  const enabledProviders = page.getByTestId("admin-access-enabled-providers");
  await expect(page.getByText("Registration disabled")).toBeVisible();
  await expect(page.getByText("Marketplace private")).toBeVisible();
  await expect(enabledProviders).toContainText("password");
  await expect(enabledProviders).toContainText("github");
  await expect(enabledProviders).toContainText("google");

  await gotoProtectedRoute(page, "/admin/skills");
  await page.getByLabel("Catalog keyword").fill("Repository");
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByTestId("admin-catalog-row-201")).toBeVisible();
  await expect(page.getByText("Recovery Drill Planner")).toHaveCount(0);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText("Recovery Drill Planner")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/sync-jobs");
  await expect(page.getByTestId("admin-catalog-row-71")).toContainText(/success/i);
  await expect(page.getByTestId("admin-catalog-row-72")).toContainText(/failed/i);
});

test("opens admin job and sync run details in inline work panes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/jobs");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const jobRow = page.locator('[data-testid^="admin-catalog-row-"]').first();
  await expect(jobRow).toBeVisible();
  await jobRow.getByRole("button", { name: "Open Details" }).click();

  const jobPane = page.getByTestId("admin-jobs-detail-pane");
  await expect(jobPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(jobPane.getByRole("button", { name: "Close Panel" })).toBeVisible();
  await jobPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(jobPane).toHaveCount(0);

  await gotoProtectedRoute(page, "/admin/sync-jobs");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const syncRunRow = page.locator('[data-testid^="admin-catalog-row-"]').first();
  await expect(syncRunRow).toBeVisible();
  await syncRunRow.getByRole("button", { name: "Open Details" }).click();

  const syncRunPane = page.getByTestId("admin-sync-runs-detail-pane");
  await expect(syncRunPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(syncRunPane.getByRole("link", { name: "Open Sync Policy" })).toBeVisible();
});

test("persists marketplace ranking settings from the admin access policy drawer", async ({ page }) => {
  await loginAsAdmin(page, "/admin/access");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Open Policy Panel" }).click();
  const policyPane = page.getByTestId("admin-access-policy-pane");
  await expect(policyPane).toBeVisible();

  await policyPane.getByLabel("Default ranking sort").selectOption("quality");
  await policyPane.getByLabel("Ranking limit").fill("7");
  await policyPane.getByLabel("Highlight limit").fill("2");
  await policyPane.getByLabel("Category leader limit").fill("4");
  await policyPane.getByRole("button", { name: "Save Access Policy" }).click();

  await expect(page.getByText("Access policy updated.")).toBeVisible();
  await policyPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(policyPane).toHaveCount(0);

  await expect(page.getByTestId("admin-access-ranking-default-sort")).toContainText("Quality");
  await expect(page.getByTestId("admin-access-ranking-limit")).toContainText("7");
  await expect(page.getByTestId("admin-access-highlight-limit")).toContainText("2");
  await expect(page.getByTestId("admin-access-category-leader-limit")).toContainText("4");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Access", level: 1 })).toBeVisible();
  await expect(page.getByTestId("admin-access-ranking-default-sort")).toContainText("Quality");
  await expect(page.getByTestId("admin-access-ranking-limit")).toContainText("7");
  await expect(page.getByTestId("admin-access-highlight-limit")).toContainText("2");
  await expect(page.getByTestId("admin-access-category-leader-limit")).toContainText("4");

  await page.getByRole("button", { name: "Open Policy Panel" }).click();
  const reloadedPolicyPane = page.getByTestId("admin-access-policy-pane");
  await expect(reloadedPolicyPane).toBeVisible();
  await expect(reloadedPolicyPane.getByLabel("Default ranking sort")).toHaveValue("quality");
  await expect(reloadedPolicyPane.getByLabel("Ranking limit")).toHaveValue("7");
  await expect(reloadedPolicyPane.getByLabel("Highlight limit")).toHaveValue("2");
  await expect(reloadedPolicyPane.getByLabel("Category leader limit")).toHaveValue("4");
});

test("filters integrations by selection and search", async ({ page }) => {
  await loginAsAdmin(page, "/admin/integrations");

  const webhookLedger = page.getByTestId("integration-webhook-ledger");
  await expect(webhookLedger).toContainText("ops.alert.triggered");

  await page.getByTestId("integration-connector-21").click();
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).toContainText("repository.sync.failed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  await page.getByRole("button", { name: "Clear Selection" }).click();
  await expect(webhookLedger).toContainText("ops.alert.triggered");

  await page.getByLabel("Search connectors").fill("Ops Webhook");
  await expect(page.getByTestId("integration-connector-22")).toBeVisible();
  await expect(page.getByTestId("integration-connector-21")).toHaveCount(0);
});

test("opens integration details in an inline work pane without breaking ledger filtering", async ({ page }) => {
  await loginAsAdmin(page, "/admin/integrations");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const webhookLedger = page.getByTestId("integration-webhook-ledger");
  await page.getByTestId("integration-connector-21").click();
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  const connectorCard = page.getByTestId("integration-connector-21");
  await connectorCard.getByRole("button", { name: "Open Details" }).click();

  const detailPane = page.getByTestId("admin-integrations-detail-pane");
  await expect(detailPane).toBeVisible();
  await expect(detailPane.getByRole("button", { name: "Close Panel" })).toBeVisible();
  await expect(detailPane).toContainText("Provider: github");
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).toContainText("repository.sync.failed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  await detailPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(detailPane).toHaveCount(0);
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  await page.getByRole("button", { name: "Clear Selection" }).click();
  await page.getByLabel("Search connectors").fill("Ops Webhook");
  await expect(page.getByTestId("integration-connector-22")).toBeVisible();
  await expect(page.getByTestId("integration-connector-21")).toHaveCount(0);

  const opsConnectorCard = page.getByTestId("integration-connector-22");
  await opsConnectorCard.getByRole("button", { name: "Open Details" }).click();
  await expect(detailPane).toBeVisible();
  await expect(detailPane).toContainText("Provider: webhook");
  await detailPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(page.getByTestId("integration-connector-22")).toBeVisible();
  await expect(page.getByTestId("integration-connector-21")).toHaveCount(0);
});

test("rejects a moderation case from the moderation workspace", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const moderationCase = page.getByTestId("moderation-case-card-61");
  await moderationCase.getByRole("button", { name: "Open Details" }).click();
  const detailPane = page.getByTestId("admin-moderation-detail-pane");
  await detailPane.getByLabel("Rejection note").fill("Rejected during moderation regression coverage.");
  await detailPane.getByRole("button", { name: "Reject Case" }).click();

  await expect(page.getByText("Case 61 rejected.")).toBeVisible();
  await expect(moderationCase).toContainText("rejected");
});

test("syncs a repository skill from the admin skills workspace", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  const repositorySkill = page.getByTestId("admin-catalog-row-201");
  await expect(repositorySkill).toContainText("9.0 quality");
  await repositorySkill.getByRole("button", { name: "Sync now" }).click();

  await expect(page.getByText("Repository skill updated.")).toBeVisible();
  await expect(repositorySkill).toContainText("9.4 quality");
});
