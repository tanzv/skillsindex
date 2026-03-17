import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

import {
  canCancelImportJob,
  canRetryImportJob,
  formatAdminIngestionDate,
  type ImportJobItem,
  type SyncRunItem
} from "./model";
import { toneForStatus } from "./shared";

export function ManualGuidanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Guardrails</CardTitle>
        <CardDescription>Keep manually-authored entries aligned with the same governance posture used by repository and import flows.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          Capture a concise description and install command so operators can review the manual record without opening a secondary page.
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          Use visibility intentionally. Public entries should already satisfy the same catalog review expectations as repository-backed skills.
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentSyncRunsCard({ syncRuns }: { syncRuns: SyncRunItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Recent Sync Runs</CardTitle>
            <CardDescription>Latest synchronization evidence returned by the repository sync endpoint.</CardDescription>
          </div>
          <Badge variant="outline">{syncRuns.length} runs</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {syncRuns.length ? (
          syncRuns.map((run) => (
            <div key={run.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-950">Run #{run.id}</span>
                  <Badge variant={toneForStatus(run.status)}>{run.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{run.trigger}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{run.scope}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Synced {run.synced}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Failed {run.failed}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatAdminIngestionDate(run.startedAt)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No repository sync runs are available yet.</div>
        )}
      </CardContent>
    </Card>
  );
}

export function ImportJobsCard({
  jobs,
  busyAction,
  onRunJobAction
}: {
  jobs: ImportJobItem[];
  busyAction: string;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Import Jobs</CardTitle>
            <CardDescription>Actionable archive and SkillMP import activity returned by the admin job endpoint.</CardDescription>
          </div>
          <Badge variant="outline">{jobs.length} jobs</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length ? (
          jobs.map((job) => (
            <div key={job.id} data-testid={`import-job-card-${job.id}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">Job #{job.id}</span>
                    <Badge variant={toneForStatus(job.status)}>{job.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canRetryImportJob(job) ? (
                      <Button size="sm" variant="outline" onClick={() => onRunJobAction(job.id, "retry")} disabled={Boolean(busyAction)}>
                        {busyAction === `retry-${job.id}` ? "Retrying..." : "Retry"}
                      </Button>
                    ) : null}
                    {canCancelImportJob(job) ? (
                      <Button size="sm" variant="outline" onClick={() => onRunJobAction(job.id, "cancel")} disabled={Boolean(busyAction)}>
                        {busyAction === `cancel-${job.id}` ? "Canceling..." : "Cancel"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{job.jobType}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Target {job.targetSkillId || "n/a"}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatAdminIngestionDate(job.updatedAt || job.createdAt)}</span>
                </div>
                {job.errorMessage ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{job.errorMessage}</div> : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No import jobs are available yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
