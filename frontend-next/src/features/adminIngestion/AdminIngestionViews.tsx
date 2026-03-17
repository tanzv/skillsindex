import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import type {
  ImportJobItem,
  ImportsDraft,
  ManualDraft,
  RepositoryDraft,
  RepositorySyncPolicy,
  SkillInventoryItem,
  SyncRunItem
} from "./model";
import { ImportJobsCard, ManualGuidanceCard, RecentSyncRunsCard } from "./AdminIngestionPanels";
import { FormField, SkillInventoryList, textareaClassName } from "./shared";

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

function ManualAuthoringCard({ draft, busyAction, onDraftChange, onSubmit }: ManualIngestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Authoring</CardTitle>
        <CardDescription>Compose a governed skill record directly when the source does not begin in a repository or import pipeline.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Name">
          <Input aria-label="Name" value={draft.name} onChange={(event) => onDraftChange({ name: event.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea
            aria-label="Description"
            className={textareaClassName}
            value={draft.description}
            onChange={(event) => onDraftChange({ description: event.target.value })}
          />
        </FormField>
        <FormField label="Content">
          <textarea
            aria-label="Content"
            className={textareaClassName}
            value={draft.content}
            onChange={(event) => onDraftChange({ content: event.target.value })}
          />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tags">
            <Input value={draft.tags} onChange={(event) => onDraftChange({ tags: event.target.value })} />
          </FormField>
          <FormField label="Visibility">
            <Input value={draft.visibility} onChange={(event) => onDraftChange({ visibility: event.target.value })} />
          </FormField>
        </div>
        <FormField label="Install Command">
          <Input value={draft.install_command} onChange={(event) => onDraftChange({ install_command: event.target.value })} />
        </FormField>
        <Button onClick={onSubmit} disabled={Boolean(busyAction)}>
          {busyAction === "manual" ? "Saving..." : "Create Manual Skill"}
        </Button>
      </CardContent>
    </Card>
  );
}

function RepositoryIntakeCard({ draft, busyAction, onDraftChange, onSubmit }: RepositoryIngestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Intake</CardTitle>
        <CardDescription>Submit repository metadata for extraction, governance review, and follow-on synchronization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Repository URL">
          <Input aria-label="Repository URL" value={draft.repo_url} onChange={(event) => onDraftChange({ repo_url: event.target.value })} />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Repository Branch">
            <Input aria-label="Repository Branch" value={draft.repo_branch} onChange={(event) => onDraftChange({ repo_branch: event.target.value })} />
          </FormField>
          <FormField label="Repository Path">
            <Input aria-label="Repository Path" value={draft.repo_path} onChange={(event) => onDraftChange({ repo_path: event.target.value })} />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tags">
            <Input aria-label="Tags" value={draft.tags} onChange={(event) => onDraftChange({ tags: event.target.value })} />
          </FormField>
          <FormField label="Visibility">
            <Input aria-label="Visibility" value={draft.visibility} onChange={(event) => onDraftChange({ visibility: event.target.value })} />
          </FormField>
        </div>
        <FormField label="Install Command">
          <Input
            aria-label="Install Command"
            value={draft.install_command}
            onChange={(event) => onDraftChange({ install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmit} disabled={Boolean(busyAction)}>
          {busyAction === "repository" ? "Submitting..." : "Start Repository Intake"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SchedulerPolicyCard({ policy, busyAction, onPolicyChange, onSavePolicy }: RepositoryIngestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduler Policy</CardTitle>
        <CardDescription>Keep repository sync cadence near the intake flow so the handoff from authoring to automation stays visible.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Enabled">
          <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700">
            <input
              aria-label="Enabled"
              type="checkbox"
              checked={policy.enabled}
              onChange={(event) => onPolicyChange({ enabled: event.target.checked })}
            />
            <span>Allow scheduled repository synchronization</span>
          </label>
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Interval">
            <Input aria-label="Interval" value={policy.interval} onChange={(event) => onPolicyChange({ interval: event.target.value })} />
          </FormField>
          <FormField label="Timeout">
            <Input aria-label="Timeout" value={policy.timeout} onChange={(event) => onPolicyChange({ timeout: event.target.value })} />
          </FormField>
        </div>
        <FormField label="Batch Size">
          <Input
            aria-label="Batch Size"
            type="number"
            value={String(policy.batchSize)}
            onChange={(event) => onPolicyChange({ batchSize: Number(event.target.value || 0) })}
          />
        </FormField>
        <Button variant="outline" onClick={onSavePolicy} disabled={Boolean(busyAction)}>
          {busyAction === "policy" ? "Saving..." : "Save Policy"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ArchiveImportCard({ draft, selectedArchiveName, busyAction, onDraftChange, onArchiveFileChange, onSubmitArchive }: ImportsIngestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archive Import</CardTitle>
        <CardDescription>Upload a packaged archive and let the backend extract a persisted skill record from the bundle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Archive File">
          <Input
            key={selectedArchiveName || "archive-empty"}
            aria-label="Archive File"
            type="file"
            accept=".zip,application/zip"
            onChange={(event) => onArchiveFileChange(event.target.files?.[0] || null)}
          />
        </FormField>
        {selectedArchiveName ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Selected archive: {selectedArchiveName}</div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tags">
            <Input aria-label="Tags" value={draft.archive_tags} onChange={(event) => onDraftChange({ archive_tags: event.target.value })} />
          </FormField>
          <FormField label="Visibility">
            <Input
              aria-label="Visibility"
              value={draft.archive_visibility}
              onChange={(event) => onDraftChange({ archive_visibility: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Install Command">
          <Input
            aria-label="Install Command"
            value={draft.archive_install_command}
            onChange={(event) => onDraftChange({ archive_install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmitArchive} disabled={Boolean(busyAction)}>
          {busyAction === "archive" ? "Uploading..." : "Import Archive"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SkillMPImportCard({ draft, busyAction, onDraftChange, onSubmitSkillMP }: ImportsIngestionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SkillMP Import</CardTitle>
        <CardDescription>Pull one remote SkillMP definition directly into the governed import inventory.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="SkillMP URL">
          <Input aria-label="SkillMP URL" value={draft.skillmp_url} onChange={(event) => onDraftChange({ skillmp_url: event.target.value })} />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="SkillMP ID">
            <Input aria-label="SkillMP ID" value={draft.skillmp_id} onChange={(event) => onDraftChange({ skillmp_id: event.target.value })} />
          </FormField>
          <FormField label="SkillMP Token">
            <Input aria-label="SkillMP Token" value={draft.skillmp_token} onChange={(event) => onDraftChange({ skillmp_token: event.target.value })} />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tags">
            <Input aria-label="Tags" value={draft.skillmp_tags} onChange={(event) => onDraftChange({ skillmp_tags: event.target.value })} />
          </FormField>
          <FormField label="Visibility">
            <Input
              aria-label="Visibility"
              value={draft.skillmp_visibility}
              onChange={(event) => onDraftChange({ skillmp_visibility: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Install Command">
          <Input
            aria-label="Install Command"
            value={draft.skillmp_install_command}
            onChange={(event) => onDraftChange({ skillmp_install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmitSkillMP} disabled={Boolean(busyAction)}>
          {busyAction === "skillmp" ? "Submitting..." : "Import SkillMP"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ManualIngestionView(props: ManualIngestionViewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <ManualAuthoringCard {...props} />
      <div className="space-y-6">
        <SkillInventoryList
          title="Manual Inventory"
          description="Manually-authored records currently available for governance and publication review."
          items={props.skills}
          emptyText="No manually-authored skills are available yet."
        />
        <ManualGuidanceCard />
      </div>
    </div>
  );
}

export function RepositoryIngestionView(props: RepositoryIngestionViewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <RepositoryIntakeCard {...props} />
        <SkillInventoryList
          title="Repository Inventory"
          description="Repository-backed skills currently available for monitored synchronization."
          items={props.skills}
          emptyText="No repository-backed skills are available yet."
        />
      </div>
      <div className="space-y-6">
        <SchedulerPolicyCard {...props} />
        <RecentSyncRunsCard syncRuns={props.syncRuns} />
      </div>
    </div>
  );
}

export function ImportsIngestionView(props: ImportsIngestionViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ArchiveImportCard {...props} />
        <SkillMPImportCard {...props} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SkillInventoryList
          title="Imported Inventory"
          description="Archive and SkillMP entries that already landed in the governed import inventory."
          items={props.skills}
          emptyText="No archive or SkillMP imports are available yet."
        />
        <ImportJobsCard jobs={props.jobs} busyAction={props.busyAction} onRunJobAction={props.onRunJobAction} />
      </div>
    </div>
  );
}
