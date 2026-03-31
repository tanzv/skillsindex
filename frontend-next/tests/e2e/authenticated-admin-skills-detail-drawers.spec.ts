import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 180_000 });

test("opens admin skills details in a detail drawer", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  const rows = page.locator('[data-testid^="admin-catalog-row-"]');
  const detailPanel = page.getByTestId("admin-skills-detail-pane");

  await expect(rows.first()).toBeVisible();
  await expect(rows.nth(1)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const firstRowTitle = (await rows.nth(0).innerText()).split("\n")[0]?.trim();
  const secondRowTitle = (await rows.nth(1).innerText()).split("\n")[0]?.trim();

  expect(firstRowTitle).toBeTruthy();
  expect(secondRowTitle).toBeTruthy();
  await rows.nth(0).getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  const topology = detailPanel.getByTestId("admin-skill-topology");
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
  await rows.first().getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();

  await detailPanel.getByTestId("admin-skill-topology").getByRole("link", { name: "skills/release-readiness" }).click();
  await page.waitForURL("**/admin/skills?q=skills%2Frelease-readiness");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("skills/release-readiness");

  await page.goto("/admin/skills");
  await rows.first().getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();

  await detailPanel.getByRole("link", { name: "skills/release-readiness" }).nth(1).click();
  await page.waitForURL("**/admin/skills?q=skills%2Frelease-readiness");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("skills/release-readiness");

  await page.goto("/admin/skills");
  await rows.first().getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();

  await detailPanel.getByTestId("admin-skill-topology").getByRole("link", { name: "repository-sync-blueprint" }).click();
  await page.waitForURL("**/skills/201");
  await expect(page.getByRole("heading", { name: "Repository Sync Blueprint" })).toBeVisible();

  await page.goto("/admin/skills");
  await rows.first().getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();

  await detailPanel.getByTestId("admin-skill-topology").getByRole("link", { name: "change-approval-guide" }).click();
  await page.waitForURL("**/admin/skills?q=change-approval-guide");
  await expect(page.getByLabel("Catalog keyword")).toHaveValue("change-approval-guide");

  await page.goto("/admin/skills");
  await rows.nth(1).getByRole("button", { name: "Open Details" }).click();
  await expect(detailPanel).toBeVisible();
  await expect(detailPanel).toContainText(secondRowTitle || "");
  await expect(detailPanel.getByTestId("admin-skill-topology")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
});
