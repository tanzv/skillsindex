import type { AdminIngestionMessages } from "@/src/lib/i18n/protectedPageMessages.ingestion";

export type AdminIngestionDisplayMessages = Pick<
  AdminIngestionMessages,
  | "valueUnnamedSkill"
  | "valueNoDescription"
  | "valueUnknownOwner"
  | "valueUnknown"
  | "sourceTypeManual"
  | "sourceTypeRepository"
  | "sourceTypeUpload"
  | "sourceTypeSkillmp"
  | "visibilityPublic"
  | "visibilityPrivate"
  | "visibilityOrganization"
  | "statusPending"
  | "statusRunning"
  | "statusFailed"
  | "statusCanceled"
  | "statusSuccess"
  | "statusUnknown"
  | "triggerManual"
  | "triggerSchedule"
  | "triggerScheduler"
  | "scopeRepository"
  | "jobTypeImportArchive"
  | "jobTypeImportUpload"
  | "jobTypeImportSkillmp"
>;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveIngestionSkillName(value: string, messages: AdminIngestionDisplayMessages): string {
  return value.trim() || messages.valueUnnamedSkill;
}

export function resolveIngestionDescription(value: string, messages: AdminIngestionDisplayMessages): string {
  return value.trim() || messages.valueNoDescription;
}

export function resolveIngestionOwnerLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "unknown") {
    return messages.valueUnknownOwner;
  }

  return value.trim();
}

export function resolveIngestionSourceTypeLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "manual") {
    return messages.sourceTypeManual;
  }
  if (normalized === "repository") {
    return messages.sourceTypeRepository;
  }
  if (normalized === "upload") {
    return messages.sourceTypeUpload;
  }
  if (normalized === "skillmp") {
    return messages.sourceTypeSkillmp;
  }

  return value.trim();
}

export function resolveIngestionVisibilityLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "private") {
    return messages.visibilityPrivate;
  }
  if (normalized === "public") {
    return messages.visibilityPublic;
  }
  if (normalized === "organization") {
    return messages.visibilityOrganization;
  }

  return value.trim();
}

export function resolveIngestionStatusLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "unknown") {
    return messages.statusUnknown;
  }
  if (normalized === "pending") {
    return messages.statusPending;
  }
  if (normalized === "running") {
    return messages.statusRunning;
  }
  if (normalized === "failed") {
    return messages.statusFailed;
  }
  if (normalized === "canceled") {
    return messages.statusCanceled;
  }
  if (normalized === "success") {
    return messages.statusSuccess;
  }

  return value.trim();
}

export function resolveIngestionTriggerLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "manual") {
    return messages.triggerManual;
  }
  if (normalized === "schedule") {
    return messages.triggerSchedule;
  }
  if (normalized === "scheduler") {
    return messages.triggerScheduler;
  }

  return value.trim();
}

export function resolveIngestionScopeLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "repository") {
    return messages.scopeRepository;
  }

  return value.trim();
}

export function resolveIngestionJobTypeLabel(value: string, messages: AdminIngestionDisplayMessages): string {
  const normalized = normalizeValue(value);

  if (!normalized || normalized === "unknown") {
    return messages.valueUnknown;
  }
  if (normalized === "import_archive") {
    return messages.jobTypeImportArchive;
  }
  if (normalized === "import_upload") {
    return messages.jobTypeImportUpload;
  }
  if (normalized === "import_skillmp") {
    return messages.jobTypeImportSkillmp;
  }

  return value.trim();
}
