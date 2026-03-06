import { useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON } from "../lib/api";
import AdminSubpageSummaryPanel from "./AdminSubpageSummaryPanel";
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
          <p>{error}</p>
          <button type="button" className="panel-action-button" onClick={retryFetch}>
            Retry
          </button>
        </section>
      </div>
    );
  }

  if (isEmptyData(route, data)) {
    return (
      <div className="page-grid">
        <AdminSubpageSummaryPanel
          title={routeCopy.title}
          status={<span className="pill muted">Empty</span>}
          actions={
            <button type="button" className="panel-action-button" onClick={retryFetch}>
              Refresh
            </button>
          }
          notice="No records were returned for this route."
          metrics={[{ id: "total-records", label: "Total Records", value: 0 }]}
        />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <AdminSubpageSummaryPanel
        title={routeCopy.title}
        status={
          <>
            <span className="pill active">Live endpoint</span>
            <span className="pill muted">Last refresh: {lastLoadedAt || "Unavailable"}</span>
          </>
        }
        actions={
          <button type="button" className="panel-action-button" onClick={retryFetch}>
            Refresh
          </button>
        }
        metrics={metrics.map((metric) => ({ id: metric.label, label: metric.label, value: metric.value }))}
      />

      {data ? renderRouteSection(route, data) : null}
    </div>
  );
}
