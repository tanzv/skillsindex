"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import {
  buildAuditExportOverview,
  buildBackupPlansOverview,
  buildBackupRunsOverview,
  buildChangeApprovalsOverview,
  buildRecoveryDrillsOverview,
  buildReleasesOverview,
  type OpsBackupPlanItem,
  type OpsBackupRunItem,
  type OpsChangeApprovalItem,
  type OpsRecoveryDrillRecordItem,
  type OpsReleaseItem,
  normalizeOpsAuditExportPayload,
  normalizeOpsBackupPlansPayload,
  normalizeOpsBackupRunsPayload,
  normalizeOpsChangeApprovalsPayload,
  normalizeOpsRecoveryDrillsPayload,
  normalizeOpsReleasesPayload
} from "./model";
import { buildCreatePayload, getRecordsFormFields, operationsRecordsRouteMeta, type RecordsDraft, type RecordsRoute } from "./recordsConfig";

type RecordsLedgerRow =
  | OpsRecoveryDrillRecordItem
  | OpsReleaseItem
  | OpsChangeApprovalItem
  | OpsBackupPlanItem
  | OpsBackupRunItem;

export function AdminOperationsRecordsPage({ route }: { route: RecordsRoute }) {
  const meta = operationsRecordsRouteMeta[route];
  const formFields = useMemo(() => getRecordsFormFields(route), [route]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [draft, setDraft] = useState<RecordsDraft>({});

  const view = useMemo(() => {
    if (route === "/admin/ops/audit-export") {
      const rows = normalizeOpsAuditExportPayload(rawPayload);
      return { metrics: buildAuditExportOverview(rows).metrics, rows: rows.map((row) => JSON.stringify(row)) };
    }
    if (route === "/admin/ops/recovery-drills") {
      const payload = normalizeOpsRecoveryDrillsPayload(rawPayload);
      return { metrics: buildRecoveryDrillsOverview(payload).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/releases") {
      const payload = normalizeOpsReleasesPayload(rawPayload);
      return { metrics: buildReleasesOverview(payload).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/change-approvals") {
      const payload = normalizeOpsChangeApprovalsPayload(rawPayload);
      return { metrics: buildChangeApprovalsOverview(payload).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/backup/plans") {
      const payload = normalizeOpsBackupPlansPayload(rawPayload);
      return { metrics: buildBackupPlansOverview(payload).metrics, rows: payload.items };
    }
    const payload = normalizeOpsBackupRunsPayload(rawPayload);
    return { metrics: buildBackupRunsOverview(payload).metrics, rows: payload.items };
  }, [rawPayload, route]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(meta.endpoint);
      setRawPayload(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load operations records.");
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [meta.endpoint]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitCreate() {
    if (!meta.createEndpoint) {
      return;
    }
    setBusyAction("submit-create");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(meta.createEndpoint, { method: "POST", body: buildCreatePayload(route, draft) });
      setMessage("Operations record saved.");
      setDraft({});
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to save operations record.");
    } finally {
      setBusyAction("");
    }
  }

  function updateDraftValue(key: string, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function renderRows() {
    if (route === "/admin/ops/audit-export") {
      return (
        <div className="space-y-3" data-testid="ops-records-rows">
          {(view.rows as string[]).map((row, index) => (
            <div
              key={`audit-${index}`}
              className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700"
              data-testid={`ops-record-row-${index}`}
            >
              {row}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3" data-testid="ops-records-rows">
        {(view.rows as RecordsLedgerRow[]).map((row, index) => (
          <div key={`row-${index}`} className="rounded-2xl border border-slate-200 p-4" data-testid={`ops-record-row-${index}`}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(row).map(([key, value]) => (
                <span key={`${index}-${key}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {String(key) + ": " + String(value || "n/a")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCreatePanel() {
    return formFields.map((field) => {
      if (field.inputType === "checkbox") {
        return (
          <label key={field.key} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              aria-label={field.label}
              checked={draft[field.key] === "true"}
              data-testid={field.testId}
              onChange={(event) => updateDraftValue(field.key, event.target.checked ? "true" : "false")}
            />
            <span>{field.label}</span>
          </label>
        );
      }

      return (
        <Input
          key={field.key}
          type={field.inputType}
          value={draft[field.key] || ""}
          aria-label={field.label}
          placeholder={field.placeholder}
          data-testid={field.testId}
          onChange={(event) => updateDraftValue(field.key, event.target.value)}
        />
      );
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title={meta.title}
        description={meta.description}
        actions={<Button onClick={() => void loadData()}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      {error ? <ErrorState description={error} /> : null}
      {message ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900" aria-live="polite" data-testid="ops-records-message">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {view.metrics.map((metric) => (
          <Card key={metric.label} data-testid={`ops-records-metric-${metric.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{meta.title} Ledger</CardTitle>
            <CardDescription>Structured operational evidence returned by the backend endpoint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3" data-testid="ops-records-ledger">
            {view.rows.length ? renderRows() : <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No records returned.</div>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {meta.createEndpoint ? (
            <Card>
              <CardHeader>
                <CardTitle>Record Entry</CardTitle>
                <CardDescription>Create a new record directly from the dedicated operations page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderCreatePanel()}
                <Button onClick={() => void submitCreate()} disabled={Boolean(busyAction)}>
                  {busyAction === "submit-create" ? "Saving..." : "Save Record"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Endpoint Status</CardTitle>
              <CardDescription>Quick reminder of the backend resource behind this page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">{meta.endpoint}</div>
              {meta.createEndpoint ? <Badge variant="outline">{meta.createEndpoint}</Badge> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
