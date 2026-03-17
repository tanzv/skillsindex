import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON } from "../../lib/api";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";
import {
  adminAccessGovernanceCopy,
  buildAdminAccessGovernanceMetrics,
  fetchAdminAccessGovernanceData,
  isAdminAccessGovernanceEmpty
} from "./AdminAccessGovernancePage.helpers";
import { AccessAccountsSection, AccessPolicySection } from "./AdminAccessGovernancePage.sections";
import type { AdminAccessGovernanceData } from "./AdminAccessGovernancePage.types";

export default function AdminAccessGovernancePage() {
  const [data, setData] = useState<AdminAccessGovernanceData | null>(null);
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
        const payload = await fetchAdminAccessGovernanceData(fetchConsoleJSON);
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
        setError(requestError instanceof Error ? requestError.message : "Failed to load access governance data");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void runFetch();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const metrics = useMemo(() => buildAdminAccessGovernanceMetrics(data), [data]);

  const retryFetch = () => {
    setRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading access governance workspace...</section>
        <section className="panel loading">Preparing metrics...</section>
        <section className="panel loading">Preparing records...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero error">
          <h2>{adminAccessGovernanceCopy.title}</h2>
          <p>{error}</p>
          <button type="button" className="panel-action-button" onClick={retryFetch}>
            Retry
          </button>
        </section>
      </div>
    );
  }

  if (isAdminAccessGovernanceEmpty(data)) {
    return (
      <div className="page-grid">
        <AdminSubpageSummaryPanel
          title={adminAccessGovernanceCopy.title}
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
        title={adminAccessGovernanceCopy.title}
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

      {data ? (
        <>
          <AccessPolicySection data={data} />
          <AccessAccountsSection data={data} />
        </>
      ) : null}
    </div>
  );
}
