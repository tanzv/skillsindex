"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { AdminAccountsContent } from "./AdminAccountsContent";
import {
  type AdminAccountsRoute,
  buildAccountsOverview,
  filterAccounts,
  normalizeAccountsPayload,
  normalizeAuthProvidersPayload,
  normalizeAccountStatus,
  normalizeRoleName,
  normalizeRegistrationPayload,
  sortAccountsByUpdatedAt
} from "./model";

export function AdminAccountsPage({ route }: { route: AdminAccountsRoute }) {
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
  const [settingsDraft, setSettingsDraft] = useState({
    allowRegistration: false,
    marketplacePublicAccess: true,
    enabledProviders: [] as string[]
  });

  const accounts = useMemo(() => normalizeAccountsPayload(rawAccounts), [rawAccounts]);
  const registration = useMemo(() => normalizeRegistrationPayload(rawRegistration), [rawRegistration]);
  const authProviders = useMemo(() => normalizeAuthProvidersPayload(rawAuthProviders), [rawAuthProviders]);
  const overview = useMemo(() => buildAccountsOverview(accounts), [accounts]);
  const filteredAccounts = useMemo(
    () => filterAccounts(sortAccountsByUpdatedAt(accounts.items), searchQuery, statusFilter),
    [accounts.items, searchQuery, statusFilter]
  );
  const selectedAccount = useMemo(
    () => filteredAccounts.find((account) => account.id === selectedAccountId) || filteredAccounts[0] || accounts.items[0] || null,
    [accounts.items, filteredAccounts, selectedAccountId]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [accountsPayload, registrationPayload, authProvidersPayload] = await Promise.all([
        clientFetchJSON("/api/bff/admin/accounts"),
        clientFetchJSON("/api/bff/admin/settings/registration"),
        clientFetchJSON("/api/bff/admin/settings/auth-providers")
      ]);
      setRawAccounts(accountsPayload);
      setRawRegistration(registrationPayload);
      setRawAuthProviders(authProvidersPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load account governance.");
      setRawAccounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

    setAccountEditor((current) => ({
      ...current,
      userId: String(selectedAccount.id),
      status: normalizeAccountStatus(selectedAccount.status) === "disabled" ? "disabled" : "active"
    }));
    setRoleEditor((current) => ({
      ...current,
      userId: String(selectedAccount.id),
      role: normalizeRoleName(selectedAccount.role)
    }));
  }, [selectedAccount]);

  async function applyAccountStatus() {
    const userId = Number(accountEditor.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Valid user ID is required.");
      return;
    }
    setBusyAction("apply-status");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/status`, {
        method: "POST",
        body: { status: accountEditor.status }
      });
      setMessage(`Account ${userId} status updated.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update account status.");
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
      setMessage(`Force sign-out requested for user ${userId}.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to force sign-out account.");
    } finally {
      setBusyAction("");
    }
  }

  async function resetPassword() {
    const userId = Number(accountEditor.userId);
    if (!Number.isFinite(userId) || userId <= 0 || !accountEditor.newPassword.trim()) {
      setError("Valid user ID and new password are required.");
      return;
    }
    setBusyAction("reset-password");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/accounts/${userId}/password-reset`, {
        method: "POST",
        body: { new_password: accountEditor.newPassword }
      });
      setMessage(`Password rotated for user ${userId}.`);
      setAccountEditor((current) => ({ ...current, newPassword: "" }));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to reset account password.");
    } finally {
      setBusyAction("");
    }
  }

  async function applyRole() {
    const fallbackUserId = selectedAccount?.id || 0;
    const userId = fallbackUserId > 0 ? fallbackUserId : Number(roleEditor.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Valid user ID is required.");
      return;
    }
    setBusyAction("apply-role");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/users/${userId}/role`, {
        method: "POST",
        body: { role: roleEditor.role }
      });
      setMessage(`Role updated for user ${userId}.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update role.");
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
      setMessage("Provisioning policy updated.");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update provisioning policy.");
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
      onAccountEditorChange={(patch) => setAccountEditor((current) => ({ ...current, ...patch }))}
      onRoleEditorChange={(patch) => setRoleEditor((current) => ({ ...current, ...patch }))}
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
