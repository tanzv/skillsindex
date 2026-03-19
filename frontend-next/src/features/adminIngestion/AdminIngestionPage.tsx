"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { AdminIngestionContent } from "./AdminIngestionContent";
import {
  type AdminIngestionRoute,
  buildAdminIngestionMetrics,
  createImportsDraft,
  createManualDraft,
  createRepositoryDraft,
  createRepositorySyncPolicy,
  normalizeImportJobsPayload,
  normalizeRepositorySyncPolicyPayload,
  normalizeSkillInventoryPayload,
  resolveAdminIngestionRouteMeta,
  normalizeSyncRunsPayload,
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

export function AdminIngestionPage({ route }: { route: AdminIngestionRoute }) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;
  const meta = useMemo(() => resolveAdminIngestionRouteMeta(route, ingestionMessages), [ingestionMessages, route]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState<SkillInventoryItem[]>([]);
  const [repositoryPolicy, setRepositoryPolicy] = useState<RepositorySyncPolicy>(createRepositorySyncPolicy);
  const [syncRuns, setSyncRuns] = useState<ReturnType<typeof normalizeSyncRunsPayload>["items"]>([]);
  const [importJobs, setImportJobs] = useState<ReturnType<typeof normalizeImportJobsPayload>["items"]>([]);
  const [manualDraft, setManualDraft] = useState(createManualDraft);
  const [repositoryDraft, setRepositoryDraft] = useState(createRepositoryDraft);
  const [importsDraft, setImportsDraft] = useState(createImportsDraft);
  const [archiveFile, setArchiveFile] = useState<File | null>(null);

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
        return;
      }

      if (route === "/admin/ingestion/repository") {
        const [skillsPayload, policyPayload, syncRunsPayload] = await Promise.all([
          clientFetchJSON("/api/bff/admin/skills?source=repository"),
          clientFetchJSON("/api/bff/admin/sync-policy/repository"),
          clientFetchJSON("/api/bff/admin/sync-jobs?limit=6")
        ]);
        setSkills(normalizeSkillInventoryPayload(skillsPayload).items);
        setRepositoryPolicy(normalizeRepositorySyncPolicyPayload(policyPayload));
        setSyncRuns(normalizeSyncRunsPayload(syncRunsPayload).items);
        setImportJobs([]);
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
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : ingestionMessages.loadError);
    } finally {
      setLoading(false);
    }
  }, [ingestionMessages.loadError, route]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      afterSuccess: () => setManualDraft(createManualDraft())
    });
  }

  async function submitRepository() {
    await executeAction({
      actionKey: "repository",
      successMessage: ingestionMessages.repositorySubmitSuccess,
      failureMessage: ingestionMessages.repositorySubmitError,
      request: () => clientFetchJSON("/api/bff/admin/ingestion/repository", { method: "POST", body: buildRepositoryPayload(repositoryDraft) }),
      afterSuccess: () => setRepositoryDraft(createRepositoryDraft())
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
        })
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
      }
    });
  }

  async function submitSkillMP() {
    await executeAction({
      actionKey: "skillmp",
      successMessage: ingestionMessages.skillmpSubmitSuccess,
      failureMessage: ingestionMessages.skillmpSubmitError,
      request: () => clientFetchJSON("/api/bff/admin/ingestion/skillmp", { method: "POST", body: buildSkillMPPayload(importsDraft) }),
      afterSuccess: () =>
        setImportsDraft((current) => ({
          ...current,
          skillmp_url: "",
          skillmp_id: "",
          skillmp_token: "",
          skillmp_tags: "",
          skillmp_visibility: "private",
          skillmp_install_command: ""
        }))
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

  return (
    <AdminIngestionContent
      route={route}
      title={meta.title}
      description={meta.description}
      loading={loading}
      error={error}
      message={message}
      metrics={metrics}
      onRefresh={() => void loadData()}
      manualView={{
        draft: manualDraft,
        skills,
        busyAction,
        onDraftChange: (patch) => setManualDraft((current) => ({ ...current, ...patch })),
        onSubmit: () => void submitManual()
      }}
      repositoryView={{
        draft: repositoryDraft,
        skills,
        policy: repositoryPolicy,
        syncRuns,
        busyAction,
        onDraftChange: (patch) => setRepositoryDraft((current) => ({ ...current, ...patch })),
        onPolicyChange: (patch) => setRepositoryPolicy((current) => ({ ...current, ...patch })),
        onSubmit: () => void submitRepository(),
        onSavePolicy: () => void saveRepositoryPolicy()
      }}
      importsView={{
        draft: importsDraft,
        selectedArchiveName: archiveFile?.name || "",
        skills,
        jobs: importJobs,
        busyAction,
        onDraftChange: (patch) => setImportsDraft((current) => ({ ...current, ...patch })),
        onArchiveFileChange: setArchiveFile,
        onSubmitArchive: () => void submitArchive(),
        onSubmitSkillMP: () => void submitSkillMP(),
        onRunJobAction: (jobId, action) => void runJobAction(jobId, action)
      }}
    />
  );
}
