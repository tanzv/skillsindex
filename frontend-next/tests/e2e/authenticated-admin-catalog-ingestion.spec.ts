import { expect, test } from "@playwright/test";

import { gotoProtectedRoute, loginAsAdmin } from "./helpers/auth";

test.describe.configure({ timeout: 180_000 });

test("renders the remaining admin catalog and ingestion routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  await expect(page.getByRole("heading", { name: "Skill Governance", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governed Inventory", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid^="admin-catalog-row-"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Details" }).first()).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await gotoProtectedRoute(page, "/admin/jobs");
  await expect(page.getByRole("heading", { name: "Asynchronous Jobs", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Execution Queue", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid^="admin-catalog-row-"]').first()).toBeVisible();

  await gotoProtectedRoute(page, "/admin/sync-jobs");
  await expect(page.getByRole("heading", { name: "Repository Sync Jobs", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run History", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid^="admin-catalog-row-"]').first()).toBeVisible();

  await gotoProtectedRoute(page, "/admin/sync-policy/repository");
  await expect(page.getByRole("heading", { name: "Repository Sync Policy", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Policy Editor", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current Policy Posture", exact: true })).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ingestion/manual");
  await expect(page.getByRole("heading", { name: "Manual Intake", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Manual Skill" }).first()).toBeVisible();

  await gotoProtectedRoute(page, "/admin/ingestion/repository");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Repository Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Sync Runs", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Repository Intake" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Policy" }).first()).toBeVisible();

  await gotoProtectedRoute(page, "/admin/records/imports");
  await expect(page.getByRole("heading", { name: "Import Records", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Imported Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Import Jobs", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Import Archive" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Import SkillMP" }).first()).toBeVisible();
});

test("executes admin catalog job and sync policy actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/jobs");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const failedJob = page.getByTestId("admin-catalog-row-81");
  const runningJob = page.getByTestId("admin-catalog-row-82");

  await expect(failedJob).toContainText("archive parse failed");
  await failedJob.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Job 81 retry requested.")).toBeVisible();
  await expect(failedJob).toContainText(/pending/i);

  await runningJob.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Job 82 cancel requested.")).toBeVisible();
  await expect(runningJob).toContainText(/canceled/i);
  await expect(failedJob).toBeVisible();

  await failedJob.getByRole("button", { name: "Open Details" }).click();
  const detailPane = page.getByTestId("admin-jobs-detail-pane");
  await expect(detailPane).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(detailPane).toContainText("archive parse failed");
  await detailPane.getByRole("button", { name: "Close Panel" }).click();
  await expect(detailPane).toHaveCount(0);

  await gotoProtectedRoute(page, "/admin/sync-policy/repository");
  const schedulerEnabled = page.getByLabel("Scheduler enabled");
  await expect(schedulerEnabled).toBeChecked();
  await schedulerEnabled.uncheck();
  await page.getByPlaceholder("Interval").fill("45m");
  await page.getByPlaceholder("Timeout").fill("8m");
  await page.getByPlaceholder("Batch Size").fill("40");
  await page.getByRole("button", { name: "Save Policy" }).click();
  await expect(page.getByText("Policy saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByPlaceholder("Interval")).toHaveValue("45m");
  await expect(page.getByPlaceholder("Timeout")).toHaveValue("8m");
  await expect(page.getByPlaceholder("Batch Size")).toHaveValue("40");
  await expect(schedulerEnabled).not.toBeChecked();
});

test("executes repository intake and import source actions", async ({ page }) => {
  const suffix = Date.now();
  await loginAsAdmin(page, "/admin/ingestion/repository");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Start Repository Intake" }).click();
  const repositoryPane = page.getByTestId("admin-ingestion-repository-pane");
  await expect(repositoryPane).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  const accountTrigger = page.getByTestId("admin-topbar-account-trigger");
  await accountTrigger.click();
  await expect(page.getByTestId("admin-topbar-account-menu")).toBeVisible();
  await accountTrigger.click();
  await repositoryPane.getByLabel("Repository URL").fill(`https://github.com/example/repository-intake-${suffix}`);
  await repositoryPane.getByLabel("Repository Branch").fill("release");
  await repositoryPane.getByLabel("Repository Path").fill("skills/catalog");
  await repositoryPane.getByLabel("Tags").fill(`release repo-${suffix}`);
  await repositoryPane.getByLabel("Visibility").selectOption("public");
  await repositoryPane.getByLabel("Install Command").fill("uvx skillsindex install repository-intake");
  await repositoryPane.getByRole("button", { name: "Start Repository Intake" }).click();
  await expect(page.getByText("Repository ingestion requested.")).toBeVisible();

  await page.getByRole("button", { name: "Save Policy" }).first().click();
  const policyPane = page.getByTestId("admin-ingestion-policy-pane");
  await expect(policyPane).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await policyPane.getByLabel("Enabled").uncheck();
  await policyPane.getByLabel("Interval").fill("30m");
  await policyPane.getByLabel("Timeout").fill("6m");
  await policyPane.getByLabel("Batch Size").fill("24");
  await policyPane.getByRole("button", { name: "Save Policy" }).click();
  await expect(page.getByText("Repository sync policy saved.")).toBeVisible();

  await gotoProtectedRoute(page, "/admin/records/imports");
  await page.getByRole("button", { name: "Import Archive" }).first().click();
  const archivePane = page.getByTestId("admin-ingestion-archive-pane");
  await expect(archivePane).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await archivePane.getByLabel("Archive File").setInputFiles({
    name: `archive-${suffix}.zip`,
    mimeType: "application/zip",
    buffer: Buffer.from("mock archive payload")
  });
  await archivePane.getByLabel("Tags").fill(`archive-${suffix}`);
  await archivePane.getByLabel("Visibility").selectOption("private");
  await archivePane.getByLabel("Install Command").fill("npx skillsindex import archive-intake");
  await archivePane.getByRole("button", { name: "Import Archive" }).click();
  await expect(page.getByText("Archive import submitted.")).toBeVisible();

  await page.getByRole("button", { name: "Import SkillMP" }).first().click();
  const skillmpPane = page.getByTestId("admin-ingestion-skillmp-pane");
  await expect(skillmpPane).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await skillmpPane.getByLabel("SkillMP URL").fill(`https://skillmp.example.com/${suffix}`);
  await skillmpPane.getByLabel("SkillMP ID").fill(`skillmp-${suffix}`);
  await skillmpPane.getByLabel("SkillMP Token").fill("skillmp-token");
  await skillmpPane.getByLabel("Tags").fill(`skillmp-${suffix}`);
  await skillmpPane.getByLabel("Visibility").selectOption("public");
  await skillmpPane.getByLabel("Install Command").fill("npx skillsindex import skillmp-governance");
  await skillmpPane.getByRole("button", { name: "Import SkillMP" }).click();
  await expect(page.getByText("SkillMP import submitted.")).toBeVisible();
});
