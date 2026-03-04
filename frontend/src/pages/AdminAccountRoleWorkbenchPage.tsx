import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON } from "../lib/api";
import { resolvePrototypeDataMode } from "./prototypeDataFallback";
import { buildAccountRoleWorkbenchFallback } from "./adminWorkbenchFallback";

export type AdminAccountRoleWorkbenchMode =
  | "account_management_list"
  | "account_configuration_form"
  | "role_management_list"
  | "role_configuration_form";

interface AdminAccountRoleWorkbenchPageProps {
  mode: AdminAccountRoleWorkbenchMode;
}

interface AdminAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdminAccountsPayload {
  items?: AdminAccountItem[];
  total?: number;
}

interface RegistrationPayload {
  allow_registration?: boolean;
}

interface AuthProvidersPayload {
  auth_providers?: string[];
}

interface AccountRoleWorkbenchData {
  accounts: AdminAccountsPayload;
  registration: RegistrationPayload;
  authProviders: AuthProvidersPayload | null;
}

const modeTitle: Record<AdminAccountRoleWorkbenchMode, string> = {
  account_management_list: "Account Management List",
  account_configuration_form: "Account Configuration Form",
  role_management_list: "Role Management List",
  role_configuration_form: "Role Configuration Form"
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleString();
}

async function fetchAccountRoleWorkbenchData(mode: AdminAccountRoleWorkbenchMode): Promise<AccountRoleWorkbenchData> {
  const includeAuthProviders = mode === "account_configuration_form";
  const [accounts, registration, authProviders] = await Promise.all([
    fetchConsoleJSON<AdminAccountsPayload>("/api/v1/admin/accounts"),
    fetchConsoleJSON<RegistrationPayload>("/api/v1/admin/settings/registration"),
    includeAuthProviders
      ? fetchConsoleJSON<AuthProvidersPayload>("/api/v1/admin/settings/auth-providers")
      : Promise.resolve(null)
  ]);

  return { accounts, registration, authProviders };
}

function normalizeRole(roleValue: string): string {
  const role = String(roleValue || "member").trim().toLowerCase();
  return role || "member";
}

export default function AdminAccountRoleWorkbenchPage({ mode }: AdminAccountRoleWorkbenchPageProps) {
  const dataMode = useMemo(
    () => resolvePrototypeDataMode(import.meta.env.VITE_ADMIN_PROTOTYPE_MODE || import.meta.env.VITE_MARKETPLACE_HOME_MODE),
    []
  );
  const [data, setData] = useState<AccountRoleWorkbenchData | null>(null);
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
      setData(buildAccountRoleWorkbenchFallback(mode));
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchAccountRoleWorkbenchData(mode)
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
        setData(buildAccountRoleWorkbenchFallback(mode));
        setError(requestError instanceof Error ? requestError.message : "Failed to load account and role data");
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

  const accounts = data?.accounts.items || [];
  const total = data?.accounts.total ?? accounts.length;
  const activeAccounts = useMemo(() => accounts.filter((item) => item.status === "active").length, [accounts]);
  const disabledAccounts = total - activeAccounts;
  const roleSummary = useMemo(() => {
    const counts = new Map<string, number>();
    accounts.forEach((item) => {
      const key = normalizeRole(item.role);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
  }, [accounts]);

  const topRows = useMemo(() => {
    if (mode === "role_management_list" || mode === "role_configuration_form") {
      return roleSummary.map(([role, count]) => ({
        primary: role,
        secondary: `${count} users`,
        status: count > 0 ? "active" : "empty",
        updatedAt: ""
      }));
    }

    return accounts.slice(0, 12).map((item) => ({
      primary: item.username,
      secondary: item.role,
      status: item.status,
      updatedAt: item.updated_at
    }));
  }, [accounts, mode, roleSummary]);

  const refresh = () => {
    setRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <div className="page-grid">
        <section className="panel panel-hero loading">Loading account and role workbench...</section>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="panel panel-hero">
        <h2>{modeTitle[mode]}</h2>
        <p>Operational account posture and role distribution loaded from admin JSON APIs.</p>
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className={degraded || dataMode === "prototype" ? "pill muted" : "pill active"}>
            {dataMode === "prototype" ? "Prototype dataset" : degraded ? "Fallback prototype data" : "Live backend data"}
          </span>
          <span className={data?.registration.allow_registration ? "pill active" : "pill muted"}>
            Registration {data?.registration.allow_registration ? "enabled" : "disabled"}
          </span>
          {data?.authProviders?.auth_providers?.length ? (
            <span className="pill muted">Auth providers: {data.authProviders.auth_providers.join(", ")}</span>
          ) : null}
          <button type="button" onClick={refresh} style={{ borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
        {degraded && error ? <p style={{ marginTop: 0, color: "#f4c9ce", fontSize: "0.78rem" }}>Degraded mode: {error}</p> : null}
        <div className="metric-row">
          <article className="metric-card">
            <span>Total Accounts</span>
            <strong>{total}</strong>
          </article>
          <article className="metric-card">
            <span>Active Accounts</span>
            <strong>{activeAccounts}</strong>
          </article>
          <article className="metric-card">
            <span>Disabled Accounts</span>
            <strong>{disabledAccounts}</strong>
          </article>
          <article className="metric-card">
            <span>Distinct Roles</span>
            <strong>{roleSummary.length}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>
          {mode === "role_management_list" || mode === "role_configuration_form" ? "Role Distribution" : "Account Snapshot"}
        </h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{mode === "role_management_list" || mode === "role_configuration_form" ? "Role" : "Username"}</th>
                <th>{mode === "role_management_list" || mode === "role_configuration_form" ? "Users" : "Role"}</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {topRows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No records returned.</td>
                </tr>
              ) : (
                topRows.map((row, index) => (
                  <tr key={`account-role-row-${index}`}>
                    <td>{row.primary}</td>
                    <td>{row.secondary}</td>
                    <td>{row.status || "N/A"}</td>
                    <td>{row.updatedAt ? formatDateTime(row.updatedAt) : "N/A"}</td>
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
