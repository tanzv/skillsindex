import { useEffect, useMemo, useState } from "react";

import { AdminIntegrationsResponse, fetchConsoleJSON } from "../../lib/api";
import { resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { buildIntegrationWorkbenchFallback } from "./adminWorkbenchFallback";
import AdminSubpageSummaryPanel from "../adminShared/AdminSubpageSummaryPanel";

export type AdminIntegrationWorkbenchMode =
  | "integration_settings"
  | "integration_connector_list"
  | "integration_configuration_form"
  | "webhook_delivery_logs";

interface AdminIntegrationWorkbenchPageProps {
  mode: AdminIntegrationWorkbenchMode;
}

interface SSOProviderPayload {
  items?: Array<Record<string, unknown>>;
  total?: number;
}

interface IntegrationWorkbenchData {
  integrations: AdminIntegrationsResponse;
  ssoProviders: SSOProviderPayload | null;
}

const modeCopy: Record<AdminIntegrationWorkbenchMode, { title: string; subtitle: string }> = {
  integration_settings: {
    title: "Integration Settings",
    subtitle: "Provider posture, connector readiness, and webhook reliability snapshot."
  },
  integration_connector_list: {
    title: "Integration Connector List",
    subtitle: "Connector inventory with provider status and update recency."
  },
  integration_configuration_form: {
    title: "Integration Configuration Form",
    subtitle: "Configuration-facing view backed by connector and SSO provider data."
  },
  webhook_delivery_logs: {
    title: "Webhook Delivery Logs",
    subtitle: "Recent webhook deliveries with outcome and endpoint visibility."
  }
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleString();
}

async function fetchIntegrationWorkbenchData(mode: AdminIntegrationWorkbenchMode): Promise<IntegrationWorkbenchData> {
  const includeProviders = mode === "integration_configuration_form";
  const [integrations, ssoProviders] = await Promise.all([
    fetchConsoleJSON<AdminIntegrationsResponse>("/api/v1/admin/integrations?limit=40"),
    includeProviders ? fetchConsoleJSON<SSOProviderPayload>("/api/v1/admin/sso/providers") : Promise.resolve(null)
  ]);

  return { integrations, ssoProviders };
}

export default function AdminIntegrationWorkbenchPage({ mode }: AdminIntegrationWorkbenchPageProps) {
  const dataMode = useMemo(
    () => resolvePrototypeDataMode(import.meta.env.VITE_ADMIN_PROTOTYPE_MODE || import.meta.env.VITE_MARKETPLACE_HOME_MODE),
    []
  );
  const [data, setData] = useState<IntegrationWorkbenchData | null>(null);
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
      setData(buildIntegrationWorkbenchFallback(mode));
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchIntegrationWorkbenchData(mode)
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
        setData(buildIntegrationWorkbenchFallback(mode));
        setError(requestError instanceof Error ? requestError.message : "Failed to load integration workbench data");
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

  const connectors = data?.integrations.items || [];
  const webhookLogs = data?.integrations.webhook_logs || [];
  const enabledConnectors = useMemo(() => connectors.filter((item) => item.enabled).length, [connectors]);
  const failedLogs = useMemo(
    () => webhookLogs.filter((item) => item.status_code >= 400 || item.outcome.toLowerCase() !== "ok").length,
    [webhookLogs]
  );

  const tableRows = useMemo(() => {
    if (mode === "webhook_delivery_logs") {
      return webhookLogs.slice(0, 20).map((item) => ({
        primary: item.event_type,
        secondary: item.outcome,
        status: String(item.status_code),
        endpoint: item.endpoint,
        timestamp: item.delivered_at
      }));
    }

    if (mode === "integration_configuration_form") {
      const providers = data?.ssoProviders?.items || [];
      return providers.slice(0, 12).map((item, index) => ({
        primary: String(item.provider_key || item.provider || `provider-${index + 1}`),
        secondary: String(item.display_name || item.name || "SSO provider"),
        status: String(item.enabled ?? true),
        endpoint: String(item.callback_url || item.client_id || "N/A"),
        timestamp: String(item.updated_at || item.created_at || "")
      }));
    }

    return connectors.slice(0, 20).map((item) => ({
      primary: item.name,
      secondary: item.provider,
      status: item.enabled ? "enabled" : "disabled",
      endpoint: item.base_url,
      timestamp: item.updated_at
    }));
  }, [connectors, data?.ssoProviders?.items, mode, webhookLogs]);

  const refresh = () => {
    setRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading integration workbench...</section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <AdminSubpageSummaryPanel
        title={modeCopy[mode].title}
        status={
          <span className={degraded || dataMode === "prototype" ? "pill muted" : "pill active"}>
            {dataMode === "prototype" ? "Prototype dataset" : degraded ? "Fallback prototype data" : "Live backend data"}
          </span>
        }
        actions={
          <button type="button" onClick={refresh} className="panel-action-button">
            Refresh
          </button>
        }
        notice={degraded && error ? `Degraded mode: ${error}` : undefined}
        metrics={[
          { id: "total-connectors", label: "Total Connectors", value: data?.integrations.total ?? connectors.length },
          { id: "enabled-connectors", label: "Enabled Connectors", value: enabledConnectors },
          { id: "webhook-logs", label: "Webhook Logs", value: data?.integrations.webhook_total ?? webhookLogs.length },
          { id: "failed-deliveries", label: "Failed Deliveries", value: failedLogs }
        ]}
      />

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>
          {mode === "webhook_delivery_logs"
            ? "Webhook Recent Deliveries"
            : mode === "integration_configuration_form"
              ? "SSO Provider Configuration"
              : "Connector Inventory"}
        </h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Endpoint</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={5}>No records returned.</td>
                </tr>
              ) : (
                tableRows.map((row, index) => (
                  <tr key={`integration-row-${index}`}>
                    <td>{row.primary}</td>
                    <td>{row.secondary}</td>
                    <td>{row.status}</td>
                    <td>{row.endpoint || "N/A"}</td>
                    <td>{row.timestamp ? formatDateTime(row.timestamp) : "N/A"}</td>
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
