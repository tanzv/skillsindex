"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { AdminAccountsContent } from "./AdminAccountsContent";
import {
  type AdminAccountsRoute,
  buildAccountsOverview,
  filterAccounts,
  normalizeAccountsPayload,
  normalizeAuthProvidersPayload,
  normalizeAccountStatus,
  normalizeRoleName,
  resolveRoleTargetUserId,
  normalizeRegistrationPayload,
  sortAccountsByUpdatedAt
} from "./model";

export function AdminAccountsPage({ route }: { route: AdminAccountsRoute }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  const latestLoadRequestRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [rawAccounts, setRawAccounts] = useState<unknown>(null);
  const [rawRegistration, setRawRegistration] = useState<unknown>(null);
  const [rawAuthProviders, setRawAuthProviders] = useState<unknown>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [accountEditor, setAccountEditor] = useState({ userId: "", status: "active", newPassword: "" });
  const [roleEditor, setRoleEditor] = useState({ userId: "", role: "member" });
  const accountEditorRef = useRef(accountEditor);
  const roleEditorRef = useRef(roleEditor);
  const [settingsDraft, setSettingsDraft] = useState({
    allowRegistration: false,
    marketplacePublicAccess: true,
    enabledProviders: [] as string[]
  });

  const accounts = useMemo(() => normalizeAccountsPayload(rawAccounts), [rawAccounts]);
  const registration = useMemo(() => normalizeRegistrationPayload(rawRegistration), [rawRegistration]);
  const authProviders = useMemo(() => normalizeAuthProvidersPayload(rawAuthProviders), [rawAuthProviders]);
  const overview = useMemo(
    () =>
      buildAccountsOverview(accounts, {
        totalAccounts: accountMessages.metricTotalAccounts,
        loadedAccounts: accountMessages.metricLoadedAccounts,
        activeAccounts: accountMessages.metricActiveAccounts,
        disabledAccounts: accountMessages.metricDisabledAccounts
      }),
    [
      accountMessages.metricActiveAccounts,
      accountMessages.metricDisabledAccounts,
      accountMessages.metricLoadedAccounts,
      accountMessages.metricTotalAccounts,
      accounts
    ]
  );
  const filteredAccounts = useMemo(
    () => filterAccounts(sortAccountsByUpdatedAt(accounts.items), searchQuery, statusFilter),
    [accounts.items, searchQuery, statusFilter]
  );
  const selectedAccount = useMemo(
    () => filteredAccounts.find((account) => account.id === selectedAccountId) || filteredAccounts[0] || accounts.items[0] || null,
    [accounts.items, filteredAccounts, selectedAccountId]
  );

  const loadData = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    try {
      const [accountsPayload, registrationPayload, authProvidersPayload] = await Promise.all([
        clientFetchJSON("/api/bff/admin/accounts"),
        clientFetchJSON("/api/bff/admin/settings/registration"),
        clientFetchJSON("/api/bff/admin/settings/auth-providers")
      ]);
      if (requestId !== latestLoadRequestRef.current) {
        return;
      }
      setRawAccounts(accountsPayload);
      setRawRegistration(registrationPayload);
      setRawAuthProviders(authProvidersPayload);
    } catch (loadError) {
      if (requestId !== latestLoadRequestRef.current) {
        return;
      }
      setError(loadError instanceof Error ? loadError.message : accountMessages.loadError);
      setRawAccounts(null);
    } finally {
      if (requestId === latestLoadRequestRef.current) {
        setLoading(false);
      }
    }
  }, [accountMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData, route]);

  useEffect(() => {
    setSettingsDraft({
      allowRegistration: registration.allowRegistration,
      marketplacePublicAccess: registration.marketplacePublicAccess,
      enabledProviders: [...authProviders.authProviders]
    });
  }, [authProviders.authProviders, registration.allowRegistration, registration.marketplacePublicAccess]);

  useEffect(() => {
    if (!selectedAccount) {
      setSelectedAccountId(null);
      return;
    }

    setSelectedAccountId((current) => (current === selectedAccount.id ? current : selectedAccount.id));
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const nextUserId = String(selectedAccount.id);
    const nextStatus = normalizeAccountStatus(selectedAccount.status) === "disabled" ? "disabled" : "active";
    const nextRole = normalizeRoleName(selectedAccount.role);

    if (accountEditorRef.current.userId !== nextUserId) {
      const nextAccountEditor = {
        ...accountEditorRef.current,
        userId: nextUserId,
        status: nextStatus
      };
      accountEditorRef.current = nextAccountEditor;
      setAccountEditor(nextAccountEditor);
    }

    if (roleEditorRef.current.userId !== nextUserId) {
      const nextRoleEditor = {
        ...roleEditorRef.current,
        userId: nextUserId,
        role: nextRole
      };
      roleEditorRef.current = nextRoleEditor;
      setRoleEditor(nextRoleEditor);
    }
  }, [selectedAccount]);

  function updateAccountEditor(patch: Partial<typeof accountEditor>) {
    const nextAccountEditor = { ...accountEditorRef.current, ...patch };
    accountEditorRef.current = nextAccountEditor;
    setAccountEditor(nextAccountEditor);
  }

  function updateRoleEditor(patch: Partial<typeof roleEditor>) {
    const nextRoleEditor = { ...roleEditorRef.current, ...patch };
    roleEditorRef.current = nextRoleEditor;
    setRoleEditor(nextRoleEditor);
  }

  async function applyAccountStatus() {
    const { userId: draftUserId, status } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError(accountMessages.invalidUserIdError);
      return;
    }
    setBusyAction("apply-status");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/status`, {
        method: "POST",
        body: { status }
      });
      setMessage(formatProtectedMessage(accountMessages.applyStatusSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.applyStatusError);
    } finally {
      setBusyAction("");
    }
  }

  async function forceSignout(userId: number) {
    setBusyAction(`force-signout-${userId}`);
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/force-signout`, { method: "POST" });
      setMessage(formatProtectedMessage(accountMessages.forceSignOutSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.forceSignOutError);
    } finally {
      setBusyAction("");
    }
  }

  async function resetPassword() {
    const { userId: draftUserId, newPassword } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0 || !newPassword.trim()) {
      setError(accountMessages.invalidPasswordError);
      return;
    }
    setBusyAction("reset-password");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/password-reset`, {
        method: "POST",
        body: { new_password: newPassword }
      });
      setMessage(formatProtectedMessage(accountMessages.resetPasswordSuccess, { userId }));
      updateAccountEditor({ newPassword: "" });
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.resetPasswordError);
    } finally {
      setBusyAction("");
    }
  }

  async function applyRole() {
    const { userId: draftUserId, role } = roleEditor;
    const userId = resolveRoleTargetUserId(draftUserId, selectedAccount?.id ?? null);
    if (userId === null) {
      setError(accountMessages.invalidUserIdError);
      return;
    }
    setBusyAction("apply-role");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/users/${userId}/role`, {
        method: "POST",
        body: { role }
      });
      setMessage(formatProtectedMessage(accountMessages.applyRoleSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.applyRoleError);
    } finally {
      setBusyAction("");
    }
  }

  async function saveSettings() {
    setBusyAction("save-settings");
    setError("");
    setMessage("");
    try {
      await Promise.all([
        clientFetchJSON("/api/bff/admin/settings/registration", {
          method: "POST",
          body: {
            allow_registration: settingsDraft.allowRegistration,
            marketplace_public_access: settingsDraft.marketplacePublicAccess
          }
        }),
        clientFetchJSON("/api/bff/admin/settings/auth-providers", {
          method: "POST",
          body: { auth_providers: settingsDraft.enabledProviders }
        })
      ]);
      setMessage(accountMessages.saveSettingsSuccess);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.saveSettingsError);
    } finally {
      setBusyAction("");
    }
  }

  return (
    <AdminAccountsContent
      route={route}
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      metrics={overview.metrics}
      accounts={filteredAccounts}
      selectedAccount={selectedAccount}
      registration={registration}
      authProviders={authProviders}
      roleSummary={overview.roleSummary}
      accountEditor={accountEditor}
      roleEditor={roleEditor}
      settingsDraft={settingsDraft}
      onRefresh={() => void loadData()}
      onSelectAccount={(accountId) => setSelectedAccountId(accountId)}
      onSearchQueryChange={setSearchQuery}
      onStatusFilterChange={(value) => setStatusFilter(value as "all" | "active" | "disabled")}
      onAccountEditorChange={updateAccountEditor}
      onRoleEditorChange={updateRoleEditor}
      onSettingsDraftChange={(patch) => setSettingsDraft((current) => ({ ...current, ...patch }))}
      onToggleProvider={(provider) =>
        setSettingsDraft((current) => ({
          ...current,
          enabledProviders: current.enabledProviders.includes(provider)
            ? current.enabledProviders.filter((item) => item !== provider)
            : [...current.enabledProviders, provider]
        }))
      }
      onApplyAccountStatus={() => void applyAccountStatus()}
      onForceSignout={(userId) => void forceSignout(userId)}
      onResetPassword={() => void resetPassword()}
      onApplyRole={() => void applyRole()}
      onSaveSettings={() => void saveSettings()}
    />
  );
}
