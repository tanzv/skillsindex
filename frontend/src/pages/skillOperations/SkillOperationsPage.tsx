import { useCallback, useEffect, useMemo, useState } from "react";

import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";
import { fetchConsoleJSON, postConsoleForm, postConsoleJSON, postConsoleMultipartJSON } from "../../lib/api";
import { asRecord, parseSyncPolicy, parseSyncRun } from "../recordsSyncCenter/RecordsSyncCenterPage.helpers";
import type { SyncPolicyRecord, SyncRunRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";
import { getSkillOperationsCopy } from "./SkillOperationsPage.copy";
import {
  buildSkillOperationsMetrics,
  defaultSkillOperationsPolicy,
  filterImportJobs,
  filterSkillsForRoute,
  getSkillOperationsRouteMeta,
  normalizeImportJobItem,
  normalizeSkillInventoryItem,
  resolveSkillOperationsViewKind
} from "./SkillOperationsPage.helpers";
import { SkillOperationsActionsPanel, SkillOperationsPolicyPanel } from "./SkillOperationsPage.panels";
import {
  buildArchivePayload,
  buildManualPayload,
  buildRepositoryPayload,
  buildRepositorySyncBatchPayload,
  buildSkillMPPayload,
  type SkillOperationsMutationResponse
} from "./SkillOperationsPage.submissions";
import SkillOperationsSubpageShell from "./SkillOperationsSubpageShell";
import type {
  ManualSkillDraft,
  RepositorySkillDraft,
  SkillInventoryItem,
  SkillMPDraft,
  SkillOperationsPageContentProps,
  SkillOperationsPageProps,
  SkillOperationsSubmissionAction
} from "./SkillOperationsPage.types";
import SkillOperationsImportsView from "./SkillOperationsImportsView";
import SkillOperationsManualView from "./SkillOperationsManualView";
import SkillOperationsRepositoryView from "./SkillOperationsRepositoryView";
import SkillOperationsSyncRunsView from "./SkillOperationsSyncRunsView";

function buildStatusNode(route: SkillOperationsPageContentProps["route"], policy: SyncPolicyRecord, message: string) {
  const pills = [
    <span className="pill active" key="state-live">
      Live backend data
    </span>
  ];

  if (route === "/admin/ingestion/repository" || route === "/admin/sync-jobs") {
    pills.push(
      <span className={policy.enabled ? "pill active" : "pill muted"} key="state-policy">
        {policy.enabled ? "Scheduler enabled" : "Scheduler disabled"}
      </span>
    );
  }

  if (message.trim()) {
    pills.push(
      <span className="pill muted" key="state-message">
        {message.trim()}
      </span>
    );
  }

  return <div className="account-workbench-status-strip">{pills}</div>;
}

export function SkillOperationsPageContent({
  locale,
  route,
  loading,
  error,
  message,
  submittingAction,
  skills,
  importJobs,
  syncRuns,
  selectedRunID,
  syncDetail,
  policy,
  onRefresh,
  onSubmitManual,
  onSubmitRepository,
  onSubmitArchiveImport,
  onSubmitSkillMPImport,
  onRunRepositorySyncBatch,
  onRetryImportJob,
  onCancelImportJob,
  onSelectRun,
  onSavePolicy,
  onPolicyChange,
  onNavigate
}: SkillOperationsPageContentProps) {
  const copy = getSkillOperationsCopy(locale);
  const meta = getSkillOperationsRouteMeta(locale, route);
  const filteredSkills = filterSkillsForRoute(skills, route);
  const metrics = buildSkillOperationsMetrics({
    route,
    locale,
    skills,
    syncRuns,
    policy
  });

  if (loading) {
    return (
      <div className="page-grid account-workbench">
        <section className="panel panel-hero loading">Loading skill operations workbench...</section>
      </div>
    );
  }

  const viewKind = resolveSkillOperationsViewKind(route);
  const notice = error.trim() ? (
    <span className="account-workbench-inline-feedback is-error">{error}</span>
  ) : message.trim() ? (
    <span className="account-workbench-inline-feedback is-success">{message}</span>
  ) : undefined;

  return (
    <div className="page-grid account-workbench">
      <AdminSubpageSummaryPanel
        title={meta.title}
        status={buildStatusNode(route, policy, "")}
        actions={
          <button type="button" onClick={onRefresh} className="panel-action-button">
            {copy.refresh}
          </button>
        }
        notice={notice}
        metrics={metrics}
      />

      {viewKind === "manual" ? (
        <div className="account-workbench-mode-layout">
          <div className="account-workbench-mode-main">
            <SkillOperationsManualView
              locale={locale}
              copy={copy}
              skills={filteredSkills}
              submittingAction={submittingAction}
              onSubmit={onSubmitManual}
            />
          </div>
          <div className="account-workbench-mode-side">
            <SkillOperationsActionsPanel copy={copy} onNavigate={onNavigate} />
          </div>
        </div>
      ) : null}

      {viewKind === "repository" ? (
        <div className="account-workbench-mode-layout">
          <div className="account-workbench-mode-main">
            <SkillOperationsRepositoryView
              locale={locale}
              copy={copy}
              skills={filteredSkills}
              syncRuns={syncRuns}
              submittingAction={submittingAction}
              onSubmit={onSubmitRepository}
              onRunSyncBatch={onRunRepositorySyncBatch}
              onSelectRun={onSelectRun}
            />
          </div>
          <div className="account-workbench-mode-side">
            <SkillOperationsPolicyPanel
              copy={copy}
              policy={policy}
              onPolicyChange={onPolicyChange}
              onSavePolicy={onSavePolicy}
              submittingAction={submittingAction}
            />
            <SkillOperationsActionsPanel copy={copy} onNavigate={onNavigate} />
          </div>
        </div>
      ) : null}

      {viewKind === "imports" ? (
        <div className="account-workbench-mode-layout">
          <div className="account-workbench-mode-main">
            <SkillOperationsImportsView
              locale={locale}
              copy={copy}
              skills={filteredSkills}
              importJobs={importJobs}
              submittingAction={submittingAction}
              onArchiveSubmit={onSubmitArchiveImport}
              onSkillMPSubmit={onSubmitSkillMPImport}
              onRetryJob={onRetryImportJob}
              onCancelJob={onCancelImportJob}
            />
          </div>
          <div className="account-workbench-mode-side">
            <SkillOperationsActionsPanel copy={copy} onNavigate={onNavigate} />
          </div>
        </div>
      ) : null}

      {viewKind === "sync-runs" ? (
        <div className="account-workbench-mode-layout">
          <div className="account-workbench-mode-main">
            <SkillOperationsSyncRunsView
              locale={locale}
              copy={copy}
              syncRuns={syncRuns}
              selectedRunID={selectedRunID}
              syncDetail={syncDetail}
              onRefresh={onRefresh}
              onSelectRun={onSelectRun}
            />
          </div>
          <div className="account-workbench-mode-side">
            <SkillOperationsPolicyPanel
              copy={copy}
              policy={policy}
              onPolicyChange={onPolicyChange}
              onSavePolicy={onSavePolicy}
              submittingAction={submittingAction}
            />
            <SkillOperationsActionsPanel copy={copy} onNavigate={onNavigate} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SkillOperationsPage({
  locale,
  route,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: SkillOperationsPageProps) {
  const copy = useMemo(() => getSkillOperationsCopy(locale), [locale]);
  const meta = useMemo(() => getSkillOperationsRouteMeta(locale, route), [locale, route]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submittingAction, setSubmittingAction] = useState<SkillOperationsSubmissionAction>("");
  const [skills, setSkills] = useState<SkillInventoryItem[]>([]);
  const [importJobs, setImportJobs] = useState<SkillOperationsPageContentProps["importJobs"]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRunRecord[]>([]);
  const [selectedRunID, setSelectedRunID] = useState(0);
  const [syncDetail, setSyncDetail] = useState<Record<string, unknown> | null>(null);
  const [policy, setPolicy] = useState<SyncPolicyRecord>(defaultSkillOperationsPolicy);

  const loadSkillInventory = useCallback(async () => {
    const payload = await fetchConsoleJSON<{ items?: Record<string, unknown>[] }>("/api/v1/admin/skills");
    const items = Array.isArray(payload.items) ? payload.items.map((item) => normalizeSkillInventoryItem(asRecord(item))) : [];
    setSkills(items);
  }, []);

  const loadImportJobs = useCallback(async () => {
    const payload = await fetchConsoleJSON<{ items?: Record<string, unknown>[] }>("/api/v1/admin/jobs?limit=40");
    const items = Array.isArray(payload.items) ? payload.items.map((item) => normalizeImportJobItem(asRecord(item))) : [];
    setImportJobs(filterImportJobs(items));
  }, []);

  const loadSyncDetail = useCallback(
    async (runID: number) => {
      if (!runID) {
        setSyncDetail(null);
        return;
      }
      const payload = await fetchConsoleJSON<{ item?: Record<string, unknown> }>(`/api/v1/admin/sync-jobs/${runID}`);
      setSyncDetail(asRecord(payload.item));
    },
    []
  );

  const loadSyncContext = useCallback(
    async (preferredRunID?: number) => {
      const [runsPayload, policyPayload] = await Promise.all([
        fetchConsoleJSON<{ items?: Record<string, unknown>[] }>("/api/v1/admin/sync-jobs?limit=20"),
        fetchConsoleJSON<unknown>("/api/v1/admin/sync-policy/repository")
      ]);

      const items = Array.isArray(runsPayload.items) ? runsPayload.items.map((item) => parseSyncRun(item)) : [];
      setSyncRuns(items);
      setPolicy(parseSyncPolicy(policyPayload));

      const resolvedRunID = items.some((item) => item.id === preferredRunID) ? preferredRunID || 0 : items[0]?.id || 0;
      setSelectedRunID(resolvedRunID);
      await loadSyncDetail(resolvedRunID);
    },
    [loadSyncDetail]
  );

  const loadData = useCallback(
    async (preferredRunID?: number, preserveMessage = false) => {
      setLoading(true);
      setError("");
      if (!preserveMessage) {
        setMessage("");
      }

      try {
        if (route === "/admin/ingestion/manual" || route === "/admin/ingestion/repository" || route === "/admin/records/imports") {
          await loadSkillInventory();
        } else {
          setSkills([]);
        }

        if (route === "/admin/records/imports") {
          await loadImportJobs();
        } else {
          setImportJobs([]);
        }

        if (route === "/admin/ingestion/repository" || route === "/admin/sync-jobs") {
          await loadSyncContext(preferredRunID);
        } else {
          setSyncRuns([]);
          setSelectedRunID(0);
          setSyncDetail(null);
          setPolicy(defaultSkillOperationsPolicy);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : copy.requestFailed);
      } finally {
        setLoading(false);
      }
    },
    [copy.requestFailed, loadImportJobs, loadSkillInventory, loadSyncContext, route]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const runSubmission = useCallback(
    async (action: SkillOperationsSubmissionAction, task: () => Promise<SkillOperationsMutationResponse>) => {
      setSubmittingAction(action);
      setError("");
      setMessage("");
      try {
        const result = await task();
        const nextMessage = String(result.message || "Operation completed").trim();
        setMessage(nextMessage || "Operation completed");
        await loadData(selectedRunID || undefined, true);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : copy.requestFailed);
      } finally {
        setSubmittingAction("");
      }
    },
    [copy.requestFailed, loadData, selectedRunID]
  );

  const handleSubmitManual = useCallback(
    async (draft: ManualSkillDraft) => {
      if (!draft.name.trim() || !draft.content.trim()) {
        setError("Name and content are required.");
        return;
      }
      await runSubmission("manual", async () =>
        postConsoleJSON<SkillOperationsMutationResponse>(
          "/api/v1/admin/ingestion/manual",
          Object.fromEntries(buildManualPayload(draft).entries())
        )
      );
    },
    [runSubmission]
  );

  const handleSubmitRepository = useCallback(
    async (draft: RepositorySkillDraft) => {
      if (!draft.repo_url.trim()) {
        setError("Repository URL is required.");
        return;
      }
      await runSubmission("repository", async () =>
        postConsoleJSON<SkillOperationsMutationResponse>(
          "/api/v1/admin/ingestion/repository",
          Object.fromEntries(buildRepositoryPayload(draft).entries())
        )
      );
    },
    [runSubmission]
  );

  const handleSubmitArchiveImport = useCallback(
    async (file: File | null, draft: Pick<RepositorySkillDraft, "tags" | "visibility" | "install_command">) => {
      if (!file) {
        setError("Archive file is required.");
        return;
      }
      await runSubmission("archive", async () =>
        postConsoleMultipartJSON<SkillOperationsMutationResponse>("/api/v1/admin/ingestion/upload", buildArchivePayload(file, draft))
      );
    },
    [runSubmission]
  );

  const handleSubmitSkillMPImport = useCallback(
    async (draft: SkillMPDraft) => {
      if (!draft.skillmp_url.trim() && !draft.skillmp_id.trim()) {
        setError("SkillMP URL or SkillMP ID is required.");
        return;
      }
      await runSubmission("skillmp", async () =>
        postConsoleJSON<SkillOperationsMutationResponse>(
          "/api/v1/admin/ingestion/skillmp",
          Object.fromEntries(buildSkillMPPayload(draft).entries())
        )
      );
    },
    [runSubmission]
  );

  const handleRunRepositorySyncBatch = useCallback(async () => {
    setSubmittingAction("sync-batch");
    setError("");
    setMessage("");
    try {
      const result = await postConsoleForm("/admin/sync/repositories", buildRepositorySyncBatchPayload());
      if (!result.ok) {
        setError(result.error || copy.requestFailed);
        return;
      }
      setMessage(result.message || "Repository sync finished");
      await loadData(selectedRunID || undefined, true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : copy.requestFailed);
    } finally {
      setSubmittingAction("");
    }
  }, [copy.requestFailed, loadData, selectedRunID]);

  const handleRetryImportJob = useCallback(
    async (jobID: number) => {
      await runSubmission("job-action", async () =>
        postConsoleJSON<SkillOperationsMutationResponse>(`/api/v1/admin/jobs/${jobID}/retry`)
      );
    },
    [runSubmission]
  );

  const handleCancelImportJob = useCallback(
    async (jobID: number) => {
      await runSubmission("job-action", async () =>
        postConsoleJSON<SkillOperationsMutationResponse>(`/api/v1/admin/jobs/${jobID}/cancel`)
      );
    },
    [runSubmission]
  );

  const handleSelectRun = useCallback(
    (runID: number) => {
      setSelectedRunID(runID);
      void loadSyncDetail(runID);
    },
    [loadSyncDetail]
  );

  const handleSavePolicy = useCallback(async () => {
    const batchSize = Number(policy.batch_size);
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      setError("Batch size must be a positive number.");
      return;
    }

    setSubmittingAction("policy");
    setError("");
    setMessage("");
    try {
      await postConsoleJSON("/api/v1/admin/sync-policy/repository", {
        enabled: policy.enabled,
        interval: policy.interval.trim(),
        timeout: policy.timeout.trim(),
        batch_size: Math.round(batchSize)
      });
      setMessage(copy.policySaved);
      await loadData(selectedRunID || undefined, true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : copy.requestFailed);
    } finally {
      setSubmittingAction("");
    }
  }, [copy.policySaved, copy.requestFailed, loadData, policy, selectedRunID]);

  return (
    <SkillOperationsSubpageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      eyebrow={meta.eyebrow}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      <SkillOperationsPageContent
        locale={locale}
        route={route}
        loading={loading}
        error={error}
        message={message}
        submittingAction={submittingAction}
        skills={skills}
        importJobs={importJobs}
        syncRuns={syncRuns}
        selectedRunID={selectedRunID}
        syncDetail={syncDetail}
        policy={policy}
        onRefresh={() => void loadData(selectedRunID || undefined)}
        onSubmitManual={handleSubmitManual}
        onSubmitRepository={handleSubmitRepository}
        onSubmitArchiveImport={handleSubmitArchiveImport}
        onSubmitSkillMPImport={handleSubmitSkillMPImport}
        onRunRepositorySyncBatch={handleRunRepositorySyncBatch}
        onRetryImportJob={handleRetryImportJob}
        onCancelImportJob={handleCancelImportJob}
        onSelectRun={handleSelectRun}
        onSavePolicy={handleSavePolicy}
        onPolicyChange={(patch) => setPolicy((previous) => ({ ...previous, ...patch }))}
        onNavigate={onNavigate}
      />
    </SkillOperationsSubpageShell>
  );
}
