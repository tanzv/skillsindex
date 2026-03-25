import { expect, test } from "@playwright/test";

import { expectSkillDetailHeaderWithinViewport } from "./helpers/layout";

test("opens skill detail from category and results list cards", async ({ page }) => {
  await page.goto("/categories/operations?subcategory=release&tags=ops");

  await page.getByRole("link", { name: "Release Readiness Checklist" }).first().click();
  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.getByTestId("skill-detail-page")).toBeVisible();

  await page.goto("/results?tags=ops");

  await page.getByRole("link", { name: "Release Readiness Checklist" }).first().click();
  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
});

test("renders the skill detail route without backend data", async ({ page }) => {
  await page.setViewportSize({ width: 512, height: 720 });
  await page.goto("/skills/101");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
  await expectSkillDetailHeaderWithinViewport(page);
  await expect(page.getByRole("heading", { level: 1, name: "Release Readiness Checklist" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-context-bar")).toBeVisible();
  await expect(page.getByTestId("skill-detail-header-summary")).toBeHidden();
  await expect(page.locator(".skill-detail-overview-card .skill-detail-panel-copy")).toContainText("Track release signals before production cutover.");
  await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Installation Method" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "SKILL.md" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Resources" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Related Skills" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-stage-title").last()).toHaveText("SKILL.md");
  await expect(page.locator("#skill-detail-panel-overview .skill-detail-preview-content")).toContainText("# Release Readiness Checklist");
  await expect(page.getByTestId("skill-detail-installation-card")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Agent" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Human" })).toBeVisible();
  await expect(page.getByTestId("skill-detail-resource-workbench")).toBeVisible();
  await expect(page.getByTestId("skill-detail-sidebar")).toBeVisible();
  await expect(page.getByTestId("skill-detail-interaction-panel")).toHaveCount(0);
  await expect(page.getByTestId("skill-detail-comments-panel")).toHaveCount(0);

  await page.getByRole("tab", { name: "Resources" }).click();
  await expect(page.getByTestId("skill-detail-source-analysis")).toBeVisible();
  await expect(page.getByTestId("skill-detail-source-analysis")).toContainText("Source Analysis");
  await expect(page.getByTestId("skill-detail-source-analysis")).toContainText("README.md");
  await expect(page.getByTestId("skill-detail-source-analysis").getByRole("link", { name: "repository-sync-blueprint" })).toBeVisible();

  await page.getByTestId("skill-detail-source-analysis").getByRole("link", { name: "repository-sync-blueprint" }).click();
  await expect(page).toHaveURL(/\/skills\/201$/);
  await expect(page.getByRole("heading", { level: 1, name: "Repository Sync Blueprint" })).toBeVisible();
});

test("keeps the skill detail context bar, preview stage, and install sidebar synchronized", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/light/skills/101");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("skill-detail-context-bar")).toBeVisible();
  await expect(page.locator(".skill-detail-context-status-value")).toHaveText("overview");
  await expect(page.locator(".skill-detail-installation-card-context-chip")).toHaveText("overview");

  await page.getByRole("tab", { name: "SKILL.md" }).click();
  await expect(page.locator("#skill-detail-panel-skill")).toBeVisible();
  await expect(page.locator(".skill-detail-context-status-value")).toHaveText("SKILL.md");
  await expect(page.locator(".skill-detail-installation-card-context-chip")).toHaveText("SKILL.md");
  await expect(page.getByTestId("skill-detail-page")).toHaveAttribute("data-active-tab", "skill");
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-stage-title")).toHaveText("SKILL.md");
  await expect(page.locator("#skill-detail-panel-skill .skill-detail-preview-content")).toContainText("# Release Readiness Checklist");
});

test("keeps source analysis deep links working on light skill detail routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/light/skills/101");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("tab", { name: "Resources" }).click();

  const sourceAnalysis = page.getByTestId("skill-detail-source-analysis");
  await expect(sourceAnalysis).toBeVisible();
  await expect(sourceAnalysis).toContainText("Source Analysis");
  await expect(sourceAnalysis).toContainText("README.md");
  await expect(sourceAnalysis.getByRole("link", { name: "repository-sync-blueprint" })).toBeVisible();

  await sourceAnalysis.getByRole("link", { name: "repository-sync-blueprint" }).click();
  await expect(page).toHaveURL(/\/light\/skills\/201$/);
  await expect(page.getByRole("heading", { level: 1, name: "Repository Sync Blueprint" })).toBeVisible();
});
