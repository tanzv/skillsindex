import { formatDateTime, statusColorStyle } from "./AdminSecurityPage.helpers";
import type { ApiKeysViewData, ModerationViewData } from "./AdminSecurityPage.types";

interface ApiKeysSectionProps {
  data: ApiKeysViewData;
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
