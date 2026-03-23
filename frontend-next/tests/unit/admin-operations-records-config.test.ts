import { describe, expect, it } from "vitest";

import { buildCreatePayload, getRecordsFormFields } from "@/src/features/adminOperations/records-config";
import { resolveAdminOperationsRecordsRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const operationsMessages = createProtectedPageTestMessages({
  adminOperations: {
    routeRecoveryDrillsTitle: "Recovery Drills",
    routeRecoveryDrillsDescription: "Track recovery validation runs.",
    routeBackupPlansTitle: "Backup Plans",
    routeBackupPlansDescription: "Manage backup plans.",
    recoveryDrillRpoHoursLabel: "Recovery drill RPO hours",
    recoveryDrillRpoHoursPlaceholder: "RPO hours",
    recoveryDrillRtoHoursLabel: "Recovery drill RTO hours",
    recoveryDrillRtoHoursPlaceholder: "RTO hours",
    recoveryDrillNoteLabel: "Recovery drill note",
    recoveryDrillNotePlaceholder: "Recovery drill note",
    backupPlanKeyLabel: "Backup plan key",
    backupPlanKeyPlaceholder: "Plan key",
    backupTypeLabel: "Backup type",
    backupTypePlaceholder: "Backup type",
    backupScheduleLabel: "Backup schedule",
    backupSchedulePlaceholder: "Schedule",
    backupRetentionDaysLabel: "Backup retention days",
    backupRetentionDaysPlaceholder: "Retention days",
    backupPlanEnabledLabel: "Backup plan enabled",
    backupPlanNoteLabel: "Backup plan note",
    backupPlanNotePlaceholder: "Backup plan note"
  }
}).adminOperations;

describe("admin operations records config", () => {
  it("provides accessible field metadata for mutable routes", () => {
    const recoveryFields = getRecordsFormFields("/admin/ops/recovery-drills", operationsMessages);
    const backupPlanFields = getRecordsFormFields("/admin/ops/backup/plans", operationsMessages);

    expect(recoveryFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "rpo_hours", label: "Recovery drill RPO hours", inputType: "number" }),
        expect.objectContaining({ key: "note", label: "Recovery drill note", inputType: "text" })
      ])
    );
    expect(backupPlanFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "enabled", label: "Backup plan enabled", inputType: "checkbox" })
      ])
    );
  });

  it("builds route meta with localized labels and endpoints", () => {
    expect(resolveAdminOperationsRecordsRouteMeta("/admin/ops/recovery-drills", operationsMessages)).toEqual({
      title: "Recovery Drills",
      description: "Track recovery validation runs.",
      endpoint: "/api/bff/admin/ops/recovery-drills",
      createEndpoint: "/api/bff/admin/ops/recovery-drills/run"
    });

    expect(resolveAdminOperationsRecordsRouteMeta("/admin/ops/backup/plans", operationsMessages)).toEqual({
      title: "Backup Plans",
      description: "Manage backup plans.",
      endpoint: "/api/bff/admin/ops/backup/plans",
      createEndpoint: "/api/bff/admin/ops/backup/plans"
    });
  });

  it("builds create payloads with stable defaults", () => {
    expect(
      buildCreatePayload("/admin/ops/releases", {
        version: "v9.1.0",
        environment: "staging",
        change_ticket: "CHG-991",
        status: "success",
        note: "Validated"
      })
    ).toEqual({
      version: "v9.1.0",
      environment: "staging",
      change_ticket: "CHG-991",
      status: "success",
      note: "Validated"
    });

    expect(
      buildCreatePayload("/admin/ops/backup/plans", {
        plan_key: "archive-weekly",
        backup_type: "snapshot",
        schedule: "0 3 * * 0",
        retention_days: "45",
        enabled: "true",
        note: "Retain evidence"
      })
    ).toEqual({
      plan_key: "archive-weekly",
      backup_type: "snapshot",
      schedule: "0 3 * * 0",
      retention_days: 45,
      enabled: true,
      note: "Retain evidence"
    });
  });

  it("derives empty create payload defaults from the shared field contract", () => {
    expect(buildCreatePayload("/admin/ops/releases", {})).toEqual({
      version: "",
      environment: "production",
      change_ticket: "",
      status: "success",
      note: ""
    });

    expect(buildCreatePayload("/admin/ops/backup/plans", {})).toEqual({
      plan_key: "",
      backup_type: "full",
      schedule: "",
      retention_days: 0,
      enabled: false,
      note: ""
    });
  });
});
