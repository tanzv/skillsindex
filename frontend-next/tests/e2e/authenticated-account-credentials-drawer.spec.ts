import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes account credential actions through detail drawers", async ({ page }) => {
  await loginAsAdmin(page, "/account/api-credentials");

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

  await credentialCard.getByRole("button", { name: "Open Details" }).click();
  const credentialDetailDialog = page.getByRole("dialog", { name: "Smoke Credential" });
  await credentialDetailDialog.getByPlaceholder("Update scopes").fill("skills.ai_search.read");
  await credentialDetailDialog.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for credential/)).toBeVisible();

  await credentialDetailDialog.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/Credential \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("sk_test_rotated_key")).toBeVisible();

  await credentialDetailDialog.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Credential \d+ revoked\./)).toBeVisible();
  await expect(credentialCard).toContainText(/revoked/i);

  await gotoProtectedRoute(page, "/account/api-credentials");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
});
