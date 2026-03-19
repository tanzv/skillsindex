"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveAccountRoleLabel, resolveAccountStatusLabel } from "@/src/lib/accountDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import {
  buildAccountAPIKeyCreateDraft,
  buildAccountAPIKeyScopeDrafts,
  buildAccountProfileDraft,
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  type AccountProfileDraft,
  type AccountProfilePayload,
  type AccountRoute,
  type AccountSessionsPayload,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountAPIKeyCreateDraft,
  sanitizeAccountProfileDraft
} from "./model";
import { AccountCenterContent } from "./AccountCenterContent";

export function AccountCenterPage({ route }: { route: AccountRoute }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profilePayload, setProfilePayload] = useState<AccountProfilePayload | null>(null);
  const [sessionsPayload, setSessionsPayload] = useState<AccountSessionsPayload | null>(null);
  const [credentialsPayload, setCredentialsPayload] = useState<AccountAPIKeysPayload | null>(null);
  const [profileDraft, setProfileDraft] = useState<AccountProfileDraft>(buildAccountProfileDraft(null));
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: "", newPassword: "", revokeOthers: false });
  const [credentialDraft, setCredentialDraft] = useState<AccountAPIKeyCreateDraft>(buildAccountAPIKeyCreateDraft(null));
  const [credentialScopeDrafts, setCredentialScopeDrafts] = useState<Record<number, string[]>>({});
  const [latestCredentialSecret, setLatestCredentialSecret] = useState<AccountAPIKeySecretState | null>(null);

  const completeness = useMemo(() => profileCompletenessScore(profilePayload), [profilePayload]);
  const profileName = profileDraft.displayName || profilePayload?.user.username || accountMessages.valueUserFallback;
  const avatarInitials = resolveAvatarInitials(profileName, accountMessages.valueUserInitialFallback);
  const accountDisplayMessages = useMemo(
    () => ({
      valueUnknownUser: accountMessages.valueUserFallback,
      statusLabelActive: accountMessages.accountStatusLabelActive,
      statusLabelDisabled: accountMessages.accountStatusLabelDisabled,
      statusLabelUnknown: accountMessages.accountStatusLabelUnknown,
      roleLabelSuperAdmin: accountMessages.roleLabelSuperAdmin,
      roleLabelAdmin: accountMessages.roleLabelAdmin,
      roleLabelAuditor: accountMessages.roleLabelAuditor,
      roleLabelMember: accountMessages.roleLabelMember,
      roleLabelViewer: accountMessages.roleLabelViewer,
      roleLabelUnknown: accountMessages.roleLabelUnknown
    }),
    [
      accountMessages.accountStatusLabelActive,
      accountMessages.accountStatusLabelDisabled,
      accountMessages.accountStatusLabelUnknown,
      accountMessages.roleLabelAdmin,
      accountMessages.roleLabelAuditor,
      accountMessages.roleLabelMember,
      accountMessages.roleLabelSuperAdmin,
      accountMessages.roleLabelUnknown,
      accountMessages.roleLabelViewer,
      accountMessages.valueUserFallback
    ]
  );

  const metricItems = useMemo(
    () => [
      {
        label: accountMessages.metricRole,
        value: resolveAccountRoleLabel(profilePayload?.user.role || "", accountDisplayMessages)
      },
      {
        label: accountMessages.metricStatus,
        value: resolveAccountStatusLabel(profilePayload?.user.status || "", accountDisplayMessages)
      },
      { label: accountMessages.metricSessions, value: String(sessionsPayload?.total || 0) },
      { label: accountMessages.metricCredentials, value: String(credentialsPayload?.total || 0) },
      { label: accountMessages.metricCompleteness, value: `${completeness}%` }
    ],
    [
      accountDisplayMessages,
      accountMessages.metricCompleteness,
      accountMessages.metricCredentials,
      accountMessages.metricRole,
      accountMessages.metricSessions,
      accountMessages.metricStatus,
      completeness,
      credentialsPayload?.total,
      profilePayload?.user.role,
      profilePayload?.user.status,
      sessionsPayload?.total
    ]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profile, sessions, credentials] = await Promise.all([
        clientFetchJSON<AccountProfilePayload>("/api/bff/account/profile"),
        clientFetchJSON<AccountSessionsPayload>("/api/bff/account/sessions"),
        clientFetchJSON<AccountAPIKeysPayload>("/api/bff/account/apikeys")
      ]);
      setProfilePayload(profile);
      setSessionsPayload(sessions);
      setCredentialsPayload(credentials);
      setProfileDraft(buildAccountProfileDraft(profile));
      setCredentialDraft(buildAccountAPIKeyCreateDraft(credentials));
      setCredentialScopeDrafts(buildAccountAPIKeyScopeDrafts(credentials));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : accountMessages.loadError);
    } finally {
      setLoading(false);
    }
  }, [accountMessages.loadError]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function clearFeedback() {
    setError("");
    setMessage("");
    setLatestCredentialSecret(null);
  }

  async function saveProfile() {
    clearFeedback();
    setSaving(true);
    try {
      await clientFetchJSON("/api/bff/account/profile", {
        method: "POST",
        body: sanitizeAccountProfileDraft(profileDraft)
      });
      setMessage(accountMessages.profileSaveSuccess);
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.profileSaveError);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    clearFeedback();
    if (!passwordDraft.currentPassword.trim() || !passwordDraft.newPassword.trim()) {
      setError(accountMessages.passwordValidationError);
      return;
    }
    setSaving(true);
    try {
      await clientFetchJSON("/api/bff/account/security/password", {
        method: "POST",
        body: {
          current_password: passwordDraft.currentPassword,
          new_password: passwordDraft.newPassword,
          revoke_other_sessions: passwordDraft.revokeOthers
        }
      });
      setPasswordDraft({ currentPassword: "", newPassword: "", revokeOthers: false });
      setMessage(accountMessages.passwordSaveSuccess);
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.passwordSaveError);
    } finally {
      setSaving(false);
    }
  }

  async function revokeSession(sessionId: string) {
    clearFeedback();
    setSaving(true);
    try {
      await clientFetchJSON(`/api/bff/account/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: "POST" });
      setMessage(formatProtectedMessage(accountMessages.revokeSessionSuccess, { sessionId }));
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.revokeSessionError);
    } finally {
      setSaving(false);
    }
  }

  async function revokeOtherSessions() {
    clearFeedback();
    setSaving(true);
    try {
      await clientFetchJSON("/api/bff/account/sessions/revoke-others", { method: "POST" });
      setMessage(accountMessages.revokeOtherSessionsSuccess);
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.revokeOtherSessionsError);
    } finally {
      setSaving(false);
    }
  }

  async function createCredential() {
    clearFeedback();
    setSaving(true);
    try {
      const payload = await clientFetchJSON<{ item: { name: string }; plaintext_key: string }>("/api/bff/account/apikeys", {
        method: "POST",
        body: sanitizeAccountAPIKeyCreateDraft(credentialDraft)
      });
      setLatestCredentialSecret({ action: "created", name: payload.item.name, plaintextKey: payload.plaintext_key });
      setMessage(accountMessages.credentialCreateSuccess);
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.credentialCreateError);
    } finally {
      setSaving(false);
    }
  }

  async function rotateCredential(keyId: number) {
    clearFeedback();
    setSaving(true);
    try {
      const payload = await clientFetchJSON<{ item: { name: string }; plaintext_key: string }>(`/api/bff/account/apikeys/${keyId}/rotate`, {
        method: "POST"
      });
      setLatestCredentialSecret({ action: "rotated", name: payload.item.name, plaintextKey: payload.plaintext_key });
      setMessage(formatProtectedMessage(accountMessages.credentialRotateSuccess, { keyId }));
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.credentialRotateError);
    } finally {
      setSaving(false);
    }
  }

  async function revokeCredential(keyId: number) {
    clearFeedback();
    setSaving(true);
    try {
      await clientFetchJSON(`/api/bff/account/apikeys/${keyId}/revoke`, { method: "POST" });
      setMessage(formatProtectedMessage(accountMessages.credentialRevokeSuccess, { keyId }));
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.credentialRevokeError);
    } finally {
      setSaving(false);
    }
  }

  async function applyCredentialScopes(keyId: number) {
    clearFeedback();
    setSaving(true);
    try {
      await clientFetchJSON(`/api/bff/account/apikeys/${keyId}/scopes`, {
        method: "POST",
        body: { scopes: credentialScopeDrafts[keyId] || [] }
      });
      setMessage(formatProtectedMessage(accountMessages.credentialScopesSaveSuccess, { keyId }));
      await loadAll();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : accountMessages.credentialScopesSaveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountCenterContent
      route={route}
      loading={loading}
      saving={saving}
      error={error}
      message={message}
      metricItems={metricItems}
      avatarInitials={avatarInitials}
      profileDraft={profileDraft}
      sessionsPayload={sessionsPayload}
      credentialsPayload={credentialsPayload}
      credentialDraft={credentialDraft}
      credentialScopeDrafts={credentialScopeDrafts}
      latestCredentialSecret={latestCredentialSecret}
      passwordDraft={passwordDraft}
      onRefresh={() => void loadAll()}
      onProfileDraftChange={(patch) => setProfileDraft((current) => ({ ...current, ...patch }))}
      onPasswordDraftChange={(patch) => setPasswordDraft((current) => ({ ...current, ...patch }))}
      onCredentialDraftChange={(patch) => setCredentialDraft((current) => ({ ...current, ...patch }))}
      onCredentialScopeDraftChange={(keyId, rawValue) =>
        setCredentialScopeDrafts((current) => ({
          ...current,
          [keyId]: rawValue
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        }))
      }
      onSaveProfile={() => void saveProfile()}
      onChangePassword={() => void changePassword()}
      onRevokeOtherSessions={() => void revokeOtherSessions()}
      onRevokeSession={(sessionId) => void revokeSession(sessionId)}
      onCreateCredential={() => void createCredential()}
      onRotateCredential={(keyId) => void rotateCredential(keyId)}
      onRevokeCredential={(keyId) => void revokeCredential(keyId)}
      onApplyCredentialScopes={(keyId) => void applyCredentialScopes(keyId)}
    />
  );
}
