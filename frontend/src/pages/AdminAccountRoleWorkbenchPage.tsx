import { useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../lib/api";
import {
  AccountStatusFilter,
  applyAccountEdit,
  buildAccountEditMutationRequests,
  buildRoleSummary,
  filterAccounts,
  normalizeAccountStatus,
  normalizeRoleName,
  sortAccountsByUpdatedAt
} from "./AdminAccountRoleWorkbenchPage.helpers";
import AdminAccountEditorModal, { AdminAccountEditorValues } from "./AdminAccountEditorModal";
import AdminAccountRoleWorkbenchTable, { AccountWorkbenchTableRow } from "./AdminAccountRoleWorkbenchTable";
import AdminSubpageSummaryPanel from "./AdminSubpageSummaryPanel";
import { buildAccountRoleWorkbenchFallback } from "./adminWorkbenchFallback";
import { resolvePrototypeDataMode } from "./prototypeDataFallback";

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

const accountStatusFilters: Array<{ value: AccountStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" }
];

function isRoleMode(mode: AdminAccountRoleWorkbenchMode): boolean {
  return mode === "role_management_list" || mode === "role_configuration_form";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>("all");
  const [editableAccounts, setEditableAccounts] = useState<AdminAccountItem[]>([]);
  const [editingAccountID, setEditingAccountID] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSubmitting, setEditorSubmitting] = useState(false);
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, [mode]);

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

  const roleMode = isRoleMode(mode);
  const accounts = data?.accounts.items || [];
  const total = data?.accounts.total ?? editableAccounts.length;
  const loadedAccounts = editableAccounts.length;
  const sortedAccounts = useMemo(() => sortAccountsByUpdatedAt(editableAccounts), [editableAccounts]);
  const filteredAccounts = useMemo(() => {
    if (roleMode) {
      return sortedAccounts;
    }
    return filterAccounts(sortedAccounts, searchQuery, statusFilter);
  }, [roleMode, searchQuery, sortedAccounts, statusFilter]);
  const activeAccounts = useMemo(
    () => editableAccounts.filter((account) => normalizeAccountStatus(account.status) === "active").length,
    [editableAccounts]
  );
  const disabledAccounts = useMemo(
    () => editableAccounts.filter((account) => normalizeAccountStatus(account.status) === "disabled").length,
    [editableAccounts]
  );
  const roleSummary = useMemo(() => buildRoleSummary(editableAccounts), [editableAccounts]);

  useEffect(() => {
    setEditableAccounts(accounts);
  }, [accounts]);

  const topRows = useMemo<AccountWorkbenchTableRow[]>(() => {
    if (roleMode) {
      return roleSummary.map((summary) => ({
        kind: "role",
        primary: summary.role,
        secondary: `${summary.count} accounts`,
        status: summary.count > 0 ? "active" : "disabled",
        updatedAt: ""
      }));
    }

    return filteredAccounts.map((item) => ({
      kind: "account",
      id: item.id,
      primary: item.username,
      secondary: item.role,
      status: item.status,
      updatedAt: item.updated_at
    }));
  }, [filteredAccounts, roleMode, roleSummary]);

  const refresh = () => {
    setRefreshKey((value) => value + 1);
  };

  const editingAccount = useMemo(
    () => editableAccounts.find((account) => account.id === editingAccountID) || null,
    [editableAccounts, editingAccountID]
  );

  function openEditor(accountID: number) {
    setEditorError("");
    setEditingAccountID(accountID);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (editorSubmitting) {
      return;
    }
    setEditorError("");
    setEditorOpen(false);
    setEditingAccountID(null);
  }

  async function submitEditor(values: AdminAccountEditorValues) {
    if (editingAccountID === null || !editingAccount) {
      return;
    }

    setEditorSubmitting(true);
    setEditorError("");
    try {
      const normalizedRole = normalizeRoleName(values.role);
      const normalizedStatus = normalizeAccountStatus(values.status);
      const mutationRequests = buildAccountEditMutationRequests({
        accountID: editingAccountID,
        currentRole: editingAccount.role,
        currentStatus: editingAccount.status,
        nextRole: normalizedRole,
        nextStatus: normalizedStatus
      });
      if (mutationRequests.length === 0) {
        setEditorOpen(false);
        setEditingAccountID(null);
        return;
      }
      await Promise.all(mutationRequests.map((request) => postConsoleJSON(request.path, request.payload)));

      const nextUpdatedAt = new Date().toISOString();
      setEditableAccounts((previousAccounts) =>
        applyAccountEdit(previousAccounts, editingAccountID, {
          username: editingAccount.username,
          role: normalizedRole,
          status: normalizedStatus,
          updatedAtISO: nextUpdatedAt
        })
      );
      setEditorOpen(false);
      setEditingAccountID(null);
    } catch (submissionError) {
      setEditorError(submissionError instanceof Error ? submissionError.message : "Failed to update account settings");
    } finally {
      setEditorSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-grid account-workbench">
        <section className="panel panel-hero loading">Loading account and role workbench...</section>
      </div>
    );
  }

  return (
    <div className="page-grid account-workbench">
      <AdminSubpageSummaryPanel
        title={modeTitle[mode]}
        status={
          <div className="account-workbench-status-strip">
            <span className={degraded || dataMode === "prototype" ? "pill muted" : "pill active"}>
              {dataMode === "prototype" ? "Prototype dataset" : degraded ? "Fallback prototype data" : "Live backend data"}
            </span>
            <span className={data?.registration.allow_registration ? "pill active" : "pill muted"}>
              Registration {data?.registration.allow_registration ? "enabled" : "disabled"}
            </span>
            {data?.authProviders?.auth_providers?.length ? (
              <span className="pill muted">Auth providers: {data.authProviders.auth_providers.join(", ")}</span>
            ) : null}
          </div>
        }
        actions={
          <button type="button" onClick={refresh} className="panel-action-button">
            Refresh
          </button>
        }
        controls={
          !roleMode ? (
            <div className="account-workbench-filter-panel">
              <div className="account-workbench-filter-row">
                <label className="account-workbench-field">
                  <span className="account-workbench-field-label">Search</span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by username, role, or status"
                    className="account-workbench-search-input"
                  />
                </label>
                <div className="account-workbench-field">
                  <span className="account-workbench-field-label">Status</span>
                  <div className="account-workbench-filter-group">
                    {accountStatusFilters.map((filter) => {
                      const selected = statusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setStatusFilter(filter.value)}
                          className={`account-workbench-filter-button${selected ? " is-active" : ""}`}
                          aria-pressed={selected}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="account-workbench-filter-summary">
                Showing {filteredAccounts.length} of {loadedAccounts} loaded accounts
                {total !== loadedAccounts ? ` (total directory size: ${total})` : ""}.
              </p>
            </div>
          ) : null
        }
        notice={degraded && error ? `Degraded mode: ${error}` : undefined}
        metrics={[
          { id: "total-accounts", label: "Total Accounts", value: total },
          { id: "loaded-accounts", label: "Loaded Accounts", value: loadedAccounts },
          { id: "active-accounts", label: "Active Accounts", value: activeAccounts },
          { id: "disabled-accounts", label: "Disabled Accounts", value: disabledAccounts },
          { id: "distinct-roles", label: "Distinct Roles", value: roleSummary.length }
        ]}
      />

      <AdminAccountRoleWorkbenchTable roleMode={roleMode} rows={topRows} onEditAccount={openEditor} />
      <AdminAccountEditorModal
        open={!roleMode && editorOpen}
        submitting={editorSubmitting}
        errorMessage={editorError}
        account={
          editingAccount
            ? {
                id: editingAccount.id,
                username: editingAccount.username,
                role: editingAccount.role,
                status: normalizeAccountStatus(editingAccount.status)
              }
            : null
        }
        onCancel={closeEditor}
        onSubmit={submitEditor}
      />
    </div>
  );
}
