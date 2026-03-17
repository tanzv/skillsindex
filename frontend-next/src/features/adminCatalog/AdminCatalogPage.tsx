"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import {
  buildAdminCatalogViewModel,
  normalizeJobsPayload,
  normalizeSkillsPayload,
  normalizeSyncJobsPayload,
  normalizeSyncPolicyPayload,
  type AdminCatalogRoute,
  type RepositorySyncPolicy
} from "./model";
import { AdminCatalogContent } from "./AdminCatalogContent";

const routeMeta: Record<AdminCatalogRoute, { title: string; description: string; endpoint: string }> = {
  "/admin/skills": {
    title: "Skill Governance",
    description: "Inspect governed skill inventory with stronger structure than the generic JSON workbench.",
    endpoint: "/api/bff/admin/skills"
  },
  "/admin/jobs": {
    title: "Asynchronous Jobs",
    description: "Track active queue pressure, failed runs, and targeted retry or cancel actions.",
    endpoint: "/api/bff/admin/jobs"
  },
  "/admin/sync-jobs": {
    title: "Repository Sync Jobs",
    description: "Review sync run throughput, failures, and latest execution timing.",
    endpoint: "/api/bff/admin/sync-jobs"
  },
  "/admin/sync-policy/repository": {
    title: "Repository Sync Policy",
    description: "Manage scheduler policy for repository synchronization from a dedicated control surface.",
    endpoint: "/api/bff/admin/sync-policy/repository"
  }
};

function buildPath(route: AdminCatalogRoute, query: Record<string, string>) {
  const meta = routeMeta[route];
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });
  const suffix = params.toString();
  return suffix ? `${meta.endpoint}?${suffix}` : meta.endpoint;
}

export function AdminCatalogPage({ route }: { route: AdminCatalogRoute }) {
  const meta = routeMeta[route];
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState<Record<string, string>>({});
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [policyDraft, setPolicyDraft] = useState<RepositorySyncPolicy>({
    enabled: false,
    interval: "30m",
    timeout: "10m",
    batchSize: 20
  });

  const normalizedPolicy = useMemo(() => normalizeSyncPolicyPayload(rawPayload), [rawPayload]);
  const viewModel = useMemo(() => {
    if (route === "/admin/skills") {
      return buildAdminCatalogViewModel(route, normalizeSkillsPayload(rawPayload));
    }
    if (route === "/admin/jobs") {
      return buildAdminCatalogViewModel(route, normalizeJobsPayload(rawPayload));
    }
    if (route === "/admin/sync-jobs") {
      return buildAdminCatalogViewModel(route, normalizeSyncJobsPayload(rawPayload));
    }
    return buildAdminCatalogViewModel(route, normalizedPolicy);
  }, [normalizedPolicy, rawPayload, route]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(buildPath(route, query));
      setRawPayload(payload);
      if (route === "/admin/sync-policy/repository") {
        setPolicyDraft(normalizeSyncPolicyPayload(payload));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Request failed");
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [query, route]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function runJobAction(jobId: number, action: "retry" | "cancel") {
    setBusyAction(`${action}-${jobId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(`/api/bff/admin/jobs/${jobId}/${action}`, { method: "POST" });
      setMessage(`Job ${jobId} ${action} requested.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
    } finally {
      setBusyAction("");
    }
  }

  async function syncSkill(skillId: number) {
    setBusyAction(`sync-skill-${skillId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(`/api/bff/admin/skills/${skillId}/sync`, { method: "POST" });
      setMessage("Repository skill updated.");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
    } finally {
      setBusyAction("");
    }
  }

  async function savePolicy() {
    setBusyAction("save-policy");
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(routeMeta["/admin/sync-policy/repository"].endpoint, {
        method: "POST",
        body: {
          enabled: policyDraft.enabled,
          interval: policyDraft.interval,
          timeout: policyDraft.timeout,
          batch_size: policyDraft.batchSize
        }
      });
      setMessage("Policy saved.");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <AdminCatalogContent
      route={route}
      title={meta.title}
      description={meta.description}
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      query={query}
      viewModel={viewModel}
      policyDraft={policyDraft}
      onQueryChange={(key, value) => setQuery((current) => ({ ...current, [key]: value }))}
      onResetQuery={() => setQuery({})}
      onRefresh={() => void loadData()}
      onSyncSkill={(skillId) => void syncSkill(skillId)}
      onRunJobAction={(jobId, action) => void runJobAction(jobId, action)}
      onPolicyDraftChange={(patch) => setPolicyDraft((current) => ({ ...current, ...patch }))}
      onResetPolicyDraft={() => setPolicyDraft(normalizedPolicy)}
      onSavePolicy={() => void savePolicy()}
    />
  );
}
