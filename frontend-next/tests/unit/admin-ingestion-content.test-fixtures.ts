import type { AdminIngestionOverlayState } from "@/src/features/adminIngestion/AdminIngestionViewProps";
import type { AdminIngestionRoute } from "@/src/lib/routing/adminRouteRegistry";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const metrics = [{ label: "Inventory", value: "2" }];

const noop = () => undefined;

function noopDraftChange(...args: unknown[]) {
  void args;
}

function noopOpenById(...args: unknown[]) {
  void args;
}

function noopArchiveFileChange(...args: unknown[]) {
  void args;
}

function noopRunJobAction(...args: unknown[]) {
  void args;
}

const manualSkill = {
  id: 11,
  name: "Manual Skill",
  description: "Manual description",
  sourceType: "manual",
  visibility: "private",
  ownerUsername: "ops.lead",
  updatedAt: "2026-03-16T08:00:00Z"
} as const;

const repositorySkill = {
  id: 21,
  name: "Repository Skill",
  description: "Repository description",
  sourceType: "repository",
  visibility: "public",
  ownerUsername: "repo.bot",
  updatedAt: "2026-03-16T08:00:00Z"
} as const;

const importedSkill = {
  id: 31,
  name: "Imported Skill",
  description: "Imported description",
  sourceType: "upload",
  visibility: "private",
  ownerUsername: "import.bot",
  updatedAt: "2026-03-16T08:00:00Z"
} as const;

const syncRun = {
  id: 41,
  trigger: "schedule",
  scope: "repository",
  status: "success",
  failed: 0,
  synced: 12,
  startedAt: "2026-03-16T08:10:00Z"
} as const;

const importJob = {
  id: 81,
  jobType: "import_archive",
  status: "failed",
  targetSkillId: 31,
  errorMessage: "archive parse failed",
  createdAt: "2026-03-16T08:00:00Z",
  updatedAt: "2026-03-16T08:01:00Z"
} as const;

export const adminIngestionTestMessages = createProtectedPageTestMessages({
  adminCommon: {
    adminEyebrow: "Admin",
    refresh: "Refresh",
    refreshing: "Refreshing..."
  },
  adminIngestion: {
    manualAuthoringTitle: "Manual Authoring",
    manualAuthoringDescription: "Compose a governed skill record directly when the source does not begin in a repository or import pipeline.",
    repositoryIntakeTitle: "Repository Intake",
    repositoryIntakeDescription: "Submit repository metadata for extraction, governance review, and follow-on synchronization.",
    schedulerPolicyTitle: "Scheduler Policy",
    schedulerPolicyDescription: "Keep repository sync cadence near the intake flow so the handoff from authoring to automation stays visible.",
    archiveImportTitle: "Archive Import",
    archiveImportDescription: "Upload a packaged archive and let the backend extract a persisted skill record from the bundle.",
    skillmpImportTitle: "SkillMP Import",
    skillmpImportDescription: "Pull one remote SkillMP definition directly into the governed import inventory.",
    manualInventoryTitle: "Manual Inventory",
    manualInventoryDescription: "Manually-authored records currently available for governance and publication review.",
    manualInventoryEmpty: "No manually-authored skills are available yet.",
    repositoryInventoryTitle: "Repository Inventory",
    repositoryInventoryDescription: "Repository-backed skills currently available for monitored synchronization.",
    repositoryInventoryEmpty: "No repository-backed skills are available yet.",
    importedInventoryTitle: "Imported Inventory",
    importedInventoryDescription: "Archive and SkillMP entries that already landed in the governed import inventory.",
    importedInventoryEmpty: "No archive or SkillMP imports are available yet.",
    publishingGuardrailsTitle: "Publishing Guardrails",
    publishingGuardrailsDescription: "Keep manually-authored entries aligned with the same governance posture used by repository and import flows.",
    publishingGuardrailsItemOne: "Capture a concise description and install command so operators can review the manual record without opening a secondary page.",
    publishingGuardrailsItemTwo: "Use visibility intentionally. Public entries should already satisfy the same catalog review expectations as repository-backed skills.",
    recentSyncRunsTitle: "Recent Sync Runs",
    recentSyncRunsDescription: "Latest synchronization evidence returned by the repository sync endpoint.",
    recentSyncRunsEmpty: "No repository sync runs are available yet.",
    importJobsTitle: "Import Jobs",
    importJobsDescription: "Actionable archive and SkillMP import activity returned by the admin job endpoint.",
    importJobsEmpty: "No import jobs are available yet.",
    nameLabel: "Name",
    descriptionLabel: "Description",
    contentLabel: "Content",
    tagsLabel: "Tags",
    visibilityLabel: "Visibility",
    installCommandLabel: "Install Command",
    repositoryUrlLabel: "Repository URL",
    repositoryBranchLabel: "Repository Branch",
    repositoryPathLabel: "Repository Path",
    enabledLabel: "Enabled",
    enabledHelp: "Allow scheduled repository synchronization",
    intervalLabel: "Interval",
    timeoutLabel: "Timeout",
    batchSizeLabel: "Batch Size",
    archiveFileLabel: "Archive File",
    skillmpUrlLabel: "SkillMP URL",
    skillmpIdLabel: "SkillMP ID",
    skillmpTokenLabel: "SkillMP Token",
    createManualAction: "Create Manual Skill",
    savingManualAction: "Saving...",
    startRepositoryAction: "Start Repository Intake",
    submittingRepositoryAction: "Submitting...",
    savePolicyAction: "Save Policy",
    savingPolicyAction: "Saving...",
    importArchiveAction: "Import Archive",
    uploadingArchiveAction: "Uploading...",
    importSkillmpAction: "Import SkillMP",
    submittingSkillmpAction: "Submitting...",
    openDetailAction: "Open Details",
    closePanelAction: "Close Panel",
    retryAction: "Retry",
    retryingAction: "Retrying...",
    cancelAction: "Cancel",
    cancelingAction: "Canceling...",
    selectedArchiveTemplate: "Selected archive: {fileName}",
    runsCountTemplate: "{count} runs",
    jobsCountTemplate: "{count} jobs",
    itemsCountTemplate: "{count} items",
    runLabelTemplate: "Run #{runId}",
    jobLabelTemplate: "Job #{jobId}",
    targetLabelTemplate: "Target {targetId}",
    syncedCountTemplate: "Synced {count}",
    failedCountTemplate: "Failed {count}",
    valueNotAvailable: "n/a",
    valueEnabled: "Enabled",
    valueDisabled: "Disabled",
    valueUnnamedSkill: "Unnamed skill",
    valueNoDescription: "No description",
    valueUnknownOwner: "Unknown owner",
    valueUnknown: "Unknown",
    sourceTypeManual: "Manual",
    sourceTypeRepository: "Repository",
    sourceTypeUpload: "Upload",
    sourceTypeSkillmp: "SkillMP",
    visibilityPublic: "Public",
    visibilityPrivate: "Private",
    visibilityOrganization: "Organization",
    statusPending: "Pending",
    statusRunning: "Running",
    statusFailed: "Failed",
    statusCanceled: "Canceled",
    statusSuccess: "Success",
    statusUnknown: "Unknown",
    triggerManual: "Manual",
    triggerSchedule: "Schedule",
    triggerScheduler: "Scheduler",
    scopeRepository: "Repository",
    jobTypeImportArchive: "Import archive",
    jobTypeImportUpload: "Import upload",
    jobTypeImportSkillmp: "Import SkillMP",
    metricManualSkills: "Manual Skills",
    metricPublicSkills: "Public Skills",
    metricPrivateSkills: "Private Skills",
    metricRepositorySkills: "Repository Skills",
    metricSyncRuns: "Sync Runs",
    metricFailedRuns: "Failed Runs",
    metricScheduler: "Scheduler",
    metricArchiveImports: "Archive Imports",
    metricSkillmpImports: "SkillMP Imports",
    metricImportJobs: "Import Jobs",
    metricFailedJobs: "Failed Jobs"
  }
});

export function createAdminIngestionContentTestProps(
  route: AdminIngestionRoute,
  overlay: AdminIngestionOverlayState | null = null
) {
  return {
    route,
    title: "Ingestion",
    description: "Route specific ingestion view",
    loading: false,
    error: "",
    message: "",
    metrics,
    overlay,
    onCloseOverlay: noop,
    onRefresh: noop,
    manualView: {
      draft: {
        name: "Manual Skill",
        description: "Manual description",
        content: "skill content",
        tags: "manual ops",
        visibility: "private",
        install_command: "uvx install manual"
      },
      skills: [manualSkill],
      selectedSkill: manualSkill,
      busyAction: "",
      onDraftChange: noopDraftChange,
      onSubmit: noop,
      onOpenCreate: noop,
      onOpenSkillDetail: noopOpenById
    },
    repositoryView: {
      draft: {
        repo_url: "https://github.com/example/repo",
        repo_branch: "main",
        repo_path: "skills/catalog",
        tags: "repository",
        visibility: "public",
        install_command: "uvx install repo"
      },
      skills: [repositorySkill],
      selectedSkill: repositorySkill,
      policy: {
        enabled: true,
        interval: "15m",
        timeout: "5m",
        batchSize: 30
      },
      syncRuns: [syncRun],
      selectedSyncRun: syncRun,
      busyAction: "",
      onDraftChange: noopDraftChange,
      onPolicyChange: noopDraftChange,
      onSubmit: noop,
      onSavePolicy: noop,
      onOpenRepositoryIntake: noop,
      onOpenPolicy: noop,
      onOpenSkillDetail: noopOpenById,
      onOpenSyncRunDetail: noopOpenById
    },
    importsView: {
      draft: {
        archive_tags: "archive",
        archive_visibility: "private",
        archive_install_command: "npx import archive",
        skillmp_url: "https://skillmp.example.com/42",
        skillmp_id: "skillmp-42",
        skillmp_token: "token",
        skillmp_tags: "skillmp",
        skillmp_visibility: "public",
        skillmp_install_command: "npx import skillmp"
      },
      selectedArchiveName: "archive-42.zip",
      skills: [importedSkill],
      selectedSkill: importedSkill,
      jobs: [importJob],
      selectedJob: importJob,
      busyAction: "",
      onDraftChange: noopDraftChange,
      onArchiveFileChange: noopArchiveFileChange,
      onSubmitArchive: noop,
      onSubmitSkillMP: noop,
      onRunJobAction: noopRunJobAction,
      onOpenArchiveImport: noop,
      onOpenSkillMPImport: noop,
      onOpenSkillDetail: noopOpenById,
      onOpenJobDetail: noopOpenById
    }
  };
}
