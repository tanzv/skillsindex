import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import { adminOpsRouteDefinitions } from "./AdminOpsControlPage.config";
import { labelFromKey, stringifyValue } from "./AdminOpsControlPage.helpers";
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
        <button type="button" onClick={reload} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      <section className="panel panel-hero">
        <h2 style={{ marginBottom: 8 }}>{routeDefinition.title}</h2>
        <p style={{ margin: 0 }}>{routeDefinition.subtitle}</p>
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {view.metrics.map((metric) => (
          <article key={metric.label} className="panel" style={{ borderLeft: "4px solid #235078" }}>
            <span style={{ display: "block", color: "var(--text-subtle)" }}>{metric.label}</span>
            <strong style={{ fontSize: 26 }}>{metric.value}</strong>
            <p style={{ marginBottom: 0, marginTop: 8 }}>{metric.help}</p>
          </article>
        ))}
      </section>

      <section className="panel" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={reload} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
          Refresh
        </button>
        {routeDefinition.runEndpoint ? (
          <button
            type="button"
            onClick={runReleaseGates}
            disabled={running}
            style={{ padding: "8px 14px", borderRadius: 8, cursor: running ? "wait" : "pointer" }}
          >
            {running ? "Running..." : "Run Release Gates"}
          </button>
        ) : null}
        {runFeedback ? <span style={{ color: "var(--text-subtle)" }}>{runFeedback}</span> : null}
      </section>

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
