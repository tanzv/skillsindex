"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type {
  ImportsIngestionViewProps,
  ManualIngestionViewProps,
  RepositoryIngestionViewProps
} from "./AdminIngestionViewProps";
import { resolveIngestionVisibilityLabel } from "./display";
import { FormField, textareaClassName } from "./shared";

function VisibilitySelect({
  value,
  ariaLabel,
  onChange
}: {
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="private">{resolveIngestionVisibilityLabel("private", ingestionMessages)}</option>
      <option value="public">{resolveIngestionVisibilityLabel("public", ingestionMessages)}</option>
      <option value="organization">{resolveIngestionVisibilityLabel("organization", ingestionMessages)}</option>
    </Select>
  );
}

export function ManualAuthoringCard({ draft, busyAction, onDraftChange, onSubmit }: ManualIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.manualAuthoringTitle}</CardTitle>
        <CardDescription>{ingestionMessages.manualAuthoringDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={ingestionMessages.nameLabel}>
          <Input aria-label={ingestionMessages.nameLabel} value={draft.name} onChange={(event) => onDraftChange({ name: event.target.value })} />
        </FormField>
        <FormField label={ingestionMessages.descriptionLabel}>
          <Textarea
            aria-label={ingestionMessages.descriptionLabel}
            className={textareaClassName}
            value={draft.description}
            onChange={(event) => onDraftChange({ description: event.target.value })}
          />
        </FormField>
        <FormField label={ingestionMessages.contentLabel}>
          <Textarea
            aria-label={ingestionMessages.contentLabel}
            className={textareaClassName}
            value={draft.content}
            onChange={(event) => onDraftChange({ content: event.target.value })}
          />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.tagsLabel}>
            <Input aria-label={ingestionMessages.tagsLabel} value={draft.tags} onChange={(event) => onDraftChange({ tags: event.target.value })} />
          </FormField>
          <FormField label={ingestionMessages.visibilityLabel}>
            <VisibilitySelect value={draft.visibility} ariaLabel={ingestionMessages.visibilityLabel} onChange={(value) => onDraftChange({ visibility: value })} />
          </FormField>
        </div>
        <FormField label={ingestionMessages.installCommandLabel}>
          <Input
            aria-label={ingestionMessages.installCommandLabel}
            value={draft.install_command}
            onChange={(event) => onDraftChange({ install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmit} disabled={Boolean(busyAction)}>
          {busyAction === "manual" ? ingestionMessages.savingManualAction : ingestionMessages.createManualAction}
        </Button>
      </CardContent>
    </Card>
  );
}

export function RepositoryIntakeCard({ draft, busyAction, onDraftChange, onSubmit }: RepositoryIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.repositoryIntakeTitle}</CardTitle>
        <CardDescription>{ingestionMessages.repositoryIntakeDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={ingestionMessages.repositoryUrlLabel}>
          <Input
            aria-label={ingestionMessages.repositoryUrlLabel}
            value={draft.repo_url}
            onChange={(event) => onDraftChange({ repo_url: event.target.value })}
          />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.repositoryBranchLabel}>
            <Input
              aria-label={ingestionMessages.repositoryBranchLabel}
              value={draft.repo_branch}
              onChange={(event) => onDraftChange({ repo_branch: event.target.value })}
            />
          </FormField>
          <FormField label={ingestionMessages.repositoryPathLabel}>
            <Input
              aria-label={ingestionMessages.repositoryPathLabel}
              value={draft.repo_path}
              onChange={(event) => onDraftChange({ repo_path: event.target.value })}
            />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.tagsLabel}>
            <Input aria-label={ingestionMessages.tagsLabel} value={draft.tags} onChange={(event) => onDraftChange({ tags: event.target.value })} />
          </FormField>
          <FormField label={ingestionMessages.visibilityLabel}>
            <VisibilitySelect value={draft.visibility} ariaLabel={ingestionMessages.visibilityLabel} onChange={(value) => onDraftChange({ visibility: value })} />
          </FormField>
        </div>
        <FormField label={ingestionMessages.installCommandLabel}>
          <Input
            aria-label={ingestionMessages.installCommandLabel}
            value={draft.install_command}
            onChange={(event) => onDraftChange({ install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmit} disabled={Boolean(busyAction)}>
          {busyAction === "repository" ? ingestionMessages.submittingRepositoryAction : ingestionMessages.startRepositoryAction}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SchedulerPolicyCard({ policy, busyAction, onPolicyChange, onSavePolicy }: RepositoryIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.schedulerPolicyTitle}</CardTitle>
        <CardDescription>{ingestionMessages.schedulerPolicyDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={ingestionMessages.enabledLabel}>
          <label className="flex items-center gap-3 rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-3 py-2 text-sm text-[color:var(--ui-text-secondary)]">
            <input
              aria-label={ingestionMessages.enabledLabel}
              type="checkbox"
              checked={policy.enabled}
              onChange={(event) => onPolicyChange({ enabled: event.target.checked })}
            />
            <span>{ingestionMessages.enabledHelp}</span>
          </label>
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.intervalLabel}>
            <Input
              aria-label={ingestionMessages.intervalLabel}
              value={policy.interval}
              onChange={(event) => onPolicyChange({ interval: event.target.value })}
            />
          </FormField>
          <FormField label={ingestionMessages.timeoutLabel}>
            <Input
              aria-label={ingestionMessages.timeoutLabel}
              value={policy.timeout}
              onChange={(event) => onPolicyChange({ timeout: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label={ingestionMessages.batchSizeLabel}>
          <Input
            aria-label={ingestionMessages.batchSizeLabel}
            type="number"
            value={String(policy.batchSize)}
            onChange={(event) => onPolicyChange({ batchSize: Number(event.target.value || 0) })}
          />
        </FormField>
        <Button variant="outline" onClick={onSavePolicy} disabled={Boolean(busyAction)}>
          {busyAction === "policy" ? ingestionMessages.savingPolicyAction : ingestionMessages.savePolicyAction}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ArchiveImportCard({
  draft,
  selectedArchiveName,
  busyAction,
  onDraftChange,
  onArchiveFileChange,
  onSubmitArchive
}: ImportsIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.archiveImportTitle}</CardTitle>
        <CardDescription>{ingestionMessages.archiveImportDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={ingestionMessages.archiveFileLabel}>
          <Input
            key={selectedArchiveName || "archive-empty"}
            aria-label={ingestionMessages.archiveFileLabel}
            type="file"
            accept=".zip,application/zip"
            onChange={(event) => onArchiveFileChange(event.target.files?.[0] || null)}
          />
        </FormField>
        {selectedArchiveName ? (
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-secondary)]">
            {formatProtectedMessage(ingestionMessages.selectedArchiveTemplate, { fileName: selectedArchiveName })}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.tagsLabel}>
            <Input
              aria-label={ingestionMessages.tagsLabel}
              value={draft.archive_tags}
              onChange={(event) => onDraftChange({ archive_tags: event.target.value })}
            />
          </FormField>
          <FormField label={ingestionMessages.visibilityLabel}>
            <VisibilitySelect
              value={draft.archive_visibility}
              ariaLabel={ingestionMessages.visibilityLabel}
              onChange={(value) => onDraftChange({ archive_visibility: value })}
            />
          </FormField>
        </div>
        <FormField label={ingestionMessages.installCommandLabel}>
          <Input
            aria-label={ingestionMessages.installCommandLabel}
            value={draft.archive_install_command}
            onChange={(event) => onDraftChange({ archive_install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmitArchive} disabled={Boolean(busyAction)}>
          {busyAction === "archive" ? ingestionMessages.uploadingArchiveAction : ingestionMessages.importArchiveAction}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SkillMPImportCard({ draft, busyAction, onDraftChange, onSubmitSkillMP }: ImportsIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.skillmpImportTitle}</CardTitle>
        <CardDescription>{ingestionMessages.skillmpImportDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label={ingestionMessages.skillmpUrlLabel}>
          <Input
            aria-label={ingestionMessages.skillmpUrlLabel}
            value={draft.skillmp_url}
            onChange={(event) => onDraftChange({ skillmp_url: event.target.value })}
          />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.skillmpIdLabel}>
            <Input
              aria-label={ingestionMessages.skillmpIdLabel}
              value={draft.skillmp_id}
              onChange={(event) => onDraftChange({ skillmp_id: event.target.value })}
            />
          </FormField>
          <FormField label={ingestionMessages.skillmpTokenLabel}>
            <Input
              aria-label={ingestionMessages.skillmpTokenLabel}
              value={draft.skillmp_token}
              onChange={(event) => onDraftChange({ skillmp_token: event.target.value })}
            />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={ingestionMessages.tagsLabel}>
            <Input
              aria-label={ingestionMessages.tagsLabel}
              value={draft.skillmp_tags}
              onChange={(event) => onDraftChange({ skillmp_tags: event.target.value })}
            />
          </FormField>
          <FormField label={ingestionMessages.visibilityLabel}>
            <VisibilitySelect
              value={draft.skillmp_visibility}
              ariaLabel={ingestionMessages.visibilityLabel}
              onChange={(value) => onDraftChange({ skillmp_visibility: value })}
            />
          </FormField>
        </div>
        <FormField label={ingestionMessages.installCommandLabel}>
          <Input
            aria-label={ingestionMessages.installCommandLabel}
            value={draft.skillmp_install_command}
            onChange={(event) => onDraftChange({ skillmp_install_command: event.target.value })}
          />
        </FormField>
        <Button onClick={onSubmitSkillMP} disabled={Boolean(busyAction)}>
          {busyAction === "skillmp" ? ingestionMessages.submittingSkillmpAction : ingestionMessages.importSkillmpAction}
        </Button>
      </CardContent>
    </Card>
  );
}
