import type { AdminCatalogMessages } from "@/src/lib/i18n/protectedPageMessages.catalog";

export type AdminCatalogDisplayMessages = Pick<
  AdminCatalogMessages,
  | "valueUnnamedSkill"
  | "valueGeneralCategory"
  | "valueUnknown"
  | "valueUnknownOwner"
  | "sourceTypeManual"
  | "sourceTypeRepository"
  | "visibilityPublic"
  | "visibilityPrivate"
  | "visibilityOrganization"
  | "triggerManual"
  | "triggerSchedule"
  | "scopeRepository"
  | "statusQueued"
  | "statusPending"
  | "statusRunning"
  | "statusFailed"
  | "statusCanceled"
  | "statusSuccess"
  | "statusCompleted"
  | "statusUnknown"
  | "jobTypeRepositorySync"
  | "jobTypeImportArchive"
  | "jobTypeImportSkillmp"
  | "jobTypeImportZip"
>;

const fallbackDisplayMessages: AdminCatalogDisplayMessages = {
  valueUnnamedSkill: "Unnamed skill",
  valueGeneralCategory: "General",
  valueUnknown: "Unknown",
  valueUnknownOwner: "Unknown owner",
  sourceTypeManual: "Manual",
  sourceTypeRepository: "Repository",
  visibilityPublic: "Public",
  visibilityPrivate: "Private",
  visibilityOrganization: "Organization",
  triggerManual: "Manual",
  triggerSchedule: "Scheduled",
  scopeRepository: "Repository",
  statusQueued: "Queued",
  statusPending: "Pending",
  statusRunning: "Running",
  statusFailed: "Failed",
  statusCanceled: "Canceled",
  statusSuccess: "Success",
  statusCompleted: "Completed",
  statusUnknown: "Unknown",
  jobTypeRepositorySync: "Repository Sync",
  jobTypeImportArchive: "Archive Import",
  jobTypeImportSkillmp: "SkillMP Import",
  jobTypeImportZip: "ZIP Import"
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveAdminCatalogDisplayMessages(
  messages?: Partial<AdminCatalogDisplayMessages>
): AdminCatalogDisplayMessages {
  return { ...fallbackDisplayMessages, ...messages };
}

export function resolveCatalogSkillName(value: string, messages: AdminCatalogDisplayMessages): string {
  return value.trim() || messages.valueUnnamedSkill;
}

export function resolveCatalogCategoryLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "general") {
    return messages.valueGeneralCategory;
  }
  return value.trim();
}

export function resolveCatalogOwnerLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  return value.trim() || messages.valueUnknownOwner;
}

export function resolveCatalogSourceTypeLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "manual") {
    return messages.sourceTypeManual;
  }
  if (normalized === "repository") {
    return messages.sourceTypeRepository;
  }
  return value.trim();
}

export function resolveCatalogVisibilityLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
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

export function resolveCatalogTriggerLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "manual") {
    return messages.triggerManual;
  }
  if (normalized === "schedule") {
    return messages.triggerSchedule;
  }
  return value.trim();
}

export function resolveCatalogScopeLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "repository") {
    return messages.scopeRepository;
  }
  return value.trim();
}

export function resolveCatalogStatusLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "unknown") {
    return messages.statusUnknown;
  }
  if (normalized === "queued") {
    return messages.statusQueued;
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
  if (normalized === "completed") {
    return messages.statusCompleted;
  }
  return value.trim();
}

export function resolveCatalogJobTypeLabel(value: string, messages: AdminCatalogDisplayMessages): string {
  const normalized = normalizeToken(value);
  if (!normalized || normalized === "unknown") {
    return messages.valueUnknown;
  }
  if (normalized === "repo_sync") {
    return messages.jobTypeRepositorySync;
  }
  if (normalized === "import_archive") {
    return messages.jobTypeImportArchive;
  }
  if (normalized === "import_skillmp") {
    return messages.jobTypeImportSkillmp;
  }
  if (normalized === "import_zip") {
    return messages.jobTypeImportZip;
  }
  return value.trim();
}
