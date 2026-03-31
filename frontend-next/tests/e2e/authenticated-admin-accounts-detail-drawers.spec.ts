import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 120_000 });

test("executes admin account lifecycle and role actions through detail drawers", async ({ page }) => {
  await loginAsAdmin(page, "/admin/accounts");

  await expect(page.locator("h1").filter({ hasText: "Accounts" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByTestId("admin-account-card-2").getByRole("button", { name: "Select" }).click();
  const accountDrawer = page.getByTestId("admin-accounts-detail-drawer");
  await expect(accountDrawer).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByLabel("Account status filter").selectOption("disabled");
  await expect(accountDrawer).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Account status filter").selectOption("all");
  await page.getByPlaceholder("Search username, role, or status").fill("operator");
  await page.getByTestId("admin-account-card-2").getByRole("button", { name: "Select" }).click();
  await expect(accountDrawer).toBeVisible();
  await accountDrawer.getByLabel("Target user ID").fill("2");
  await accountDrawer.getByLabel("Target account status").selectOption("disabled");
  await accountDrawer.getByRole("button", { name: "Apply Status" }).click();
  await expect(page.getByText("Account 2 status updated.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/disabled/i);

  await accountDrawer.getByRole("button", { name: "Force Sign-out" }).click();
  await expect(page.getByText("Force sign-out requested for user 2.")).toBeVisible();

  await accountDrawer.getByLabel("Target new password").fill("Operator987654!");
  await accountDrawer.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Password rotated for user 2.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/roles");
  await expect(page.locator("h1").filter({ hasText: "Roles" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByTestId("admin-account-card-2").getByRole("button", { name: "Select" }).click();
  const roleDrawer = page.getByTestId("admin-accounts-detail-drawer");
  await expect(roleDrawer).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByPlaceholder("Search username, role, or status").fill("operator");
  await roleDrawer.getByLabel("Role target user ID").fill("2");
  await roleDrawer.getByLabel("Target role").selectOption("viewer");
  await roleDrawer.getByRole("button", { name: "Apply Role" }).click();
  await expect(page.getByText("Role updated for user 2.")).toBeVisible();
  await expect(page.getByTestId("admin-account-card-2")).toContainText(/viewer/i);
});
