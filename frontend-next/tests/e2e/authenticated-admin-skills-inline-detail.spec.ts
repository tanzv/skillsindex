import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 180_000 });

test("keeps admin skills details inline inside a work pane", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  const rows = page.locator('[data-testid^="admin-catalog-row-"]');
  const detailPanel = page.getByTestId("admin-skills-inline-detail");
  const topology = page.getByTestId("admin-skill-topology");

  await expect(rows.first()).toBeVisible();
  await expect(rows.nth(1)).toBeVisible();
  await expect(detailPanel).toBeVisible();
  await expect(topology).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const firstRowTitle = (await rows.nth(0).innerText()).split("\n")[0]?.trim();
  const secondRowTitle = (await rows.nth(1).innerText()).split("\n")[0]?.trim();

  expect(firstRowTitle).toBeTruthy();
  expect(secondRowTitle).toBeTruthy();
  await expect(detailPanel).toContainText(firstRowTitle || "");
  await expect(topology).toContainText("Topology");
  await expect(topology.getByRole("link", { name: "README.md" })).toBeVisible();
  await expect(topology.getByRole("link", { name: "skills/release-readiness" })).toBeVisible();
  await expect(topology.getByRole("link", { name: "repository-sync-blueprint" })).toBeVisible();
  await expect(topology.getByRole("link", { name: "change-approval-guide" })).toBeVisible();
  await expect(detailPanel.getByRole("link", { name: "README.md" }).nth(1)).toBeVisible();
  await expect(detailPanel.getByRole("link", { name: "skills/release-readiness" }).nth(1)).toBeVisible();
  await expect(detailPanel.getByRole("link", { name: "repository-sync-blueprint" }).nth(1)).toBeVisible();
  await expect(detailPanel.getByRole("link", { name: "change-approval-guide" }).nth(1)).toBeVisible();

  await topology.getByRole("link", { name: "README.md" }).click();
  await page.waitForURL("**/admin/skills?q=README.md");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("README.md");

  await page.goto("/admin/skills");
  await expect(topology).toBeVisible();

  await topology.getByRole("link", { name: "skills/release-readiness" }).click();
  await page.waitForURL("**/admin/skills?q=skills%2Frelease-readiness");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("skills/release-readiness");

  await page.goto("/admin/skills");
  await expect(topology).toBeVisible();

  await detailPanel.getByRole("link", { name: "skills/release-readiness" }).nth(1).click();
  await page.waitForURL("**/admin/skills?q=skills%2Frelease-readiness");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("skills/release-readiness");

  await page.goto("/admin/skills");
  await expect(topology).toBeVisible();

  await topology.getByRole("link", { name: "repository-sync-blueprint" }).click();
  await page.waitForURL("**/skills/201");
  await expect(page.getByRole("heading", { name: "Repository Sync Blueprint" })).toBeVisible();

  await page.goto("/admin/skills");
  await expect(topology).toBeVisible();

  await topology.getByRole("link", { name: "change-approval-guide" }).click();
  await page.waitForURL("**/admin/skills?q=change-approval-guide");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("change-approval-guide");

  await page.goto("/admin/skills");
  await expect(rows.nth(1)).toBeVisible();
  await expect(topology).toBeVisible();

  await rows.nth(1).getByRole("button").first().click();
  await expect(detailPanel).toContainText(secondRowTitle || "");
  await expect(topology).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
