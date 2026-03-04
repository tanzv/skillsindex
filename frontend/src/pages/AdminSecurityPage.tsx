import { useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON } from "../lib/api";
import {
  buildRouteCopy,
  computeMetrics,
  fetchSecurityViewData,
  isEmptyData
} from "./AdminSecurityPage.helpers";
import {
  AccessAccountsSection,
  AccessPolicySection,
  ApiKeysSection,
  ModerationSection
} from "./AdminSecurityPage.sections";
import type {
  AccessViewData,
  AdminSecurityPageProps,
  AdminSecurityRoute,
  ApiKeysViewData,
  ModerationViewData,
  SecurityViewData
} from "./AdminSecurityPage.types";

export type { AdminSecurityRoute } from "./AdminSecurityPage.types";

const actionButtonStyle = {
  border: "1px solid rgba(17, 25, 31, 0.2)",
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: 10,
  padding: "8px 14px",
  cursor: "pointer"
} as const;

function renderRouteSection(route: AdminSecurityRoute, data: SecurityViewData): JSX.Element {
  if (route === "/admin/apikeys") {
    return <ApiKeysSection data={data as ApiKeysViewData} />;
  }

  if (route === "/admin/access") {
    const accessData = data as AccessViewData;
    return (
      <>
        <AccessPolicySection data={accessData} />
        <AccessAccountsSection data={accessData} />
      </>
    );
  }

  return <ModerationSection data={data as ModerationViewData} />;
}

export default function AdminSecurityPage({ route }: AdminSecurityPageProps) {
  const [data, setData] = useState<SecurityViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState("");

  useEffect(() => {
    let active = true;

    async function runFetch(): Promise<void> {
      setLoading(true);
      setError("");

      try {
        const payload = await fetchSecurityViewData(route, fetchConsoleJSON);
        if (!active) {
          return;
        }
        setData(payload);
        setLastLoadedAt(new Date().toLocaleString());
      } catch (requestError) {
        if (!active) {
          return;
        }
        setData(null);
        setError(requestError instanceof Error ? requestError.message : "Failed to load security data");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    runFetch();

    return () => {
      active = false;
    };
  }, [route, refreshKey]);

  const routeCopy = useMemo(() => buildRouteCopy(route), [route]);
  const metrics = useMemo(() => computeMetrics(route, data), [data, route]);

  const retryFetch = () => {
    setRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading security workspace...</section>
        <section className="panel loading">Preparing metrics...</section>
        <section className="panel loading">Preparing records...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero error">
          <h2>{routeCopy.title}</h2>
          <p>Failed to load latest data.</p>
          <p>{error}</p>
          <button type="button" style={actionButtonStyle} onClick={retryFetch}>
            Retry
          </button>
        </section>
      </div>
    );
  }

  if (isEmptyData(route, data)) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero">
          <h2>{routeCopy.title}</h2>
          <p>No records were returned for this route.</p>
          <div className="metric-row">
            <article className="metric-card">
              <span>Total Records</span>
              <strong>0</strong>
            </article>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" style={actionButtonStyle} onClick={retryFetch}>
              Refresh
            </button>
            <span className="pill muted">Empty</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="panel panel-hero">
        <h2>{routeCopy.title}</h2>
        <p>{routeCopy.subtitle}</p>
        <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span className="pill active">Live endpoint</span>
          <span className="pill muted">Last refresh: {lastLoadedAt || "Unavailable"}</span>
          <button type="button" style={actionButtonStyle} onClick={retryFetch}>
            Refresh
          </button>
        </div>
        <div className="metric-row">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      </section>

      {data ? renderRouteSection(route, data) : null}
    </div>
  );
}
