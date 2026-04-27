"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { adminIntegrationsBFFEndpoint } from "@/src/lib/routing/protectedSurfaceEndpoints";
import {
  disableManagedAuthProvider,
  loadManagedAuthProviderConfigs,
  loadManagedAuthProviderDetail,
  saveManagedAuthProvider
} from "@/src/lib/api/adminAuthProviders";

import { AdminIntegrationsContent } from "./AdminIntegrationsContent";
import {
  createManagedAuthProviderDraft,
  normalizeManagedAuthProviderDetailPayload,
  normalizeManagedAuthProvidersPayload,
  resolveManagedAuthProviderDefinition,
  type ManagedAuthProviderDraft
} from "./adminAuthProvidersModel";
import {
  buildIntegrationsOverview,
  normalizeAdminIntegrationsPayload,
  resolveSelectedIntegrationConnector
} from "./integrationsModel";

export function AdminIntegrationsPage() {
  const { locale, messages } = useProtectedI18n();
  const integrationMessages = messages.adminIntegrations;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [connectorFilterId, setConnectorFilterId] = useState<number>(0);
  const [detailConnectorId, setDetailConnectorId] = useState<number | null>(null);
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [rawAuthProvidersPayload, setRawAuthProvidersPayload] = useState<unknown>(null);
  const [authProviderError, setAuthProviderError] = useState("");
  const [authProviderKey, setAuthProviderKey] = useState<string | null>(null);
  const [authProviderPaneOpen, setAuthProviderPaneOpen] = useState(false);
  const [authProviderDraft, setAuthProviderDraft] = useState<ManagedAuthProviderDraft | null>(null);
  const [authProviderBusy, setAuthProviderBusy] = useState(false);
  const [authProviderBusyKey, setAuthProviderBusyKey] = useState<string | null>(null);

  const payload = useMemo(
    () =>
      normalizeAdminIntegrationsPayload(rawPayload, {
        unnamedConnector: integrationMessages.unnamedConnector,
        customProvider: integrationMessages.customProvider,
        noConnectorDescription: integrationMessages.noConnectorDescription,
        unknownEvent: integrationMessages.unknownEvent,
        unknownOutcome: integrationMessages.unknownOutcome,
        notAvailable: integrationMessages.notAvailable
      }),
    [integrationMessages, rawPayload]
  );
  const overview = useMemo(
    () =>
      buildIntegrationsOverview(payload, {
        metricTotalConnectors: integrationMessages.metricTotalConnectors,
        metricEnabledConnectors: integrationMessages.metricEnabledConnectors,
        metricWebhookDeliveries: integrationMessages.metricWebhookDeliveries,
        metricFailedDeliveries: integrationMessages.metricFailedDeliveries,
        customProvider: integrationMessages.customProvider,
        notAvailable: integrationMessages.notAvailable
      }, locale),
    [integrationMessages, locale, payload]
  );
  const authProvidersInventory = useMemo(
    () => normalizeManagedAuthProvidersPayload(rawAuthProvidersPayload),
    [rawAuthProvidersPayload]
  );
  const detailConnector = useMemo(
    () => resolveSelectedIntegrationConnector(payload.items, detailConnectorId),
    [detailConnectorId, payload.items]
  );
  const selectedAuthProvider = useMemo(
    () => authProvidersInventory.items.find((item) => item.key === authProviderKey) || null,
    [authProviderKey, authProvidersInventory.items]
  );
  const selectedFilterConnector = useMemo(
    () => resolveSelectedIntegrationConnector(payload.items, connectorFilterId),
    [connectorFilterId, payload.items]
  );

  const filteredConnectors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return payload.items.filter((item) => {
      if (connectorFilterId && item.id !== connectorFilterId) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return [item.name, item.provider, item.description, item.baseUrl].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [connectorFilterId, payload.items, search]);

  const filteredLogs = useMemo(() => {
    return payload.webhookLogs.filter((item) => {
      if (connectorFilterId && item.connectorId !== connectorFilterId) {
        return false;
      }
      return true;
    });
  }, [connectorFilterId, payload.webhookLogs]);
  const selectedConnectorName = selectedFilterConnector?.name || integrationMessages.connectorSelectionAll;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setAuthProviderError("");
    try {
      const [nextPayload, nextAuthProvidersPayload] = await Promise.all([
        clientFetchJSON(adminIntegrationsBFFEndpoint),
        loadManagedAuthProviderConfigs()
      ]);
      setRawPayload(nextPayload);
      setRawAuthProvidersPayload(nextAuthProvidersPayload);
    } catch (loadError) {
      setError(resolveRequestErrorDisplayMessage(loadError, integrationMessages.loadError));
      setRawPayload(null);
      setRawAuthProvidersPayload(null);
    } finally {
      setLoading(false);
    }
  }, [integrationMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  useEffect(() => {
    if (!detailConnector && detailPaneOpen) {
      setDetailPaneOpen(false);
      setDetailConnectorId(null);
    }
  }, [detailConnector, detailPaneOpen]);

  const authProviderDisplayName = selectedAuthProvider?.displayName || authProviderKey || integrationMessages.authProviderInventoryTitle;

  const handleOpenAuthProvider = useCallback(
    async (provider: string) => {
      const definition = resolveManagedAuthProviderDefinition(provider);
      if (!definition) {
        return;
      }

      setAuthProviderBusyKey(provider);
      setAuthProviderError("");
      try {
        const detailPayload = await loadManagedAuthProviderDetail(provider);
        const detail = normalizeManagedAuthProviderDetailPayload(detailPayload);
        setAuthProviderDraft(createManagedAuthProviderDraft(definition, detail));
        setAuthProviderKey(provider);
        setAuthProviderPaneOpen(true);
      } catch (loadError) {
        setAuthProviderError(resolveRequestErrorDisplayMessage(loadError, integrationMessages.loadError));
      } finally {
        setAuthProviderBusyKey(null);
      }
    },
    [integrationMessages.loadError]
  );

  const handleAuthProviderSubmit = useCallback(async () => {
    if (!authProviderDraft) {
      return;
    }

    setAuthProviderBusy(true);
    setAuthProviderError("");
    try {
      await saveManagedAuthProvider({
        provider: authProviderDraft.provider,
        name: authProviderDraft.name,
        description: authProviderDraft.description,
        issuer: authProviderDraft.issuer,
        authorization_url: authProviderDraft.authorizationUrl,
        token_url: authProviderDraft.tokenUrl,
        userinfo_url: authProviderDraft.userInfoUrl,
        client_id: authProviderDraft.clientId,
        client_secret: authProviderDraft.clientSecret,
        scope: authProviderDraft.scope,
        claim_external_id: authProviderDraft.claimExternalId,
        claim_username: authProviderDraft.claimUsername,
        claim_email: authProviderDraft.claimEmail,
        claim_email_verified: authProviderDraft.claimEmailVerified,
        claim_groups: authProviderDraft.claimGroups,
        offboarding_mode: authProviderDraft.offboardingMode,
        mapping_mode: authProviderDraft.mappingMode,
        default_org_id: Number(authProviderDraft.defaultOrgId) || 0,
        default_org_role: authProviderDraft.defaultOrgRole,
        default_org_group_rules: authProviderDraft.defaultOrgGroupRules,
        default_org_email_domains: authProviderDraft.defaultOrgEmailDomains,
        default_user_role: authProviderDraft.defaultUserRole
      });
      await loadData();
      setAuthProviderPaneOpen(false);
    } catch (saveError) {
      setAuthProviderError(resolveRequestErrorDisplayMessage(saveError, integrationMessages.loadError));
    } finally {
      setAuthProviderBusy(false);
    }
  }, [authProviderDraft, integrationMessages.loadError, loadData]);

  const handleAuthProviderDisable = useCallback(
    async (provider: string) => {
      setAuthProviderBusyKey(provider);
      setAuthProviderError("");
      try {
        await disableManagedAuthProvider(provider);
        await loadData();
        if (authProviderKey === provider) {
          setAuthProviderPaneOpen(false);
          setAuthProviderDraft(null);
        }
      } catch (disableError) {
        setAuthProviderError(resolveRequestErrorDisplayMessage(disableError, integrationMessages.loadError));
      } finally {
        setAuthProviderBusyKey(null);
      }
    },
    [authProviderKey, integrationMessages.loadError, loadData]
  );

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={integrationMessages.pageTitle}
        description={integrationMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminIntegrationsContent
      loading={loading}
      error={error}
      search={search}
      connectorFilterId={connectorFilterId}
      allConnectors={payload.items}
      filteredConnectors={filteredConnectors}
      filteredLogs={filteredLogs}
      detailConnector={detailConnector}
      detailPaneOpen={detailPaneOpen}
      authProviderItems={authProvidersInventory.items}
      authProviderLoading={loading}
      authProviderError={authProviderError}
      authProviderDraft={authProviderDraft}
      authProviderPaneOpen={authProviderPaneOpen}
      authProviderDisplayName={authProviderDisplayName}
      authProviderBusy={authProviderBusy}
      authProviderBusyKey={authProviderBusyKey}
      overview={overview}
      selectedConnectorName={selectedConnectorName}
      onRefresh={() => void loadData()}
      onAuthProviderReload={() => void loadData()}
      onClearSelection={() => setConnectorFilterId(0)}
      onSearchChange={setSearch}
      onConnectorFilterChange={setConnectorFilterId}
      onToggleConnectorFilter={(connectorId) => setConnectorFilterId((current) => (current === connectorId ? 0 : connectorId))}
      onOpenConnectorDetail={(connectorId) => {
        setDetailConnectorId(connectorId);
        setDetailPaneOpen(true);
      }}
      onCloseDetailPane={() => setDetailPaneOpen(false)}
      onOpenAuthProvider={(provider) => void handleOpenAuthProvider(provider)}
      onCloseAuthProviderPane={() => setAuthProviderPaneOpen(false)}
      onAuthProviderDraftChange={(name, value) =>
        setAuthProviderDraft((current) => (current ? { ...current, [name]: value } : current))
      }
      onAuthProviderSubmit={() => void handleAuthProviderSubmit()}
      onAuthProviderDisable={(provider) => void handleAuthProviderDisable(provider)}
    />
  );
}
