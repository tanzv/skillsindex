import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders authenticated admin operations record routes", async ({ page }) => {
  await loginAsAdmin(page, "/admin/ops/audit-export");

  await expect(page.getByRole("heading", { name: "Audit Export", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText("release.create");

  await page.goto("/admin/ops/recovery-drills");
  await expect(page.getByRole("heading", { name: "Recovery Drills", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();
  await expect(page.getByRole("button", { name: /Record Entry/i })).toBeVisible();
  await expect(page.getByTestId("ops-record-row-0").getByRole("button", { name: "Open Details" })).toBeVisible();

  await page.goto("/admin/ops/releases");
  await expect(page.getByRole("heading", { name: "Releases", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();

  await page.goto("/admin/ops/change-approvals");
  await expect(page.getByRole("heading", { name: "Change Approvals", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();

  await page.goto("/admin/ops/backup/plans");
  await expect(page.getByRole("heading", { name: "Backup Plans", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();

  await page.goto("/admin/ops/backup/runs");
  await expect(page.getByRole("heading", { name: "Backup Runs", level: 1 })).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toBeVisible();
});

test("executes recovery, release, and change approval record actions", async ({ page }) => {
  const suffix = Date.now();
  await loginAsAdmin(page, "/admin/ops/recovery-drills");

  await page.getByRole("button", { name: /Record Entry/i }).click();
  const recoveryDialog = page.getByRole("dialog", { name: "Record Entry" });
  await expect(recoveryDialog).toBeVisible();
  await recoveryDialog.getByLabel("Recovery drill RPO hours").fill("4");
  await recoveryDialog.getByLabel("Recovery drill RTO hours").fill("6");
  await recoveryDialog.getByLabel("Recovery drill note").fill(`Recovery drill note ${suffix}`);
  await recoveryDialog.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`Recovery drill note ${suffix}`);

  await page.goto("/admin/ops/releases");
  await page.getByRole("button", { name: /Record Entry/i }).click();
  const releaseDialog = page.getByRole("dialog", { name: "Record Entry" });
  await releaseDialog.getByLabel("Release version").fill(`v9.${suffix}`);
  await releaseDialog.getByLabel("Release environment").selectOption("staging");
  await releaseDialog.getByLabel("Release change ticket").fill(`CHG-${suffix}`);
  await releaseDialog.getByLabel("Release status").selectOption("success");
  await releaseDialog.getByLabel("Release note").fill(`Release note ${suffix}`);
  await releaseDialog.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`v9.${suffix}`);

  await page.goto("/admin/ops/change-approvals");
  await page.getByRole("button", { name: /Record Entry/i }).click();
  const approvalDialog = page.getByRole("dialog", { name: "Record Entry" });
  await approvalDialog.getByLabel("Change approval ticket ID").fill(`APP-${suffix}`);
  await approvalDialog.getByLabel("Change approval reviewer").fill("ops-reviewer");
  await approvalDialog.getByLabel("Change approval status").selectOption("approved");
  await approvalDialog.getByLabel("Change approval note").fill(`Approval note ${suffix}`);
  await approvalDialog.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`APP-${suffix}`);
});

test("executes backup plan and backup run record actions", async ({ page }) => {
  const suffix = Date.now();
  await loginAsAdmin(page, "/admin/ops/backup/plans");

  await page.getByRole("button", { name: /Record Entry/i }).click();
  const planDialog = page.getByRole("dialog", { name: "Record Entry" });
  await planDialog.getByLabel("Backup plan key").fill(`archive-${suffix}`);
  await planDialog.getByLabel("Backup type").selectOption("snapshot");
  await planDialog.getByLabel("Backup schedule").fill("0 3 * * 0");
  await planDialog.getByLabel("Backup retention days").fill("45");
  await planDialog.getByLabel("Backup plan enabled").check();
  await planDialog.getByLabel("Backup plan note").fill(`Plan note ${suffix}`);
  await planDialog.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`archive-${suffix}`);

  await page.goto("/admin/ops/backup/runs");
  await page.getByRole("button", { name: /Record Entry/i }).click();
  const runDialog = page.getByRole("dialog", { name: "Record Entry" });
  await runDialog.getByLabel("Backup run plan key").fill(`archive-${suffix}`);
  await runDialog.getByLabel("Backup run status").selectOption("success");
  await runDialog.getByLabel("Backup run size MB").fill("512");
  await runDialog.getByLabel("Backup run duration minutes").fill("18");
  await runDialog.getByLabel("Backup run note").fill(`Run note ${suffix}`);
  await runDialog.getByRole("button", { name: "Save Record" }).click();
  await expect(page.getByText("Operations record saved.")).toBeVisible();
  await expect(page.getByTestId("ops-records-ledger")).toContainText(`Run note ${suffix}`);
});
