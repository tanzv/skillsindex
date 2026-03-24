import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("renders the remaining admin governance routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/apikeys");

  await expect(page.getByRole("heading", { name: "API Keys", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Key Inventory", exact: true })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/integrations");
  await expect(page.getByRole("heading", { name: "Integrations", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connector Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identity Provider Inventory", exact: true })).toBeVisible();
  const connectorCard = page.getByTestId("integration-connector-21");
  await expect(connectorCard).toBeVisible();
  await expect(connectorCard.getByRole("button", { name: "Open Details" })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/organizations");
  await expect(page.getByRole("heading", { name: "Organizations", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Member Ledger", exact: true })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/moderation");
  await expect(page.getByRole("heading", { name: "Moderation", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Moderation Queue", exact: true })).toBeVisible();
});

test("executes admin api key lifecycle actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/apikeys");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Create Key" }).first().click();
  const createPane = page.getByTestId("admin-apikeys-create-pane");
  await expect(createPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await createPane.getByLabel("Create key name").fill("Ops Smoke Key");
  await createPane.getByLabel("Create key purpose").fill("Governance regression coverage");
  await createPane.getByLabel("Create key owner user ID").fill("2");
  await createPane.getByLabel("Create key scopes").fill("skills.search.read");
  await createPane.getByRole("button", { name: "Create Key" }).click();

  await expect(page.getByText("API key created.")).toBeVisible();
  await expect(page.getByText("adm_test_created_key")).toBeVisible();

  const apiKeyCard = page.locator('[data-testid^="admin-apikey-card-"]').filter({ hasText: "Ops Smoke Key" }).first();
  await expect(apiKeyCard).toBeVisible();
  await expect(apiKeyCard).toContainText("Governance regression coverage");
  await apiKeyCard.getByRole("button", { name: "Open Details" }).click();
  const apiKeyDetailPane = page.getByTestId("admin-apikeys-detail-pane");
  await expect(apiKeyDetailPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await apiKeyDetailPane.getByLabel("API key scopes").fill("skills.ai_search.read");
  await apiKeyDetailPane.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for API key/)).toBeVisible();

  await apiKeyDetailPane.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/API key \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("adm_test_rotated_key")).toBeVisible();

  await apiKeyDetailPane.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/API key \d+ revoked\./)).toBeVisible();
  await expect(apiKeyCard).toContainText(/revoked/i);
});

test("executes organization membership actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/organizations");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Create Organization" }).first().click();
  const createPane = page.getByTestId("admin-organizations-create-pane");
  await expect(createPane).toBeVisible();
  await createPane.getByLabel("Organization name").fill("Reliability Guild");
  await createPane.getByRole("button", { name: "Create Organization" }).click();
  await expect(page.getByText("Organization created.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reliability Guild" })).toBeVisible();

  await page.getByRole("button", { name: "Assign Member" }).click();
  const memberPane = page.getByTestId("admin-organizations-member-pane");
  await expect(memberPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await memberPane.getByLabel("Organization member user ID").fill("3");
  await memberPane.getByLabel("Organization member role").selectOption("admin");
  await memberPane.getByRole("button", { name: "Save Member" }).click();
  await expect(page.getByText("Member assignment saved.")).toBeVisible();
  const memberCard = page.getByTestId("organization-member-card-3");
  await expect(memberCard).toContainText("reviewer #3");

  await memberCard.getByRole("button", { name: "Open Details" }).click();
  await expect(memberPane).toContainText("reviewer #3");
  await memberPane.getByLabel("Member role").selectOption("viewer");
  await memberPane.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 3.")).toBeVisible();
  await expect(memberCard).toContainText(/org viewer/i);

  await memberPane.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("User 3 removed.")).toBeVisible();
});

test("executes moderation case creation and resolution", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Open Create Case" }).click();
  const createPane = page.getByTestId("admin-moderation-create-pane");
  await expect(createPane).toBeVisible();
  await createPane.getByLabel("Case reporter user ID").fill("2");
  await createPane.getByLabel("Case skill ID").fill("301");
  await createPane.getByLabel("Case reason code").fill("policy_violation");
  await createPane.getByLabel("Case reason detail").fill("Created by governance e2e coverage.");
  await createPane.getByRole("button", { name: "Create Case" }).click();
  await expect(page.getByText("Moderation case created.")).toBeVisible();

  const caseButton = page.locator('[data-testid^="moderation-case-card-"]').filter({ hasText: "policy_violation" }).first();
  await caseButton.getByRole("button", { name: "Open Details" }).click();
  const detailPane = page.getByTestId("admin-moderation-detail-pane");
  await expect(detailPane).toBeVisible();
  await detailPane.getByLabel("Resolution note").fill("Escalated and hidden.");
  await detailPane.getByRole("button", { name: "Resolve Case" }).click();
  await expect(page.getByText(/Case \d+ resolved\./)).toBeVisible();
});
