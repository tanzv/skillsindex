"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AdminEmptyBlock,
  AdminFilterBar,
  AdminInsetBlock,
  AdminMetaChipList,
  AdminPageScaffold,
  AdminRecordCard,
  AdminSectionCard,
  AdminToggleField
} from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveAccountRoleLabel, resolveAccountStatusLabel, resolveAccountUsernameLabel } from "@/src/lib/accountDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { formatDateTime } from "../adminGovernance/shared";

import { buildAccessOverview, buildAdminAccessGovernanceData } from "./model";

export function AdminAccessPage() {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const accessMessages = messages.adminAccess;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [accounts, registration, authProviders] = await Promise.all([
        clientFetchJSON("/api/bff/admin/accounts"),
        clientFetchJSON("/api/bff/admin/settings/registration"),
        clientFetchJSON("/api/bff/admin/settings/auth-providers")
      ]);
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

  useEffect(() => {
    setSettingsDraft({
      allowRegistration: data.allowRegistration,
      marketplacePublicAccess: data.marketplacePublicAccess,
      enabledProviders: [...data.enabledProviders]
    });
  }, [data.allowRegistration, data.enabledProviders, data.marketplacePublicAccess]);

  async function saveAccessSettings() {
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
          body: {
            auth_providers: settingsDraft.enabledProviders
          }
        })
      ]);
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

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={accessMessages.pageTitle}
      description={accessMessages.pageDescription}
      actions={<Button onClick={() => void loadData()}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      metrics={overview.metrics}
      error={error}
      message={message}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <AdminSectionCard title={accessMessages.directoryTitle} description={accessMessages.directoryDescription}>
              <AdminFilterBar className="md:grid-cols-[1fr_auto]">
                <Input
                  aria-label={accessMessages.searchLabel}
                  value={keyword}
                  placeholder={accessMessages.searchPlaceholder}
                  onChange={(event) => setKeyword(event.target.value)}
                />
                <Button variant="outline" onClick={() => setKeyword("")}>
                  {commonMessages.clear}
                </Button>
              </AdminFilterBar>

              <div className="space-y-3">
                {filteredAccounts.map((account) => (
                  <AdminRecordCard key={account.id} data-testid={`admin-access-account-${account.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                            {resolveAccountUsernameLabel(account.username, accessMessages)} #{account.id}
                          </span>
                          <Badge variant={account.status.toLowerCase() === "active" ? "soft" : "outline"}>
                            {resolveAccountStatusLabel(account.status, accessMessages)}
                          </Badge>
                          <Badge variant="outline">{resolveAccountRoleLabel(account.role, accessMessages)}</Badge>
                        </div>
                        <AdminMetaChipList
                          items={[
                            `${accessMessages.createdPrefix} ${formatDateTime(account.createdAt, locale, accessMessages.notAvailable)}`,
                            `${accessMessages.updatedPrefix} ${formatDateTime(account.updatedAt, locale, accessMessages.notAvailable)}`,
                            ...(account.forceLogoutAt
                              ? [
                                  `${accessMessages.forceSignOutPrefix} ${formatDateTime(
                                    account.forceLogoutAt,
                                    locale,
                                    accessMessages.notAvailable
                                  )}`
                                ]
                              : [])
                          ]}
                        />
                      </div>
                    </div>
                  </AdminRecordCard>
                ))}

                {!filteredAccounts.length && !loading ? (
                  <AdminEmptyBlock>{accessMessages.directoryEmpty}</AdminEmptyBlock>
                ) : null}
              </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard title={accessMessages.policyTitle} description={accessMessages.policyDescription}>
              <AdminToggleField
                ariaLabel={accessMessages.allowRegistrationLabel}
                label={accessMessages.allowRegistrationLabel}
                checked={settingsDraft.allowRegistration}
                onChange={(checked) => setSettingsDraft((current) => ({ ...current, allowRegistration: checked }))}
              />
              <AdminToggleField
                ariaLabel={accessMessages.marketplacePublicAccessLabel}
                label={accessMessages.marketplacePublicAccessLabel}
                checked={settingsDraft.marketplacePublicAccess}
                onChange={(checked) => setSettingsDraft((current) => ({ ...current, marketplacePublicAccess: checked }))}
              />
              <Button onClick={() => void saveAccessSettings()} disabled={Boolean(busyAction)}>
                {busyAction === "save-settings" ? accessMessages.savingAction : accessMessages.saveAction}
              </Button>
          </AdminSectionCard>

          <AdminSectionCard
            title={accessMessages.providersTitle}
            description={accessMessages.providersDescription}
            contentClassName="space-y-3"
          >
              {data.availableProviders.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-secondary)]"
                >
                  <input
                    aria-label={formatProtectedMessage(accessMessages.providerAriaLabel, { provider })}
                    type="checkbox"
                    checked={settingsDraft.enabledProviders.includes(provider)}
                    onChange={() => toggleProvider(provider)}
                  />
                  <span>{provider}</span>
                </label>
              ))}
          </AdminSectionCard>

          <AdminSectionCard
            title={accessMessages.snapshotTitle}
            description={accessMessages.snapshotDescription}
            contentClassName="space-y-3"
          >
              <div className="flex flex-wrap gap-2">
                <Badge variant={data.allowRegistration ? "soft" : "outline"}>
                  {data.allowRegistration ? accessMessages.registrationEnabled : accessMessages.registrationDisabled}
                </Badge>
                <Badge variant={data.marketplacePublicAccess ? "soft" : "outline"}>
                  {data.marketplacePublicAccess ? accessMessages.marketplacePublic : accessMessages.marketplacePrivate}
                </Badge>
                {data.enabledProviders.map((provider) => (
                  <Badge key={provider} variant="outline">
                    {provider}
                  </Badge>
                ))}
              </div>
              <AdminInsetBlock>
                {accessMessages.availableProvidersLabel}
                <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
                  {data.availableProviders.length ? data.availableProviders.join(", ") : accessMessages.notAvailable}
                </div>
              </AdminInsetBlock>
          </AdminSectionCard>

          <AdminSectionCard
            title={accessMessages.roleSummaryTitle}
            description={accessMessages.roleSummaryDescription}
            contentClassName="space-y-3"
          >
              {overview.roleSummary.map((item) => (
                <AdminInsetBlock key={item.role} className="flex items-center justify-between">
                  <span className="text-sm text-[color:var(--ui-text-secondary)]">
                    {resolveAccountRoleLabel(item.role, accessMessages)}
                  </span>
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
                </AdminInsetBlock>
              ))}
          </AdminSectionCard>
        </div>
      </div>
    </AdminPageScaffold>
  );
}
