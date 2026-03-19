"use client";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { formatAccountDate, type AccountSessionsPayload } from "./model";
import type {
  AccountProfileSectionProps,
  AccountSecuritySectionProps,
  AccountSessionsSectionProps
} from "./AccountCenterSectionProps";

export function AccountProfileSection({
  loading,
  saving,
  avatarInitials,
  profileDraft,
  onProfileDraftChange,
  onSaveProfile
}: AccountProfileSectionProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <section className="account-center-stage-panel account-center-section-stack">
      <div className="account-center-profile-head">
        <div className="account-center-panel-title-row">
          <h2>{accountMessages.profileSectionTitle}</h2>
          <p className="account-center-panel-description">{accountMessages.profileSectionDescription}</p>
        </div>
        <div className="account-center-avatar">{avatarInitials}</div>
      </div>

      <div className="account-center-form-grid is-two-column">
        <input
          className="account-center-field"
          value={profileDraft.displayName}
          placeholder={accountMessages.profileDisplayNamePlaceholder}
          disabled={loading || saving}
          onChange={(event) => onProfileDraftChange({ displayName: event.target.value })}
        />
        <input
          className="account-center-field"
          value={profileDraft.avatarURL}
          placeholder={accountMessages.profileAvatarUrlPlaceholder}
          disabled={loading || saving}
          onChange={(event) => onProfileDraftChange({ avatarURL: event.target.value })}
        />
      </div>

      <textarea
        className="account-center-textarea"
        value={profileDraft.bio}
        placeholder={accountMessages.profileBioPlaceholder}
        disabled={loading || saving}
        onChange={(event) => onProfileDraftChange({ bio: event.target.value })}
      />

      <div className="account-center-action-row">
        <button type="button" className="account-center-action is-primary" onClick={onSaveProfile} disabled={saving || loading}>
          {accountMessages.profileSaveAction}
        </button>
      </div>
    </section>
  );
}

export function AccountSecuritySection({
  loading,
  saving,
  passwordDraft,
  sessionsPayload,
  onPasswordDraftChange,
  onChangePassword,
  onRevokeOtherSessions
}: AccountSecuritySectionProps) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <>
      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>{accountMessages.securitySectionTitle}</h2>
          <p className="account-center-panel-description">{accountMessages.securitySectionDescription}</p>
        </div>

        <div className="account-center-form-grid is-two-column">
          <input
            className="account-center-field"
            type="password"
            value={passwordDraft.currentPassword}
            placeholder={accountMessages.currentPasswordPlaceholder}
            disabled={loading || saving}
            onChange={(event) => onPasswordDraftChange({ currentPassword: event.target.value })}
          />
          <input
            className="account-center-field"
            type="password"
            value={passwordDraft.newPassword}
            placeholder={accountMessages.newPasswordPlaceholder}
            disabled={loading || saving}
            onChange={(event) => onPasswordDraftChange({ newPassword: event.target.value })}
          />
        </div>

        <label className="account-center-checkbox-row">
          <input
            type="checkbox"
            checked={passwordDraft.revokeOthers}
            disabled={loading || saving}
            onChange={(event) => onPasswordDraftChange({ revokeOthers: event.target.checked })}
          />
          {accountMessages.revokeOthersCheckboxLabel}
        </label>

        <div className="account-center-action-row">
          <button type="button" className="account-center-action is-primary" onClick={onChangePassword} disabled={saving || loading}>
            {accountMessages.changePasswordAction}
          </button>
          <button type="button" className="account-center-action" onClick={onRevokeOtherSessions} disabled={saving || loading}>
            {accountMessages.revokeOtherSessionsAction}
          </button>
        </div>
      </section>

      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>{accountMessages.securitySnapshotTitle}</h2>
          <p className="account-center-panel-description">{accountMessages.securitySnapshotDescription}</p>
        </div>

        <div className="account-center-section-stack">
          <div className="account-center-session-card">
            <div className="account-center-panel-title-row">
              <h3>{accountMessages.currentSessionTitle}</h3>
            </div>
            <div className="account-center-session-meta">
              <span className="account-center-badge">{sessionsPayload?.current_session_id || accountMessages.valueNotAvailable}</span>
              <span className="account-center-badge">
                {formatProtectedMessage(accountMessages.currentSessionIssuedTemplate, {
                  value: formatAccountDate(sessionsPayload?.session_issued_at || null, locale, accountMessages.valueNotAvailable)
                })}
              </span>
              <span className="account-center-badge">
                {formatProtectedMessage(accountMessages.currentSessionExpiresTemplate, {
                  value: formatAccountDate(sessionsPayload?.session_expires_at || null, locale, accountMessages.valueNotAvailable)
                })}
              </span>
            </div>
          </div>
          <div className="account-center-session-card">
            <div className="account-center-panel-title-row">
              <h3>{accountMessages.otherActiveSessionsTitle}</h3>
            </div>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.otherActiveSessionsTemplate, {
                count: Math.max(0, (sessionsPayload?.total || 0) - 1)
              })}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function SessionInventoryCard({
  session,
  loading,
  saving,
  onRevokeSession
}: {
  session: AccountSessionsPayload["items"][number];
  loading: boolean;
  saving: boolean;
  onRevokeSession: (sessionId: string) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <div className="account-center-session-card">
      <div className="account-center-session-row">
        <div className="account-center-section-stack">
          <div className="account-center-panel-title-row">
            <h3>{session.user_agent || accountMessages.unknownDeviceLabel}</h3>
            <div className="account-center-section-badges">
              <span className={`account-center-badge ${session.is_current ? "is-soft" : ""}`}>
                {session.is_current ? accountMessages.sessionStateCurrent : accountMessages.sessionStateActive}
              </span>
            </div>
          </div>
          <div className="account-center-session-meta">
            <span className="account-center-badge">{session.issued_ip || accountMessages.valueNotAvailable}</span>
            <span className="account-center-badge">
              {formatProtectedMessage(accountMessages.sessionLastSeenTemplate, {
                value: formatAccountDate(session.last_seen, locale, accountMessages.valueNotAvailable)
              })}
            </span>
            <span className="account-center-badge">
              {formatProtectedMessage(accountMessages.sessionExpiresTemplate, {
                value: formatAccountDate(session.expires_at, locale, accountMessages.valueNotAvailable)
              })}
            </span>
          </div>
        </div>

        {!session.is_current ? (
          <button
            type="button"
            className="account-center-action"
            onClick={() => onRevokeSession(session.session_id)}
            disabled={saving || loading}
          >
            {accountMessages.revokeSessionAction}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AccountSessionsSection({ loading, saving, sessionsPayload, onRevokeSession }: AccountSessionsSectionProps) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;

  return (
    <section className="account-center-stage-panel account-center-section-stack">
      <div className="account-center-panel-title-row">
        <h2>{accountMessages.sessionsSectionTitle}</h2>
        <p className="account-center-panel-description">{accountMessages.sessionsSectionDescription}</p>
      </div>

      <div className="account-center-section-stack">
        {(sessionsPayload?.items || []).map((session) => (
          <SessionInventoryCard
            key={session.session_id}
            session={session}
            loading={loading}
            saving={saving}
            onRevokeSession={onRevokeSession}
          />
        ))}
      </div>
    </section>
  );
}
