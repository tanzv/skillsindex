"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { resolveAdminIngestionPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";
import type { AdminIngestionRoute } from "@/src/lib/routing/adminRouteRegistry";

import { AdminIngestionContent } from "./AdminIngestionContent";
import type { AdminIngestionOverlayEntity } from "./AdminIngestionViewProps";
import {
  buildAdminIngestionMetrics,
  createImportsDraft,
  createManualDraft,
  createRepositoryDraft,
  createRepositorySyncPolicy,
  createAdminIngestionRepositorySnapshot,
  normalizeImportJobsPayload,
  normalizeSkillInventoryPayload,
  normalizeSyncRunsPayload,
  resolveSelectedImportJobItem,
  resolveSelectedSkillInventoryItem,
  resolveSelectedSyncRunItem,
  type AdminIngestionRepositorySnapshot,
  type RepositorySyncPolicy,
  type SkillInventoryItem
} from "./model";
import { buildManualPayload, buildRepositoryPayload, buildSkillMPPayload } from "./shared";

interface ActionConfig {
  actionKey: string;
  successMessage: string;
  failureMessage: string;
  request: () => Promise<unknown>;
  afterSuccess?: () => void;
}

interface AdminIngestionPageProps {
  route: AdminIngestionRoute;
  initialRepositorySnapshot?: AdminIngestionRepositorySnapshot | null;
}

export function AdminIngestionPage({
  route,
  initialRepositorySnapshot = null
}: AdminIngestionPageProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;
  const meta = useMemo(() => resolveAdminIngestionPageRouteMeta(route, ingestionMessages), [ingestionMessages, route]);
  const { overlay, openOverlay, closeOverlay } = useAdminOverlayState<AdminIngestionOverlayEntity>();
  const hasInitialRepositorySnapshotRef = useRef(
    route === "/admin/ingestion/repository" && initialRepositorySnapshot !== null
  );
  const [loading, setLoading] = useState(() => !(route === "/admin/ingestion/repository" && initialRepositorySnapshot));
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState<SkillInventoryItem[]>(() => initialRepositorySnapshot?.skills || []);
  const [repositoryPolicy, setRepositoryPolicy] = useState<RepositorySyncPolicy>(
    () => initialRepositorySnapshot?.policy || createRepositorySyncPolicy()
  );
  const [syncRuns, setSyncRuns] = useState<ReturnType<typeof normalizeSyncRunsPayload>["items"]>(
    () => initialRepositorySnapshot?.syncRuns || []
  );
  const [importJobs, setImportJobs] = useState<ReturnType<typeof normalizeImportJobsPayload>["items"]>([]);
  const [manualDraft, setManualDraft] = useState(createManualDraft);
  const [repositoryDraft, setRepositoryDraft] = useState(createRepositoryDraft);
  const [importsDraft, setImportsDraft] = useState(createImportsDraft);
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [loadedRoute, setLoadedRoute] = useState<AdminIngestionRoute | null>(
    route === "/admin/ingestion/repository" && initialRepositorySnapshot !== null ? route : null
  );

  const selectedSkill = useMemo(
    () => resolveSelectedSkillInventoryItem(skills, overlay?.entity === "skillDetail" ? Number(overlay.entityId || 0) : null),
    [overlay, skills]
  );
  const selectedSyncRun = useMemo(
    () => resolveSelectedSyncRunItem(syncRuns, overlay?.entity === "syncRunDetail" ? Number(overlay.entityId || 0) : null),
    [overlay, syncRuns]
  );
  const selectedJob = useMemo(
    () => resolveSelectedImportJobItem(importJobs, overlay?.entity === "importJobDetail" ? Number(overlay.entityId || 0) : null),
    [importJobs, overlay]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (route === "/admin/ingestion/manual") {
        const payload = await clientFetchJSON("/api/bff/admin/skills?source=manual");
        setSkills(normalizeSkillInventoryPayload(payload).items);
        setImportJobs([]);
        setSyncRuns([]);
        setRepositoryPolicy(createRepositorySyncPolicy());
        setLoadedRoute(route);
        return;
      }

      if (route === "/admin/ingestion/repository") {
        const [skillsPayload, policyPayload, syncRunsPayload] = await Promise.all([
          clientFetchJSON("/api/bff/admin/skills?source=repository"),
          clientFetchJSON("/api/bff/admin/sync-policy/repository"),
          clientFetchJSON("/api/bff/admin/sync-jobs?limit=6")
        ]);
        const snapshot = createAdminIngestionRepositorySnapshot({
          skillsPayload,
          policyPayload,
          syncRunsPayload
        });
        setSkills(snapshot.skills);
        setRepositoryPolicy(snapshot.policy);
        setSyncRuns(snapshot.syncRuns);
        setImportJobs([]);
        setLoadedRoute(route);
        return;
      }

      const [archivePayload, skillMPPayload, jobsPayload] = await Promise.all([
        clientFetchJSON("/api/bff/admin/skills?source=upload"),
        clientFetchJSON("/api/bff/admin/skills?source=skillmp"),
        clientFetchJSON("/api/bff/admin/jobs?limit=20")
      ]);
      const archiveSkills = normalizeSkillInventoryPayload(archivePayload).items;
      const skillMPSkills = normalizeSkillInventoryPayload(skillMPPayload).items;
      setSkills([...archiveSkills, ...skillMPSkills]);
      setImportJobs(normalizeImportJobsPayload(jobsPayload).items);
      setSyncRuns([]);
      setRepositoryPolicy(createRepositorySyncPolicy());
      setLoadedRoute(route);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : ingestionMessages.loadError);
    } finally {
      setLoading(false);
    }
  }, [ingestionMessages.loadError, route]);

  useEffect(() => {
    closeOverlay();
    if (route === "/admin/ingestion/repository" && hasInitialRepositorySnapshotRef.current) {
      hasInitialRepositorySnapshotRef.current = false;
      return;
    }
    void loadData();
  }, [closeOverlay, loadData, route]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: loadedRoute === route });

  const metrics = useMemo(
    () =>
      buildAdminIngestionMetrics(route, {
        skills,
        importJobs,
        syncRuns,
        policy: repositoryPolicy
      }, {
        messages: ingestionMessages
      }),
    [importJobs, ingestionMessages, repositoryPolicy, route, skills, syncRuns]
  );

  const executeAction = useCallback(
    async ({ actionKey, successMessage, failureMessage, request, afterSuccess }: ActionConfig) => {
      setBusyAction(actionKey);
      setError("");
      setMessage("");

      try {
        await request();
        afterSuccess?.();
        setMessage(successMessage);
        await loadData();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : failureMessage);
      } finally {
        setBusyAction("");
      }
    },
    [loadData]
  );

  async function submitManual() {
    await executeAction({
      actionKey: "manual",
      successMessage: ingestionMessages.manualCreateSuccess,
      failureMessage: ingestionMessages.manualCreateError,
      request: () => clientFetchJSON("/api/bff/admin/ingestion/manual", { method: "POST", body: buildManualPayload(manualDraft) }),
      afterSuccess: () => {
        setManualDraft(createManualDraft());
        closeOverlay();
      }
    });
  }

  async function submitRepository() {
    await executeAction({
      actionKey: "repository",
      successMessage: ingestionMessages.repositorySubmitSuccess,
      failureMessage: ingestionMessages.repositorySubmitError,
      request: () => clientFetchJSON("/api/bff/admin/ingestion/repository", { method: "POST", body: buildRepositoryPayload(repositoryDraft) }),
      afterSuccess: () => {
        setRepositoryDraft(createRepositoryDraft());
        closeOverlay();
      }
    });
  }

  async function saveRepositoryPolicy() {
    await executeAction({
      actionKey: "policy",
      successMessage: ingestionMessages.policySaveSuccess,
      failureMessage: ingestionMessages.policySaveError,
      request: () =>
        clientFetchJSON("/api/bff/admin/sync-policy/repository", {
          method: "POST",
          body: {
            enabled: repositoryPolicy.enabled,
            interval: repositoryPolicy.interval,
            timeout: repositoryPolicy.timeout,
            batch_size: repositoryPolicy.batchSize
          }
        }),
      afterSuccess: closeOverlay
    });
  }

  async function submitArchive() {
    if (!archiveFile) {
      setError(ingestionMessages.archiveRequiredError);
      return;
    }

    await executeAction({
      actionKey: "archive",
      successMessage: ingestionMessages.archiveSubmitSuccess,
      failureMessage: ingestionMessages.archiveSubmitError,
      request: async () => {
        const formData = new FormData();
        formData.set("archive", archiveFile);
        formData.set("tags", importsDraft.archive_tags);
        formData.set("visibility", importsDraft.archive_visibility);
        formData.set("install_command", importsDraft.archive_install_command);
        await clientFetchJSON("/api/bff/admin/ingestion/upload", { method: "POST", body: formData });
      },
      afterSuccess: () => {
        setArchiveFile(null);
        setImportsDraft((current) => ({
          ...current,
          archive_tags: "",
          archive_install_command: "",
          archive_visibility: "private"
        }));
        closeOverlay();
      }
    });
  }

  async function submitSkillMP() {
    await executeAction({
      actionKey: "skillmp",
      successMessage: ingestionMessages.skillmpSubmitSuccess,
      failureMessage: ingestionMessages.skillmpSubmitError,
      request: () => clientFetchJSON("/api/bff/admin/ingestion/skillmp", { method: "POST", body: buildSkillMPPayload(importsDraft) }),
      afterSuccess: () => {
        setImportsDraft((current) => ({
          ...current,
          skillmp_url: "",
          skillmp_id: "",
          skillmp_token: "",
          skillmp_tags: "",
          skillmp_visibility: "private",
          skillmp_install_command: ""
        }));
        closeOverlay();
      }
    });
  }

  async function runJobAction(jobId: number, action: "retry" | "cancel") {
    await executeAction({
      actionKey: `${action}-${jobId}`,
      successMessage: formatProtectedMessage(
        action === "retry" ? ingestionMessages.retryImportJobSuccess : ingestionMessages.cancelImportJobSuccess,
        { jobId }
      ),
      failureMessage: ingestionMessages.importJobActionError,
      request: () => clientFetchJSON(`/api/bff/admin/jobs/${jobId}/${action}`, { method: "POST" })
    });
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
    <AdminIngestionContent
      route={route}
      title={meta.title}
      description={meta.description}
      loading={loading}
      error={error}
      message={message}
      metrics={metrics}
      overlay={overlay}
      onCloseOverlay={closeOverlay}
      onRefresh={() => void loadData()}
      manualView={{
        draft: manualDraft,
        skills,
        selectedSkill,
        busyAction,
        onDraftChange: (patch) => setManualDraft((current) => ({ ...current, ...patch })),
        onSubmit: () => void submitManual(),
        onOpenCreate: () => openOverlay({ kind: "create", entity: "manualForm" }),
        onOpenSkillDetail: (skillId) => openOverlay({ kind: "detail", entity: "skillDetail", entityId: skillId })
      }}
      repositoryView={{
        draft: repositoryDraft,
        skills,
        selectedSkill,
        policy: repositoryPolicy,
        syncRuns,
        selectedSyncRun,
        busyAction,
        onDraftChange: (patch) => setRepositoryDraft((current) => ({ ...current, ...patch })),
        onPolicyChange: (patch) => setRepositoryPolicy((current) => ({ ...current, ...patch })),
        onSubmit: () => void submitRepository(),
        onSavePolicy: () => void saveRepositoryPolicy(),
        onOpenRepositoryIntake: () => openOverlay({ kind: "create", entity: "repositoryForm" }),
        onOpenPolicy: () => openOverlay({ kind: "edit", entity: "repositoryPolicy" }),
        onOpenSkillDetail: (skillId) => openOverlay({ kind: "detail", entity: "skillDetail", entityId: skillId }),
        onOpenSyncRunDetail: (runId) => openOverlay({ kind: "detail", entity: "syncRunDetail", entityId: runId })
      }}
      importsView={{
        draft: importsDraft,
        selectedArchiveName: archiveFile?.name || "",
        skills,
        selectedSkill,
        jobs: importJobs,
        selectedJob,
        busyAction,
        onDraftChange: (patch) => setImportsDraft((current) => ({ ...current, ...patch })),
        onArchiveFileChange: setArchiveFile,
        onSubmitArchive: () => void submitArchive(),
        onSubmitSkillMP: () => void submitSkillMP(),
        onRunJobAction: (jobId, action) => void runJobAction(jobId, action),
        onOpenArchiveImport: () => openOverlay({ kind: "create", entity: "archiveForm" }),
        onOpenSkillMPImport: () => openOverlay({ kind: "create", entity: "skillmpForm" }),
        onOpenSkillDetail: (skillId) => openOverlay({ kind: "detail", entity: "skillDetail", entityId: skillId }),
        onOpenJobDetail: (jobId) => openOverlay({ kind: "detail", entity: "importJobDetail", entityId: jobId })
      }}
    />
  );
}
