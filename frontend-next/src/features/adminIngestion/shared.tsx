"use client";

import type { ReactNode } from "react";

import {
  AdminOverlayMetaList,
  AdminOverlaySection
} from "@/src/components/admin/AdminOverlaySurface";
import { AdminEmptyBlock, AdminInsetBlock, AdminMessageBanner, AdminMetricGrid } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import {
  canCancelImportJob,
  canRetryImportJob,
  formatAdminIngestionDate,
  type ImportJobItem,
  type ImportsDraft,
  type ManualDraft,
  type RepositoryDraft,
  type SkillInventoryItem,
  type SyncRunItem
} from "./model";
import {
  resolveIngestionDescription,
  resolveIngestionJobTypeLabel,
  resolveIngestionOwnerLabel,
  resolveIngestionScopeLabel,
  resolveIngestionSkillName,
  resolveIngestionSourceTypeLabel,
  resolveIngestionStatusLabel,
  resolveIngestionTriggerLabel,
  resolveIngestionVisibilityLabel
} from "./display";

export const textareaClassName =
  "flex min-h-28 w-full rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 py-2 text-sm text-[color:var(--ui-control-text)] shadow-sm outline-none ring-offset-0 placeholder:text-[color:var(--ui-control-placeholder)] focus-visible:border-[color:var(--ui-control-border-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)]";

export function toneForStatus(status: string): "default" | "soft" | "outline" {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "default";
  }
  if (normalized.includes("run") || normalized.includes("pending") || normalized.includes("active")) {
    return "soft";
  }
  return "outline";
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">{label}</span>
      {children}
    </label>
  );
}

export function IngestionMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return <AdminMetricGrid metrics={metrics} />;
}

export function IngestionMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <AdminMessageBanner message={message} />;
}

export function IngestionTriggerCard({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>{actionLabel}</Button>
      </CardContent>
    </Card>
  );
}

export function SkillInventoryList({
  title,
  description,
  items,
  emptyText,
  actionLabel,
  onOpenItem
}: {
  title: string;
  description?: string;
  items: SkillInventoryItem[];
  emptyText: string;
  actionLabel?: string;
  onOpenItem?: (skillId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline">{formatProtectedMessage(ingestionMessages.itemsCountTemplate, { count: items.length })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={`${title}-${item.id}`}
              className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                      {resolveIngestionSkillName(item.name, ingestionMessages)}
                    </span>
                    <Badge variant={item.visibility.toLowerCase() === "public" ? "soft" : "outline"}>
                      {resolveIngestionVisibilityLabel(item.visibility, ingestionMessages)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[color:var(--ui-text-secondary)]">
                    {resolveIngestionDescription(item.description, ingestionMessages)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {resolveIngestionSourceTypeLabel(item.sourceType, ingestionMessages)}
                    </span>
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {resolveIngestionOwnerLabel(item.ownerUsername, ingestionMessages)}
                    </span>
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {formatAdminIngestionDate(item.updatedAt, locale, ingestionMessages.valueNotAvailable)}
                    </span>
                  </div>
                </div>
                {onOpenItem && actionLabel ? (
                  <Button size="sm" variant="outline" onClick={() => onOpenItem(item.id)}>
                    {actionLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <AdminEmptyBlock>{emptyText}</AdminEmptyBlock>
        )}
      </CardContent>
    </Card>
  );
}

export function IngestionSkillDetail({ item }: { item: SkillInventoryItem }) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-4">
      <AdminOverlaySection
        title={resolveIngestionSkillName(item.name, ingestionMessages)}
        description={resolveIngestionDescription(item.description, ingestionMessages)}
      >
        <AdminOverlayMetaList
          items={[
            {
              label: ingestionMessages.visibilityLabel,
              value: resolveIngestionVisibilityLabel(item.visibility, ingestionMessages)
            },
            {
              label: "Owner",
              value: resolveIngestionOwnerLabel(item.ownerUsername, ingestionMessages)
            },
            {
              label: "Source",
              value: resolveIngestionSourceTypeLabel(item.sourceType, ingestionMessages)
            },
            {
              label: "Updated",
              value: formatAdminIngestionDate(item.updatedAt, locale, ingestionMessages.valueNotAvailable)
            }
          ]}
        />
      </AdminOverlaySection>
    </div>
  );
}

export function IngestionSyncRunDetail({ run }: { run: SyncRunItem }) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-4">
      <AdminOverlaySection
        title={formatProtectedMessage(ingestionMessages.runLabelTemplate, { runId: run.id })}
        description={resolveIngestionStatusLabel(run.status, ingestionMessages)}
      >
        <AdminOverlayMetaList
          items={[
            {
              label: "Trigger",
              value: resolveIngestionTriggerLabel(run.trigger, ingestionMessages)
            },
            {
              label: "Scope",
              value: resolveIngestionScopeLabel(run.scope, ingestionMessages)
            },
            {
              label: "Synced",
              value: formatProtectedMessage(ingestionMessages.syncedCountTemplate, { count: run.synced })
            },
            {
              label: "Failed",
              value: formatProtectedMessage(ingestionMessages.failedCountTemplate, { count: run.failed })
            },
            {
              label: "Started",
              value: formatAdminIngestionDate(run.startedAt, locale, ingestionMessages.valueNotAvailable)
            }
          ]}
        />
      </AdminOverlaySection>
    </div>
  );
}

export function IngestionImportJobDetail({
  job,
  busyAction,
  onRunJobAction
}: {
  job: ImportJobItem;
  busyAction: string;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-4">
      <AdminOverlaySection
        title={formatProtectedMessage(ingestionMessages.jobLabelTemplate, { jobId: job.id })}
        description={resolveIngestionStatusLabel(job.status, ingestionMessages)}
      >
        <AdminOverlayMetaList
          items={[
            {
              label: "Job Type",
              value: resolveIngestionJobTypeLabel(job.jobType, ingestionMessages)
            },
            {
              label: "Target",
              value: formatProtectedMessage(ingestionMessages.targetLabelTemplate, {
                targetId: job.targetSkillId || ingestionMessages.valueNotAvailable
              })
            },
            {
              label: "Updated",
              value: formatAdminIngestionDate(job.updatedAt || job.createdAt, locale, ingestionMessages.valueNotAvailable)
            }
          ]}
        />
        {job.errorMessage ? <AdminInsetBlock>{job.errorMessage}</AdminInsetBlock> : null}
      </AdminOverlaySection>
      <div className="flex flex-wrap gap-3">
        {canRetryImportJob(job) ? (
          <Button size="sm" variant="outline" onClick={() => onRunJobAction(job.id, "retry")} disabled={Boolean(busyAction)}>
            {busyAction === `retry-${job.id}` ? ingestionMessages.retryingAction : ingestionMessages.retryAction}
          </Button>
        ) : null}
        {canCancelImportJob(job) ? (
          <Button size="sm" variant="outline" onClick={() => onRunJobAction(job.id, "cancel")} disabled={Boolean(busyAction)}>
            {busyAction === `cancel-${job.id}` ? ingestionMessages.cancelingAction : ingestionMessages.cancelAction}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function buildManualPayload(draft: ManualDraft): Record<string, unknown> {
  return {
    name: draft.name,
    description: draft.description,
    content: draft.content,
    tags: draft.tags,
    visibility: draft.visibility,
    install_command: draft.install_command
  };
}

export function buildRepositoryPayload(draft: RepositoryDraft): Record<string, unknown> {
  return {
    repo_url: draft.repo_url,
    repo_branch: draft.repo_branch,
    repo_path: draft.repo_path,
    tags: draft.tags,
    visibility: draft.visibility,
    install_command: draft.install_command
  };
}

export function buildSkillMPPayload(draft: ImportsDraft): Record<string, unknown> {
  return {
    skillmp_url: draft.skillmp_url,
    skillmp_id: draft.skillmp_id,
    skillmp_token: draft.skillmp_token,
    tags: draft.skillmp_tags,
    visibility: draft.skillmp_visibility,
    install_command: draft.skillmp_install_command
  };
}
