"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import type { AdminCatalogMessages } from "@/src/lib/i18n/protectedPageMessages.catalog";
import { resolveAdminCatalogPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

import { type AdminCatalogRoute, type RepositorySyncPolicy } from "./model";
import {
  buildAdminCatalogPageViewModel,
  buildAdminCatalogRequestPath,
  createInitialRepositorySyncPolicyDraft,
  patchRepositorySyncPolicyDraft,
  updateAdminCatalogQuery
} from "./pageState";
import { useAdminCatalogActions } from "./useAdminCatalogActions";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

export function useAdminCatalogController({
  route,
  initialQuery,
  locale,
  messages
}: {
  route: AdminCatalogRoute;
  initialQuery?: Record<string, string>;
  locale: PublicLocale;
  messages: AdminCatalogMessages;
}) {
  const meta = useMemo(() => resolveAdminCatalogPageRouteMeta(route, messages), [messages, route]);
  const policyMeta = useMemo(
    () => resolveAdminCatalogPageRouteMeta("/admin/sync-policy/repository", messages),
    [messages]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState<Record<string, string>>(initialQuery || {});
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [policyDraft, setPolicyDraft] = useState<RepositorySyncPolicy>(createInitialRepositorySyncPolicyDraft);
  const policyDraftRef = useRef(policyDraft);

  const commitPolicyDraft = useCallback((nextPolicyDraft: RepositorySyncPolicy) => {
    policyDraftRef.current = nextPolicyDraft;
    setPolicyDraft(nextPolicyDraft);
  }, []);

  const { viewModel, normalizedPolicy } = useMemo(
    () =>
      buildAdminCatalogPageViewModel({
        route,
        rawPayload,
        locale,
        messages
      }),
    [locale, messages, rawPayload, route]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(buildAdminCatalogRequestPath(meta.endpoint, query));
      setRawPayload(payload);
      if (route === "/admin/sync-policy/repository") {
        commitPolicyDraft(buildAdminCatalogPageViewModel({ route, rawPayload: payload, locale, messages }).normalizedPolicy);
      }
    } catch (loadError) {
      setError(resolveRequestErrorDisplayMessage(loadError, messages.loadError));
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [commitPolicyDraft, locale, meta.endpoint, messages, query, route]);

  const actions = useAdminCatalogActions({
    messages,
    policyEndpoint: policyMeta.endpoint,
    policyDraft,
    loadData,
    setError
  });

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setQuery(initialQuery || {});
  }, [initialQuery, route]);

  return {
    meta,
    loading,
    busyAction: actions.busyAction,
    error,
    message: actions.message,
    query,
    viewModel,
    policyDraft,
    hasData: rawPayload !== null,
    refresh: () => void loadData(),
    updateQuery: (key: string, value: string) =>
      setQuery((current) => updateAdminCatalogQuery(current, key, value)),
    resetQuery: () => setQuery({}),
    changePage: (page: number) =>
      setQuery((current) => ({
        ...current,
        page: String(page)
      })),
    syncSkill: actions.syncSkill,
    updateSkillVisibility: actions.updateSkillVisibility,
    deleteSkill: actions.deleteSkill,
    rollbackSkillVersion: actions.rollbackSkillVersion,
    restoreSkillVersion: actions.restoreSkillVersion,
    runJobAction: actions.runJobAction,
    patchPolicyDraft: (patch: Partial<RepositorySyncPolicy>) =>
      commitPolicyDraft(patchRepositorySyncPolicyDraft(policyDraftRef.current, patch)),
    resetPolicyDraft: () => commitPolicyDraft(normalizedPolicy),
    savePolicy: actions.savePolicy
  };
}
