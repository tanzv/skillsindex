import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { AdminOperationsRecordsContent } from "@/src/features/adminOperations/AdminOperationsRecordsContent";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createMessages() {
  return createProtectedPageTestMessages({
    adminCommon: {
      adminEyebrow: "Admin",
      refresh: "Refresh",
      refreshing: "Refreshing..."
    },
    adminOperations: {
      ledgerTitleSuffix: "Ledger",
      ledgerDescription: "Structured operational evidence.",
      noRecords: "No records returned.",
      openRecordEntryAction: "Open Record Entry",
      openRecordDetailAction: "Open Details",
      recordEntryTitle: "Record Entry",
      recordEntryDescription: "Create a new record.",
      recordDetailTitle: "Record Detail",
      recordDetailDescription: "Inspect the selected record without leaving the ledger.",
      rawRecordDetailTitle: "Raw record",
      closePanelAction: "Close Panel",
      saveRecordAction: "Save Record",
      savingRecordAction: "Saving...",
      endpointStatusTitle: "Endpoint Status",
      endpointStatusDescription: "Endpoint details.",
      releaseVersionLabel: "Release version",
      releaseVersionPlaceholder: "v1.0.0",
      releaseEnvironmentLabel: "Release environment",
      releaseEnvironmentPlaceholder: "production",
      releaseChangeTicketLabel: "Release change ticket",
      releaseChangeTicketPlaceholder: "CHG-001",
      releaseStatusLabel: "Release status",
      releaseStatusPlaceholder: "success",
      releaseNoteLabel: "Release note",
      releaseNotePlaceholder: "Release note",
      recordFieldReleasedAt: "Released at",
      recordFieldActorUserId: "Actor user",
      recordValueActorTemplate: "User {id}",
      valueNotAvailable: "n/a",
      recordValueEnvironmentProduction: "production",
      recordValueEnvironmentStaging: "staging",
      recordValueEnvironmentUnknown: "unknown",
      recordValueStatusSuccess: "success",
      recordValueStatusFailed: "failed",
      recordValueStatusRollback: "rollback",
      recordValueStatusApproved: "approved",
      recordValueStatusPending: "pending",
      recordValueStatusRunning: "running",
      recordValueStatusCompleted: "completed",
      recordValueStatusUnknown: "unknown",
      recoveryDrillRpoHoursLabel: "Recovery drill RPO hours",
      recoveryDrillRpoHoursPlaceholder: "4",
      recoveryDrillRtoHoursLabel: "Recovery drill RTO hours",
      recoveryDrillRtoHoursPlaceholder: "6",
      recoveryDrillNoteLabel: "Recovery drill note",
      recoveryDrillNotePlaceholder: "Recovery note",
      changeApprovalTicketIdLabel: "Change approval ticket ID",
      changeApprovalTicketIdPlaceholder: "APP-001",
      changeApprovalReviewerLabel: "Change approval reviewer",
      changeApprovalReviewerPlaceholder: "ops-reviewer",
      changeApprovalStatusLabel: "Change approval status",
      changeApprovalStatusPlaceholder: "approved",
      changeApprovalNoteLabel: "Change approval note",
      changeApprovalNotePlaceholder: "Approval note",
      backupPlanKeyLabel: "Backup plan key",
      backupPlanKeyPlaceholder: "archive-weekly",
      backupTypeLabel: "Backup type",
      backupTypePlaceholder: "full",
      backupScheduleLabel: "Backup schedule",
      backupSchedulePlaceholder: "0 3 * * 0",
      backupRetentionDaysLabel: "Backup retention days",
      backupRetentionDaysPlaceholder: "45",
      backupPlanEnabledLabel: "Backup plan enabled",
      backupPlanNoteLabel: "Backup plan note",
      backupPlanNotePlaceholder: "Plan note",
      backupRunPlanKeyLabel: "Backup run plan key",
      backupRunPlanKeyPlaceholder: "archive-weekly",
      backupRunStatusLabel: "Backup run status",
      backupRunStatusPlaceholder: "success",
      backupRunSizeMbLabel: "Backup run size MB",
      backupRunSizeMbPlaceholder: "512",
      backupRunDurationMinutesLabel: "Backup run duration minutes",
      backupRunDurationMinutesPlaceholder: "18",
      backupRunNoteLabel: "Backup run note",
      backupRunNotePlaceholder: "Run note",
      recordValueBackupTypeFull: "full",
      recordValueBackupTypeSnapshot: "snapshot",
      recordValueBackupTypeIncremental: "incremental",
      recordValueBackupTypeUnknown: "unknown"
    }
  });
}

function renderContent(activePane: "idle" | "create" | "detail" = "create") {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      { locale: "en", messages: createMessages() },
      createElement(AdminOperationsRecordsContent, {
        route: "/admin/ops/releases",
        title: "Releases",
        description: "Track release records.",
        loading: false,
        busyAction: "",
        error: "",
        message: "",
        metrics: [
          { label: "Records", value: "1" },
          { label: "Successful", value: "1" }
        ],
        rows: [
          {
            releasedAt: "2026-03-16T10:00:00Z",
            actorUserId: 3,
            version: "v1.2.3",
            environment: "staging",
            changeTicket: "CHG-100",
            status: "success",
            note: "Release note"
          }
        ],
        endpoint: "/api/bff/admin/ops/releases",
        createEndpoint: "/api/bff/admin/ops/releases",
        formFields: [
          {
            key: "version",
            label: "Release version",
            placeholder: "v1.0.0",
            inputType: "text",
            testId: "ops-records-field-version"
          }
        ],
        draft: { version: "v1.2.3" },
        activePane,
        selectedRecord: {
          index: 0,
          rawValue: null,
          chips: [
            { label: "Release version", value: "v1.2.3" },
            { label: "Release status", value: "success" }
          ]
        },
        onRefresh: () => undefined,
        onOpenCreatePane: () => undefined,
        onClosePane: () => undefined,
        onOpenDetailPane: () => undefined,
        onDraftChange: () => undefined,
        onSubmitCreate: () => undefined
      })
    )
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

describe("admin operations records content", () => {
  it("renders the record entry work pane contract with form fields and ledger context", () => {
    const markup = renderContent("create");

    expectMarkupToContainAll(markup, [
      'data-testid="ops-records-ledger"',
      'data-testid="ops-records-rows"',
      'data-testid="ops-record-row-0"',
      "Open Record Entry",
      "Record Entry",
      "Create a new record.",
      'data-testid="admin-ops-record-create-pane"',
      'data-testid="ops-records-field-version"',
      'aria-label="Release version"',
      "Save Record"
    ]);
    expect(markup).not.toContain('role="dialog"');
  });

  it("renders the record detail work pane contract with resolved chips", () => {
    const markup = renderContent("detail");

    expectMarkupToContainAll(markup, [
      "Releases Ledger",
      "Open Details",
      "Record Detail",
      "Inspect the selected record without leaving the ledger.",
      'data-testid="admin-ops-record-detail-pane"',
      "Release version",
      "v1.2.3",
      "Release status",
      "success"
    ]);
    expect(markup).not.toContain('role="dialog"');
  });
});
