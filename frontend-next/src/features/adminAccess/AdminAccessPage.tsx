"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { formatDateTime } from "../adminGovernance/shared";

import { buildAccessOverview, buildAdminAccessGovernanceData } from "./model";

export function AdminAccessPage() {
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
  const overview = useMemo(() => buildAccessOverview(data), [data]);

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
      setError(loadError instanceof Error ? loadError.message : "Failed to load access governance.");
      setRawAccounts(null);
      setRawRegistration(null);
      setRawAuthProviders(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setMessage("Access policy updated.");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update access policy.");
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Access"
        description="Inspect account status, registration posture, and enabled authentication providers from a dedicated governance page."
        actions={<Button onClick={() => void loadData()}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Directory</CardTitle>
              <CardDescription>Search by username, role, or status before reviewing account risk signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input aria-label="Search accounts" value={keyword} placeholder="Search accounts" onChange={(event) => setKeyword(event.target.value)} />
                <Button variant="outline" onClick={() => setKeyword("")}>
                  Clear
                </Button>
              </div>

              {error ? <ErrorState description={error} /> : null}

              <div className="space-y-3">
                {filteredAccounts.map((account) => (
                  <div key={account.id} data-testid={`admin-access-account-${account.id}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">
                            {account.username} #{account.id}
                          </span>
                          <Badge variant={account.status.toLowerCase() === "active" ? "soft" : "outline"}>{account.status}</Badge>
                          <Badge variant="outline">{account.role}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">created {formatDateTime(account.createdAt)}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">updated {formatDateTime(account.updatedAt)}</span>
                          {account.forceLogoutAt ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                              force sign-out {formatDateTime(account.forceLogoutAt)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredAccounts.length && !loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No accounts matched the current filter.</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Policy</CardTitle>
              <CardDescription>Update registration posture and marketplace exposure from the same page used to inspect account risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  aria-label="Allow registration"
                  type="checkbox"
                  checked={settingsDraft.allowRegistration}
                  onChange={(event) => setSettingsDraft((current) => ({ ...current, allowRegistration: event.target.checked }))}
                />
                <span>Allow registration</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  aria-label="Marketplace public access"
                  type="checkbox"
                  checked={settingsDraft.marketplacePublicAccess}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({ ...current, marketplacePublicAccess: event.target.checked }))
                  }
                />
                <span>Marketplace public access</span>
              </label>
              <Button onClick={() => void saveAccessSettings()} disabled={Boolean(busyAction)}>
                {busyAction === "save-settings" ? "Saving..." : "Save Access Policy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auth Providers</CardTitle>
              <CardDescription>Keep sign-in providers visible and aligned with the current access contract.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.availableProviders.map((provider) => (
                <label key={provider} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    aria-label={`Provider ${provider}`}
                    type="checkbox"
                    checked={settingsDraft.enabledProviders.includes(provider)}
                    onChange={() => toggleProvider(provider)}
                  />
                  <span>{provider}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Snapshot</CardTitle>
              <CardDescription>Registration posture and provider availability across the current admin perimeter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={data.allowRegistration ? "soft" : "outline"}>
                  Registration {data.allowRegistration ? "enabled" : "disabled"}
                </Badge>
                <Badge variant={data.marketplacePublicAccess ? "soft" : "outline"}>
                  Marketplace {data.marketplacePublicAccess ? "public" : "private"}
                </Badge>
                {data.enabledProviders.map((provider) => (
                  <Badge key={provider} variant="outline">
                    {provider}
                  </Badge>
                ))}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Available providers
                <div className="mt-1 font-semibold text-slate-950">
                  {data.availableProviders.length ? data.availableProviders.join(", ") : "n/a"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Current concentration of roles across the loaded account directory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.roleSummary.map((item) => (
                <div key={item.role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{item.role}</span>
                  <span className="text-sm font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
