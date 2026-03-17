"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import type { AdminCatalogRoute, AdminCatalogRow, AdminCatalogViewModel, RepositorySyncPolicy } from "./model";

interface AdminCatalogContentProps {
  route: AdminCatalogRoute;
  title: string;
  description: string;
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  query: Record<string, string>;
  viewModel: AdminCatalogViewModel;
  policyDraft: RepositorySyncPolicy;
  onQueryChange: (key: string, value: string) => void;
  onResetQuery: () => void;
  onRefresh: () => void;
  onSyncSkill: (skillId: number) => void;
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
  onPolicyDraftChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onResetPolicyDraft: () => void;
  onSavePolicy: () => void;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "default";
  }
  if (normalized.includes("running") || normalized.includes("active") || normalized.includes("success")) {
    return "soft";
  }
  return "outline";
}

function useSelectedRow(rows: AdminCatalogRow[]) {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(rows[0]?.id ?? null);

  const selectedRow = useMemo(() => {
    if (rows.length === 0) {
      return null;
    }

    return rows.find((row) => row.id === selectedRowId) || rows[0] || null;
  }, [rows, selectedRowId]);

  return {
    selectedRow,
    selectedRowId: selectedRow?.id || null,
    setSelectedRowId
  };
}

function MetricGrid({ metrics }: { metrics: AdminCatalogViewModel["metrics"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="rounded-2xl">
          <CardHeader className="gap-2 p-5">
            <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
            <CardTitle className="text-base">{metric.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function QueryFilters({
  route,
  loading,
  query,
  onQueryChange,
  onResetQuery,
  onRefresh
}: Pick<
  AdminCatalogContentProps,
  "route" | "loading" | "query" | "onQueryChange" | "onResetQuery" | "onRefresh"
>) {
  if (route !== "/admin/skills" && route !== "/admin/jobs") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Scope the current collection before refreshing the route-specific admin view.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Input
          aria-label="Catalog keyword"
          value={query.q || ""}
          placeholder="Keyword"
          onChange={(event) => onQueryChange("q", event.target.value)}
        />
        <Input
          aria-label={route === "/admin/skills" ? "Catalog source" : "Catalog status"}
          value={route === "/admin/skills" ? query.source || "" : query.status || ""}
          placeholder={route === "/admin/skills" ? "Source" : "Status"}
          onChange={(event) => onQueryChange(route === "/admin/skills" ? "source" : "status", event.target.value)}
        />
        <Input
          aria-label={route === "/admin/skills" ? "Catalog visibility" : "Catalog job type"}
          value={route === "/admin/skills" ? query.visibility || "" : query.job_type || ""}
          placeholder={route === "/admin/skills" ? "Visibility" : "Job Type"}
          onChange={(event) => onQueryChange(route === "/admin/skills" ? "visibility" : "job_type", event.target.value)}
        />
        <div className="md:col-span-3 flex flex-wrap gap-3">
          <Button onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outline" onClick={onResetQuery}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RowSelectionButton({
  row,
  selected,
  buttonLabel,
  onSelect,
  children
}: {
  row: AdminCatalogRow;
  selected: boolean;
  buttonLabel: string;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid={`admin-catalog-row-${row.id}`}
      className={`rounded-2xl border p-4 transition-colors ${selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-950">{row.name}</div>
            <Badge variant={statusTone(row.status)}>{row.status}</Badge>
          </div>
          <div className="text-sm text-slate-600">{row.summary}</div>
          <div className="flex flex-wrap gap-2">
            {row.meta.map((metaItem) => (
              <span key={`${row.id}-${metaItem}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {metaItem}
              </span>
            ))}
          </div>
          {row.detail ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{row.detail}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={selected ? "soft" : "outline"} onClick={onSelect}>
            {selected ? "Selected" : buttonLabel}
          </Button>
          {children}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  description,
  row,
  emptyText,
  actions
}: {
  title: string;
  description: string;
  row: AdminCatalogRow | null;
  emptyText: string;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {row ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-slate-950">{row.name}</span>
                <Badge variant={statusTone(row.status)}>{row.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{row.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {row.meta.map((metaItem) => (
                  <span key={`${row.id}-detail-${metaItem}`} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">
                    {metaItem}
                  </span>
                ))}
              </div>
              {row.detail ? <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{row.detail}</div> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{emptyText}</div>
        )}
      </CardContent>
    </Card>
  );
}

function SidePanels({ panels }: { panels: AdminCatalogViewModel["sidePanel"] }) {
  return (
    <div className="space-y-6">
      {panels.map((panel) => (
        <Card key={panel.title}>
          <CardHeader>
            <CardTitle>{panel.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.items.map((item) => (
              <div key={`${panel.title}-${item.label}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkillsView({
  rows,
  busyAction,
  sidePanels,
  onSyncSkill
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onSyncSkill: AdminCatalogContentProps["onSyncSkill"];
}) {
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Governed Inventory</CardTitle>
            <CardDescription>Use this route as the searchable catalog list, then inspect one governed skill at a time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel="Inspect"
                onSelect={() => setSelectedRowId(row.id)}
              >
                {row.syncable ? (
                  <Button size="sm" variant="outline" onClick={() => onSyncSkill(row.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${row.id}` ? "Syncing..." : "Sync now"}
                  </Button>
                ) : null}
              </RowSelectionButton>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title="Selected Skill"
          description="Keep governance decisions anchored to one skill at a time instead of scanning anonymous rows."
          row={selectedRow}
          emptyText="Select a skill from the governed inventory to inspect ownership, quality, and exposure."
          actions={
            selectedRow ? (
              <>
                {selectedRow.syncable ? (
                  <Button variant="outline" onClick={() => onSyncSkill(selectedRow.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${selectedRow.id}` ? "Syncing..." : "Sync now"}
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href={`/skills/${selectedRow.id}`}>Open Skill Detail</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/ingestion/repository">Open Intake</Link>
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

function JobsView({
  rows,
  busyAction,
  sidePanels,
  onRunJobAction
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onRunJobAction: AdminCatalogContentProps["onRunJobAction"];
}) {
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Queue</CardTitle>
            <CardDescription>Review the async job queue as an action list, not only a metric strip.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => {
              const normalized = row.status.toLowerCase();
              const canRetry = normalized.includes("failed") || normalized.includes("canceled");
              const canCancel = normalized.includes("running") || normalized.includes("pending");

              return (
                <RowSelectionButton
                  key={row.id}
                  row={row}
                  selected={selectedRowId === row.id}
                  buttonLabel="Inspect"
                  onSelect={() => setSelectedRowId(row.id)}
                >
                  {canRetry ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunJobAction(row.id, "retry")}
                      disabled={Boolean(busyAction)}
                    >
                      {busyAction === `retry-${row.id}` ? "Retrying..." : "Retry"}
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunJobAction(row.id, "cancel")}
                      disabled={Boolean(busyAction)}
                    >
                      {busyAction === `cancel-${row.id}` ? "Cancelling..." : "Cancel"}
                    </Button>
                  ) : null}
                </RowSelectionButton>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title="Selected Job"
          description="Inspect the currently selected queue item before applying retry or cancel decisions."
          row={selectedRow}
          emptyText="Select a job from the queue to inspect retry pressure and failure context."
          actions={
            selectedRow ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "retry")}
                  disabled={Boolean(busyAction) || (!selectedRow.status.toLowerCase().includes("failed") && !selectedRow.status.toLowerCase().includes("canceled"))}
                >
                  Retry Selected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "cancel")}
                  disabled={Boolean(busyAction) || (!selectedRow.status.toLowerCase().includes("running") && !selectedRow.status.toLowerCase().includes("pending"))}
                >
                  Cancel Selected
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

function SyncRunsView({
  rows,
  sidePanels
}: {
  rows: AdminCatalogRow[];
  sidePanels: AdminCatalogViewModel["sidePanel"];
}) {
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
            <CardDescription>Read repository synchronization as an operational history with one focused run at a time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel="Inspect"
                onSelect={() => setSelectedRowId(row.id)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <DetailCard
          title="Selected Sync Run"
          description="Use the focused run detail to understand cadence, duration, and delivery quality."
          row={selectedRow}
          emptyText="Select a sync run to inspect throughput and completion details."
          actions={
            selectedRow ? (
              <Button asChild variant="outline">
                <Link href="/admin/sync-policy/repository">Open Sync Policy</Link>
              </Button>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

function PolicyView({
  busyAction,
  sidePanels,
  metrics,
  policyDraft,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy
}: {
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  metrics: AdminCatalogViewModel["metrics"];
  policyDraft: RepositorySyncPolicy;
  onPolicyDraftChange: AdminCatalogContentProps["onPolicyDraftChange"];
  onResetPolicyDraft: () => void;
  onSavePolicy: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Policy Editor</CardTitle>
            <CardDescription>Use this route as a configuration surface rather than a generic data table.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
              <input
                aria-label="Scheduler enabled"
                type="checkbox"
                checked={policyDraft.enabled}
                onChange={(event) => onPolicyDraftChange({ enabled: event.target.checked })}
              />
              <span>Scheduler enabled</span>
            </label>
            <Input value={policyDraft.interval} placeholder="Interval" onChange={(event) => onPolicyDraftChange({ interval: event.target.value })} />
            <Input value={policyDraft.timeout} placeholder="Timeout" onChange={(event) => onPolicyDraftChange({ timeout: event.target.value })} />
            <Input
              type="number"
              value={String(policyDraft.batchSize)}
              placeholder="Batch Size"
              onChange={(event) => onPolicyDraftChange({ batchSize: Number(event.target.value) || 0 })}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={onSavePolicy} disabled={busyAction === "save-policy"}>
                {busyAction === "save-policy" ? "Saving..." : "Save Policy"}
              </Button>
              <Button variant="outline" onClick={onResetPolicyDraft}>
                Reset Draft
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Policy Posture</CardTitle>
            <CardDescription>Read the effective scheduler posture before publishing a new draft.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{metric.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SidePanels panels={sidePanels} />
    </div>
  );
}

export function AdminCatalogContent({
  route,
  title,
  description,
  loading,
  busyAction,
  error,
  message,
  query,
  viewModel,
  policyDraft,
  onQueryChange,
  onResetQuery,
  onRefresh,
  onSyncSkill,
  onRunJobAction,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy
}: AdminCatalogContentProps) {
  const rows = viewModel.table?.rows || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title={title}
        description={description}
        actions={<Button onClick={onRefresh}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      <MetricGrid metrics={viewModel.metrics} />
      <QueryFilters route={route} loading={loading} query={query} onQueryChange={onQueryChange} onResetQuery={onResetQuery} onRefresh={onRefresh} />

      {error ? <ErrorState description={error} /> : null}
      {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500">Loading admin catalog data...</CardContent>
        </Card>
      ) : null}

      {route === "/admin/skills" ? (
        <SkillsView rows={rows} busyAction={busyAction} sidePanels={viewModel.sidePanel} onSyncSkill={onSyncSkill} />
      ) : null}
      {route === "/admin/jobs" ? <JobsView rows={rows} busyAction={busyAction} sidePanels={viewModel.sidePanel} onRunJobAction={onRunJobAction} /> : null}
      {route === "/admin/sync-jobs" ? <SyncRunsView rows={rows} sidePanels={viewModel.sidePanel} /> : null}
      {route === "/admin/sync-policy/repository" ? (
        <PolicyView
          busyAction={busyAction}
          sidePanels={viewModel.sidePanel}
          metrics={viewModel.metrics}
          policyDraft={policyDraft}
          onPolicyDraftChange={onPolicyDraftChange}
          onResetPolicyDraft={onResetPolicyDraft}
          onSavePolicy={onSavePolicy}
        />
      ) : null}
    </div>
  );
}
