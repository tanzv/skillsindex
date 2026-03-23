import type { AdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";

import type {
  ImportJobItem,
  ImportsDraft,
  ManualDraft,
  RepositoryDraft,
  RepositorySyncPolicy,
  SkillInventoryItem,
  SyncRunItem
} from "./model";

export type AdminIngestionOverlayEntity =
  | "manualForm"
  | "repositoryForm"
  | "repositoryPolicy"
  | "archiveForm"
  | "skillmpForm"
  | "skillDetail"
  | "syncRunDetail"
  | "importJobDetail";

export type AdminIngestionOverlayState = AdminOverlayState<AdminIngestionOverlayEntity>;

export interface ManualIngestionViewProps {
  draft: ManualDraft;
  skills: SkillInventoryItem[];
  selectedSkill: SkillInventoryItem | null;
  busyAction: string;
  onDraftChange: (patch: Partial<ManualDraft>) => void;
  onSubmit: () => void;
  onOpenCreate: () => void;
  onOpenSkillDetail: (skillId: number) => void;
}

export interface RepositoryIngestionViewProps {
  draft: RepositoryDraft;
  skills: SkillInventoryItem[];
  selectedSkill: SkillInventoryItem | null;
  policy: RepositorySyncPolicy;
  syncRuns: SyncRunItem[];
  selectedSyncRun: SyncRunItem | null;
  busyAction: string;
  onDraftChange: (patch: Partial<RepositoryDraft>) => void;
  onPolicyChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onSubmit: () => void;
  onSavePolicy: () => void;
  onOpenRepositoryIntake: () => void;
  onOpenPolicy: () => void;
  onOpenSkillDetail: (skillId: number) => void;
  onOpenSyncRunDetail: (runId: number) => void;
}

export interface ImportsIngestionViewProps {
  draft: ImportsDraft;
  selectedArchiveName: string;
  skills: SkillInventoryItem[];
  selectedSkill: SkillInventoryItem | null;
  jobs: ImportJobItem[];
  selectedJob: ImportJobItem | null;
  busyAction: string;
  onDraftChange: (patch: Partial<ImportsDraft>) => void;
  onArchiveFileChange: (file: File | null) => void;
  onSubmitArchive: () => void;
  onSubmitSkillMP: () => void;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
  onOpenArchiveImport: () => void;
  onOpenSkillMPImport: () => void;
  onOpenSkillDetail: (skillId: number) => void;
  onOpenJobDetail: (jobId: number) => void;
}
