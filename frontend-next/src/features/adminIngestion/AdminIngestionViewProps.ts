import type {
  ImportJobItem,
  ImportsDraft,
  ManualDraft,
  RepositoryDraft,
  RepositorySyncPolicy,
  SkillInventoryItem,
  SyncRunItem
} from "./model";

export interface ManualIngestionViewProps {
  draft: ManualDraft;
  skills: SkillInventoryItem[];
  busyAction: string;
  onDraftChange: (patch: Partial<ManualDraft>) => void;
  onSubmit: () => void;
}

export interface RepositoryIngestionViewProps {
  draft: RepositoryDraft;
  skills: SkillInventoryItem[];
  policy: RepositorySyncPolicy;
  syncRuns: SyncRunItem[];
  busyAction: string;
  onDraftChange: (patch: Partial<RepositoryDraft>) => void;
  onPolicyChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onSubmit: () => void;
  onSavePolicy: () => void;
}

export interface ImportsIngestionViewProps {
  draft: ImportsDraft;
  selectedArchiveName: string;
  skills: SkillInventoryItem[];
  jobs: ImportJobItem[];
  busyAction: string;
  onDraftChange: (patch: Partial<ImportsDraft>) => void;
  onArchiveFileChange: (file: File | null) => void;
  onSubmitArchive: () => void;
  onSubmitSkillMP: () => void;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
}
