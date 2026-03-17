"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import {
  type AdminOperationsRoute,
  buildOpsAlertsOverview,
  buildOpsMetricCards,
  buildOpsReleaseGatesOverview,
  normalizeOpsAlertsPayload,
  normalizeOpsMetricsPayload,
  normalizeOpsReleaseGatesPayload
} from "./model";

type OperationsDashboardRoute = Extract<
  AdminOperationsRoute,
  "/admin/ops/metrics" | "/admin/ops/alerts" | "/admin/ops/release-gates"
>;

const routeMeta: Record<OperationsDashboardRoute, { title: string; description: string; endpoint: string; runEndpoint?: string }> = {
  "/admin/ops/metrics": {
    title: "Operations Metrics",
    description: "Track reliability, queue, moderation, and integration pressure from a structured operating baseline.",
    endpoint: "/api/bff/admin/ops/metrics"
  },
  "/admin/ops/alerts": {
    title: "Operations Alerts",
    description: "Review derived operational alerts and concentrate on currently triggered or critical signals.",
    endpoint: "/api/bff/admin/ops/alerts"
  },
  "/admin/ops/release-gates": {
    title: "Release Gates",
    description: "Inspect current release readiness checks and run a fresh evaluation on demand.",
    endpoint: "/api/bff/admin/ops/release-gates",
    runEndpoint: "/api/bff/admin/ops/release-gates/run"
  }
};

function severityClasses(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized === "critical" || normalized === "high" || normalized === "blocked") {
    return "bg-rose-100 text-rose-900";
  }
  if (normalized === "warning") {
    return "bg-amber-100 text-amber-900";
  }
  if (normalized === "passed" || normalized === "active" || normalized === "normal") {
    return "bg-sky-100 text-sky-900";
  }
  return "bg-slate-100 text-slate-700";
}

export function AdminOperationsPage({ route }: { route: OperationsDashboardRoute }) {
  const meta = routeMeta[route];
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);

  const metricsPayload = useMemo(() => (route === "/admin/ops/metrics" ? normalizeOpsMetricsPayload(rawPayload) : null), [rawPayload, route]);
  const alertPayload = useMemo(() => (route === "/admin/ops/alerts" ? normalizeOpsAlertsPayload(rawPayload) : null), [rawPayload, route]);
  const releaseGatePayload = useMemo(() => (route === "/admin/ops/release-gates" ? normalizeOpsReleaseGatesPayload(rawPayload) : null), [rawPayload, route]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(meta.endpoint);
      setRawPayload(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load operations data.");
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [meta.endpoint]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function runReleaseGates() {
    if (!meta.runEndpoint) {
      return;
    }
    setBusyAction("run-release-gates");
    setError("");
    setMessage("");
    try {
      const payload = await clientFetchJSON(meta.runEndpoint, { method: "POST" });
      setRawPayload(payload);
      setMessage("Release gates executed.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to execute release gates.");
    } finally {
      setBusyAction("");
    }
  }

  const metricCards = metricsPayload ? buildOpsMetricCards(metricsPayload) : [];
  const alertOverview = alertPayload ? buildOpsAlertsOverview(alertPayload) : null;
  const releaseOverview = releaseGatePayload ? buildOpsReleaseGatesOverview(releaseGatePayload) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title={meta.title}
        description={meta.description}
        actions={
          <>
            {meta.runEndpoint ? (
              <Button variant="outline" onClick={() => void runReleaseGates()} disabled={Boolean(busyAction)}>
                {busyAction === "run-release-gates" ? "Running..." : "Run Gates"}
              </Button>
            ) : null}
            <Button onClick={() => void loadData()}>{loading ? "Refreshing..." : "Refresh"}</Button>
          </>
        }
      />

      {error ? <ErrorState description={error} /> : null}
      {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}

      {route === "/admin/ops/metrics" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="gap-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
                    <Badge className={severityClasses(metric.severity)}>{metric.severity}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Telemetry Context</CardTitle>
                <CardDescription>Secondary baseline data that explains current operating pressure.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Audit Logs 24h</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{metricsPayload?.totalAuditLogs24h || 0}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Sync Runs 24h</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{metricsPayload?.totalSyncRuns24h || 0}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Retention Days</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{metricsPayload?.retentionDays || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {route === "/admin/ops/alerts" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {alertOverview?.metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="gap-2 p-5">
                  <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
                  <CardTitle className="text-base">{metric.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alert Queue</CardTitle>
              <CardDescription>Derived alerts from reliability, moderation, and platform trust thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertPayload?.items.map((alert) => (
                <div key={alert.code} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">{alert.code}</span>
                        <Badge className={severityClasses(alert.severity)}>{alert.severity}</Badge>
                        {alert.triggered ? <Badge variant="outline">triggered</Badge> : <Badge variant="outline">standby</Badge>}
                      </div>
                      <div className="text-sm text-slate-600">{alert.message}</div>
                    </div>
                  </div>
                </div>
              ))}
              {!alertPayload?.items.length && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No operations alerts are currently active.</div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : null}

      {route === "/admin/ops/release-gates" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {releaseOverview?.metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="gap-2 p-5">
                  <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
                  <CardTitle className="text-base">{metric.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Gate Checks</CardTitle>
                <CardDescription>Current release readiness checks and their latest evaluation results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {releaseGatePayload?.checks.map((check) => (
                  <div key={check.code} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">{check.code}</span>
                          <Badge className={severityClasses(check.passed ? "passed" : check.severity)}>{check.passed ? "passed" : check.severity}</Badge>
                        </div>
                        <div className="text-sm text-slate-600">{check.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {!releaseGatePayload?.checks.length && !loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No release gate checks were returned by the backend.</div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Snapshot Summary</CardTitle>
                <CardDescription>Overall release posture and latest evaluation timestamp.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-950">Overall state</div>
                  <div className="mt-1">
                    <Badge className={severityClasses(releaseOverview?.overallState || "blocked")}>{releaseOverview?.overallState || "blocked"}</Badge>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-950">Generated at</div>
                  <div className="mt-1">{releaseOverview?.generatedAt || "n/a"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
