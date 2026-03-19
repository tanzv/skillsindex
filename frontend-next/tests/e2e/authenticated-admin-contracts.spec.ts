import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("redirects /admin to overview and keeps overview quick links working", async ({ page }) => {
  await loginAsAdmin(page, "/admin/overview");

  await page.goto("/admin");
  await page.waitForURL("**/admin/overview");
  await expect(page.getByRole("heading", { name: "Admin Overview", level: 1 })).toBeVisible();
  await expect(page.getByTestId("admin-overview-nav-grid")).toBeVisible();

  await page.getByTestId("admin-overview-nav-grid").getByRole("link", { name: /Skill Governance/i }).click();
  await page.waitForURL("**/admin/skills");
  await expect(page.getByRole("heading", { name: "Skill Governance", level: 1 })).toBeVisible();

  await page.goto("/admin/overview");
  await page.getByTestId("admin-overview-nav-grid").getByRole("link", { name: /Repository Intake/i }).click();
  await page.waitForURL("**/admin/ingestion/repository");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();

  await page.goto("/admin/overview");
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

  await page.getByLabel("Allow registration").uncheck();
  await page.getByLabel("Marketplace public access").uncheck();
  await page.getByLabel("Provider google").check();
  await page.getByRole("button", { name: "Save Access Policy" }).click();
  await expect(page.getByText("Access policy updated.")).toBeVisible();

  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByText("Registration disabled")).toBeVisible();
  await expect(page.getByText("Marketplace private")).toBeVisible();
  await expect(page.getByText("password, github, google")).toBeVisible();

  await page.goto("/admin/skills");
  await page.getByLabel("Catalog keyword").fill("Repository");
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByTestId("admin-catalog-row-201")).toBeVisible();
  await expect(page.getByText("Recovery Drill Planner")).toHaveCount(0);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText("Recovery Drill Planner")).toBeVisible();

  await page.goto("/admin/sync-jobs");
  await expect(page.getByTestId("admin-catalog-row-71")).toContainText(/success/i);
  await expect(page.getByTestId("admin-catalog-row-72")).toContainText(/failed/i);
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

test("rejects a moderation case from the moderation workspace", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");

  const moderationCase = page.getByTestId("moderation-case-card-61");
  await moderationCase.click();
  await page.getByLabel("Rejection note").fill("Rejected during moderation regression coverage.");
  await page.getByRole("button", { name: "Reject Case" }).click();

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
