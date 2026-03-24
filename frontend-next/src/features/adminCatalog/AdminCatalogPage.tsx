"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { resolveAdminCatalogPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";
import { Button } from "@/src/components/ui/button";

import { AdminCatalogContent } from "./AdminCatalogContent";
import {
  buildAdminCatalogViewModel,
  normalizeJobsPayload,
  normalizeSkillsPayload,
  normalizeSyncJobsPayload,
  normalizeSyncPolicyPayload,
  type AdminCatalogRoute,
  type RepositorySyncPolicy
} from "./model";

function buildPath(endpoint: string, query: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });
  const suffix = params.toString();
  return suffix ? `${endpoint}?${suffix}` : endpoint;
}

export function AdminCatalogPage({ route }: { route: AdminCatalogRoute }) {
  const { locale, messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const meta = useMemo(() => resolveAdminCatalogPageRouteMeta(route, adminCatalogMessages), [adminCatalogMessages, route]);
  const policyMeta = useMemo(
    () => resolveAdminCatalogPageRouteMeta("/admin/sync-policy/repository", adminCatalogMessages),
    [adminCatalogMessages]
  );

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
      return buildAdminCatalogViewModel(route, normalizeSkillsPayload(rawPayload), {
        locale,
        messages: adminCatalogMessages
      });
    }
    if (route === "/admin/jobs") {
      return buildAdminCatalogViewModel(route, normalizeJobsPayload(rawPayload), {
        locale,
        messages: adminCatalogMessages
      });
    }
    if (route === "/admin/sync-jobs") {
      return buildAdminCatalogViewModel(route, normalizeSyncJobsPayload(rawPayload), {
        locale,
        messages: adminCatalogMessages
      });
    }
    return buildAdminCatalogViewModel(route, normalizedPolicy, {
      locale,
      messages: adminCatalogMessages
    });
  }, [adminCatalogMessages, locale, normalizedPolicy, rawPayload, route]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(buildPath(meta.endpoint, query));
      setRawPayload(payload);
      if (route === "/admin/sync-policy/repository") {
        setPolicyDraft(normalizeSyncPolicyPayload(payload));
      }
    } catch (loadError) {
      setError(resolveRequestErrorDisplayMessage(loadError, adminCatalogMessages.loadError));
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [adminCatalogMessages.loadError, meta.endpoint, query, route]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  async function runJobAction(jobId: number, action: "retry" | "cancel") {
    setBusyAction(`${action}-${jobId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(`/api/bff/admin/jobs/${jobId}/${action}`, { method: "POST" });
      setMessage(
        formatProtectedMessage(
          action === "retry" ? adminCatalogMessages.retryJobSuccess : adminCatalogMessages.cancelJobSuccess,
          { jobId }
        )
      );
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, adminCatalogMessages.actionError));
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
      setMessage(adminCatalogMessages.skillSyncSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, adminCatalogMessages.actionError));
    } finally {
      setBusyAction("");
    }
  }

  async function savePolicy() {
    setBusyAction("save-policy");
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(policyMeta.endpoint, {
        method: "POST",
        body: {
          enabled: policyDraft.enabled,
          interval: policyDraft.interval,
          timeout: policyDraft.timeout,
          batch_size: policyDraft.batchSize
        }
      });
      setMessage(adminCatalogMessages.policySaveSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, adminCatalogMessages.actionError));
    } finally {
      setBusyAction("");
    }
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
