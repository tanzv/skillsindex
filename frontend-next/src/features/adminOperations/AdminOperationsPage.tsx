"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminInsetBlock, AdminMessageBanner, AdminMetricGrid, AdminRecordCard } from "@/src/components/admin/AdminPrimitives";
import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveAdminOperationsDashboardRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";

import {
  type AdminOperationsDashboardRoute,
  buildOpsAlertsOverview,
  buildOpsMetricCards,
  buildOpsReleaseGatesOverview,
  type OpsAlertItem,
  type OpsReleaseGateSnapshot,
  type OpsMetricItem,
  normalizeOpsAlertsPayload,
  normalizeOpsMetricsPayload,
  normalizeOpsReleaseGatesPayload
} from "./model";
import {
  resolveAlertCodeLabel,
  resolveOpsAlertMessage,
  resolveOpsReleaseGateMessage,
  resolveOpsSeverityLabel,
  resolveReleaseGateBadgeLabel,
  resolveReleaseGateCodeLabel
} from "./display";

function severityClasses(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized === "critical" || normalized === "high" || normalized === "blocked") {
    return "border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] text-[color:var(--ui-danger-text)]";
  }
  if (normalized === "warning") {
    return "border-[color:var(--ui-warning-border)] bg-[color:var(--ui-warning-bg)] text-[color:var(--ui-warning-text)]";
  }
  if (normalized === "passed" || normalized === "active" || normalized === "normal") {
    return "border-[color:var(--ui-success-border)] bg-[color:var(--ui-success-bg)] text-[color:var(--ui-success-text)]";
  }
  return "border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] text-[color:var(--ui-text-secondary)]";
}

function formatMetricSeverity(
  severity: OpsMetricItem["openIncidents"] extends never ? never : "normal" | "warning" | "critical",
  messages: ReturnType<typeof useProtectedI18n>["messages"]["adminOperations"]
) {
  switch (severity) {
    case "critical":
      return messages.severityCritical;
    case "warning":
      return messages.severityWarning;
    case "normal":
    default:
      return messages.severityNormal;
  }
}

export function AdminOperationsPage({ route }: { route: AdminOperationsDashboardRoute }) {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const operationsMessages = messages.adminOperations;
  const meta = useMemo(() => resolveAdminOperationsDashboardRouteMeta(route, operationsMessages), [operationsMessages, route]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);

  const metricsPayload = useMemo<OpsMetricItem | null>(
    () => (route === "/admin/ops/metrics" ? normalizeOpsMetricsPayload(rawPayload) : null),
    [rawPayload, route]
  );
  const alertPayload = useMemo<{ total: number; items: OpsAlertItem[] } | null>(
    () => (route === "/admin/ops/alerts" ? normalizeOpsAlertsPayload(rawPayload) : null),
    [rawPayload, route]
  );
  const releaseGatePayload = useMemo<OpsReleaseGateSnapshot | null>(
    () => (route === "/admin/ops/release-gates" ? normalizeOpsReleaseGatesPayload(rawPayload) : null),
    [rawPayload, route]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(meta.endpoint);
      setRawPayload(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : operationsMessages.dashboardLoadError);
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [meta.endpoint, operationsMessages.dashboardLoadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

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
      setMessage(operationsMessages.releaseGatesRunSuccess);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : operationsMessages.releaseGatesRunError);
    } finally {
      setBusyAction("");
    }
  }

  const metricCards = metricsPayload
    ? buildOpsMetricCards(metricsPayload, {
        metricOpenIncidentsLabel: operationsMessages.metricOpenIncidentsLabel,
        metricOpenIncidentsDescription: operationsMessages.metricOpenIncidentsDescription,
        metricPendingModerationLabel: operationsMessages.metricPendingModerationLabel,
        metricPendingModerationDescription: operationsMessages.metricPendingModerationDescription,
        metricUnresolvedJobsLabel: operationsMessages.metricUnresolvedJobsLabel,
        metricUnresolvedJobsDescription: operationsMessages.metricUnresolvedJobsDescription,
        metricFailedSyncRunsLabel: operationsMessages.metricFailedSyncRunsLabel,
        metricFailedSyncRunsDescription: operationsMessages.metricFailedSyncRunsDescription,
        metricDisabledAccountsLabel: operationsMessages.metricDisabledAccountsLabel,
        metricDisabledAccountsDescription: operationsMessages.metricDisabledAccountsDescription,
        metricStaleIntegrationsLabel: operationsMessages.metricStaleIntegrationsLabel,
        metricStaleIntegrationsDescription: operationsMessages.metricStaleIntegrationsDescription
      })
    : [];
  const alertOverview = alertPayload
    ? buildOpsAlertsOverview(alertPayload, {
        alertsMetricTotalLabel: operationsMessages.alertsMetricTotalLabel,
        alertsMetricTriggeredLabel: operationsMessages.alertsMetricTriggeredLabel,
        alertsMetricCriticalLabel: operationsMessages.alertsMetricCriticalLabel
      })
    : null;
  const releaseOverview = releaseGatePayload
    ? buildOpsReleaseGatesOverview(releaseGatePayload, locale, {
        releaseGatesMetricChecksLabel: operationsMessages.releaseGatesMetricChecksLabel,
        releaseGatesMetricPassedLabel: operationsMessages.releaseGatesMetricPassedLabel,
        releaseGatesMetricBlockedLabel: operationsMessages.releaseGatesMetricBlockedLabel,
        valueNotAvailable: operationsMessages.valueNotAvailable,
        statePassed: operationsMessages.statePassed,
        stateBlocked: operationsMessages.stateBlocked
      })
    : null;

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={commonMessages.adminEyebrow}
        title={meta.title}
        description={meta.description}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={commonMessages.adminEyebrow}
        title={meta.title}
        description={meta.description}
        actions={
          <>
            {meta.runEndpoint ? (
              <Button variant="outline" onClick={() => void runReleaseGates()} disabled={Boolean(busyAction)}>
                {busyAction === "run-release-gates" ? operationsMessages.runningGatesAction : operationsMessages.runGatesAction}
              </Button>
            ) : null}
            <Button onClick={() => void loadData()}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>
          </>
        }
      />
      {message ? <AdminMessageBanner message={message} /> : null}

      {route === "/admin/ops/metrics" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="gap-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">{metric.label}</CardDescription>
                    <Badge variant="outline" className={severityClasses(metric.severity)}>
                      {formatMetricSeverity(metric.severity, operationsMessages)}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--ui-text-secondary)]">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>{operationsMessages.telemetryContextTitle}</CardTitle>
                <CardDescription>{operationsMessages.telemetryContextDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <AdminInsetBlock>
                  <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                    {operationsMessages.telemetryAuditLogs24hLabel}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[color:var(--ui-text-primary)]">{metricsPayload?.totalAuditLogs24h || 0}</div>
                </AdminInsetBlock>
                <AdminInsetBlock>
                  <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                    {operationsMessages.telemetrySyncRuns24hLabel}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[color:var(--ui-text-primary)]">{metricsPayload?.totalSyncRuns24h || 0}</div>
                </AdminInsetBlock>
                <AdminInsetBlock>
                  <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                    {operationsMessages.telemetryRetentionDaysLabel}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[color:var(--ui-text-primary)]">{metricsPayload?.retentionDays || 0}</div>
                </AdminInsetBlock>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {route === "/admin/ops/alerts" ? (
        <>
          <AdminMetricGrid metrics={alertOverview?.metrics || []} columnsClassName="grid gap-4 md:grid-cols-3" />

          <Card>
            <CardHeader>
              <CardTitle>{operationsMessages.alertQueueTitle}</CardTitle>
              <CardDescription>{operationsMessages.alertQueueDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertPayload?.items.map((alert) => (
                <AdminRecordCard key={alert.code}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                          {resolveAlertCodeLabel(alert, operationsMessages)}
                        </span>
                        <Badge variant="outline" className={severityClasses(alert.severity)}>
                          {resolveOpsSeverityLabel(alert.severity, operationsMessages)}
                        </Badge>
                        {alert.triggered ? (
                          <Badge variant="outline">{operationsMessages.alertTriggeredBadge}</Badge>
                        ) : (
                          <Badge variant="outline">{operationsMessages.alertStandbyBadge}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-[color:var(--ui-text-secondary)]">
                        {resolveOpsAlertMessage(alert.message, operationsMessages)}
                      </div>
                    </div>
                  </div>
                </AdminRecordCard>
              ))}
              {!alertPayload?.items.length && !loading ? <AdminEmptyBlock>{operationsMessages.alertsEmpty}</AdminEmptyBlock> : null}
            </CardContent>
          </Card>
        </>
      ) : null}

      {route === "/admin/ops/release-gates" ? (
        <>
          <AdminMetricGrid metrics={releaseOverview?.metrics || []} columnsClassName="grid gap-4 md:grid-cols-3" />

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>{operationsMessages.gateChecksTitle}</CardTitle>
                <CardDescription>{operationsMessages.gateChecksDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {releaseGatePayload?.checks.map((check) => (
                  <AdminRecordCard key={check.code}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                            {resolveReleaseGateCodeLabel(check, operationsMessages)}
                          </span>
                          <Badge variant="outline" className={severityClasses(check.passed ? "passed" : check.severity)}>
                            {resolveReleaseGateBadgeLabel(check, operationsMessages)}
                          </Badge>
                        </div>
                        <div className="text-sm text-[color:var(--ui-text-secondary)]">
                          {resolveOpsReleaseGateMessage(check.message, operationsMessages)}
                        </div>
                      </div>
                    </div>
                  </AdminRecordCard>
                ))}
                {!releaseGatePayload?.checks.length && !loading ? (
                  <AdminEmptyBlock>{operationsMessages.releaseGatesEmpty}</AdminEmptyBlock>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{operationsMessages.snapshotSummaryTitle}</CardTitle>
                <CardDescription>{operationsMessages.snapshotSummaryDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
                <AdminInsetBlock>
                  <div className="font-semibold text-[color:var(--ui-text-primary)]">{operationsMessages.overallStateLabel}</div>
                  <div className="mt-1">
                    <Badge variant="outline" className={severityClasses(releaseOverview?.overallState || operationsMessages.stateBlocked)}>
                      {releaseOverview?.overallState || operationsMessages.stateBlocked}
                    </Badge>
                  </div>
                </AdminInsetBlock>
                <AdminInsetBlock>
                  <div className="font-semibold text-[color:var(--ui-text-primary)]">{operationsMessages.generatedAtLabel}</div>
                  <div className="mt-1">{releaseOverview?.generatedAt || operationsMessages.valueNotAvailable}</div>
                </AdminInsetBlock>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
