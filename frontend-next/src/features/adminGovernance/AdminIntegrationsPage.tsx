"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { buildIntegrationsOverview, normalizeAdminIntegrationsPayload } from "./integrationsModel";
import { formatDateTime } from "./shared";

function renderOutcomeBadge(outcome: string, statusCode: number) {
  const normalizedOutcome = outcome.toLowerCase();
  if (statusCode >= 400 || normalizedOutcome.includes("fail") || normalizedOutcome.includes("error")) {
    return <Badge className="bg-rose-100 text-rose-900 hover:bg-rose-100">{outcome}</Badge>;
  }
  if (normalizedOutcome.includes("ok") || normalizedOutcome.includes("success")) {
    return <Badge variant="soft">{outcome}</Badge>;
  }
  return <Badge variant="outline">{outcome}</Badge>;
}

export function AdminIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedConnectorId, setSelectedConnectorId] = useState<number>(0);
  const [rawPayload, setRawPayload] = useState<unknown>(null);

  const payload = useMemo(() => normalizeAdminIntegrationsPayload(rawPayload), [rawPayload]);
  const overview = useMemo(() => buildIntegrationsOverview(payload), [payload]);

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
      setError(loadError instanceof Error ? loadError.message : "Failed to load integrations.");
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Integrations"
        description="Review connector coverage, webhook delivery health, and provider spread from a dedicated governance surface."
        actions={
          <>
            <Button variant="outline" onClick={() => setSelectedConnectorId(0)}>
              Clear Selection
            </Button>
            <Button onClick={() => void loadData()} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connector Inventory</CardTitle>
              <CardDescription>Filter by provider or connector name, then inspect telemetry for the active connector.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                <Input aria-label="Search connectors" value={search} placeholder="Search connectors" onChange={(event) => setSearch(event.target.value)} />
                <select
                  aria-label="Connector selection"
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                  value={selectedConnectorId || ""}
                  onChange={(event) => setSelectedConnectorId(event.target.value ? Number(event.target.value) : 0)}
                >
                  <option value="">All connectors</option>
                  {payload.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                  Reload
                </Button>
              </div>

              {error ? <ErrorState description={error} /> : null}

              {filteredConnectors.length === 0 && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No connectors match the current filters.</div>
              ) : null}

              <div className="space-y-3">
                {filteredConnectors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`integration-connector-${item.id}`}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedConnectorId === item.id ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedConnectorId((current) => (current === item.id ? 0 : item.id))}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{item.name}</span>
                          <Badge variant={item.enabled ? "soft" : "outline"}>{item.enabled ? "enabled" : "disabled"}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">{item.provider}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">{item.baseUrl}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatDateTime(item.updatedAt)}</span>
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
                  <CardTitle>Webhook Delivery Ledger</CardTitle>
                  <CardDescription>Recent delivery attempts scoped to the active connector selection.</CardDescription>
                </div>
                <Badge variant={overview.failedDeliveryCount > 0 ? "outline" : "soft"}>
                  {overview.failedDeliveryCount > 0 ? "Needs attention" : "Healthy"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3" data-testid="integration-webhook-ledger">
              {filteredLogs.length === 0 && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No webhook deliveries recorded.</div>
              ) : null}

              {filteredLogs.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{item.eventType}</span>
                        {renderOutcomeBadge(item.outcome, item.statusCode)}
                      </div>
                      <p className="text-sm text-slate-600">{item.endpoint}</p>
                    </div>
                    <div className="space-y-1 text-right text-xs text-slate-500">
                      <div>Status {item.statusCode || "n/a"}</div>
                      <div>{formatDateTime(item.deliveredAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Spread</CardTitle>
              <CardDescription>Current provider concentration across connector inventory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.providerSummary.map((item) => (
                <div key={item.provider} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{item.provider}</span>
                  <span className="text-sm font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operations Snapshot</CardTitle>
              <CardDescription>Quick audit indicators for connector governance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Latest delivery
                <div className="mt-1 font-semibold text-slate-950">{overview.latestDeliveryAt}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Connector selection
                <div className="mt-1 font-semibold text-slate-950">
                  {selectedConnectorId ? payload.items.find((item) => item.id === selectedConnectorId)?.name || "Unknown connector" : "All connectors"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
