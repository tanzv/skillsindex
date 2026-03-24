import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes account credential actions through inline work panes", async ({ page }) => {
  await loginAsAdmin(page, "/account/api-credentials");

  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Create Credential" }).click();
  const credentialWorkPane = page.getByTestId("account-credentials-work-pane");
  await expect(credentialWorkPane).toContainText("Credential Factory");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await credentialWorkPane.getByPlaceholder("Credential name").fill("Smoke Credential");
  await credentialWorkPane.getByPlaceholder("Purpose").fill("Extended authenticated coverage");
  await credentialWorkPane.getByPlaceholder("Scopes separated by commas").fill("skills.read, skills.search.read");
  await credentialWorkPane.getByRole("button", { name: "Create Credential" }).click();
  await expect(page.getByText("Credential created.")).toBeVisible();
  await expect(page.getByText("sk_test_created_key")).toBeVisible();

  const credentialCard = page.locator('[data-testid^="account-credential-card-"]').filter({ hasText: "Smoke Credential" }).first();
  await expect(credentialCard).toBeVisible();

  await credentialCard.getByRole("button", { name: "Open Details" }).click();
  await expect(credentialWorkPane).toContainText("Smoke Credential");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await credentialWorkPane.getByPlaceholder("Update scopes").fill("skills.ai_search.read");
  await credentialWorkPane.getByRole("button", { name: "Apply Scopes" }).click();
  await expect(page.getByText(/Scopes updated for credential/)).toBeVisible();

  await credentialWorkPane.getByRole("button", { name: "Rotate" }).click();
  await expect(page.getByText(/Credential \d+ rotated\./)).toBeVisible();
  await expect(page.getByText("sk_test_rotated_key")).toBeVisible();

  await credentialWorkPane.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText(/Credential \d+ revoked\./)).toBeVisible();
  await expect(credentialCard).toContainText(/revoked/i);

  await gotoProtectedRoute(page, "/account/api-credentials");
  await expect(page.getByRole("heading", { name: "Account Center", level: 1 })).toBeVisible();
});
