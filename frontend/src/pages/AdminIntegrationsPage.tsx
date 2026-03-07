import { useEffect, useState } from "react";

import { AdminIntegrationsResponse, fetchAdminIntegrations } from "../lib/api";
import AdminSubpageSummaryPanel from "./AdminSubpageSummaryPanel";

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }
  return parsed.toLocaleString();
}

export default function AdminIntegrationsPage() {
  const [data, setData] = useState<AdminIntegrationsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminIntegrations()
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load integrations");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadVersion]);

  const connectors = data?.items || [];
  const logs = data?.webhook_logs || [];
  const enabledConnectors = connectors.filter((item) => item.enabled).length;
  const disabledConnectors = connectors.length - enabledConnectors;
  const failedDeliveries = logs.filter((item) => item.status_code >= 400 || item.outcome.toLowerCase() !== "ok").length;
  const healthyDeliveries = logs.length - failedDeliveries;
  const latestDeliveryAt = !logs.length
    ? "No deliveries yet"
    : formatDateTime(
        logs.reduce((current, candidate) =>
          new Date(candidate.delivered_at).getTime() > new Date(current.delivered_at).getTime() ? candidate : current
        ).delivered_at
      );
  const hasData = connectors.length > 0 || logs.length > 0;
  const refresh = () => setReloadVersion((value) => value + 1);

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading integration command center...</section>
        <section className="panel loading">Preparing connector catalog...</section>
        <section className="panel loading">Preparing webhook telemetry...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero error">
          <h2>Integration Command Center</h2>
          <p>{error}</p>
          <button type="button" className="panel-action-button" onClick={refresh}>
            Retry request
          </button>
        </section>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="page-grid">
        <AdminSubpageSummaryPanel
          title="Integration Command Center"
          status={<span className="pill muted">No records</span>}
          actions={
            <button type="button" className="panel-action-button" onClick={refresh}>
              Refresh data
            </button>
          }
          notice="No connector or webhook records were returned for this workspace."
          metrics={[
            { id: "total-connectors", label: "Total Connectors", value: 0 },
            { id: "webhook-deliveries", label: "Webhook Deliveries", value: 0 }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <AdminSubpageSummaryPanel
        title="Integration Command Center"
        status={
          <>
            <span className="pill active">Live telemetry</span>
            <span className="pill muted">Latest delivery: {latestDeliveryAt}</span>
          </>
        }
        actions={
          <>
            <button type="button" className="panel-action-button" onClick={refresh}>
              Refresh now
            </button>
            <button type="button" className="panel-action-button" disabled>
              Rotate secrets
            </button>
            <button type="button" className="panel-action-button" disabled>
              Export audit snapshot
            </button>
          </>
        }
        metrics={[
          { id: "total-connectors", label: "Total Connectors", value: data?.total || connectors.length },
          { id: "enabled-connectors", label: "Enabled Connectors", value: enabledConnectors },
          { id: "disabled-connectors", label: "Disabled Connectors", value: disabledConnectors },
          { id: "webhook-deliveries", label: "Webhook Deliveries", value: data?.webhook_total || logs.length },
          { id: "healthy-deliveries", label: "Healthy Deliveries", value: healthyDeliveries },
          { id: "failed-deliveries", label: "Failed Deliveries", value: failedDeliveries }
        ]}
      />

      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <h3>Connector Catalog</h3>
          <span className="pill muted">{connectors.length} rows</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Description</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {connectors.length === 0 ? (
                <tr>
                  <td colSpan={5}>No connector records</td>
                </tr>
              ) : (
                connectors.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.provider}</td>
                    <td>
                      <span className={item.enabled ? "pill active" : "pill muted"}>{item.enabled ? "Enabled" : "Disabled"}</span>
                    </td>
                    <td>{item.description || "No description"}</td>
                    <td>{formatDateTime(item.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <h3>Webhook Recent Deliveries</h3>
          <span className={failedDeliveries > 0 ? "pill muted" : "pill active"}>{failedDeliveries > 0 ? "Needs attention" : "Healthy"}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Outcome</th>
                <th>Status Code</th>
                <th>Endpoint</th>
                <th>Delivered At</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>No delivery records</td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.event_type}</td>
                    <td>{item.outcome}</td>
                    <td>{item.status_code}</td>
                    <td>{item.endpoint}</td>
                    <td>{formatDateTime(item.delivered_at)}</td>
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
