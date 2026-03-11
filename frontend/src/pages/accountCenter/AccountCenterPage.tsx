import { Spin } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { AccountRoute } from "../accountWorkbench/AccountWorkbenchPage";
import { getAccountCenterCopy } from "./AccountCenterPage.copy";
import {
  buildAccountAPIKeyCreateDraft,
  buildAccountAPIKeyScopeDrafts,
  type AccountProfileDraft,
  type AccountProfilePayload,
  buildAccountProfileDraft,
  buildAccountProfilePreviewItems,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountAPIKeyCreateDraft,
  sanitizeAccountProfileDraft
} from "./AccountCenterPage.helpers";
import AccountProfileEditorModal from "./AccountProfileEditorModal";
import { AccountCenterSections } from "./AccountCenterPage.sections";
import {
  accountRouteBySection,
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeyCredentialResponse,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  accountSectionByRoute,
  type AccountRevokeMode,
  type AccountSection,
  type AccountSessionsPayload
} from "./AccountCenterPage.types";
import { PrototypeLoadingCenter } from "../prototype/prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "../prototype/prototypePageTheme";

interface AccountCenterPageProps {
  locale: AppLocale;
  route: AccountRoute;
  onNavigate: (path: string) => void;
}

export default function AccountCenterPage({ locale, route, onNavigate }: AccountCenterPageProps) {
  const text = getAccountCenterCopy(locale);
  const activeSection = accountSectionByRoute[route];
  const lightMode = isLightPrototypePath(window.location.pathname);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profilePayload, setProfilePayload] = useState<AccountProfilePayload | null>(null);
  const [sessionsPayload, setSessionsPayload] = useState<AccountSessionsPayload | null>(null);
  const [credentialsPayload, setCredentialsPayload] = useState<AccountAPIKeysPayload | null>(null);

  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [revokeMode, setRevokeMode] = useState<AccountRevokeMode>("keep");
  const [credentialDraft, setCredentialDraft] = useState<AccountAPIKeyCreateDraft>(() => buildAccountAPIKeyCreateDraft(null));
  const [credentialScopeDrafts, setCredentialScopeDrafts] = useState<Record<number, string[]>>({});
  const [latestCredentialSecret, setLatestCredentialSecret] = useState<AccountAPIKeySecretState | null>(null);

  const completeness = useMemo(() => profileCompletenessScore(profilePayload), [profilePayload]);
  const profileDraft = useMemo(() => buildAccountProfileDraft(profilePayload), [profilePayload]);

  const profilePreviewItems = useMemo(
    () =>
      buildAccountProfilePreviewItems(
        profilePayload,
        {
          displayName: text.displayName,
          avatarURL: text.avatarURL,
          bio: text.bio
        },
        text.never
      ),
    [profilePayload, text.avatarURL, text.bio, text.displayName, text.never]
  );

  const profileUser = profilePayload?.user;
  const primaryProfileName = profileDraft.displayName || profileUser?.username || text.never;
  const avatarInitials = resolveAvatarInitials(primaryProfileName, profileUser?.username || "U");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profile, sessions, credentials] = await Promise.all([
        fetchConsoleJSON<AccountProfilePayload>("/api/v1/account/profile"),
        fetchConsoleJSON<AccountSessionsPayload>("/api/v1/account/sessions"),
        fetchConsoleJSON<AccountAPIKeysPayload>("/api/v1/account/apikeys")
      ]);
      setProfilePayload(profile);
      setSessionsPayload(sessions);
      setCredentialsPayload(credentials);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.updateFailed);
    } finally {
      setLoading(false);
    }
  }, [text.updateFailed]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    setCredentialDraft(buildAccountAPIKeyCreateDraft(credentialsPayload));
    setCredentialScopeDrafts(buildAccountAPIKeyScopeDrafts(credentialsPayload));
  }, [credentialsPayload]);

  const clearFeedback = useCallback(() => {
    setMessage("");
    setError("");
    setLatestCredentialSecret(null);
  }, []);

  const openProfileEditor = useCallback(() => {
    clearFeedback();
    setProfileEditorOpen(true);
  }, [clearFeedback]);

  const closeProfileEditor = useCallback(() => {
    if (saving) {
      return;
    }
    setProfileEditorOpen(false);
  }, [saving]);

  const saveProfile = useCallback(
    async (values: AccountProfileDraft) => {
      clearFeedback();
      setSaving(true);
      try {
        await postConsoleJSON("/api/v1/account/profile", sanitizeAccountProfileDraft(values));
        setMessage(text.saveSuccess);
        setProfileEditorOpen(false);
        await loadAll();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : text.updateFailed);
      } finally {
        setSaving(false);
      }
    },
    [clearFeedback, loadAll, text.saveSuccess, text.updateFailed]
  );

  const applyPassword = useCallback(async () => {
    clearFeedback();
    if (!currentPassword.trim() || !newPassword.trim()) {
      setError(text.updateFailed);
      return;
    }

    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/security/password", {
        current_password: currentPassword,
        new_password: newPassword,
        revoke_other_sessions: revokeMode === "revoke"
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage(text.passwordSuccess);
      await loadAll();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }, [clearFeedback, currentPassword, loadAll, newPassword, revokeMode, text.passwordSuccess, text.updateFailed]);

  const revokeSession = useCallback(
    async (sessionID: string) => {
      clearFeedback();
      if (!sessionID.trim()) {
        return;
      }
      setSaving(true);
      try {
        await postConsoleJSON(`/api/v1/account/sessions/${encodeURIComponent(sessionID)}/revoke`);
        setMessage(text.revokedSuccess);
        await loadAll();
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : text.updateFailed);
      } finally {
        setSaving(false);
      }
    },
    [clearFeedback, loadAll, text.revokedSuccess, text.updateFailed]
  );

  const revokeOtherSessions = useCallback(async () => {
    clearFeedback();
    setSaving(true);
    try {
      await postConsoleJSON("/api/v1/account/sessions/revoke-others");
      setMessage(text.revokedSuccess);
      await loadAll();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }, [clearFeedback, loadAll, text.revokedSuccess, text.updateFailed]);

  const updateCredentialDraft = useCallback((patch: Partial<AccountAPIKeyCreateDraft>) => {
    setCredentialDraft((current) => ({
      ...current,
      ...patch
    }));
  }, []);

  const updateCredentialScopeDraft = useCallback((keyID: number, scopes: string[]) => {
    setCredentialScopeDrafts((current) => ({
      ...current,
      [keyID]: scopes
    }));
  }, []);

  const createCredential = useCallback(async () => {
    clearFeedback();
    setSaving(true);
    try {
      const payload = await postConsoleJSON<AccountAPIKeyCredentialResponse>(
        "/api/v1/account/apikeys",
        sanitizeAccountAPIKeyCreateDraft(credentialDraft)
      );
      setLatestCredentialSecret({
        action: "created",
        name: payload.item.name,
        plaintextKey: payload.plaintext_key
      });
      setMessage(text.credentialCreatedSuccess);
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }, [clearFeedback, credentialDraft, loadAll, text.credentialCreatedSuccess, text.updateFailed]);

  const rotateCredential = useCallback(
    async (keyID: number) => {
      clearFeedback();
      setSaving(true);
      try {
        const payload = await postConsoleJSON<AccountAPIKeyCredentialResponse>(`/api/v1/account/apikeys/${keyID}/rotate`);
        setLatestCredentialSecret({
          action: "rotated",
          name: payload.item.name,
          plaintextKey: payload.plaintext_key
        });
        setMessage(text.credentialRotatedSuccess);
        await loadAll();
      } catch (rotateError) {
        setError(rotateError instanceof Error ? rotateError.message : text.updateFailed);
      } finally {
        setSaving(false);
      }
    },
    [clearFeedback, loadAll, text.credentialRotatedSuccess, text.updateFailed]
  );

  const revokeCredential = useCallback(
    async (keyID: number) => {
      clearFeedback();
      setSaving(true);
      try {
        await postConsoleJSON(`/api/v1/account/apikeys/${keyID}/revoke`);
        setMessage(text.credentialRevokedSuccess);
        await loadAll();
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : text.updateFailed);
      } finally {
        setSaving(false);
      }
    },
    [clearFeedback, loadAll, text.credentialRevokedSuccess, text.updateFailed]
  );

  const applyCredentialScopes = useCallback(
    async (keyID: number) => {
      clearFeedback();
      setSaving(true);
      try {
        await postConsoleJSON(`/api/v1/account/apikeys/${keyID}/scopes`, {
          scopes: credentialScopeDrafts[keyID] || []
        });
        setMessage(text.credentialScopesUpdatedSuccess);
        await loadAll();
      } catch (scopeError) {
        setError(scopeError instanceof Error ? scopeError.message : text.updateFailed);
      } finally {
        setSaving(false);
      }
    },
    [clearFeedback, credentialScopeDrafts, loadAll, text.credentialScopesUpdatedSuccess, text.updateFailed]
  );

  const handleSectionChange = useCallback(
    (section: AccountSection) => {
      onNavigate(accountRouteBySection[section]);
    },
    [onNavigate]
  );

  if (loading) {
    return (
      <PrototypeLoadingCenter>
        <Spin description={text.loading} />
      </PrototypeLoadingCenter>
    );
  }

  const sessionItems = sessionsPayload?.items || [];
  const currentSessionID = sessionsPayload?.current_session_id || "";

  const metricItems = [
    { key: "role", label: text.role, value: profileUser?.role || text.never },
    { key: "status", label: text.status, value: profileUser?.status || text.never },
    { key: "sessions", label: text.activeSessions, value: String(sessionsPayload?.total || 0) },
    { key: "credentials", label: text.credentialsTab, value: String(credentialsPayload?.total || 0) },
    { key: "completeness", label: text.profileCompleteness, value: `${completeness}%` }
  ];

  return (
    <>
      <AccountCenterSections
        text={text}
        locale={locale}
        palette={palette}
        activeSection={activeSection}
        metricItems={metricItems}
        profilePayload={profilePayload}
        profileDraft={profileDraft}
        profilePreviewItems={profilePreviewItems}
        primaryProfileName={primaryProfileName}
        avatarInitials={avatarInitials}
        sessionsPayload={sessionsPayload}
        sessionItems={sessionItems}
        currentSessionID={currentSessionID}
        credentialsPayload={credentialsPayload}
        credentialDraft={credentialDraft}
        credentialScopeDrafts={credentialScopeDrafts}
        latestCredentialSecret={latestCredentialSecret}
        currentPassword={currentPassword}
        newPassword={newPassword}
        revokeMode={revokeMode}
        saving={saving}
        error={error}
        message={message}
        onOpenProfileEditor={openProfileEditor}
        onRefresh={loadAll}
        onNavigate={onNavigate}
        onSectionChange={handleSectionChange}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onRevokeModeChange={setRevokeMode}
        onApplyPassword={applyPassword}
        onRevokeOtherSessions={revokeOtherSessions}
        onRevokeSession={revokeSession}
        onCredentialDraftChange={updateCredentialDraft}
        onCredentialScopeDraftChange={updateCredentialScopeDraft}
        onCreateCredential={createCredential}
        onRotateCredential={rotateCredential}
        onRevokeCredential={revokeCredential}
        onApplyCredentialScopes={applyCredentialScopes}
      />

      <AccountProfileEditorModal
        open={profileEditorOpen}
        submitting={saving}
        initialValues={profileDraft}
        labels={{
          title: text.editProfileModalTitle,
          displayName: text.displayName,
          avatarURL: text.avatarURL,
          bio: text.bio,
          save: text.saveProfile,
          cancel: text.cancel,
          invalidAvatarURL: text.invalidAvatarURL,
          displayNameTooLong: text.displayNameTooLong,
          bioTooLong: text.bioTooLong
        }}
        onCancel={closeProfileEditor}
        onSubmit={saveProfile}
      />
    </>
  );
}
