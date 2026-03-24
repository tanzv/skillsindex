"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { resolveAdminOperationsRecordsRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";

import { AdminOperationsRecordsContent } from "./AdminOperationsRecordsContent";
import type { OperationsRecordDetailState } from "./AdminOperationsRecordsPanels";
import {
  buildAuditExportOverview,
  buildBackupPlansOverview,
  buildBackupRunsOverview,
  buildChangeApprovalsOverview,
  buildRecoveryDrillsOverview,
  buildReleasesOverview,
  normalizeOpsAuditExportPayload,
  normalizeOpsBackupPlansPayload,
  normalizeOpsBackupRunsPayload,
  normalizeOpsChangeApprovalsPayload,
  normalizeOpsRecoveryDrillsPayload,
  normalizeOpsReleasesPayload
} from "./model";
import { buildCreatePayload, getRecordsFormFields, type RecordsDraft, type RecordsRoute } from "./records-config";

export function AdminOperationsRecordsPage({ route }: { route: RecordsRoute }) {
  const { messages } = useProtectedI18n();
  const operationsMessages = messages.adminOperations;
  const meta = useMemo(() => resolveAdminOperationsRecordsRouteMeta(route, operationsMessages), [operationsMessages, route]);
  const formFields = useMemo(() => getRecordsFormFields(route, operationsMessages), [operationsMessages, route]);
  const { overlay, openOverlay, closeOverlay } = useAdminOverlayState<"recordCreate" | "recordDetail">();
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [draft, setDraft] = useState<RecordsDraft>({});
  const [selectedRecord, setSelectedRecord] = useState<OperationsRecordDetailState | null>(null);

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
      setError(resolveRequestErrorDisplayMessage(loadError, operationsMessages.recordsLoadError));
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [meta.endpoint, operationsMessages.recordsLoadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  useEffect(() => {
    closeOverlay();
    setSelectedRecord(null);
  }, [closeOverlay, route]);

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
      closeOverlay();
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, operationsMessages.recordsSaveError));
    } finally {
      setBusyAction("");
    }
  }

  function updateDraftValue(key: string, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={meta.title}
        description={meta.description}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminOperationsRecordsContent
      route={route}
      title={meta.title}
      description={meta.description}
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      metrics={view.metrics}
      rows={view.rows}
      endpoint={meta.endpoint}
      createEndpoint={meta.createEndpoint}
      formFields={formFields}
      draft={draft}
      activePane={overlay?.entity === "recordCreate" ? "create" : overlay?.entity === "recordDetail" ? "detail" : "idle"}
      selectedRecord={selectedRecord}
      onRefresh={() => void loadData()}
      onOpenCreatePane={() => openOverlay({ kind: "create", entity: "recordCreate" })}
      onClosePane={() => {
        closeOverlay();
        setSelectedRecord(null);
      }}
      onOpenDetailPane={(detail) => {
        setSelectedRecord(detail);
        openOverlay({ kind: "detail", entity: "recordDetail", entityId: detail.index });
      }}
      onDraftChange={updateDraftValue}
      onSubmitCreate={() => void submitCreate()}
    />
  );
}
