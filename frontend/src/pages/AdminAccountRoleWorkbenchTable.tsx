import { normalizeAccountStatus, resolveStatusPillClassName } from "./AdminAccountRoleWorkbenchPage.helpers";

export interface AccountWorkbenchTableAccountRow {
  kind: "account";
  id: number;
  primary: string;
  secondary: string;
  status: string;
  updatedAt: string;
}

export interface AccountWorkbenchTableRoleRow {
  kind: "role";
  primary: string;
  secondary: string;
  status: string;
  updatedAt: string;
}

export type AccountWorkbenchTableRow = AccountWorkbenchTableAccountRow | AccountWorkbenchTableRoleRow;

interface AdminAccountRoleWorkbenchTableProps {
  roleMode: boolean;
  rows: AccountWorkbenchTableRow[];
  onEditAccount: (accountID: number) => void;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleString();
}

export default function AdminAccountRoleWorkbenchTable({ roleMode, rows, onEditAccount }: AdminAccountRoleWorkbenchTableProps) {
  return (
    <section className="panel">
      <h3 className="account-workbench-table-heading">{roleMode ? "Role Distribution" : "Account Snapshot"}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{roleMode ? "Role" : "Username"}</th>
              <th>{roleMode ? "Users" : "Role"}</th>
              <th>Status</th>
              <th>Updated</th>
              {!roleMode ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={roleMode ? 4 : 5} className="account-workbench-empty-row">
                  {roleMode
                    ? "No roles are currently available."
                    : "No account records match the active filters."}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`account-role-row-${row.primary}-${index}`}>
                  <td>{row.primary}</td>
                  <td>{row.secondary}</td>
                  <td>
                    <span className={`${resolveStatusPillClassName(row.status)} account-workbench-table-status`}>
                      {normalizeAccountStatus(row.status)}
                    </span>
                  </td>
                  <td>{row.updatedAt ? formatDateTime(row.updatedAt) : "N/A"}</td>
                  {!roleMode ? (
                    <td>
                      {row.kind === "account" ? (
                        <button
                          type="button"
                          onClick={() => onEditAccount(row.id)}
                          className="account-workbench-action-button"
                          aria-label={`Edit ${row.primary}`}
                        >
                          Edit
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
