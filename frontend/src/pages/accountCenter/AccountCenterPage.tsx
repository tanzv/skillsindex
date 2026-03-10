import { Spin } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { AccountRoute } from "../accountWorkbench/AccountWorkbenchPage";
import { getAccountCenterCopy } from "./AccountCenterPage.copy";
import {
  type AccountProfileDraft,
  type AccountProfilePayload,
  buildAccountProfileDraft,
  buildAccountProfilePreviewItems,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountProfileDraft
} from "./AccountCenterPage.helpers";
import AccountProfileEditorModal from "./AccountProfileEditorModal";
import { AccountCenterSections } from "./AccountCenterPage.sections";
import {
  accountRouteBySection,
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

  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [revokeMode, setRevokeMode] = useState<AccountRevokeMode>("keep");

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
      const [profile, sessions] = await Promise.all([
        fetchConsoleJSON<AccountProfilePayload>("/api/v1/account/profile"),
        fetchConsoleJSON<AccountSessionsPayload>("/api/v1/account/sessions")
      ]);
      setProfilePayload(profile);
      setSessionsPayload(sessions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.updateFailed);
    } finally {
      setLoading(false);
    }
  }, [text.updateFailed]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const clearFeedback = useCallback(() => {
    setMessage("");
    setError("");
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
