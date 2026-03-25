import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes admin account lifecycle and role actions through inline work panes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/accounts");

  await expect(page.getByRole("heading", { name: "Accounts", level: 1 })).toBeVisible();
  const accountWorkPane = page.getByTestId("admin-accounts-work-pane");
  await expect(accountWorkPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Search accounts").fill("operator");
  await accountWorkPane.getByLabel("Target user ID").fill("2");
  await accountWorkPane.getByLabel("Target account status").selectOption("disabled");
  await accountWorkPane.getByRole("button", { name: "Apply Status" }).click();
  await expect(page.getByText("Account 2 status updated.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/disabled/i);

  await accountWorkPane.getByRole("button", { name: "Force Sign-out" }).click();
  await expect(page.getByText("Force sign-out requested for user 2.")).toBeVisible();

  await accountWorkPane.getByLabel("Target new password").fill("Operator987654!");
  await accountWorkPane.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Password rotated for user 2.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/roles");
  await expect(page.getByRole("heading", { name: "Roles", level: 1 })).toBeVisible();
  const roleWorkPane = page.getByTestId("admin-accounts-work-pane");
  await expect(roleWorkPane).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Search accounts").fill("operator");
  await roleWorkPane.getByLabel("Role target user ID").fill("2");
  await roleWorkPane.getByLabel("Target role").selectOption("viewer");
  await roleWorkPane.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 2.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/viewer/i);
});
