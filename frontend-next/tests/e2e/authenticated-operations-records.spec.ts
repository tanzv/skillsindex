import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders authenticated admin operations record routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/ops/audit-export");

  await expect(page.getByRole("heading", { name: "Audit Export", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Audit Export Ledger", exact: true })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText("release.create");

  await page.goto("/admin/ops/recovery-drills");
  await expect(page.getByRole("heading", { name: "Recovery Drills", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recovery Drills Ledger", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Record Entry", exact: true })).toBeVisible();

  await page.goto("/admin/ops/releases");
  await expect(page.getByRole("heading", { name: "Releases", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Releases Ledger", exact: true })).toBeVisible();

  await page.goto("/admin/ops/change-approvals");
  await expect(page.getByRole("heading", { name: "Change Approvals", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Change Approvals Ledger", exact: true })).toBeVisible();

  await page.goto("/admin/ops/backup/plans");
  await expect(page.getByRole("heading", { name: "Backup Plans", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup Plans Ledger", exact: true })).toBeVisible();

  await page.goto("/admin/ops/backup/runs");
  await expect(page.getByRole("heading", { name: "Backup Runs", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup Runs Ledger", exact: true })).toBeVisible();
});

test("executes recovery, release, and change approval record actions", async ({ page }) => {
  const suffix = Date.now();
  await loginAsAdmin(page, "/admin/ops/recovery-drills");

  await page.getByLabel("Recovery drill RPO hours").fill("4");
  await page.getByLabel("Recovery drill RTO hours").fill("6");
  await page.getByLabel("Recovery drill note").fill(`Recovery drill note ${suffix}`);
  await page.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`Recovery drill note ${suffix}`);

  await page.goto("/admin/ops/releases");
  await page.getByLabel("Release version").fill(`v9.${suffix}`);
  await page.getByLabel("Release environment").fill("staging");
  await page.getByLabel("Release change ticket").fill(`CHG-${suffix}`);
  await page.getByLabel("Release status").fill("success");
  await page.getByLabel("Release note").fill(`Release note ${suffix}`);
  await page.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`v9.${suffix}`);

  await page.goto("/admin/ops/change-approvals");
  await page.getByLabel("Change approval ticket ID").fill(`APP-${suffix}`);
  await page.getByLabel("Change approval reviewer").fill("ops-reviewer");
  await page.getByLabel("Change approval status").fill("approved");
  await page.getByLabel("Change approval note").fill(`Approval note ${suffix}`);
  await page.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`APP-${suffix}`);
});

test("executes backup plan and backup run record actions", async ({ page }) => {
  const suffix = Date.now();
  await loginAsAdmin(page, "/admin/ops/backup/plans");

  await page.getByLabel("Backup plan key").fill(`archive-${suffix}`);
  await page.getByLabel("Backup type").fill("snapshot");
  await page.getByLabel("Backup schedule").fill("0 3 * * 0");
  await page.getByLabel("Backup retention days").fill("45");
  await page.getByLabel("Backup plan enabled").check();
  await page.getByLabel("Backup plan note").fill(`Plan note ${suffix}`);
  await page.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`archive-${suffix}`);

  await page.goto("/admin/ops/backup/runs");
  await page.getByLabel("Backup run plan key").fill(`archive-${suffix}`);
  await page.getByLabel("Backup run status").fill("success");
  await page.getByLabel("Backup run size MB").fill("512");
  await page.getByLabel("Backup run duration minutes").fill("18");
  await page.getByLabel("Backup run note").fill(`Run note ${suffix}`);
  await page.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`Run note ${suffix}`);
});
