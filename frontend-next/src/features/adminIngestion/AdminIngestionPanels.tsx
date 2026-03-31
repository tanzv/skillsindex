"use client";

import { AdminEmptyBlock } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import {
  type RepositorySyncPolicy,
  canCancelImportJob,
  canRetryImportJob,
  formatAdminIngestionDate,
  type ImportJobItem,
  type SyncRunItem
} from "./model";
import {
  resolveIngestionJobTypeLabel,
  resolveIngestionScopeLabel,
  resolveIngestionStatusLabel,
  resolveIngestionTriggerLabel
} from "./display";
import { toneForStatus } from "./shared";

export function ManualGuidanceCard() {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.publishingGuardrailsTitle}</CardTitle>
        <CardDescription>{ingestionMessages.publishingGuardrailsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
        <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3">{ingestionMessages.publishingGuardrailsItemOne}</div>
        <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3">{ingestionMessages.publishingGuardrailsItemTwo}</div>
      </CardContent>
    </Card>
  );
}

export function RepositoryPolicySummaryCard({
  policy,
  onOpenPolicy
}: {
  policy: RepositorySyncPolicy;
  onOpenPolicy: () => void;
}) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ingestionMessages.schedulerPolicyTitle}</CardTitle>
        <CardDescription>{ingestionMessages.schedulerPolicyDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-secondary)]">
          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
            {policy.enabled ? ingestionMessages.valueEnabled : ingestionMessages.valueDisabled}
          </span>
          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
            {`${ingestionMessages.intervalLabel}: ${policy.interval}`}
          </span>
          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
            {`${ingestionMessages.timeoutLabel}: ${policy.timeout}`}
          </span>
          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
            {`${ingestionMessages.batchSizeLabel}: ${String(policy.batchSize)}`}
          </span>
        </div>
        <Button variant="outline" onClick={onOpenPolicy}>
          {ingestionMessages.savePolicyAction}
        </Button>
      </CardContent>
    </Card>
  );
}

export function RecentSyncRunsCard({
  syncRuns,
  onOpenDetail
}: {
  syncRuns: SyncRunItem[];
  onOpenDetail?: (runId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{ingestionMessages.recentSyncRunsTitle}</CardTitle>
            <CardDescription>{ingestionMessages.recentSyncRunsDescription}</CardDescription>
          </div>
          <Badge variant="outline">{formatProtectedMessage(ingestionMessages.runsCountTemplate, { count: syncRuns.length })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {syncRuns.length ? (
          syncRuns.map((run) => (
            <div
              key={run.id}
              className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                        {formatProtectedMessage(ingestionMessages.runLabelTemplate, { runId: run.id })}
                      </span>
                      <Badge variant={toneForStatus(run.status)}>{resolveIngestionStatusLabel(run.status, ingestionMessages)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-secondary)]">
                      <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                        {resolveIngestionTriggerLabel(run.trigger, ingestionMessages)}
                      </span>
                      <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                        {resolveIngestionScopeLabel(run.scope, ingestionMessages)}
                      </span>
                      <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                        {formatProtectedMessage(ingestionMessages.syncedCountTemplate, { count: run.synced })}
                      </span>
                      <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                        {formatProtectedMessage(ingestionMessages.failedCountTemplate, { count: run.failed })}
                      </span>
                      <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                        {formatAdminIngestionDate(run.startedAt, locale, ingestionMessages.valueNotAvailable)}
                      </span>
                    </div>
                  </div>
                  {onOpenDetail ? (
                    <Button size="sm" variant="outline" onClick={() => onOpenDetail(run.id)}>
                      {ingestionMessages.openDetailAction}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <AdminEmptyBlock>{ingestionMessages.recentSyncRunsEmpty}</AdminEmptyBlock>
        )}
      </CardContent>
    </Card>
  );
}

export function ImportJobsCard({
  jobs,
  busyAction,
  onRunJobAction,
  onOpenDetail
}: {
  jobs: ImportJobItem[];
  busyAction: string;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
  onOpenDetail?: (jobId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{ingestionMessages.importJobsTitle}</CardTitle>
            <CardDescription>{ingestionMessages.importJobsDescription}</CardDescription>
          </div>
          <Badge variant="outline">{formatProtectedMessage(ingestionMessages.jobsCountTemplate, { count: jobs.length })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length ? (
          jobs.map((job) => (
            <div
              key={job.id}
              data-testid={`import-job-card-${job.id}`}
              className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                      {formatProtectedMessage(ingestionMessages.jobLabelTemplate, { jobId: job.id })}
                    </span>
                    <Badge variant={toneForStatus(job.status)}>{resolveIngestionStatusLabel(job.status, ingestionMessages)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {onOpenDetail ? (
                      <Button size="sm" variant="outline" onClick={() => onOpenDetail(job.id)}>
                        {ingestionMessages.openDetailAction}
                      </Button>
                    ) : null}
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
                <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-secondary)]">
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {resolveIngestionJobTypeLabel(job.jobType, ingestionMessages)}
                  </span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {formatProtectedMessage(ingestionMessages.targetLabelTemplate, {
                      targetId: job.targetSkillId || ingestionMessages.valueNotAvailable
                    })}
                  </span>
                  <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                    {formatAdminIngestionDate(job.updatedAt || job.createdAt, locale, ingestionMessages.valueNotAvailable)}
                  </span>
                </div>
                {job.errorMessage ? (
                  <div className="rounded-xl border border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] px-3 py-2 text-xs text-[color:var(--ui-danger-text)]">
                    {job.errorMessage}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <AdminEmptyBlock>{ingestionMessages.importJobsEmpty}</AdminEmptyBlock>
        )}
      </CardContent>
    </Card>
  );
}
