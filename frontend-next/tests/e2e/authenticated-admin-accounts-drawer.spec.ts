import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes admin account lifecycle and role actions through detail drawers", async ({ page }) => {
  await loginAsAdmin(page, "/admin/accounts");

  await expect(page.getByRole("heading", { name: "Accounts", level: 1 })).toBeVisible();
  const accountActionDialog = page.getByRole("dialog", { name: "Account Actions" });
  await expect(accountActionDialog).toBeVisible();

  await page.getByLabel("Search accounts").fill("operator");
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
  const roleActionDialog = page.getByRole("dialog", { name: "Role Assignment" });
  await expect(roleActionDialog).toBeVisible();

  await page.getByLabel("Search accounts").fill("operator");
  await roleActionDialog.getByLabel("Role target user ID").fill("2");
  await roleActionDialog.getByLabel("Target role").selectOption("auditor");
  await roleActionDialog.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 2.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/auditor/i);
});
