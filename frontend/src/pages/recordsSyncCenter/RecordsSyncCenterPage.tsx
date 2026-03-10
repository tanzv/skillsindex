import { Button } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { getWorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";
import { buildWorkspaceSidebarNavigation } from "../workspace/WorkspaceCenterPage.navigation";
import {
  asRecord,
  buildSyncRunsQuery,
  buildSyncRunDetailSummary,
  parseSyncPolicy,
  parseSyncRun,
  resolveAdminBase,
  resolveRecordsSyncActiveMenuID,
  resolveRecordsSyncSidebarGroups
} from "./RecordsSyncCenterPage.helpers";
import RecordsSyncCenterPageContent from "./RecordsSyncCenterPageContent";
import type { RecordsSyncCenterPageProps, SyncPolicyRecord, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import WorkspacePrototypePageShell from "../workspace/WorkspacePrototypePageShell";
import { getRecordsSyncCenterCopy } from "./RecordsSyncCenterPage.copy";

export default function RecordsSyncCenterPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: RecordsSyncCenterPageProps) {
  const text = useMemo(() => getRecordsSyncCenterCopy(locale, currentPath), [currentPath, locale]);
  const workspaceText = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const adminBase = useMemo(() => resolveAdminBase(currentPath), [currentPath]);
  const activeMenuID = useMemo(() => resolveRecordsSyncActiveMenuID(currentPath), [currentPath]);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);

  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [limit, setLimit] = useState("80");
  const [runs, setRuns] = useState<SyncRunRecord[]>([]);
  const [selectedRunID, setSelectedRunID] = useState<number>(0);
  const [detailPayload, setDetailPayload] = useState<Record<string, unknown> | null>(null);
  const [policy, setPolicy] = useState<SyncPolicyRecord>({
    enabled: false,
    interval: "30m",
    timeout: "10m",
    batch_size: 20
  });

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  const loadDetail = useCallback(async (runID: number) => {
    if (!runID) {
      setDetailPayload(null);
      return;
    }
    try {
      const payload = await fetchConsoleJSON<{ item?: Record<string, unknown> }>(`/api/v1/admin/sync-jobs/${runID}`);
      setDetailPayload(asRecord(payload.item));
    } catch (detailError) {
      setDetailPayload(null);
      setError(detailError instanceof Error ? detailError.message : text.requestFailed);
    }
  }, [text.requestFailed]);

  const loadRuns = useCallback(async (nextSelectedRunID?: number) => {
    const queryString = buildSyncRunsQuery({ ownerFilter, limit });
    const payload = await fetchConsoleJSON<{ items?: unknown[] }>(`/api/v1/admin/sync-jobs?${queryString}`);
    const items = Array.isArray(payload.items) ? payload.items.map((item) => parseSyncRun(item)) : [];
    setRuns(items);

    const preferredRunID = nextSelectedRunID || selectedRunID;
    const resolvedRunID = items.some((item) => item.id === preferredRunID) ? preferredRunID : items[0]?.id || 0;
    setSelectedRunID(resolvedRunID);
    await loadDetail(resolvedRunID);
  }, [limit, loadDetail, ownerFilter, selectedRunID]);

  const loadPolicy = useCallback(async () => {
    const payload = await fetchConsoleJSON<unknown>("/api/v1/admin/sync-policy/repository");
    setPolicy(parseSyncPolicy(payload));
  }, []);

  const refreshAll = useCallback(async (nextSelectedRunID?: number) => {
    clearFeedback();
    setLoading(true);
    try {
      await Promise.all([loadRuns(nextSelectedRunID), loadPolicy()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }, [loadPolicy, loadRuns, text.requestFailed]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const savePolicy = useCallback(async () => {
    clearFeedback();
    const batchSize = Number(policy.batch_size);
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      setError(text.invalidBatchSize);
      return;
    }

    setSavingPolicy(true);
    try {
      await postConsoleJSON("/api/v1/admin/sync-policy/repository", {
        enabled: policy.enabled,
        interval: policy.interval.trim(),
        timeout: policy.timeout.trim(),
        batch_size: Math.round(batchSize)
      });
      setMessage(text.saveSuccess);
      await refreshAll(selectedRunID || undefined);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.requestFailed);
    } finally {
      setSavingPolicy(false);
    }
  }, [policy, refreshAll, selectedRunID, text.invalidBatchSize, text.requestFailed, text.saveSuccess]);

  const failedCount = runs.filter((item) => item.status.toLowerCase() === "failed").length;
  const partialCount = runs.filter((item) => item.status.toLowerCase() === "partial").length;
  const detailSummary = buildSyncRunDetailSummary(detailPayload, locale, text.unknown);
  const topbarMenuGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text: workspaceText,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [pageNavigator.toAdmin, pageNavigator.toPublic, workspaceText]
  );
  const sidebarGroups = useMemo(() => resolveRecordsSyncSidebarGroups(topbarMenuGroups), [topbarMenuGroups]);

  return (
    <WorkspacePrototypePageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser || null}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID={activeMenuID}
      sidebarGroups={sidebarGroups}
      topbarMenuGroups={topbarMenuGroups}
      sidebarMode="secondary"
      sidebarMeta={[
        { id: "records-policy", label: policy.enabled ? text.enabledState : text.disabledState, tone: "accent" },
        { id: "records-partial", label: `${partialCount} ${text.partialBadge}` }
      ]}
      eyebrow={text.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
      summaryMetrics={[
        { id: "summary-records", label: text.recordsCount, value: String(runs.length) },
        { id: "summary-failed", label: text.failedCount, value: String(failedCount) },
        { id: "summary-partial", label: text.partialCount, value: String(partialCount) },
        { id: "summary-policy", label: text.policyState, value: policy.enabled ? text.enabledState : text.disabledState }
      ]}
      summaryActions={
        <>
          <Button onClick={() => onNavigate(`${adminBase}/jobs`)}>{text.openJobs}</Button>
          <Button onClick={() => onNavigate(`${adminBase}/sync-policy/repository`)}>{text.openPolicy}</Button>
          <Button onClick={() => onNavigate(`${adminBase}/records/exports`)}>{text.openExports}</Button>
          <Button type="primary" onClick={() => void refreshAll(selectedRunID || undefined)} loading={loading && !savingPolicy}>
            {text.refresh}
          </Button>
        </>
      }
      loading={loading}
      loadingText={text.loading}
      error={error}
      success={message}
    >
      <RecordsSyncCenterPageContent
        locale={locale}
        text={text}
        adminBase={adminBase}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        limit={limit}
        onLimitChange={setLimit}
        onRefresh={() => void refreshAll(selectedRunID || undefined)}
        refreshing={loading && !savingPolicy}
        runs={runs}
        selectedRunID={selectedRunID}
        onSelectRun={(runID) => {
          setSelectedRunID(runID);
          void loadDetail(runID);
        }}
        detailSummary={detailSummary}
        detailPayload={detailPayload}
        policy={policy}
        setPolicy={setPolicy}
        onSavePolicy={() => void savePolicy()}
        savingPolicy={savingPolicy}
        onNavigate={onNavigate}
      />
    </WorkspacePrototypePageShell>
  );
}
