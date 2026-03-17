"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { buildKeyMeta, buildAdminAPIKeyOverview, normalizeAdminAPIKeysPayload } from "./model";

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
  const overview = useMemo(() => buildAdminAPIKeyOverview(payload), [payload]);

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
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin api keys.");
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      setMessage("API key created.");
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
      setError(actionError instanceof Error ? actionError.message : "Failed to create api key.");
    } finally {
      setBusyAction("");
    }
  }

  async function revokeKey(keyId: number) {
    clearFeedback();
    setBusyAction(`revoke-${keyId}`);
    try {
      await clientFetchJSON(`/api/bff/admin/apikeys/${keyId}/revoke`, { method: "POST" });
      setMessage(`API key ${keyId} revoked.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to revoke api key.");
    } finally {
      setBusyAction("");
    }
  }

  async function rotateKey(keyId: number) {
    clearFeedback();
    setBusyAction(`rotate-${keyId}`);
    try {
      const payload = await clientFetchJSON<{ plaintext_key?: string }>(`/api/bff/admin/apikeys/${keyId}/rotate`, { method: "POST" });
      setMessage(`API key ${keyId} rotated.`);
      setPlaintextSecret(payload.plaintext_key || "");
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to rotate api key.");
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
      setMessage(`Scopes updated for API key ${keyId}.`);
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update api key scopes.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="API Keys"
        description="Create, rotate, revoke, and re-scope admin API keys from a dedicated credential governance page."
        actions={<Button onClick={() => void loadData()}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

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

      {error ? <ErrorState description={error} /> : null}
      {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}
      {plaintextSecret ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">One-time token: {plaintextSecret}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Inventory</CardTitle>
              <CardDescription>Filter by owner or lifecycle status before operating on a credential.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input value={filters.owner} placeholder="Owner username or ID" onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))} />
                <select className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option value="all">all</option>
                  <option value="active">active</option>
                  <option value="revoked">revoked</option>
                  <option value="expired">expired</option>
                </select>
                <Button variant="outline" onClick={() => setFilters({ owner: "", status: "all" })}>
                  Clear
                </Button>
              </div>

              <div className="space-y-3">
                {payload.items.map((item) => (
                  <div key={item.id} data-testid={`admin-apikey-card-${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-950">{item.name}</span>
                            <Badge variant={item.status.toLowerCase() === "active" ? "soft" : "outline"}>{item.status}</Badge>
                            <Badge variant="outline">{item.ownerUsername}</Badge>
                          </div>
                          <div className="text-sm text-slate-600">{item.purpose || "No purpose"}</div>
                          <div className="flex flex-wrap gap-2">
                            {buildKeyMeta(item).map((meta) => (
                              <span key={`${item.id}-${meta}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                {meta}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => void rotateKey(item.id)} disabled={Boolean(busyAction)}>
                            {busyAction === `rotate-${item.id}` ? "Rotating..." : "Rotate"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void revokeKey(item.id)} disabled={Boolean(busyAction)}>
                            {busyAction === `revoke-${item.id}` ? "Revoking..." : "Revoke"}
                          </Button>
                        </div>
                      </div>

                      <Input
                        aria-label="API key scopes"
                        value={scopeDrafts[item.id] || ""}
                        placeholder="Comma-separated scopes"
                        onChange={(event) =>
                          setScopeDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value
                          }))
                        }
                      />
                      <Button size="sm" onClick={() => void updateScopes(item.id)} disabled={Boolean(busyAction)}>
                        {busyAction === `scopes-${item.id}` ? "Saving..." : "Apply Scopes"}
                      </Button>
                    </div>
                  </div>
                ))}

                {!payload.items.length && !loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No API keys matched the current filter.</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
              <CardDescription>Create a new admin API key for the current or target owner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input aria-label="Create key name" value={createDraft.name} placeholder="Key name" onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))} />
              <Input aria-label="Create key purpose" value={createDraft.purpose} placeholder="Purpose" onChange={(event) => setCreateDraft((current) => ({ ...current, purpose: event.target.value }))} />
              <Input aria-label="Create key owner user ID" value={createDraft.ownerUserId} placeholder="Owner user ID" onChange={(event) => setCreateDraft((current) => ({ ...current, ownerUserId: event.target.value }))} />
              <Input aria-label="Create key expires in days" value={createDraft.expiresInDays} placeholder="Expires in days" onChange={(event) => setCreateDraft((current) => ({ ...current, expiresInDays: event.target.value }))} />
              <Input aria-label="Create key scopes" value={createDraft.scopes} placeholder="Comma-separated scopes" onChange={(event) => setCreateDraft((current) => ({ ...current, scopes: event.target.value }))} />
              <Button onClick={() => void createKey()} disabled={Boolean(busyAction)}>
                {busyAction === "create-key" ? "Creating..." : "Create Key"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Summary</CardTitle>
              <CardDescription>Top key owners across the currently loaded inventory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.ownerSummary.map((item) => (
                <div key={item.owner} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{item.owner}</span>
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
