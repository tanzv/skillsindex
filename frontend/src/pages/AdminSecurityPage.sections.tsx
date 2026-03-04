import { formatDateTime, statusColorStyle } from "./AdminSecurityPage.helpers";
import type { AccessViewData, ApiKeysViewData, ModerationViewData } from "./AdminSecurityPage.types";

interface ApiKeysSectionProps {
  data: ApiKeysViewData;
}

interface AccessPolicySectionProps {
  data: AccessViewData;
}

interface AccessAccountsSectionProps {
  data: AccessViewData;
}

interface ModerationSectionProps {
  data: ModerationViewData;
}

export function ApiKeysSection({ data }: ApiKeysSectionProps): JSX.Element {
  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3>API Key Inventory</h3>
        <span className="pill muted">{data.items.length} rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Scopes</th>
              <th>Expires</th>
              <th>Last Used</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.ownerUsername}</td>
                <td>
                  <span className="pill" style={statusColorStyle(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td>{item.scopes.length > 0 ? item.scopes.join(", ") : "-"}</td>
                <td>{formatDateTime(item.expiresAt)}</td>
                <td>{formatDateTime(item.lastUsedAt)}</td>
                <td>{formatDateTime(item.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AccessPolicySection({ data }: AccessPolicySectionProps): JSX.Element {
  return (
    <section className="panel" style={{ display: "grid", gap: 12 }}>
      <h3 style={{ marginBottom: 0 }}>Policy Snapshot</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span className={data.allowRegistration ? "pill active" : "pill muted"}>
          Registration {data.allowRegistration ? "Enabled" : "Disabled"}
        </span>
        <span className="pill muted">Auth Providers: {data.enabledProviders.length}</span>
      </div>
      <div>
        <strong style={{ display: "block", marginBottom: 8 }}>Enabled Providers</strong>
        {data.enabledProviders.length === 0 ? (
          <span className="pill muted">No provider enabled</span>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.enabledProviders.map((provider) => (
              <span className="pill active" key={`enabled-${provider}`}>
                {provider}
              </span>
            ))}
          </div>
        )}
      </div>
      {data.availableProviders.length > 0 ? (
        <p style={{ margin: 0, color: "var(--text-soft)" }}>Available providers: {data.availableProviders.join(", ")}</p>
      ) : null}
    </section>
  );
}

export function AccessAccountsSection({ data }: AccessAccountsSectionProps): JSX.Element {
  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3>Account List</h3>
        <span className="pill muted">{data.accounts.length} rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Force Sign-out At</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.username}</td>
                <td>{account.role}</td>
                <td>
                  <span className="pill" style={statusColorStyle(account.status)}>
                    {account.status}
                  </span>
                </td>
                <td>{formatDateTime(account.forceLogoutAt)}</td>
                <td>{formatDateTime(account.createdAt)}</td>
                <td>{formatDateTime(account.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ModerationSection({ data }: ModerationSectionProps): JSX.Element {
  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3>Moderation Case Queue</h3>
        <span className="pill muted">{data.items.length} rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Target</th>
              <th>Reason Code</th>
              <th>Reason Detail</th>
              <th>Status</th>
              <th>Action</th>
              <th>Created</th>
              <th>Resolved</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.targetType}</td>
                <td>{item.reasonCode}</td>
                <td>{item.reasonDetail || "-"}</td>
                <td>
                  <span className="pill" style={statusColorStyle(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td>{item.action}</td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>{formatDateTime(item.resolvedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
