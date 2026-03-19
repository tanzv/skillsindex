"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminInsetBlock, AdminMetricGrid, AdminRecordCard } from "@/src/components/admin/AdminPrimitives";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { buildIntegrationsOverview, normalizeAdminIntegrationsPayload, resolveIntegrationOutcomeLabel } from "./integrationsModel";
import { formatDateTime } from "./shared";

function renderOutcomeBadge(outcome: string, label: string, statusCode: number) {
  const normalizedOutcome = outcome.toLowerCase();
  if (statusCode >= 400 || normalizedOutcome.includes("fail") || normalizedOutcome.includes("error")) {
    return (
      <Badge
        variant="outline"
        className="border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] text-[color:var(--ui-danger-text)]"
      >
        {label}
      </Badge>
    );
  }
  if (normalizedOutcome.includes("ok") || normalizedOutcome.includes("success")) {
    return <Badge variant="soft">{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}

export function AdminIntegrationsPage() {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const integrationMessages = messages.adminIntegrations;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedConnectorId, setSelectedConnectorId] = useState<number>(0);
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

  const filteredConnectors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return payload.items.filter((item) => {
      if (selectedConnectorId && item.id !== selectedConnectorId) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return [item.name, item.provider, item.description, item.baseUrl].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [payload.items, search, selectedConnectorId]);

  const filteredLogs = useMemo(() => {
    return payload.webhookLogs.filter((item) => {
      if (selectedConnectorId && item.connectorId !== selectedConnectorId) {
        return false;
      }
      return true;
    });
  }, [payload.webhookLogs, selectedConnectorId]);

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={commonMessages.adminEyebrow}
        title={integrationMessages.pageTitle}
        description={integrationMessages.pageDescription}
        actions={
          <>
            <Button variant="outline" onClick={() => setSelectedConnectorId(0)}>
              {integrationMessages.clearSelection}
            </Button>
            <Button onClick={() => void loadData()} disabled={loading}>
              {loading ? commonMessages.refreshing : commonMessages.refresh}
            </Button>
          </>
        }
      />

      <AdminMetricGrid metrics={overview.metrics} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{integrationMessages.connectorInventoryTitle}</CardTitle>
              <CardDescription>{integrationMessages.connectorInventoryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                <Input
                  aria-label={integrationMessages.searchLabel}
                  value={search}
                  placeholder={integrationMessages.searchPlaceholder}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Select
                  aria-label={integrationMessages.connectorSelectionLabel}
                  value={selectedConnectorId || ""}
                  onChange={(event) => setSelectedConnectorId(event.target.value ? Number(event.target.value) : 0)}
                >
                  <option value="">{integrationMessages.connectorSelectionAll}</option>
                  {payload.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                  {integrationMessages.reloadAction}
                </Button>
              </div>

              {error ? <ErrorState description={error} /> : null}

              {filteredConnectors.length === 0 && !loading ? (
                <AdminEmptyBlock>{integrationMessages.emptyFilteredConnectors}</AdminEmptyBlock>
              ) : null}

              <div className="space-y-3">
                {filteredConnectors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`integration-connector-${item.id}`}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedConnectorId === item.id
                        ? "border-[color:var(--ui-info-border)] bg-[color:var(--ui-info-bg)]"
                        : "border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] hover:border-[color:var(--ui-border-strong)] hover:bg-[color:var(--ui-card-muted-bg)]"
                    }`}
                    onClick={() => setSelectedConnectorId((current) => (current === item.id ? 0 : item.id))}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.name}</span>
                          <Badge variant={item.enabled ? "soft" : "outline"}>
                            {item.enabled ? integrationMessages.enabledLabel : integrationMessages.disabledLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-[color:var(--ui-text-secondary)]">{item.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ui-text-muted)]">
                          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">{item.provider}</span>
                          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">{item.baseUrl}</span>
                          <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1">
                            {formatDateTime(item.updatedAt, locale, integrationMessages.notAvailable)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{integrationMessages.webhookLedgerTitle}</CardTitle>
                  <CardDescription>{integrationMessages.webhookLedgerDescription}</CardDescription>
                </div>
                <Badge variant={overview.failedDeliveryCount > 0 ? "outline" : "soft"}>
                  {overview.failedDeliveryCount > 0 ? integrationMessages.ledgerNeedsAttention : integrationMessages.ledgerHealthy}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3" data-testid="integration-webhook-ledger">
              {filteredLogs.length === 0 && !loading ? (
                <AdminEmptyBlock>{integrationMessages.emptyWebhookLedger}</AdminEmptyBlock>
              ) : null}

              {filteredLogs.map((item) => (
                <AdminRecordCard key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.eventType}</span>
                        {renderOutcomeBadge(
                          item.outcome,
                          resolveIntegrationOutcomeLabel(item.outcome, integrationMessages),
                          item.statusCode
                        )}
                      </div>
                      <p className="text-sm text-[color:var(--ui-text-secondary)]">{item.endpoint}</p>
                    </div>
                    <div className="space-y-1 text-right text-xs text-[color:var(--ui-text-muted)]">
                      <div>
                        {formatProtectedMessage(integrationMessages.deliveryStatusTemplate, {
                          value: item.statusCode || integrationMessages.notAvailable
                        })}
                      </div>
                      <div>{formatDateTime(item.deliveredAt, locale, integrationMessages.notAvailable)}</div>
                    </div>
                  </div>
                </AdminRecordCard>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{integrationMessages.providerSpreadTitle}</CardTitle>
              <CardDescription>{integrationMessages.providerSpreadDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.providerSummary.map((item) => (
                <AdminInsetBlock key={item.provider} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[color:var(--ui-text-secondary)]">{item.provider}</span>
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
                </AdminInsetBlock>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{integrationMessages.operationsSnapshotTitle}</CardTitle>
              <CardDescription>{integrationMessages.operationsSnapshotDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
              <AdminInsetBlock>
                {integrationMessages.latestDeliveryLabel}
                <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{overview.latestDeliveryAt}</div>
              </AdminInsetBlock>
              <AdminInsetBlock>
                {integrationMessages.connectorSelectionSummaryLabel}
                <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
                  {selectedConnectorId
                    ? payload.items.find((item) => item.id === selectedConnectorId)?.name || integrationMessages.unknownConnector
                    : integrationMessages.connectorSelectionAll}
                </div>
              </AdminInsetBlock>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
