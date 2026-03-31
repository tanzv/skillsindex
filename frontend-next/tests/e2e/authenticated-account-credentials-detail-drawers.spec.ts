import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes account credential actions through detail drawers", async ({ page }) => {
  await loginAsAdmin(page, "/account/api-credentials");

  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Create Credential" }).click();
  const credentialDrawer = page.getByTestId("account-credentials-detail-drawer");
  await expect(credentialDrawer).toContainText("Credential Factory");
  await expect(page.getByRole("dialog")).toBeVisible();
  const credentialNameInput = credentialDrawer.getByPlaceholder("Credential name");
  await expect(credentialNameInput).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(credentialDrawer).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Create Credential" }).click();
  await expect(credentialDrawer).toContainText("Credential Factory");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(credentialNameInput).toBeFocused();
  await credentialNameInput.fill("Smoke Credential");
  await credentialDrawer.getByPlaceholder("Purpose").fill("Extended authenticated coverage");
  await credentialDrawer.getByPlaceholder("Scopes separated by commas").fill("skills.read, skills.search.read");
  await credentialDrawer.getByRole("button", { name: "Create Credential" }).click();
  await expect(page.getByText("Credential created.")).toBeVisible();
  await expect(page.getByText("sk_test_created_key")).toBeVisible();

  const credentialCard = page.locator('[data-testid^="account-credential-card-"]').filter({ hasText: "Smoke Credential" }).first();
  await expect(credentialCard).toBeVisible();

  await credentialCard.getByRole("button", { name: "Open Details" }).click();
  await expect(credentialDrawer).toContainText("Smoke Credential");
  await expect(page.getByRole("dialog")).toBeVisible();
  await credentialDrawer.getByPlaceholder("Update scopes").fill("skills.ai_search.read");
  await credentialDrawer.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for credential/)).toBeVisible();

  await credentialDrawer.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/Credential \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("sk_test_rotated_key")).toBeVisible();

  await credentialDrawer.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Credential \d+ revoked\./)).toBeVisible();
  await expect(credentialCard).toContainText(/revoked/i);

  await gotoProtectedRoute(page, "/account/api-credentials");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
});
