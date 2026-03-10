import { type FormEvent, useEffect, useMemo, useState } from "react";

import { postConsoleJSON } from "../../lib/api";
import type { AdminAccountRoleWorkbenchMode } from "./AdminAccountRoleWorkbenchPage.types";
import {
  type AccountStatusFilter,
  applyAccountEdit,
  buildAccountEditMutationRequests,
  buildRoleSummary,
  filterAccounts,
  normalizeAccountStatus,
  normalizeRoleName,
  sortAccountsByUpdatedAt
} from "./AdminAccountRoleWorkbenchPage.helpers";
import type { AdminAccountEditorValues } from "./AdminAccountEditorModal";
import type { AccountWorkbenchTableRow } from "./AdminAccountRoleWorkbenchTable";
import { buildAccountRoleWorkbenchFallback } from "../adminWorkbench/adminWorkbenchFallback";
import { resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import {
  type AccountRoleWorkbenchData,
  type AdminAccountItem,
  defaultRoleOptions,
  dedupeStringList,
  fetchAccountRoleWorkbenchData,
  isRoleMode,
  resolveAuthProviderDraft
} from "./adminAccountRoleWorkbench.config";

export function useAdminAccountRoleWorkbenchController(mode: AdminAccountRoleWorkbenchMode) {
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
  const [forceSignoutPendingID, setForceSignoutPendingID] = useState<number | null>(null);
  const [tableActionError, setTableActionError] = useState("");
  const [tableActionSuccess, setTableActionSuccess] = useState("");
  const [allowRegistrationDraft, setAllowRegistrationDraft] = useState(false);
  const [enabledAuthProvidersDraft, setEnabledAuthProvidersDraft] = useState<string[]>([]);
  const [availableAuthProviders, setAvailableAuthProviders] = useState<string[]>([]);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [roleAssignmentUserID, setRoleAssignmentUserID] = useState("");
  const [roleAssignmentRole, setRoleAssignmentRole] = useState("member");
  const [roleAssignmentSubmitting, setRoleAssignmentSubmitting] = useState(false);
  const [roleAssignmentError, setRoleAssignmentError] = useState("");
  const [roleAssignmentSuccess, setRoleAssignmentSuccess] = useState("");
  const roleMode = isRoleMode(mode);
  const isAccountManagementMode = mode === "account_management_list";
  const isAccountConfigurationMode = mode === "account_configuration_form";
  const isRoleManagementMode = mode === "role_management_list";
  const isRoleConfigurationMode = mode === "role_configuration_form";

  useEffect(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setTableActionError("");
    setTableActionSuccess("");
    setSettingsError("");
    setSettingsSuccess("");
    setRoleAssignmentError("");
    setRoleAssignmentSuccess("");
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
  const roleOptions = useMemo(
    () => dedupeStringList([...defaultRoleOptions, ...roleSummary.map((summary) => summary.role)]),
    [roleSummary]
  );

  useEffect(() => {
    setEditableAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    if (!data) {
      return;
    }
    setAllowRegistrationDraft(Boolean(data.registration.allow_registration));
    const providers = resolveAuthProviderDraft(data.authProviders);
    setAvailableAuthProviders(providers.available);
    setEnabledAuthProvidersDraft(providers.enabled);
  }, [data]);

  useEffect(() => {
    if (roleOptions.length === 0) {
      return;
    }
    if (!roleOptions.includes(roleAssignmentRole)) {
      setRoleAssignmentRole(roleOptions[0]);
    }
  }, [roleAssignmentRole, roleOptions]);

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

  const editingAccount = useMemo(
    () => editableAccounts.find((account) => account.id === editingAccountID) || null,
    [editableAccounts, editingAccountID]
  );
  const roleAssignmentPreview = useMemo(() => {
    const userID = Number.parseInt(roleAssignmentUserID, 10);
    if (!Number.isInteger(userID) || userID <= 0) {
      return null;
    }
    return editableAccounts.find((account) => account.id === userID) || null;
  }, [editableAccounts, roleAssignmentUserID]);

  function refresh(): void {
    setRefreshKey((value) => value + 1);
  }

  function openEditor(accountID: number): void {
    setEditorError("");
    setEditingAccountID(accountID);
    setEditorOpen(true);
  }

  function closeEditor(): void {
    if (editorSubmitting) {
      return;
    }
    setEditorError("");
    setEditorOpen(false);
    setEditingAccountID(null);
  }

  async function submitEditor(values: AdminAccountEditorValues): Promise<void> {
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

  function toggleAuthProvider(provider: string): void {
    setEnabledAuthProvidersDraft((previousProviders) => {
      if (previousProviders.includes(provider)) {
        return previousProviders.filter((item) => item !== provider);
      }
      return dedupeStringList([...previousProviders, provider]);
    });
  }

  function resetAccessPolicyDraft(): void {
    if (!data) {
      return;
    }
    setAllowRegistrationDraft(Boolean(data.registration.allow_registration));
    const providers = resolveAuthProviderDraft(data.authProviders);
    setAvailableAuthProviders(providers.available);
    setEnabledAuthProvidersDraft(providers.enabled);
    setSettingsError("");
    setSettingsSuccess("");
  }

  async function submitAccessPolicySettings(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSettingsSubmitting(true);
    setSettingsError("");
    setSettingsSuccess("");
    try {
      const sanitizedProviders = enabledAuthProvidersDraft.filter((provider) => availableAuthProviders.includes(provider));
      await Promise.all([
        postConsoleJSON("/api/v1/admin/settings/registration", {
          allow_registration: allowRegistrationDraft
        }),
        postConsoleJSON("/api/v1/admin/settings/auth-providers", {
          auth_providers: sanitizedProviders
        })
      ]);
      setSettingsSuccess("Access settings updated.");
      setRefreshKey((current) => current + 1);
    } catch (submissionError) {
      setSettingsError(submissionError instanceof Error ? submissionError.message : "Failed to update access settings");
    } finally {
      setSettingsSubmitting(false);
    }
  }

  async function handleForceSignout(accountID: number): Promise<void> {
    setForceSignoutPendingID(accountID);
    setTableActionError("");
    setTableActionSuccess("");
    try {
      await postConsoleJSON(`/api/v1/admin/accounts/${accountID}/force-signout`);
      setTableActionSuccess(`Forced sign-out completed for account #${accountID}.`);
    } catch (actionError) {
      setTableActionError(actionError instanceof Error ? actionError.message : "Failed to force account sign-out");
    } finally {
      setForceSignoutPendingID(null);
    }
  }

  async function submitRoleAssignment(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const userID = Number.parseInt(roleAssignmentUserID, 10);
    const role = normalizeRoleName(roleAssignmentRole);
    if (!Number.isInteger(userID) || userID <= 0) {
      setRoleAssignmentError("A valid numeric user ID is required.");
      setRoleAssignmentSuccess("");
      return;
    }
    if (!role) {
      setRoleAssignmentError("Role cannot be empty.");
      setRoleAssignmentSuccess("");
      return;
    }
    setRoleAssignmentSubmitting(true);
    setRoleAssignmentError("");
    setRoleAssignmentSuccess("");
    try {
      await postConsoleJSON(`/api/v1/admin/users/${userID}/role`, { role });
      const updatedAtISO = new Date().toISOString();
      setEditableAccounts((previousAccounts) =>
        previousAccounts.map((account) =>
          account.id === userID
            ? {
                ...account,
                role,
                updated_at: updatedAtISO
              }
            : account
        )
      );
      setRoleAssignmentSuccess(`Role assignment updated for user #${userID}.`);
      setRoleAssignmentUserID("");
      setRefreshKey((current) => current + 1);
    } catch (submissionError) {
      setRoleAssignmentError(submissionError instanceof Error ? submissionError.message : "Failed to update user role");
    } finally {
      setRoleAssignmentSubmitting(false);
    }
  }

  return {
    dataMode, data, loading, error, degraded, roleMode, isAccountManagementMode, isAccountConfigurationMode,
    isRoleManagementMode, isRoleConfigurationMode, searchQuery, statusFilter, filteredAccounts, loadedAccounts, total,
    activeAccounts, disabledAccounts, roleSummary, topRows, editingAccount, editorOpen, editorSubmitting, editorError,
    forceSignoutPendingID, tableActionError, tableActionSuccess, allowRegistrationDraft, availableAuthProviders,
    enabledAuthProvidersDraft, settingsSubmitting, settingsError, settingsSuccess, roleAssignmentUserID, roleAssignmentRole,
    roleOptions, roleAssignmentSubmitting, roleAssignmentError, roleAssignmentSuccess, roleAssignmentPreview, refresh,
    openEditor, closeEditor, submitEditor, setSearchQuery, setStatusFilter, setAllowRegistrationDraft, toggleAuthProvider,
    resetAccessPolicyDraft, submitAccessPolicySettings, handleForceSignout, setRoleAssignmentUserID, setRoleAssignmentRole,
    submitRoleAssignment
  };
}
