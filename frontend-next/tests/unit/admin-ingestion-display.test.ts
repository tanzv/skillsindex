import { describe, expect, it } from "vitest";

import {
  resolveIngestionDescription,
  resolveIngestionJobTypeLabel,
  resolveIngestionOwnerLabel,
  resolveIngestionScopeLabel,
  resolveIngestionSkillName,
  resolveIngestionSourceTypeLabel,
  resolveIngestionStatusLabel,
  resolveIngestionTriggerLabel,
  resolveIngestionVisibilityLabel,
  type AdminIngestionDisplayMessages
} from "@/src/features/adminIngestion/display";

const messages: AdminIngestionDisplayMessages = {
  valueUnnamedSkill: "display_unnamed_skill",
  valueNoDescription: "display_no_description",
  valueUnknownOwner: "display_unknown_owner",
  valueUnknown: "display_unknown",
  sourceTypeManual: "display_source_manual",
  sourceTypeRepository: "display_source_repository",
  sourceTypeUpload: "display_source_upload",
  sourceTypeSkillmp: "display_source_skillmp",
  visibilityPublic: "display_visibility_public",
  visibilityPrivate: "display_visibility_private",
  visibilityOrganization: "display_visibility_organization",
  statusPending: "display_status_pending",
  statusRunning: "display_status_running",
  statusFailed: "display_status_failed",
  statusCanceled: "display_status_canceled",
  statusSuccess: "display_status_success",
  statusUnknown: "display_status_unknown",
  triggerManual: "display_trigger_manual",
  triggerSchedule: "display_trigger_schedule",
  triggerScheduler: "display_trigger_scheduler",
  scopeRepository: "display_scope_repository",
  jobTypeImportArchive: "display_job_archive",
  jobTypeImportUpload: "display_job_upload",
  jobTypeImportSkillmp: "display_job_skillmp"
};

describe("admin ingestion display", () => {
  it("maps fallback and protocol values to localized display labels", () => {
    expect(resolveIngestionSkillName("", messages)).toBe("display_unnamed_skill");
    expect(resolveIngestionDescription("", messages)).toBe("display_no_description");
    expect(resolveIngestionOwnerLabel("", messages)).toBe("display_unknown_owner");
    expect(resolveIngestionOwnerLabel("unknown", messages)).toBe("display_unknown_owner");

    expect(resolveIngestionSourceTypeLabel("manual", messages)).toBe("display_source_manual");
    expect(resolveIngestionSourceTypeLabel("repository", messages)).toBe("display_source_repository");
    expect(resolveIngestionSourceTypeLabel("upload", messages)).toBe("display_source_upload");
    expect(resolveIngestionSourceTypeLabel("skillmp", messages)).toBe("display_source_skillmp");

    expect(resolveIngestionVisibilityLabel("public", messages)).toBe("display_visibility_public");
    expect(resolveIngestionVisibilityLabel("private", messages)).toBe("display_visibility_private");
    expect(resolveIngestionVisibilityLabel("organization", messages)).toBe("display_visibility_organization");

    expect(resolveIngestionStatusLabel("pending", messages)).toBe("display_status_pending");
    expect(resolveIngestionStatusLabel("running", messages)).toBe("display_status_running");
    expect(resolveIngestionStatusLabel("failed", messages)).toBe("display_status_failed");
    expect(resolveIngestionStatusLabel("canceled", messages)).toBe("display_status_canceled");
    expect(resolveIngestionStatusLabel("success", messages)).toBe("display_status_success");
    expect(resolveIngestionStatusLabel("", messages)).toBe("display_status_unknown");

    expect(resolveIngestionTriggerLabel("manual", messages)).toBe("display_trigger_manual");
    expect(resolveIngestionTriggerLabel("schedule", messages)).toBe("display_trigger_schedule");
    expect(resolveIngestionTriggerLabel("scheduler", messages)).toBe("display_trigger_scheduler");

    expect(resolveIngestionScopeLabel("repository", messages)).toBe("display_scope_repository");
    expect(resolveIngestionJobTypeLabel("import_archive", messages)).toBe("display_job_archive");
    expect(resolveIngestionJobTypeLabel("import_upload", messages)).toBe("display_job_upload");
    expect(resolveIngestionJobTypeLabel("import_skillmp", messages)).toBe("display_job_skillmp");
    expect(resolveIngestionJobTypeLabel("", messages)).toBe("display_unknown");
  });

  it("preserves forward-compatible values that do not have a dedicated mapping", () => {
    expect(resolveIngestionStatusLabel("paused", messages)).toBe("paused");
    expect(resolveIngestionSourceTypeLabel("remote", messages)).toBe("remote");
    expect(resolveIngestionJobTypeLabel("import_git", messages)).toBe("import_git");
  });
});
