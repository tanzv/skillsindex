import { describe, expect, it } from "vitest";

import {
  buildAuditExportOverview,
  buildBackupPlansOverview,
  buildBackupRunsOverview,
  buildChangeApprovalsOverview,
  buildRecoveryDrillsOverview,
  buildReleasesOverview,
  normalizeOpsAuditExportPayload,
  normalizeOpsBackupPlansPayload,
  normalizeOpsBackupRunsPayload,
  normalizeOpsChangeApprovalsPayload,
  normalizeOpsRecoveryDrillsPayload,
  normalizeOpsReleasesPayload
} from "@/src/features/adminOperations/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const operationsMessages = createProtectedPageTestMessages({
  adminOperations: {
    recordsMetricExportedRecordsLabel: "Exported Records",
    recordsMetricDistinctActorsLabel: "Distinct Actors",
    recordsMetricActionTypesLabel: "Action Types",
    recordsMetricRecordedDrillsLabel: "Recorded Drills",
    recordsMetricPassedLabel: "Passed",
    recordsMetricAverageRpoLabel: "Average RPO",
    recordsMetricReleaseRecordsLabel: "Release Records",
    recordsMetricSuccessfulLabel: "Successful",
    recordsMetricFailedLabel: "Failed",
    recordsMetricApprovalRecordsLabel: "Approval Records",
    recordsMetricApprovedLabel: "Approved",
    recordsMetricPendingLabel: "Pending",
    recordsMetricBackupPlansLabel: "Backup Plans",
    recordsMetricEnabledLabel: "Enabled",
    recordsMetricAverageRetentionLabel: "Average Retention",
    recordsMetricBackupRunsLabel: "Backup Runs"
  }
}).adminOperations;

describe("admin operations records model", () => {
  it("builds audit export overview", () => {
    const rows = normalizeOpsAuditExportPayload([
      { actor_user_id: 1, action: "release.create" },
      { actor_user_id: 2, action: "release.create" },
      { actor_user_id: 1, action: "backup.run" }
    ]);

    const overview = buildAuditExportOverview(rows, operationsMessages);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Exported Records", value: "3" }),
        expect.objectContaining({ label: "Distinct Actors", value: "2" }),
        expect.objectContaining({ label: "Action Types", value: "2" })
      ])
    );
  });

  it("builds recovery, release, and change approval summaries", () => {
    const recovery = buildRecoveryDrillsOverview(
      normalizeOpsRecoveryDrillsPayload({
        total: 2,
        items: [
          { logged_at: "2026-03-14T10:00:00Z", actor_user_id: 1, rpo_hours: 2, rto_hours: 4, passed: true, note: "" },
          { logged_at: "2026-03-15T10:00:00Z", actor_user_id: 2, rpo_hours: 4, rto_hours: 6, passed: false, note: "" }
        ]
      }),
      operationsMessages
    );
    const releases = buildReleasesOverview(
      normalizeOpsReleasesPayload({
        total: 2,
        items: [
          { released_at: "2026-03-14T10:00:00Z", actor_user_id: 1, version: "v1", environment: "prod", change_ticket: "CHG-1", status: "success", note: "" },
          { released_at: "2026-03-15T10:00:00Z", actor_user_id: 2, version: "v2", environment: "prod", change_ticket: "CHG-2", status: "failed", note: "" }
        ]
      }),
      operationsMessages
    );
    const approvals = buildChangeApprovalsOverview(
      normalizeOpsChangeApprovalsPayload({
        total: 2,
        items: [
          { occurred_at: "2026-03-14T10:00:00Z", actor_user_id: 1, ticket_id: "CHG-1", reviewer: "ops", status: "approved", note: "" },
          { occurred_at: "2026-03-15T10:00:00Z", actor_user_id: 2, ticket_id: "CHG-2", reviewer: "ops", status: "pending", note: "" }
        ]
      }),
      operationsMessages
    );

    expect(recovery.metrics).toEqual(expect.arrayContaining([expect.objectContaining({ label: "Passed", value: "1" })]));
    expect(releases.metrics).toEqual(expect.arrayContaining([expect.objectContaining({ label: "Failed", value: "1" })]));
    expect(approvals.metrics).toEqual(expect.arrayContaining([expect.objectContaining({ label: "Pending", value: "1" })]));
  });

  it("builds backup plan and run summaries", () => {
    const plans = buildBackupPlansOverview(
      normalizeOpsBackupPlansPayload({
        total: 2,
        items: [
          { logged_at: "2026-03-14T10:00:00Z", actor_user_id: 1, plan_key: "daily", backup_type: "full", schedule: "0 1 * * *", retention_days: 30, enabled: true, note: "" },
          { logged_at: "2026-03-15T10:00:00Z", actor_user_id: 2, plan_key: "weekly", backup_type: "incremental", schedule: "0 2 * * 1", retention_days: 14, enabled: false, note: "" }
        ]
      }),
      operationsMessages
    );
    const runs = buildBackupRunsOverview(
      normalizeOpsBackupRunsPayload({
        total: 2,
        items: [
          { logged_at: "2026-03-14T10:00:00Z", actor_user_id: 1, plan_key: "daily", status: "success", size_mb: 512, duration_minutes: 22, note: "" },
          { logged_at: "2026-03-15T10:00:00Z", actor_user_id: 2, plan_key: "weekly", status: "failed", size_mb: 0, duration_minutes: 0, note: "" }
        ]
      }),
      operationsMessages
    );

    expect(plans.metrics).toEqual(expect.arrayContaining([expect.objectContaining({ label: "Enabled", value: "1" })]));
    expect(runs.metrics).toEqual(expect.arrayContaining([expect.objectContaining({ label: "Failed", value: "1" })]));
  });
});
