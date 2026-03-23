"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { AdminIntegrationsContent } from "./AdminIntegrationsContent";
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
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [rawPayload, setRawPayload] = useState<unknown>(null);

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
  const detailConnector = useMemo(
    () => resolveSelectedIntegrationConnector(payload.items, detailConnectorId),
    [detailConnectorId, payload.items]
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
    try {
      const nextPayload = await clientFetchJSON("/api/bff/admin/integrations");
      setRawPayload(nextPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : integrationMessages.loadError);
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [integrationMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  useEffect(() => {
    if (!detailConnector && detailDrawerOpen) {
      setDetailDrawerOpen(false);
      setDetailConnectorId(null);
    }
  }, [detailConnector, detailDrawerOpen]);

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
      detailDrawerOpen={detailDrawerOpen}
      overview={overview}
      selectedConnectorName={selectedConnectorName}
      onRefresh={() => void loadData()}
      onClearSelection={() => setConnectorFilterId(0)}
      onSearchChange={setSearch}
      onConnectorFilterChange={setConnectorFilterId}
      onToggleConnectorFilter={(connectorId) => setConnectorFilterId((current) => (current === connectorId ? 0 : connectorId))}
      onOpenConnectorDetail={(connectorId) => {
        setDetailConnectorId(connectorId);
        setDetailDrawerOpen(true);
      }}
      onCloseDetailDrawer={() => setDetailDrawerOpen(false)}
    />
  );
}
