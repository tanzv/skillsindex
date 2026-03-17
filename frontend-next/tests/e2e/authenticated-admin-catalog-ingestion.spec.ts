import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders the remaining admin catalog and ingestion routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/skills");

  await expect(page.getByRole("heading", { name: "Skill Governance", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governed Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Selected Skill", exact: true })).toBeVisible();

  await page.goto("/admin/jobs");
  await expect(page.getByRole("heading", { name: "Asynchronous Jobs", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Execution Queue", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Selected Job", exact: true })).toBeVisible();

  await page.goto("/admin/sync-jobs");
  await expect(page.getByRole("heading", { name: "Repository Sync Jobs", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run History", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Selected Sync Run", exact: true })).toBeVisible();

  await page.goto("/admin/sync-policy/repository");
  await expect(page.getByRole("heading", { name: "Repository Sync Policy", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Policy Editor", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current Policy Posture", exact: true })).toBeVisible();

  await page.goto("/admin/ingestion/manual");
  await expect(page.getByRole("heading", { name: "Manual Intake", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual Authoring", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual Inventory", exact: true })).toBeVisible();

  await page.goto("/admin/ingestion/repository");
  await expect(page.getByRole("heading", { name: "Repository Intake", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Repository Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scheduler Policy", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Sync Runs", exact: true })).toBeVisible();

  await page.goto("/admin/records/imports");
  await expect(page.getByRole("heading", { name: "Import Records", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Archive Import", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "SkillMP Import", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Imported Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Import Jobs", exact: true })).toBeVisible();
});

test("executes admin catalog job and sync policy actions", async ({ page }) => {
  await loginAsAdmin(page, "/admin/jobs");

  const failedJob = page.getByTestId("admin-catalog-row-81");
  const runningJob = page.getByTestId("admin-catalog-row-82");

  await expect(failedJob).toContainText("archive parse failed");
  await failedJob.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Job 81 retry requested.")).toBeVisible();
  await expect(failedJob).toContainText("pending");

  await runningJob.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Job 82 cancel requested.")).toBeVisible();
  await expect(runningJob).toContainText("canceled");
  await expect(failedJob).toBeVisible();

  await page.goto("/admin/sync-policy/repository");
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

  await page.getByLabel("Repository URL").fill(`https://github.com/example/repository-intake-${suffix}`);
  await page.getByLabel("Repository Branch").fill("release");
  await page.getByLabel("Repository Path").fill("skills/catalog");
  await page.getByLabel("Tags").first().fill(`release repo-${suffix}`);
  await page.getByLabel("Visibility").first().fill("public");
  await page.getByLabel("Install Command").first().fill("uvx skillsindex install repository-intake");
  await page.getByRole("button", { name: "Start Repository Intake" }).click();
  await expect(page.getByText("Repository ingestion requested.")).toBeVisible();

  await page.getByLabel("Enabled").uncheck();
  await page.getByLabel("Interval").fill("30m");
  await page.getByLabel("Timeout").fill("6m");
  await page.getByLabel("Batch Size").fill("24");
  await page.getByRole("button", { name: "Save Policy" }).click();
  await expect(page.getByText("Repository sync policy saved.")).toBeVisible();

  await page.goto("/admin/records/imports");
  await page.getByLabel("Archive File").setInputFiles({
    name: `archive-${suffix}.zip`,
    mimeType: "application/zip",
    buffer: Buffer.from("mock archive payload")
  });
  await page.getByLabel("Tags").first().fill(`archive-${suffix}`);
  await page.getByLabel("Visibility").first().fill("private");
  await page.getByLabel("Install Command").first().fill("npx skillsindex import archive-intake");
  await page.getByRole("button", { name: "Import Archive" }).click();
  await expect(page.getByText("Archive import submitted.")).toBeVisible();

  await page.getByLabel("SkillMP URL").fill(`https://skillmp.example.com/${suffix}`);
  await page.getByLabel("SkillMP ID").fill(`skillmp-${suffix}`);
  await page.getByLabel("SkillMP Token").fill("skillmp-token");
  await page.getByLabel("Tags").nth(1).fill(`skillmp-${suffix}`);
  await page.getByLabel("Visibility").nth(1).fill("public");
  await page.getByLabel("Install Command").nth(1).fill("npx skillsindex import skillmp-governance");
  await page.getByRole("button", { name: "Import SkillMP" }).click();
  await expect(page.getByText("SkillMP import submitted.")).toBeVisible();
});
