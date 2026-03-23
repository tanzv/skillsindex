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

  await page.getByRole("button", { name: "Create Key" }).first().click();
  await page.getByLabel("Create key name").fill("Ops Smoke Key");
  await page.getByLabel("Create key purpose").fill("Governance regression coverage");
  await page.getByLabel("Create key owner user ID").fill("2");
  await page.getByLabel("Create key scopes").fill("skills.search.read");
  await page.getByRole("dialog").getByRole("button", { name: "Create Key" }).click();

  await expect(page.getByText("API key created.")).toBeVisible();
  await expect(page.getByText("adm_test_created_key")).toBeVisible();

  const apiKeyCard = page.locator('[data-testid^="admin-apikey-card-"]').filter({ hasText: "Ops Smoke Key" }).first();
  await expect(apiKeyCard).toBeVisible();
  await expect(apiKeyCard).toContainText("Governance regression coverage");
  await apiKeyCard.getByRole("button", { name: "Open Details" }).click();
  const apiKeyDetailDialog = page.getByRole("dialog", { name: "Ops Smoke Key" });
  await apiKeyDetailDialog.getByLabel("API key scopes").fill("skills.ai_search.read");
  await apiKeyDetailDialog.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for API key/)).toBeVisible();

  await apiKeyDetailDialog.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/API key \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("adm_test_rotated_key")).toBeVisible();

  await apiKeyDetailDialog.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/API key \d+ revoked\./)).toBeVisible();
  await expect(apiKeyCard).toContainText(/revoked/i);
});

test("executes organization membership actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/organizations");

  await page.getByRole("button", { name: "Create Organization" }).first().click();
  const createDialog = page.getByRole("dialog", { name: "Create Organization" });
  await createDialog.getByLabel("Organization name").fill("Reliability Guild");
  await createDialog.getByRole("button", { name: "Create Organization" }).click();
  await expect(page.getByText("Organization created.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reliability Guild" })).toBeVisible();

  await page.getByRole("button", { name: "Assign Member" }).click();
  const memberDialog = page.getByRole("dialog", { name: "Member Assignment" });
  await memberDialog.getByLabel("Organization member user ID").fill("3");
  await memberDialog.getByLabel("Organization member role").selectOption("admin");
  await memberDialog.getByRole("button", { name: "Save Member" }).click();
  await expect(page.getByText("Member assignment saved.")).toBeVisible();
  const memberCard = page.getByTestId("organization-member-card-3");
  await expect(memberCard).toContainText("reviewer #3");

  await memberCard.getByRole("button", { name: "Open Details" }).click();
  const memberDetailDialog = page.getByRole("dialog", { name: "reviewer #3" });
  await memberDetailDialog.getByLabel("Member role").selectOption("viewer");
  await memberDetailDialog.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 3.")).toBeVisible();
  await expect(memberCard).toContainText(/org viewer/i);

  await memberDetailDialog.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("User 3 removed.")).toBeVisible();
});

test("executes moderation case creation and resolution", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");

  await page.getByRole("button", { name: "Open Create Case" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create Case" });
  await createDialog.getByLabel("Case reporter user ID").fill("2");
  await createDialog.getByLabel("Case skill ID").fill("301");
  await createDialog.getByLabel("Case reason code").fill("policy_violation");
  await createDialog.getByLabel("Case reason detail").fill("Created by governance e2e coverage.");
  await createDialog.getByRole("button", { name: "Create Case" }).click();
  await expect(page.getByText("Moderation case created.")).toBeVisible();

  const caseButton = page.locator('[data-testid^="moderation-case-card-"]').filter({ hasText: "policy_violation" }).first();
  await caseButton.getByRole("button", { name: "Open Details" }).click();
  const detailDialog = page.getByRole("dialog", { name: /Case #/ });
  await detailDialog.getByLabel("Resolution note").fill("Escalated and hidden.");
  await detailDialog.getByRole("button", { name: "Resolve Case" }).click();
  await expect(page.getByText(/Case \d+ resolved\./)).toBeVisible();
});
