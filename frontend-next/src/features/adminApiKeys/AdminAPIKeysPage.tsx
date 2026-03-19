"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminMessageBanner, AdminMetaChipList } from "@/src/components/admin/AdminPrimitives";
import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveApiKeyStatusLabel, resolveApiKeyStatusTone } from "@/src/lib/apiKeyDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { buildAdminAPIKeyOverview, buildKeyMeta, normalizeAdminAPIKeysPayload } from "./model";

function buildPath(filters: { owner: string; status: string }) {
  const params = new URLSearchParams();
  if (filters.owner.trim()) {
    params.set("owner", filters.owner.trim());
  }
  if (filters.status.trim() && filters.status !== "all") {
    params.set("status", filters.status.trim());
  }
  const suffix = params.toString();
  return suffix ? `/api/bff/admin/apikeys?${suffix}` : "/api/bff/admin/apikeys";
}

export function AdminAPIKeysPage() {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const apiKeyMessages = messages.adminApiKeys;
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [filters, setFilters] = useState({ owner: "", status: "all" });
  const [createDraft, setCreateDraft] = useState({
    name: "",
    purpose: "",
    expiresInDays: "90",
    ownerUserId: "",
    scopes: ""
  });
  const [scopeDrafts, setScopeDrafts] = useState<Record<number, string>>({});
  const [plaintextSecret, setPlaintextSecret] = useState("");

  const payload = useMemo(() => normalizeAdminAPIKeysPayload(rawPayload), [rawPayload]);
  const overview = useMemo(
    () =>
      buildAdminAPIKeyOverview(payload, {
        metricTotalKeys: apiKeyMessages.metricTotalKeys,
        metricActiveKeys: apiKeyMessages.metricActiveKeys,
        metricRevokedKeys: apiKeyMessages.metricRevokedKeys,
        metricExpiredKeys: apiKeyMessages.metricExpiredKeys,
        ownerUnknown: apiKeyMessages.ownerUnknown
      }),
    [
      apiKeyMessages.metricActiveKeys,
      apiKeyMessages.metricExpiredKeys,
      apiKeyMessages.metricRevokedKeys,
      apiKeyMessages.metricTotalKeys,
      apiKeyMessages.ownerUnknown,
      payload
    ]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextPayload = await clientFetchJSON(buildPath(filters));
      const normalized = normalizeAdminAPIKeysPayload(nextPayload);
      setRawPayload(nextPayload);
      setScopeDrafts(
        normalized.items.reduce<Record<number, string>>((accumulator, item) => {
          accumulator[item.id] = item.scopes.join(", ");
          return accumulator;
        }, {})
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : apiKeyMessages.loadError);
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [apiKeyMessages.loadError, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function clearFeedback() {
    setError("");
    setMessage("");
    setPlaintextSecret("");
  }

  async function createKey() {
    clearFeedback();
    setBusyAction("create-key");
    try {
      const payload = await clientFetchJSON<{ plaintext_key?: string }>("/api/bff/admin/apikeys", {
        method: "POST",
        body: {
          name: createDraft.name.trim(),
          purpose: createDraft.purpose.trim(),
          expires_in_days: Number(createDraft.expiresInDays || 0) || 0,
          owner_user_id: Number(createDraft.ownerUserId || 0) || undefined,
          scopes: createDraft.scopes
            .split(",")
            .map((scope) => scope.trim())
            .filter(Boolean)
        }
      });
      setMessage(apiKeyMessages.createSuccess);
      setPlaintextSecret(payload.plaintext_key || "");
      setCreateDraft({
        name: "",
        purpose: "",
        expiresInDays: "90",
        ownerUserId: "",
        scopes: ""
      });
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : apiKeyMessages.createError);
    } finally {
      setBusyAction("");
    }
  }

  async function revokeKey(keyId: number) {
    clearFeedback();
    setBusyAction(`revoke-${keyId}`);
    try {
      await clientFetchJSON(`/api/bff/admin/apikeys/${keyId}/revoke`, { method: "POST" });
      setMessage(formatProtectedMessage(apiKeyMessages.revokeSuccess, { keyId }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : apiKeyMessages.revokeError);
    } finally {
      setBusyAction("");
    }
  }

  async function rotateKey(keyId: number) {
    clearFeedback();
    setBusyAction(`rotate-${keyId}`);
    try {
      const payload = await clientFetchJSON<{ plaintext_key?: string }>(`/api/bff/admin/apikeys/${keyId}/rotate`, { method: "POST" });
      setMessage(formatProtectedMessage(apiKeyMessages.rotateSuccess, { keyId }));
      setPlaintextSecret(payload.plaintext_key || "");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : apiKeyMessages.rotateError);
    } finally {
      setBusyAction("");
    }
  }

  async function updateScopes(keyId: number) {
    clearFeedback();
    setBusyAction(`scopes-${keyId}`);
    try {
      await clientFetchJSON(`/api/bff/admin/apikeys/${keyId}/scopes`, {
        method: "POST",
        body: {
          scopes: (scopeDrafts[keyId] || "")
            .split(",")
            .map((scope) => scope.trim())
            .filter(Boolean)
        }
      });
      setMessage(formatProtectedMessage(apiKeyMessages.updateScopesSuccess, { keyId }));
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : apiKeyMessages.updateScopesError);
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={commonMessages.adminEyebrow}
        title={apiKeyMessages.pageTitle}
        description={apiKeyMessages.pageDescription}
        actions={<Button onClick={() => void loadData()}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {error ? <ErrorState description={error} /> : null}
      {message ? <AdminMessageBanner message={message} /> : null}
      {plaintextSecret ? (
        <div className="rounded-2xl border border-[color:var(--ui-success-border)] bg-[color:var(--ui-success-bg)] px-4 py-3 text-sm text-[color:var(--ui-success-text)]">
          {formatProtectedMessage(apiKeyMessages.plaintextSecretTemplate, { plaintextSecret })}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{apiKeyMessages.inventoryTitle}</CardTitle>
              <CardDescription>{apiKeyMessages.inventoryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input
                  aria-label={apiKeyMessages.filterOwnerAriaLabel}
                  value={filters.owner}
                  placeholder={apiKeyMessages.filterOwnerPlaceholder}
                  onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))}
                />
                <Select
                  aria-label={apiKeyMessages.filterStatusAriaLabel}
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="all">{apiKeyMessages.filterStatusOptionAll}</option>
                  <option value="active">{apiKeyMessages.filterStatusOptionActive}</option>
                  <option value="revoked">{apiKeyMessages.filterStatusOptionRevoked}</option>
                  <option value="expired">{apiKeyMessages.filterStatusOptionExpired}</option>
                </Select>
                <Button variant="outline" onClick={() => setFilters({ owner: "", status: "all" })}>
                  {commonMessages.clear}
                </Button>
              </div>

              <div className="space-y-3">
                {payload.items.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`admin-apikey-card-${item.id}`}
                    className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                              {item.name || apiKeyMessages.unnamedKey}
                            </span>
                            <Badge variant={resolveApiKeyStatusTone(item.status)}>
                              {resolveApiKeyStatusLabel(item.status, apiKeyMessages)}
                            </Badge>
                            <Badge variant="outline">{item.ownerUsername || apiKeyMessages.ownerUnknown}</Badge>
                          </div>
                          <div className="text-sm text-[color:var(--ui-text-secondary)]">{item.purpose || apiKeyMessages.noPurpose}</div>
                          <AdminMetaChipList
                            items={buildKeyMeta(item, locale, {
                              valueNotAvailable: apiKeyMessages.valueNotAvailable,
                              metaPrefixTemplate: apiKeyMessages.metaPrefixTemplate,
                              metaCreatedTemplate: apiKeyMessages.metaCreatedTemplate,
                              metaUpdatedTemplate: apiKeyMessages.metaUpdatedTemplate,
                              metaLastUsedTemplate: apiKeyMessages.metaLastUsedTemplate
                            })}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => void rotateKey(item.id)} disabled={Boolean(busyAction)}>
                            {busyAction === `rotate-${item.id}` ? apiKeyMessages.rotatingAction : apiKeyMessages.rotateAction}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void revokeKey(item.id)} disabled={Boolean(busyAction)}>
                            {busyAction === `revoke-${item.id}` ? apiKeyMessages.revokingAction : apiKeyMessages.revokeAction}
                          </Button>
                        </div>
                      </div>

                      <Input
                        aria-label={apiKeyMessages.scopeInputAriaLabel}
                        value={scopeDrafts[item.id] || ""}
                        placeholder={apiKeyMessages.scopeInputPlaceholder}
                        onChange={(event) =>
                          setScopeDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value
                          }))
                        }
                      />
                      <Button size="sm" onClick={() => void updateScopes(item.id)} disabled={Boolean(busyAction)}>
                        {busyAction === `scopes-${item.id}` ? apiKeyMessages.savingScopesAction : apiKeyMessages.applyScopesAction}
                      </Button>
                    </div>
                  </div>
                ))}

                {!payload.items.length && !loading ? (
                  <AdminEmptyBlock>{apiKeyMessages.inventoryEmpty}</AdminEmptyBlock>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{apiKeyMessages.createTitle}</CardTitle>
              <CardDescription>{apiKeyMessages.createDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                aria-label={apiKeyMessages.createNameAriaLabel}
                value={createDraft.name}
                placeholder={apiKeyMessages.createNamePlaceholder}
                onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
              />
              <Input
                aria-label={apiKeyMessages.createPurposeAriaLabel}
                value={createDraft.purpose}
                placeholder={apiKeyMessages.createPurposePlaceholder}
                onChange={(event) => setCreateDraft((current) => ({ ...current, purpose: event.target.value }))}
              />
              <Input
                aria-label={apiKeyMessages.createOwnerUserIdAriaLabel}
                value={createDraft.ownerUserId}
                placeholder={apiKeyMessages.createOwnerUserIdPlaceholder}
                onChange={(event) => setCreateDraft((current) => ({ ...current, ownerUserId: event.target.value }))}
              />
              <Input
                aria-label={apiKeyMessages.createExpiresInDaysAriaLabel}
                value={createDraft.expiresInDays}
                placeholder={apiKeyMessages.createExpiresInDaysPlaceholder}
                onChange={(event) => setCreateDraft((current) => ({ ...current, expiresInDays: event.target.value }))}
              />
              <Input
                aria-label={apiKeyMessages.createScopesAriaLabel}
                value={createDraft.scopes}
                placeholder={apiKeyMessages.createScopesPlaceholder}
                onChange={(event) => setCreateDraft((current) => ({ ...current, scopes: event.target.value }))}
              />
              <Button onClick={() => void createKey()} disabled={Boolean(busyAction)}>
                {busyAction === "create-key" ? apiKeyMessages.creatingAction : apiKeyMessages.createAction}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{apiKeyMessages.ownerSummaryTitle}</CardTitle>
              <CardDescription>{apiKeyMessages.ownerSummaryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.ownerSummary.map((item) => (
                <div
                  key={item.owner}
                  className="flex items-center justify-between rounded-2xl bg-[color:var(--ui-card-muted-bg)] px-4 py-3"
                >
                  <span className="text-sm text-[color:var(--ui-text-secondary)]">{item.owner}</span>
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
