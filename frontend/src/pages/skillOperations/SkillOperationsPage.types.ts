import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import type { SyncPolicyRecord, SyncRunRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";

export type SkillOperationsRoute =
  | "/admin/ingestion/manual"
  | "/admin/ingestion/repository"
  | "/admin/records/imports"
  | "/admin/sync-jobs";

export type SkillOperationsViewKind = "manual" | "repository" | "imports" | "sync-runs";

export type SkillOperationsSubmissionAction =
  | ""
  | "manual"
  | "repository"
  | "archive"
  | "skillmp"
  | "policy"
  | "sync-batch"
  | "job-action";

export interface SkillOperationsPageProps {
  locale: AppLocale;
  route: SkillOperationsRoute;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser?: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

export interface SkillInventoryItem {
  id: number;
  name: string;
  description: string;
  source_type: string;
  visibility: string;
  owner_username: string;
  updated_at: string;
}

export interface ImportJobItem {
  id: number;
  job_type: string;
  status: string;
  owner_user_id: number;
  actor_user_id: number;
  target_skill_id: number;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface ManualSkillDraft {
  name: string;
  description: string;
  content: string;
  tags: string;
  visibility: string;
  install_command: string;
}

export interface RepositorySkillDraft {
  repo_url: string;
  repo_branch: string;
  repo_path: string;
  tags: string;
  visibility: string;
  install_command: string;
}

export interface SkillMPDraft {
  skillmp_url: string;
  skillmp_id: string;
  skillmp_token: string;
  tags: string;
  visibility: string;
  install_command: string;
}

export interface SkillOperationsRouteMeta {
  title: string;
  subtitle: string;
  eyebrow: string;
  primaryActionLabel: string;
  inventoryTitle: string;
  inventoryEmptyText: string;
}

export interface SkillOperationsCopy {
  refresh: string;
  liveState: string;
  schedulerEnabled: string;
  schedulerDisabled: string;
  requestFailed: string;
  policySaved: string;
  sourceInventory: string;
  sourceType: string;
  visibility: string;
  updatedAt: string;
  owner: string;
  noRuns: string;
  runID: string;
  runStatus: string;
  runScope: string;
  runTrigger: string;
  jobType: string;
  actor: string;
  createdAt: string;
  targetSkill: string;
  runStartedAt: string;
  runFailed: string;
  runSynced: string;
  selectedRunDetail: string;
  detailPayload: string;
  policyTitle: string;
  policyDescription: string;
  batchSize: string;
  interval: string;
  timeout: string;
  enabled: string;
  savePolicy: string;
  actions: string;
  openSkills: string;
  openImports: string;
  openSyncRuns: string;
  retryAction: string;
  cancelAction: string;
  formHints: {
    manual: string;
    repository: string;
    archive: string;
    skillmp: string;
  };
  manual: SkillOperationsRouteMeta & {
    name: string;
    description: string;
    content: string;
    tags: string;
    installCommand: string;
    submit: string;
  };
  repository: SkillOperationsRouteMeta & {
    repoURL: string;
    repoBranch: string;
    repoPath: string;
    tags: string;
    installCommand: string;
    submit: string;
    runBatchSync: string;
    latestRuns: string;
  };
  imports: SkillOperationsRouteMeta & {
    archiveTitle: string;
    archiveFile: string;
    archiveSubmit: string;
    skillmpTitle: string;
    skillmpURL: string;
    skillmpID: string;
    skillmpToken: string;
    skillmpSubmit: string;
    jobsTitle: string;
    jobsEmptyText: string;
  };
  syncRuns: SkillOperationsRouteMeta & {
    refreshRuns: string;
    latestRuns: string;
  };
}

export interface SkillOperationsPageContentProps {
  locale: AppLocale;
  route: SkillOperationsRoute;
  loading: boolean;
  error: string;
  message: string;
  submittingAction: SkillOperationsSubmissionAction;
  skills: SkillInventoryItem[];
  importJobs: ImportJobItem[];
  syncRuns: SyncRunRecord[];
  selectedRunID: number;
  syncDetail: Record<string, unknown> | null;
  policy: SyncPolicyRecord;
  onRefresh: () => void;
  onSubmitManual: (draft: ManualSkillDraft) => Promise<void>;
  onSubmitRepository: (draft: RepositorySkillDraft) => Promise<void>;
  onSubmitArchiveImport: (file: File | null, draft: Pick<RepositorySkillDraft, "tags" | "visibility" | "install_command">) => Promise<void>;
  onSubmitSkillMPImport: (draft: SkillMPDraft) => Promise<void>;
  onRunRepositorySyncBatch: () => Promise<void>;
  onRetryImportJob: (jobID: number) => Promise<void>;
  onCancelImportJob: (jobID: number) => Promise<void>;
  onSelectRun: (runID: number) => void;
  onSavePolicy: () => Promise<void>;
  onPolicyChange: (patch: Partial<SyncPolicyRecord>) => void;
  onNavigate: (path: string) => void;
}
