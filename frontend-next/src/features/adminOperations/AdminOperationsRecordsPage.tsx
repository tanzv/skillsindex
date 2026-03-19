"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminInsetBlock, AdminMessageBanner, AdminMetricGrid, AdminRecordCard } from "@/src/components/admin/AdminPrimitives";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
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
import { buildOpsRecordChips } from "./display";
import { buildCreatePayload, getOperationsRecordsRouteMeta, getRecordsFormFields, type RecordsDraft, type RecordsRoute } from "./recordsConfig";

type RecordsLedgerRow =
  | OpsRecoveryDrillRecordItem
  | OpsReleaseItem
  | OpsChangeApprovalItem
  | OpsBackupPlanItem
  | OpsBackupRunItem;

export function AdminOperationsRecordsPage({ route }: { route: RecordsRoute }) {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const operationsMessages = messages.adminOperations;
  const meta = useMemo(() => getOperationsRecordsRouteMeta(route, operationsMessages), [operationsMessages, route]);
  const formFields = useMemo(() => getRecordsFormFields(route, operationsMessages), [operationsMessages, route]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [draft, setDraft] = useState<RecordsDraft>({});

  const view = useMemo(() => {
    if (route === "/admin/ops/audit-export") {
      const rows = normalizeOpsAuditExportPayload(rawPayload);
      return {
        metrics: buildAuditExportOverview(rows, operationsMessages).metrics,
        rows: rows.map((row) => JSON.stringify(row))
      };
    }
    if (route === "/admin/ops/recovery-drills") {
      const payload = normalizeOpsRecoveryDrillsPayload(rawPayload);
      return { metrics: buildRecoveryDrillsOverview(payload, operationsMessages).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/releases") {
      const payload = normalizeOpsReleasesPayload(rawPayload);
      return { metrics: buildReleasesOverview(payload, operationsMessages).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/change-approvals") {
      const payload = normalizeOpsChangeApprovalsPayload(rawPayload);
      return { metrics: buildChangeApprovalsOverview(payload, operationsMessages).metrics, rows: payload.items };
    }
    if (route === "/admin/ops/backup/plans") {
      const payload = normalizeOpsBackupPlansPayload(rawPayload);
      return { metrics: buildBackupPlansOverview(payload, operationsMessages).metrics, rows: payload.items };
    }
    const payload = normalizeOpsBackupRunsPayload(rawPayload);
    return { metrics: buildBackupRunsOverview(payload, operationsMessages).metrics, rows: payload.items };
  }, [operationsMessages, rawPayload, route]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(meta.endpoint);
      setRawPayload(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : operationsMessages.recordsLoadError);
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [meta.endpoint, operationsMessages.recordsLoadError]);

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
      setMessage(operationsMessages.recordsSaveSuccess);
      setDraft({});
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : operationsMessages.recordsSaveError);
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
              className="overflow-x-auto rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4 font-mono text-xs text-[color:var(--ui-text-secondary)]"
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
          <AdminRecordCard key={`row-${index}`} data-testid={`ops-record-row-${index}`}>
            <div className="flex flex-wrap gap-2">
              {buildOpsRecordChips(route, row, locale, operationsMessages).map((chip, chipIndex) => (
                <span
                  key={`${index}-${chipIndex}-${chip.label}`}
                  className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]"
                >
                  {`${chip.label}: ${chip.value}`}
                </span>
              ))}
            </div>
          </AdminRecordCard>
        ))}
      </div>
    );
  }

  function renderCreatePanel() {
    return formFields.map((field) => {
      if (field.inputType === "checkbox") {
        return (
          <label
            key={field.key}
            className="flex items-center gap-3 rounded-xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-3 py-2 text-sm text-[color:var(--ui-text-secondary)]"
          >
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

      if (field.inputType === "select") {
        return (
          <Select
            key={field.key}
            value={draft[field.key] || field.options?.[0]?.value || ""}
            aria-label={field.label}
            data-testid={field.testId}
            onChange={(event) => updateDraftValue(field.key, event.target.value)}
          >
            {(field.options || []).map((option) => (
              <option key={`${field.key}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
        eyebrow={commonMessages.adminEyebrow}
        title={meta.title}
        description={meta.description}
        actions={<Button onClick={() => void loadData()}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      />

      {error ? <ErrorState description={error} /> : null}
      {message ? <AdminMessageBanner message={message} /> : null}

      <div data-testid="ops-records-metrics">
        <AdminMetricGrid metrics={view.metrics} columnsClassName="grid gap-4 md:grid-cols-3" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{`${meta.title} ${operationsMessages.ledgerTitleSuffix}`}</CardTitle>
            <CardDescription>{operationsMessages.ledgerDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3" data-testid="ops-records-ledger">
            {view.rows.length ? renderRows() : <AdminEmptyBlock>{operationsMessages.noRecords}</AdminEmptyBlock>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {meta.createEndpoint ? (
            <Card>
              <CardHeader>
                <CardTitle>{operationsMessages.recordEntryTitle}</CardTitle>
                <CardDescription>{operationsMessages.recordEntryDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderCreatePanel()}
                <Button onClick={() => void submitCreate()} disabled={Boolean(busyAction)}>
                  {busyAction === "submit-create" ? operationsMessages.savingRecordAction : operationsMessages.saveRecordAction}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{operationsMessages.endpointStatusTitle}</CardTitle>
              <CardDescription>{operationsMessages.endpointStatusDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
              <AdminInsetBlock>{meta.endpoint}</AdminInsetBlock>
              {meta.createEndpoint ? <Badge variant="outline">{meta.createEndpoint}</Badge> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
