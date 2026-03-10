import { CSSProperties, useEffect, useMemo, useState } from "react";

import { AdminOpsMetricsResponse, OpsMetrics, fetchAdminOpsMetrics } from "../../lib/api";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";

type OpsMetricKey = keyof OpsMetrics;
type Severity = "normal" | "warning" | "critical";

interface MetricDefinition {
  key: OpsMetricKey;
  label: string;
  description: string;
  warningAt: number;
  criticalAt: number;
}

const metricDefinitions: MetricDefinition[] = [
  { key: "open_incidents", label: "Open Incidents", description: "Active incidents pending closure.", warningAt: 3, criticalAt: 7 },
  { key: "pending_moderation_cases", label: "Pending Moderation", description: "Backlog waiting for review.", warningAt: 8, criticalAt: 20 },
  { key: "unresolved_jobs", label: "Unresolved Jobs", description: "Background jobs requiring intervention.", warningAt: 5, criticalAt: 12 },
  { key: "failed_sync_runs_24h", label: "Failed Syncs (24h)", description: "Integration sync failures in the last day.", warningAt: 2, criticalAt: 6 },
  { key: "disabled_accounts", label: "Disabled Accounts", description: "Accounts blocked by policy or anomaly.", warningAt: 10, criticalAt: 25 },
  { key: "stale_integrations", label: "Stale Integrations", description: "Connectors with delayed heartbeats.", warningAt: 3, criticalAt: 8 }
];

function toSafeCount(value: unknown): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, Math.floor(numericValue));
}

function getSeverity(value: number, warningAt: number, criticalAt: number): Severity {
  if (value >= criticalAt) {
    return "critical";
  }
  if (value >= warningAt) {
    return "warning";
  }
  return "normal";
}

const severityPalette: Record<Severity, { tone: string; border: string; background: string }> = {
  normal: {
    tone: "var(--si-color-success-text)",
    border: "color-mix(in srgb, var(--si-color-success-bg) 68%, transparent)",
    background: "color-mix(in srgb, var(--si-color-success-bg) 44%, transparent)"
  },
  warning: {
    tone: "var(--si-color-warning-text)",
    border: "color-mix(in srgb, var(--si-color-warning-bg) 72%, transparent)",
    background: "color-mix(in srgb, var(--si-color-warning-bg) 48%, transparent)"
  },
  critical: {
    tone: "var(--si-color-danger-text)",
    border: "color-mix(in srgb, var(--si-color-danger-bg) 72%, transparent)",
    background: "color-mix(in srgb, var(--si-color-danger-bg) 48%, transparent)"
  }
};

const subtleTextColor = "var(--si-color-text-secondary)";
const spotlightCardStyle: CSSProperties = {
  borderLeft: "4px solid color-mix(in srgb, var(--si-color-accent) 64%, transparent)"
};

export default function AdminOpsMetricsPage() {
  const [data, setData] = useState<AdminOpsMetricsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminOpsMetrics()
      .then((payload) => {
        if (!active) {
          return;
        }
        setData(payload);
        setLastLoadedAt(new Date().toLocaleString());
      })
      .catch((fetchError) => {
        if (!active) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load metrics");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [requestVersion]);

  const metrics = useMemo(() => {
    const item = data?.item;
    if (!item) {
      return [];
    }

    return metricDefinitions.map((definition) => {
      const value = toSafeCount(item[definition.key]);
      const severity = getSeverity(value, definition.warningAt, definition.criticalAt);
      return { ...definition, value, severity };
    });
  }, [data]);

  const summary = useMemo(() => {
    const critical = metrics.filter((metric) => metric.severity === "critical").length;
    const warning = metrics.filter((metric) => metric.severity === "warning").length;
    const total = metrics.reduce((accumulator, metric) => accumulator + metric.value, 0);
    return { critical, warning, total };
  }, [metrics]);

  const quickContextCards = useMemo(() => {
    const valueByKey = new Map(metrics.map((metric) => [metric.key, metric.value]));
    const incidentPressure = (valueByKey.get("open_incidents") || 0) + (valueByKey.get("pending_moderation_cases") || 0);
    const pipelineFriction = (valueByKey.get("unresolved_jobs") || 0) + (valueByKey.get("failed_sync_runs_24h") || 0);
    const platformTrust = (valueByKey.get("disabled_accounts") || 0) + (valueByKey.get("stale_integrations") || 0);

    return [
      { label: "Incident Pressure", value: incidentPressure, target: "Contain unresolved reliability signals." },
      { label: "Pipeline Friction", value: pipelineFriction, target: "Restore flow for automated jobs and sync." },
      { label: "Platform Trust Risk", value: platformTrust, target: "Review account controls and integration health." }
    ];
  }, [metrics]);

  const retryFetch = () => {
    setRequestVersion((version) => version + 1);
  };

  if (loading) {
    return <div className="panel loading">Loading operations dashboard...</div>;
  }

  if (error) {
    return (
      <div className="panel error">
        <h3 style={{ marginTop: 0 }}>Unable to load operations metrics</h3>
        <p style={{ marginBottom: 16 }}>{error}</p>
        <button type="button" onClick={retryFetch} className="panel-action-button">
          Retry
        </button>
      </div>
    );
  }

  if (!data?.item || metrics.length === 0) {
    return (
      <div className="page-grid">
        <AdminSubpageSummaryPanel
          title="Operations Command Dashboard"
          status={<span className="pill muted">No data</span>}
          actions={
            <button type="button" onClick={retryFetch} className="panel-action-button">
              Refresh
            </button>
          }
          notice="The metrics endpoint returned an empty payload. Retry after telemetry pipelines complete a full cycle."
          metrics={[{ id: "tracked-events", label: "Tracked Events", value: 0 }]}
        />
      </div>
    );
  }

  return (
    <div className="page-grid" style={{ gap: 18 }}>
      <AdminSubpageSummaryPanel
        title="Operations Command Dashboard"
        status={
          <>
            <span className="pill active">Live baseline</span>
            <span className="pill muted">Last refresh: {lastLoadedAt || "Unavailable"}</span>
          </>
        }
        actions={
          <button type="button" onClick={retryFetch} className="panel-action-button">
            Refresh Metrics
          </button>
        }
        notice="Use the risk queue to prioritize response across reliability, moderation, and integration stability."
        metrics={[
          { id: "critical-signals", label: "Critical Signals", value: summary.critical },
          { id: "warning-signals", label: "Warning Signals", value: summary.warning },
          { id: "tracked-events", label: "Tracked Events", value: summary.total }
        ]}
      />

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {quickContextCards.map((card) => (
          <article key={card.label} className="panel" style={spotlightCardStyle}>
            <span style={{ display: "block", color: subtleTextColor }}>{card.label}</span>
            <strong style={{ fontSize: 26, lineHeight: 1.25 }}>{card.value}</strong>
            <p style={{ marginBottom: 0, fontSize: 13 }}>{card.target}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>Risk Queue</h3>
        <p style={{ marginTop: 0, color: subtleTextColor }}>
          {summary.critical > 0 ? "Immediate intervention needed on critical metrics." : "No critical blockers detected."}
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {metrics
            .filter((metric) => metric.severity !== "normal")
            .map((metric) => (
              <article
                key={`queue-${metric.key}`}
                style={{
                  border: `1px solid ${severityPalette[metric.severity].border}`,
                  background: severityPalette[metric.severity].background,
                  borderRadius: 10,
                  padding: "10px 12px"
                }}
              >
                <strong style={{ display: "block", color: severityPalette[metric.severity].tone }}>{metric.label}</strong>
                <span>{metric.value} records require response.</span>
              </article>
            ))}
          {summary.critical === 0 && summary.warning === 0 ? (
            <article
              style={{
                border: "1px dashed color-mix(in srgb, var(--si-color-border) 84%, transparent)",
                borderRadius: 10,
                padding: "10px 12px"
              }}
            >
              All monitored metrics are currently within normal operating thresholds.
            </article>
          ) : null}
        </div>
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="panel"
            style={{ borderTop: `4px solid ${severityPalette[metric.severity].tone}`, background: severityPalette[metric.severity].background }}
          >
            <span style={{ display: "block", color: subtleTextColor, marginBottom: 8 }}>{metric.label}</span>
            <strong style={{ fontSize: 30, lineHeight: 1.1 }}>{metric.value}</strong>
            <p style={{ marginBottom: 0, marginTop: 8 }}>{metric.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
