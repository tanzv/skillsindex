"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { loadAdminAccessSettingsPayloads, saveAdminAccessSettings } from "@/src/lib/api/adminAccessSettings";

import { AdminAccessContent } from "./AdminAccessContent";
import { buildAccessOverview, buildAdminAccessGovernanceData, resolveSelectedAccessAccount } from "./model";

export function AdminAccessPage() {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [rawAccounts, setRawAccounts] = useState<unknown>(null);
  const [rawRegistration, setRawRegistration] = useState<unknown>(null);
  const [rawAuthProviders, setRawAuthProviders] = useState<unknown>(null);
  const [settingsDraft, setSettingsDraft] = useState({
    allowRegistration: false,
    marketplacePublicAccess: false,
    enabledProviders: [] as string[]
  });

  const data = useMemo(
    () =>
      buildAdminAccessGovernanceData({
        accounts: rawAccounts,
        registration: rawRegistration,
        authProviders: rawAuthProviders
      }),
    [rawAccounts, rawAuthProviders, rawRegistration]
  );
  const overview = useMemo(
    () =>
      buildAccessOverview(data, {
        accounts: accessMessages.metricAccounts,
        disabled: accessMessages.metricDisabled,
        enabledProviders: accessMessages.metricEnabledProviders,
        pendingSignOut: accessMessages.metricPendingSignOut
      }),
    [
      accessMessages.metricAccounts,
      accessMessages.metricDisabled,
      accessMessages.metricEnabledProviders,
      accessMessages.metricPendingSignOut,
      data
    ]
  );

  const filteredAccounts = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) {
      return data.accounts;
    }
    return data.accounts.filter((item) => [item.username, item.role, item.status, String(item.id)].some((value) => value.toLowerCase().includes(search)));
  }, [data.accounts, keyword]);
  const selectedAccount = useMemo(
    () => resolveSelectedAccessAccount(data.accounts, selectedAccountId),
    [data.accounts, selectedAccountId]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { accounts, registration, authProviders } = await loadAdminAccessSettingsPayloads();
      setRawAccounts(accounts);
      setRawRegistration(registration);
      setRawAuthProviders(authProviders);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : accessMessages.loadError);
      setRawAccounts(null);
      setRawRegistration(null);
      setRawAuthProviders(null);
    } finally {
      setLoading(false);
    }
  }, [accessMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({
    loading,
    error,
    hasData: rawAccounts !== null && rawRegistration !== null && rawAuthProviders !== null
  });

  useEffect(() => {
    setSettingsDraft({
      allowRegistration: data.allowRegistration,
      marketplacePublicAccess: data.marketplacePublicAccess,
      enabledProviders: [...data.enabledProviders]
    });
  }, [data.allowRegistration, data.enabledProviders, data.marketplacePublicAccess]);

  useEffect(() => {
    if (selectedAccountId !== null && !selectedAccount) {
      setSelectedAccountId(null);
      setAccountDrawerOpen(false);
    }
  }, [selectedAccount, selectedAccountId]);

  async function saveAccessSettings() {
    setBusyAction("save-settings");
    setError("");
    setMessage("");
    try {
      await saveAdminAccessSettings(settingsDraft);
      setMessage(accessMessages.saveSuccess);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accessMessages.saveError);
    } finally {
      setBusyAction("");
    }
  }

  function toggleProvider(provider: string) {
    setSettingsDraft((current) => ({
      ...current,
      enabledProviders: current.enabledProviders.includes(provider)
        ? current.enabledProviders.filter((item) => item !== provider)
        : [...current.enabledProviders, provider]
    }));
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={accessMessages.pageTitle}
        description={accessMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminAccessContent
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      keyword={keyword}
      data={data}
      overview={overview}
      filteredAccounts={filteredAccounts}
      selectedAccount={selectedAccount}
      policyDrawerOpen={policyDrawerOpen}
      accountDrawerOpen={accountDrawerOpen}
      settingsDraft={settingsDraft}
      onRefresh={() => void loadData()}
      onKeywordChange={setKeyword}
      onClearKeyword={() => setKeyword("")}
      onOpenPolicyDrawer={() => setPolicyDrawerOpen(true)}
      onClosePolicyDrawer={() => setPolicyDrawerOpen(false)}
      onOpenAccountDrawer={(accountId) => {
        setSelectedAccountId(accountId);
        setAccountDrawerOpen(true);
      }}
      onCloseAccountDrawer={() => setAccountDrawerOpen(false)}
      onToggleProvider={toggleProvider}
      onSettingsDraftChange={(patch) => setSettingsDraft((current) => ({ ...current, ...patch }))}
      onSavePolicy={() => void saveAccessSettings()}
    />
  );
}
