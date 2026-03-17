import { describe, expect, it } from "vitest";

import { buildCreatePayload, getRecordsFormFields } from "@/src/features/adminOperations/recordsConfig";

describe("admin operations records config", () => {
  it("provides accessible field metadata for mutable routes", () => {
    const recoveryFields = getRecordsFormFields("/admin/ops/recovery-drills");
    const backupPlanFields = getRecordsFormFields("/admin/ops/backup/plans");

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
});
