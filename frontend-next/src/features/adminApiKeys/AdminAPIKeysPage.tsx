"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  adminAPIKeysBFFEndpoint,
  buildAdminAPIKeyRevokeBFFEndpoint,
  buildAdminAPIKeyRotateBFFEndpoint,
  buildAdminAPIKeyScopesBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

import { AdminAPIKeysContent } from "./AdminAPIKeysContent";
import { buildAdminAPIKeyOverview, normalizeAdminAPIKeysPayload, resolveSelectedAdminAPIKey } from "./model";

function buildPath(filters: { owner: string; status: string }) {
  const params = new URLSearchParams();
  if (filters.owner.trim()) {
    params.set("owner", filters.owner.trim());
  }
  if (filters.status.trim() && filters.status !== "all") {
    params.set("status", filters.status.trim());
  }
  const suffix = params.toString();
  return suffix ? `${adminAPIKeysBFFEndpoint}?${suffix}` : adminAPIKeysBFFEndpoint;
}

export function AdminAPIKeysPage() {
  const { messages } = useProtectedI18n();
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
  const { overlay, openOverlay, closeOverlay } = useAdminOverlayState<"apiKeyCreate" | "apiKeyDetail">();

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
  const selectedItem = useMemo(
    () => resolveSelectedAdminAPIKey(payload.items, overlay?.entity === "apiKeyDetail" ? Number(overlay.entityId || 0) : null),
    [overlay, payload.items]
  );
  const activePane = overlay?.entity === "apiKeyCreate" ? "create" : overlay?.entity === "apiKeyDetail" && selectedItem ? "detail" : "idle";

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
      setError(resolveRequestErrorDisplayMessage(loadError, apiKeyMessages.loadError));
      setRawPayload(null);
    } finally {
      setLoading(false);
    }
  }, [apiKeyMessages.loadError, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: rawPayload !== null });

  useEffect(() => {
    if (overlay?.entity === "apiKeyDetail" && !selectedItem) {
      closeOverlay();
    }
  }, [closeOverlay, overlay, selectedItem]);

  function clearFeedback() {
    setError("");
    setMessage("");
    setPlaintextSecret("");
  }

  async function createKey() {
    clearFeedback();
    setBusyAction("create-key");
    try {
      const payload = await clientFetchJSON<{ plaintext_key?: string }>(adminAPIKeysBFFEndpoint, {
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
      closeOverlay();
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, apiKeyMessages.createError));
    } finally {
      setBusyAction("");
    }
  }

  async function revokeKey(keyId: number) {
    clearFeedback();
    setBusyAction(`revoke-${keyId}`);
    try {
      await clientFetchJSON(buildAdminAPIKeyRevokeBFFEndpoint(keyId), { method: "POST" });
      setMessage(formatProtectedMessage(apiKeyMessages.revokeSuccess, { keyId }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, apiKeyMessages.revokeError));
    } finally {
      setBusyAction("");
    }
  }

  async function rotateKey(keyId: number) {
    clearFeedback();
    setBusyAction(`rotate-${keyId}`);
    try {
      const payload = await clientFetchJSON<{ plaintext_key?: string }>(buildAdminAPIKeyRotateBFFEndpoint(keyId), {
        method: "POST"
      });
      setMessage(formatProtectedMessage(apiKeyMessages.rotateSuccess, { keyId }));
      setPlaintextSecret(payload.plaintext_key || "");
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, apiKeyMessages.rotateError));
    } finally {
      setBusyAction("");
    }
  }

  async function updateScopes(keyId: number) {
    clearFeedback();
    setBusyAction(`scopes-${keyId}`);
    try {
      await clientFetchJSON(buildAdminAPIKeyScopesBFFEndpoint(keyId), {
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
      setError(resolveRequestErrorDisplayMessage(actionError, apiKeyMessages.updateScopesError));
    } finally {
      setBusyAction("");
    }
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={apiKeyMessages.pageTitle}
        description={apiKeyMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void loadData()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminAPIKeysContent
      loading={loading}
      busyAction={busyAction}
      error={error}
      message={message}
      plaintextSecret={plaintextSecret}
      payload={payload}
      overview={overview}
      filters={filters}
      createDraft={createDraft}
      scopeDrafts={scopeDrafts}
      activePane={activePane}
      selectedItem={selectedItem}
      onRefresh={() => void loadData()}
      onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
      onResetFilters={() => setFilters({ owner: "", status: "all" })}
      onCreateDraftChange={(patch) => setCreateDraft((current) => ({ ...current, ...patch }))}
      onScopeDraftChange={(keyId, value) =>
        setScopeDrafts((current) => ({
          ...current,
          [keyId]: value
        }))
      }
      onOpenCreatePane={() => openOverlay({ kind: "create", entity: "apiKeyCreate" })}
      onClosePane={closeOverlay}
      onOpenDetail={(keyId) => openOverlay({ kind: "detail", entity: "apiKeyDetail", entityId: keyId })}
      onCreateKey={() => void createKey()}
      onRotateKey={(keyId) => void rotateKey(keyId)}
      onRevokeKey={(keyId) => void revokeKey(keyId)}
      onUpdateScopes={(keyId) => void updateScopes(keyId)}
    />
  );
}
