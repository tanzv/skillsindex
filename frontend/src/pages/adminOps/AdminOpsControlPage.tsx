import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { adminOpsRouteDefinitions } from "./AdminOpsControlPage.config";
import { labelFromKey, stringifyValue } from "./AdminOpsControlPage.helpers";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";
import { AdminOpsControlPageProps, AdminOpsControlRoute } from "./AdminOpsControlPage.types";

export type { AdminOpsControlRoute };

export default function AdminOpsControlPage({ route }: AdminOpsControlPageProps) {
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [running, setRunning] = useState(false);
  const [runFeedback, setRunFeedback] = useState("");

  const routeDefinition = adminOpsRouteDefinitions[route];

  const reload = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setRunFeedback("");

    fetchConsoleJSON(routeDefinition.endpoint)
      .then((response) => {
        if (!active) {
          return;
        }
        setPayload(response);
      })
      .catch((fetchError) => {
        if (!active) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load operations data");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadVersion, routeDefinition]);

  const view = useMemo(() => routeDefinition.buildView(payload), [payload, routeDefinition]);
  const columns = useMemo(() => {
    const firstRow = view.rows[0];
    return firstRow ? Object.keys(firstRow) : [];
  }, [view.rows]);

  const runReleaseGates = useCallback(async () => {
    if (!routeDefinition.runEndpoint) {
      return;
    }

    setRunning(true);
    setRunFeedback("");

    try {
      await postConsoleJSON(routeDefinition.runEndpoint);
      setRunFeedback("Release gates run completed. Data reloaded.");
      reload();
    } catch (runError) {
      setRunFeedback(runError instanceof Error ? runError.message : "Failed to execute release gate run");
    } finally {
      setRunning(false);
    }
  }, [reload, routeDefinition]);

  if (loading) {
    return <section className="panel loading">Loading operations control data...</section>;
  }

  if (error) {
    return (
      <section className="panel error">
        <h2 style={{ marginTop: 0 }}>Unable to load operations control data</h2>
        <p>{error}</p>
        <button type="button" onClick={reload} className="panel-action-button">
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      <AdminSubpageSummaryPanel
        title={routeDefinition.title}
        status={<span className="pill muted">{routeDefinition.subtitle}</span>}
        actions={
          <>
            <button type="button" onClick={reload} className="panel-action-button">
              Refresh
            </button>
            {routeDefinition.runEndpoint ? (
              <button type="button" onClick={runReleaseGates} disabled={running} className="panel-action-button" data-variant="emphasis">
                {running ? "Running..." : "Run Release Gates"}
              </button>
            ) : null}
          </>
        }
        notice={runFeedback ? <span>{runFeedback}</span> : undefined}
        metrics={view.metrics.map((metric) => ({ id: metric.label, label: metric.label, value: metric.value, help: metric.help }))}
      />

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>Records</h3>
        {view.rows.length === 0 ? (
          <p style={{ marginBottom: 0 }}>{view.emptyHint}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{labelFromKey(column)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`}>{stringifyValue(row[column])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>Endpoint</h3>
        <p style={{ marginBottom: 0 }}>
          <code>{routeDefinition.endpoint}</code>
        </p>
      </section>
    </div>
  );
}
