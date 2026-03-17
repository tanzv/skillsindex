import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders the remaining admin governance routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/apikeys");

  await expect(page.getByRole("heading", { name: "API Keys", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Key Inventory", exact: true })).toBeVisible();

  await page.goto("/admin/integrations");
  await expect(page.getByRole("heading", { name: "Integrations", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connector Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /GitHub App/i })).toBeVisible();

  await page.goto("/admin/organizations");
  await expect(page.getByRole("heading", { name: "Organizations", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Member Ledger", exact: true })).toBeVisible();

  await page.goto("/admin/moderation");
  await expect(page.getByRole("heading", { name: "Moderation", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Moderation Queue", exact: true })).toBeVisible();
});

test("executes admin api key lifecycle actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/apikeys");

  await page.getByLabel("Create key name").fill("Ops Smoke Key");
  await page.getByLabel("Create key purpose").fill("Governance regression coverage");
  await page.getByLabel("Create key owner user ID").fill("2");
  await page.getByLabel("Create key scopes").fill("skills.search.read");
  await page.getByRole("button", { name: "Create Key" }).click();

  await expect(page.getByText("API key created.")).toBeVisible();
  await expect(page.getByText("adm_test_created_key")).toBeVisible();

  const apiKeyCard = page.locator('[data-testid^="admin-apikey-card-"]').filter({ hasText: "Ops Smoke Key" }).first();
  await expect(apiKeyCard).toBeVisible();
  await expect(apiKeyCard).toContainText("Governance regression coverage");
  await apiKeyCard.getByLabel("API key scopes").fill("skills.ai_search.read");
  await apiKeyCard.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for API key/)).toBeVisible();

  await apiKeyCard.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/API key \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("adm_test_rotated_key")).toBeVisible();

  await apiKeyCard.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/API key \d+ revoked\./)).toBeVisible();
  await expect(apiKeyCard).toContainText("revoked");
});

test("executes organization membership actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/organizations");

  await page.getByLabel("Organization name").fill("Reliability Guild");
  await page.getByRole("button", { name: "Create Organization" }).click();
  await expect(page.getByText("Organization created.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reliability Guild" })).toBeVisible();

  await page.getByLabel("Organization member user ID").fill("3");
  await page.getByLabel("Organization member role").selectOption("admin");
  await page.getByRole("button", { name: "Save Member" }).click();
  await expect(page.getByText("Member assignment saved.")).toBeVisible();
  const memberCard = page.getByTestId("organization-member-card-3");
  await expect(memberCard).toContainText("reviewer #3");

  await memberCard.getByLabel("Member role").selectOption("viewer");
  await memberCard.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 3.")).toBeVisible();
  await expect(memberCard).toContainText("org viewer");

  await memberCard.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("User 3 removed.")).toBeVisible();
});

test("executes moderation case creation and resolution", async ({ page }) => {
  await loginAsAdmin(page, "/admin/moderation");

  await page.getByLabel("Case reporter user ID").fill("2");
  await page.getByLabel("Case skill ID").fill("301");
  await page.getByLabel("Case reason code").fill("policy_violation");
  await page.getByLabel("Case reason detail").fill("Created by governance e2e coverage.");
  await page.getByRole("button", { name: "Create Case" }).click();
  await expect(page.getByText("Moderation case created.")).toBeVisible();

  const caseButton = page.locator('[data-testid^="moderation-case-card-"]').filter({ hasText: "policy_violation" }).first();
  await caseButton.click();
  await page.getByLabel("Resolution note").fill("Escalated and hidden.");
  await page.getByRole("button", { name: "Resolve Case" }).click();
  await expect(page.getByText(/Case \d+ resolved\./)).toBeVisible();
});
