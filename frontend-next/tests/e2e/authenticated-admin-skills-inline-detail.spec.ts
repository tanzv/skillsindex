import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 180_000 });

test("keeps admin skills details inline without opening a drawer", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  const rows = page.locator('[data-testid^="admin-catalog-row-"]');
  const detailPanel = page.getByTestId("admin-skills-inline-detail");

  await expect(rows.first()).toBeVisible();
  await expect(rows.nth(1)).toBeVisible();
  await expect(detailPanel).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const firstRowTitle = (await rows.nth(0).innerText()).split("\n")[0]?.trim();
  const secondRowTitle = (await rows.nth(1).innerText()).split("\n")[0]?.trim();

  expect(firstRowTitle).toBeTruthy();
  expect(secondRowTitle).toBeTruthy();
  await expect(detailPanel).toContainText(firstRowTitle || "");

  await rows.nth(1).getByRole("button").first().click();
  await expect(detailPanel).toContainText(secondRowTitle || "");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
