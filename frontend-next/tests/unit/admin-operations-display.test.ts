import { describe, expect, it } from "vitest";

import {
  buildOpsRecordChips,
  resolveOpsAlertMessage,
  resolveOpsReleaseGateMessage,
  resolveOpsSeverityLabel,
  resolveReleaseGateBadgeLabel
} from "@/src/features/adminOperations/display";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const operationsMessages = createProtectedPageTestMessages({
  adminOperations: {
    severityNormal: "Normal",
    severityWarning: "Warning",
    severityCritical: "Critical",
    severityHigh: "High",
    severityBlocked: "Blocked",
    severityUnknown: "Unknown",
    statePassed: "Passed",
    stateBlocked: "Blocked",
    valueNotAvailable: "n/a",
    alertMessageFallback: "No alert message",
    releaseGateMessageFallback: "No gate message",
    recordFieldLoggedAt: "Logged At",
    recordFieldOccurredAt: "Occurred At",
    recordFieldReleasedAt: "Released At",
    recordFieldActorUserId: "Actor",
    recordFieldPassed: "Passed",
    recordValueActorTemplate: "User {id}",
    recordValueYes: "Yes",
    recordValueNo: "No",
    recordValueStatusApproved: "Approved",
    recordValueStatusPending: "Pending",
    recordValueStatusSuccess: "Success",
    recordValueStatusFailed: "Failed",
    recordValueStatusRollback: "Rollback",
    recordValueStatusRunning: "Running",
    recordValueStatusCompleted: "Completed",
    recordValueStatusUnknown: "Unknown Status",
    recordValueEnvironmentProduction: "Production",
    recordValueEnvironmentStaging: "Staging",
    recordValueEnvironmentUnknown: "Unknown Environment",
    recordValueBackupTypeFull: "Full",
    recordValueBackupTypeSnapshot: "Snapshot",
    recordValueBackupTypeIncremental: "Incremental",
    recordValueBackupTypeUnknown: "Unknown Backup Type",
    recoveryDrillRpoHoursLabel: "RPO",
    recoveryDrillRtoHoursLabel: "RTO",
    recoveryDrillNoteLabel: "Recovery note",
    releaseVersionLabel: "Version",
    releaseEnvironmentLabel: "Environment",
    releaseChangeTicketLabel: "Change Ticket",
    releaseStatusLabel: "Status",
    releaseNoteLabel: "Release note",
    changeApprovalTicketIdLabel: "Ticket",
    changeApprovalReviewerLabel: "Reviewer",
    changeApprovalStatusLabel: "Approval status",
    changeApprovalNoteLabel: "Approval note",
    backupPlanKeyLabel: "Plan Key",
    backupTypeLabel: "Backup Type",
    backupScheduleLabel: "Schedule",
    backupRetentionDaysLabel: "Retention Days",
    backupPlanEnabledLabel: "Enabled",
    backupPlanNoteLabel: "Plan note",
    backupRunPlanKeyLabel: "Run Plan Key",
    backupRunStatusLabel: "Run Status",
    backupRunSizeMbLabel: "Size MB",
    backupRunDurationMinutesLabel: "Duration Minutes",
    backupRunNoteLabel: "Run note"
  }
}).adminOperations;

describe("admin operations display helpers", () => {
  it("localizes severities and fallback messages", () => {
    expect(resolveOpsSeverityLabel("high", operationsMessages)).toBe("High");
    expect(resolveOpsSeverityLabel("blocked", operationsMessages)).toBe("Blocked");
    expect(resolveOpsSeverityLabel("", operationsMessages)).toBe("Unknown");
    expect(resolveOpsAlertMessage("", operationsMessages)).toBe("No alert message");
    expect(resolveOpsReleaseGateMessage("", operationsMessages)).toBe("No gate message");
    expect(
      resolveReleaseGateBadgeLabel(
        { code: "release.readiness", severity: "critical", message: "", passed: false },
        operationsMessages
      )
    ).toBe("Critical");
  });

  it("builds localized record chips for release rows", () => {
    const chips = buildOpsRecordChips(
      "/admin/ops/releases",
      {
        releasedAt: "2026-03-19T00:00:00Z",
        actorUserId: 7,
        version: "v1.2.3",
        environment: "production",
        changeTicket: "CHG-001",
        status: "success",
        note: ""
      },
      "en",
      operationsMessages
    );

    expect(chips).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Actor", value: "User 7" }),
        expect.objectContaining({ label: "Environment", value: "Production" }),
        expect.objectContaining({ label: "Status", value: "Success" }),
        expect.objectContaining({ label: "Release note", value: "n/a" })
      ])
    );
  });
});
