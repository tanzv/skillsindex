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

  await page.getByLabel("Search accounts").fill("reviewer");
  await expect(page.getByTestId("admin-access-account-3")).toBeVisible();
  await expect(page.getByTestId("admin-access-account-1")).toHaveCount(0);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByTestId("admin-access-account-1")).toBeVisible();

  await page.getByRole("button", { name: "Open Policy Panel" }).click();
  const policyDialog = page.getByRole("dialog", { name: "Access Policy" });
  await policyDialog.getByLabel("Allow registration").uncheck();
  await policyDialog.getByLabel("Marketplace public access").uncheck();
  await policyDialog.getByLabel("Provider google").check();
  await policyDialog.getByRole("button", { name: "Save Access Policy" }).click();
  await expect(page.getByText("Access policy updated.")).toBeVisible();
  await policyDialog.getByRole("button", { name: "Close Panel" }).click();
  await expect(policyDialog).toHaveCount(0);

  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByText("Registration disabled")).toBeVisible();
  await expect(page.getByText("Marketplace private")).toBeVisible();
  await expect(page.getByText("password, github, google")).toBeVisible();

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

test("persists marketplace ranking settings from the admin access policy drawer", async ({ page }) => {
  await loginAsAdmin(page, "/admin/access");

  await page.getByRole("button", { name: "Open Policy Panel" }).click();
  const policyDialog = page.getByRole("dialog", { name: "Access Policy" });

  await policyDialog.getByLabel("Default ranking sort").selectOption("quality");
  await policyDialog.getByLabel("Ranking limit").fill("7");
  await policyDialog.getByLabel("Highlight limit").fill("2");
  await policyDialog.getByLabel("Category leader limit").fill("4");
  await policyDialog.getByRole("button", { name: "Save Access Policy" }).click();

  await expect(page.getByText("Access policy updated.")).toBeVisible();
  await policyDialog.getByRole("button", { name: "Close Panel" }).click();
  await expect(policyDialog).toHaveCount(0);

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
  const reloadedPolicyDialog = page.getByRole("dialog", { name: "Access Policy" });
  await expect(reloadedPolicyDialog.getByLabel("Default ranking sort")).toHaveValue("quality");
  await expect(reloadedPolicyDialog.getByLabel("Ranking limit")).toHaveValue("7");
  await expect(reloadedPolicyDialog.getByLabel("Highlight limit")).toHaveValue("2");
  await expect(reloadedPolicyDialog.getByLabel("Category leader limit")).toHaveValue("4");
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

test("opens integration details in a drawer without breaking ledger filtering", async ({ page }) => {
  await loginAsAdmin(page, "/admin/integrations");

  const webhookLedger = page.getByTestId("integration-webhook-ledger");
  await page.getByTestId("integration-connector-21").click();
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  const connectorCard = page.getByTestId("integration-connector-21");
  await connectorCard.getByRole("button", { name: "Open Details" }).click();

  const detailDialog = page.getByRole("dialog", { name: "GitHub App" });
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog.getByRole("button", { name: "Close Panel" })).toBeVisible();
  await expect(detailDialog).toContainText("Provider: github");
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).toContainText("repository.sync.failed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  await detailDialog.getByRole("button", { name: "Close Panel" }).click();
  await expect(detailDialog).toHaveCount(0);
  await expect(webhookLedger).toContainText("repository.sync.completed");
  await expect(webhookLedger).not.toContainText("ops.alert.triggered");

  await page.getByRole("button", { name: "Clear Selection" }).click();
  await page.getByLabel("Search connectors").fill("Ops Webhook");
  await expect(page.getByTestId("integration-connector-22")).toBeVisible();
  await expect(page.getByTestId("integration-connector-21")).toHaveCount(0);

  const opsConnectorCard = page.getByTestId("integration-connector-22");
  await opsConnectorCard.getByRole("button", { name: "Open Details" }).click();
  const opsDetailDialog = page.getByRole("dialog", { name: "Ops Webhook" });
  await expect(opsDetailDialog).toBeVisible();
  await opsDetailDialog.getByRole("button", { name: "Close Panel" }).click();
  await expect(page.getByTestId("integration-connector-22")).toBeVisible();
  await expect(page.getByTestId("integration-connector-21")).toHaveCount(0);
});

test("rejects a moderation case from the moderation workspace", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");

  const moderationCase = page.getByTestId("moderation-case-card-61");
  await moderationCase.getByRole("button", { name: "Open Details" }).click();
  const detailDialog = page.getByRole("dialog", { name: "Case #61" });
  await detailDialog.getByLabel("Rejection note").fill("Rejected during moderation regression coverage.");
  await detailDialog.getByRole("button", { name: "Reject Case" }).click();

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
