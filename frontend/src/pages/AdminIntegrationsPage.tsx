import { useEffect, useState } from "react";
import { AdminIntegrationsResponse, fetchAdminIntegrations } from "../lib/api";

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
          <p>Failed to load the latest integration data.</p>
          <p>{error}</p>
          <button
            type="button"
            style={{
              border: "1px solid rgba(17, 25, 31, 0.2)",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer"
            }}
            onClick={() => setReloadVersion((value) => value + 1)}
          >
            Retry request
          </button>
        </section>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero">
          <h2>Integration Command Center</h2>
          <p>No connector or webhook records were returned for this workspace.</p>
          <div className="metric-row">
            <article className="metric-card">
              <span>Total Connectors</span>
              <strong>0</strong>
            </article>
            <article className="metric-card">
              <span>Webhook Deliveries</span>
              <strong>0</strong>
            </article>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                border: "1px solid rgba(17, 25, 31, 0.2)",
                background: "rgba(255, 255, 255, 0.85)",
                borderRadius: 10,
                padding: "8px 14px",
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => setReloadVersion((value) => value + 1)}
            >
              Refresh data
            </button>
            <span className="pill muted">No records</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="panel panel-hero">
        <h2>Integration Command Center</h2>
        <p>
          Unified operations view for connector readiness, webhook reliability, and rapid recovery actions.
        </p>
        <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pill active">Live telemetry</span>
          <span className="pill muted">Latest delivery: {latestDeliveryAt}</span>
        </div>
        <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              border: "1px solid rgba(17, 25, 31, 0.2)",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer"
            }}
            onClick={() => setReloadVersion((value) => value + 1)}
          >
            Refresh now
          </button>
          <button
            type="button"
            style={{
              border: "1px solid rgba(17, 25, 31, 0.2)",
              background: "transparent",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700
            }}
            disabled
          >
            Rotate secrets
          </button>
          <button
            type="button"
            style={{
              border: "1px solid rgba(17, 25, 31, 0.2)",
              background: "transparent",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700
            }}
            disabled
          >
            Export audit snapshot
          </button>
        </div>
        <div className="metric-row">
          <article className="metric-card">
            <span>Total Connectors</span>
            <strong>{data?.total || connectors.length}</strong>
          </article>
          <article className="metric-card">
            <span>Enabled Connectors</span>
            <strong>{enabledConnectors}</strong>
          </article>
          <article className="metric-card">
            <span>Disabled Connectors</span>
            <strong>{disabledConnectors}</strong>
          </article>
          <article className="metric-card">
            <span>Webhook Deliveries</span>
            <strong>{data?.webhook_total || logs.length}</strong>
          </article>
          <article className="metric-card">
            <span>Healthy Deliveries</span>
            <strong>{healthyDeliveries}</strong>
          </article>
          <article className="metric-card">
            <span>Failed Deliveries</span>
            <strong>{failedDeliveries}</strong>
          </article>
        </div>
      </section>

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
                      <span className={item.enabled ? "pill active" : "pill muted"}>
                        {item.enabled ? "Enabled" : "Disabled"}
                      </span>
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
          <span className={failedDeliveries > 0 ? "pill muted" : "pill active"}>
            {failedDeliveries > 0 ? "Needs attention" : "Healthy"}
          </span>
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
                  <td colSpan={5}>No webhook delivery records</td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.event_type}</td>
                    <td>
                      <span className={item.status_code >= 400 ? "pill muted" : "pill active"}>{item.outcome}</span>
                    </td>
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
