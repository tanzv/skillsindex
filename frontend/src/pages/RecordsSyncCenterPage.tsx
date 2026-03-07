import { Button } from "antd";
import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { buildWorkspaceSidebarNavigation } from "./WorkspaceCenterPage.navigation";
import {
  asRecord,
  buildSyncRunDetailSummary,
  parseSyncPolicy,
  parseSyncRun,
  resolveAdminBase,
  resolveRecordsSyncActiveMenuID
} from "./RecordsSyncCenterPage.helpers";
import RecordsSyncCenterPageContent from "./RecordsSyncCenterPageContent";
import type { RecordsSyncCenterPageProps, SyncPolicyRecord, SyncRunRecord } from "./RecordsSyncCenterPage.types";
import { createPublicPageNavigator } from "./publicPageNavigation";
import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";

const baseCopy = {
  title: "Records Governance and Remote Sync",
  subtitle: "Track sync run history, inspect one run detail, and update scheduler policy from the workspace command surface.",
  eyebrow: "Records Sync",
  loading: "Loading sync records",
  refresh: "Refresh",
  apply: "Apply Filters",
  openJobs: "Open Jobs",
  openPolicy: "Open Sync Policy",
  openExports: "Open Exports",
  ownerFilter: "Owner ID",
  limit: "Limit",
  runList: "Sync Run List",
  runDetail: "Run Detail",
  noRuns: "No sync run records",
  status: "Status",
  duration: "Duration",
  started: "Started",
  finished: "Finished",
  openDetail: "Open Detail",
  detailsJSON: "Details JSON",
  policy: "Repository Sync Policy",
  policyHint: "Update scheduler configuration used by repository synchronization.",
  enabled: "Enabled",
  interval: "Interval",
  timeout: "Timeout",
  batchSize: "Batch Size",
  savePolicy: "Save Policy",
  quickActions: "Quick Actions",
  recordsCount: "Run Records",
  failedCount: "Failed Runs",
  partialCount: "Partial Runs",
  policyState: "Policy State",
  enabledState: "enabled",
  disabledState: "disabled",
  saveSuccess: "Saved successfully",
  requestFailed: "Request failed",
  unknown: "n/a"
};

const copy: Record<AppLocale, typeof baseCopy> = {
  en: baseCopy,
  zh: baseCopy
};

export default function RecordsSyncCenterPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: RecordsSyncCenterPageProps) {
  const text = copy[locale];
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

  async function loadDetail(runID: number) {
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
  }

  async function loadRuns(nextSelectedRunID?: number) {
    const query = new URLSearchParams();
    const normalizedOwner = ownerFilter.trim();
    if (normalizedOwner) {
      query.set("owner_user_id", normalizedOwner);
    }
    const normalizedLimit = Math.max(1, Math.min(200, Number(limit) || 80));
    query.set("limit", String(normalizedLimit));

    const payload = await fetchConsoleJSON<{ items?: unknown[] }>(`/api/v1/admin/sync-jobs?${query.toString()}`);
    const items = Array.isArray(payload.items) ? payload.items.map((item) => parseSyncRun(item)) : [];
    setRuns(items);

    const preferredRunID = nextSelectedRunID || selectedRunID;
    const resolvedRunID = items.some((item) => item.id === preferredRunID) ? preferredRunID : items[0]?.id || 0;
    setSelectedRunID(resolvedRunID);
    await loadDetail(resolvedRunID);
  }

  async function loadPolicy() {
    const payload = await fetchConsoleJSON<{ item?: unknown }>("/api/v1/admin/sync-policy/repository");
    setPolicy(parseSyncPolicy(payload.item));
  }

  async function refreshAll(nextSelectedRunID?: number) {
    clearFeedback();
    setLoading(true);
    try {
      await Promise.all([loadRuns(nextSelectedRunID), loadPolicy()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  async function savePolicy() {
    clearFeedback();
    const batchSize = Number(policy.batch_size);
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      setError(text.requestFailed);
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
  }

  const failedCount = runs.filter((item) => item.status.toLowerCase() === "failed").length;
  const partialCount = runs.filter((item) => item.status.toLowerCase() === "partial").length;
  const detailSummary = buildSyncRunDetailSummary(detailPayload, locale, text.unknown);
  const sidebarGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text: workspaceText,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [pageNavigator.toAdmin, pageNavigator.toPublic, workspaceText]
  );

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
      sidebarMeta={[
        { id: "records-policy", label: policy.enabled ? text.enabledState : text.disabledState, tone: "accent" },
        { id: "records-partial", label: `${partialCount} ${text.partialCount.toLowerCase()}` }
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
