import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON } from "../../lib/api";
import { resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { buildIncidentWorkbenchFallback } from "./adminWorkbenchFallback";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";

export type AdminIncidentWorkbenchMode =
  | "incident_recovery"
  | "incident_management_list"
  | "incident_response_console"
  | "incident_postmortem_detail";

interface AdminIncidentWorkbenchPageProps {
  mode: AdminIncidentWorkbenchMode;
  incidentID?: string;
}

interface OpsMetricsPayload {
  item?: Record<string, unknown>;
}

interface OpsCollectionPayload {
  items?: Array<Record<string, unknown>>;
  total?: number;
}

interface IncidentWorkbenchData {
  metrics: OpsMetricsPayload;
  alerts: OpsCollectionPayload;
  recoveryDrills: OpsCollectionPayload;
  releases: OpsCollectionPayload | null;
}

interface ModeCopy {
  title: string;
  subtitle: string;
}

const modeCopy: Record<AdminIncidentWorkbenchMode, ModeCopy> = {
  incident_recovery: {
    title: "Incident Recovery Center",
    subtitle: "Recovery readiness baseline with current alert pressure and drill evidence."
  },
  incident_management_list: {
    title: "Incident Management List",
    subtitle: "Current incident-like alert workload with severity distribution and responder backlog."
  },
  incident_response_console: {
    title: "Incident Response Console",
    subtitle: "Response-focused view with live metrics and active response queue context."
  },
  incident_postmortem_detail: {
    title: "Incident Postmortem Detail",
    subtitle: "Postmortem evidence panel combining release and recovery timelines for follow-up actions."
  }
};

function toPositiveInteger(value: unknown): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }
  return Math.floor(numericValue);
}

function formatDateTime(value: unknown): string {
  const parsed = new Date(String(value || ""));
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleString();
}

function selectAlertTitle(alert: Record<string, unknown>): string {
  return String(alert.title || alert.name || alert.metric || "Alert");
}

function selectAlertSeverity(alert: Record<string, unknown>): string {
  const severity = String(alert.severity || "normal").trim().toLowerCase();
  if (!severity) {
    return "normal";
  }
  return severity;
}

async function fetchIncidentWorkbenchData(mode: AdminIncidentWorkbenchMode): Promise<IncidentWorkbenchData> {
  const includeReleaseTimeline = mode === "incident_postmortem_detail";
  const [metrics, alerts, recoveryDrills, releases] = await Promise.all([
    fetchConsoleJSON<OpsMetricsPayload>("/api/v1/admin/ops/metrics"),
    fetchConsoleJSON<OpsCollectionPayload>("/api/v1/admin/ops/alerts"),
    fetchConsoleJSON<OpsCollectionPayload>("/api/v1/admin/ops/recovery-drills?limit=20"),
    includeReleaseTimeline ? fetchConsoleJSON<OpsCollectionPayload>("/api/v1/admin/ops/releases?limit=20") : Promise.resolve(null)
  ]);

  return { metrics, alerts, recoveryDrills, releases };
}

export default function AdminIncidentWorkbenchPage({ mode, incidentID }: AdminIncidentWorkbenchPageProps) {
  const dataMode = useMemo(
    () => resolvePrototypeDataMode(import.meta.env.VITE_ADMIN_PROTOTYPE_MODE || import.meta.env.VITE_MARKETPLACE_HOME_MODE),
    []
  );
  const [data, setData] = useState<IncidentWorkbenchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degraded, setDegraded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setDegraded(false);

    if (dataMode === "prototype") {
      setData(buildIncidentWorkbenchFallback(mode));
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchIncidentWorkbenchData(mode)
      .then((payload) => {
        if (!active) {
          return;
        }
        setData(payload);
        setDegraded(false);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setData(buildIncidentWorkbenchFallback(mode));
        setError(requestError instanceof Error ? requestError.message : "Failed to load incident workbench data");
        setDegraded(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, mode, refreshKey]);

  const alerts = data?.alerts.items || [];
  const recoveryDrills = data?.recoveryDrills.items || [];
  const releases = data?.releases?.items || [];

  const totalAlerts = data?.alerts.total ?? alerts.length;
  const triggeredAlerts = useMemo(
    () => alerts.filter((item) => Boolean(item.triggered) || selectAlertSeverity(item) === "critical").length,
    [alerts]
  );
  const openIncidents = toPositiveInteger(data?.metrics.item?.open_incidents);

  const topRows = useMemo(() => {
    if (mode === "incident_postmortem_detail") {
      return releases.slice(0, 6);
    }
    if (mode === "incident_recovery") {
      return recoveryDrills.slice(0, 6);
    }
    return alerts.slice(0, 8);
  }, [alerts, mode, recoveryDrills, releases]);

  const refresh = () => {
    setRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading incident workbench...</section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <AdminSubpageSummaryPanel
        title={modeCopy[mode].title}
        status={
          <>
            <span className={degraded || dataMode === "prototype" ? "pill muted" : "pill active"}>
              {dataMode === "prototype" ? "Prototype dataset" : degraded ? "Fallback prototype data" : "Live backend data"}
            </span>
            {incidentID ? <span className="pill muted">Incident #{incidentID}</span> : null}
          </>
        }
        actions={
          <button type="button" onClick={refresh} className="panel-action-button">
            Refresh
          </button>
        }
        notice={degraded && error ? `Degraded mode: ${error}` : undefined}
        metrics={[
          { id: "open-incidents", label: "Open Incidents", value: openIncidents },
          { id: "total-alerts", label: "Total Alerts", value: toPositiveInteger(totalAlerts) },
          { id: "triggered-alerts", label: "Triggered Alerts", value: triggeredAlerts },
          { id: "recovery-drills", label: "Recovery Drills", value: toPositiveInteger(data?.recoveryDrills.total ?? recoveryDrills.length) }
        ]}
      />

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>
          {mode === "incident_postmortem_detail"
            ? "Recent Release Timeline"
            : mode === "incident_recovery"
              ? "Recovery Drill Records"
              : "Incident Alert Queue"}
        </h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {topRows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No records returned.</td>
                </tr>
              ) : (
                topRows.map((item, index) => (
                  <tr key={`incident-row-${index}`}>
                    <td>{selectAlertTitle(item)}</td>
                    <td>{String(item.status || item.severity || item.outcome || "N/A")}</td>
                    <td>{String(item.owner || item.reviewer || item.environment || "N/A")}</td>
                    <td>{formatDateTime(item.updated_at || item.occurred_at || item.created_at || item.released_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
