import type {
  AccountAPIKeyCreateDraft,
  AccountAPIKeyItem,
  AccountAPIKeysPayload,
  AccountProfileDraft,
  AccountRoute,
  AccountSessionsPayload
} from "./model";
import { formatAccountDate } from "./model";

interface AccountProfileSectionProps {
  loading: boolean;
  saving: boolean;
  avatarInitials: string;
  profileDraft: AccountProfileDraft;
  onProfileDraftChange: (patch: Partial<AccountProfileDraft>) => void;
  onSaveProfile: () => void;
}

interface AccountSecuritySectionProps {
  loading: boolean;
  saving: boolean;
  passwordDraft: {
    currentPassword: string;
    newPassword: string;
    revokeOthers: boolean;
  };
  sessionsPayload: AccountSessionsPayload | null;
  onPasswordDraftChange: (patch: Partial<AccountSecuritySectionProps["passwordDraft"]>) => void;
  onChangePassword: () => void;
  onRevokeOtherSessions: () => void;
}

interface AccountSessionsSectionProps {
  loading: boolean;
  saving: boolean;
  sessionsPayload: AccountSessionsPayload | null;
  onRevokeSession: (sessionId: string) => void;
}

interface AccountCredentialsSectionProps {
  loading: boolean;
  saving: boolean;
  credentialDraft: AccountAPIKeyCreateDraft;
  credentialScopeDrafts: Record<number, string[]>;
  credentialsPayload: AccountAPIKeysPayload | null;
  onCredentialDraftChange: (patch: Partial<AccountAPIKeyCreateDraft>) => void;
  onCredentialScopeDraftChange: (keyId: number, rawValue: string) => void;
  onCreateCredential: () => void;
  onRotateCredential: (keyId: number) => void;
  onRevokeCredential: (keyId: number) => void;
  onApplyCredentialScopes: (keyId: number) => void;
}

interface AccountRouteSectionsProps
  extends AccountProfileSectionProps,
    AccountSecuritySectionProps,
    AccountSessionsSectionProps,
    AccountCredentialsSectionProps {
  route: AccountRoute;
}

function joinScopes(value: string[]) {
  return value.join(", ");
}

function AccountProfileSection({
  loading,
  saving,
  avatarInitials,
  profileDraft,
  onProfileDraftChange,
  onSaveProfile
}: AccountProfileSectionProps) {
  return (
    <section className="account-center-stage-panel account-center-section-stack">
      <div className="account-center-profile-head">
        <div className="account-center-panel-title-row">
          <h2>Profile</h2>
          <p className="account-center-panel-description">
            Edit public identity fields for the current signed-in account.
          </p>
        </div>
        <div className="account-center-avatar">{avatarInitials}</div>
      </div>

      <div className="account-center-form-grid is-two-column">
        <input
          className="account-center-field"
          value={profileDraft.displayName}
          placeholder="Display name"
          disabled={loading || saving}
          onChange={(event) => onProfileDraftChange({ displayName: event.target.value })}
        />
        <input
          className="account-center-field"
          value={profileDraft.avatarURL}
          placeholder="Avatar URL"
          disabled={loading || saving}
          onChange={(event) => onProfileDraftChange({ avatarURL: event.target.value })}
        />
      </div>

      <textarea
        className="account-center-textarea"
        value={profileDraft.bio}
        placeholder="Bio"
        disabled={loading || saving}
        onChange={(event) => onProfileDraftChange({ bio: event.target.value })}
      />

      <div className="account-center-action-row">
        <button type="button" className="account-center-action is-primary" onClick={onSaveProfile} disabled={saving || loading}>
          Save Profile
        </button>
      </div>
    </section>
  );
}

function AccountSecuritySection({
  loading,
  saving,
  passwordDraft,
  sessionsPayload,
  onPasswordDraftChange,
  onChangePassword,
  onRevokeOtherSessions
}: AccountSecuritySectionProps) {
  return (
    <>
      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>Session Security</h2>
          <p className="account-center-panel-description">Rotate your password and review active sessions.</p>
        </div>

        <div className="account-center-form-grid is-two-column">
          <input
            className="account-center-field"
            type="password"
            value={passwordDraft.currentPassword}
            placeholder="Current password"
            disabled={loading || saving}
            onChange={(event) => onPasswordDraftChange({ currentPassword: event.target.value })}
          />
          <input
            className="account-center-field"
            type="password"
            value={passwordDraft.newPassword}
            placeholder="New password"
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
          Revoke other sessions after password change
        </label>

        <div className="account-center-action-row">
          <button type="button" className="account-center-action is-primary" onClick={onChangePassword} disabled={saving || loading}>
            Change Password
          </button>
          <button type="button" className="account-center-action" onClick={onRevokeOtherSessions} disabled={saving || loading}>
            Revoke Other Sessions
          </button>
        </div>
      </section>

      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>Security Snapshot</h2>
          <p className="account-center-panel-description">
            Live account session posture for the password and revoke workflow.
          </p>
        </div>

        <div className="account-center-section-stack">
          <div className="account-center-session-card">
            <div className="account-center-panel-title-row">
              <h3>Current Session</h3>
            </div>
            <div className="account-center-session-meta">
              <span className="account-center-badge">{sessionsPayload?.current_session_id || "n/a"}</span>
              <span className="account-center-badge">
                issued {formatAccountDate(sessionsPayload?.session_issued_at || null)}
              </span>
              <span className="account-center-badge">
                expires {formatAccountDate(sessionsPayload?.session_expires_at || null)}
              </span>
            </div>
          </div>
          <div className="account-center-session-card">
            <div className="account-center-panel-title-row">
              <h3>Other Active Sessions</h3>
            </div>
            <p className="account-center-surface-copy">
              {Math.max(0, (sessionsPayload?.total || 0) - 1)} additional sessions remain active outside the current browser.
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
  return (
    <div className="account-center-session-card">
      <div className="account-center-session-row">
        <div className="account-center-section-stack">
          <div className="account-center-panel-title-row">
            <h3>{session.user_agent || "Unknown device"}</h3>
            <div className="account-center-section-badges">
              <span className={`account-center-badge ${session.is_current ? "is-soft" : ""}`}>
                {session.is_current ? "current" : "active"}
              </span>
            </div>
          </div>
          <div className="account-center-session-meta">
            <span className="account-center-badge">{session.issued_ip || "n/a"}</span>
            <span className="account-center-badge">last seen {formatAccountDate(session.last_seen)}</span>
            <span className="account-center-badge">expires {formatAccountDate(session.expires_at)}</span>
          </div>
        </div>

        {!session.is_current ? (
          <button
            type="button"
            className="account-center-action"
            onClick={() => onRevokeSession(session.session_id)}
            disabled={saving || loading}
          >
            Revoke
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AccountSessionsSection({ loading, saving, sessionsPayload, onRevokeSession }: AccountSessionsSectionProps) {
  return (
    <section className="account-center-stage-panel account-center-section-stack">
      <div className="account-center-panel-title-row">
        <h2>Session Inventory</h2>
        <p className="account-center-panel-description">
          Device-level access context, expiration windows, and direct revoke controls.
        </p>
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

function CredentialInventoryCard({
  credential,
  loading,
  saving,
  credentialScopeDrafts,
  onCredentialScopeDraftChange,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: {
  credential: AccountAPIKeyItem;
  loading: boolean;
  saving: boolean;
  credentialScopeDrafts: Record<number, string[]>;
  onCredentialScopeDraftChange: (keyId: number, rawValue: string) => void;
  onRotateCredential: (keyId: number) => void;
  onRevokeCredential: (keyId: number) => void;
  onApplyCredentialScopes: (keyId: number) => void;
}) {
  return (
    <div data-testid={`account-credential-card-${credential.id}`} className="account-center-credential-card">
      <div className="account-center-section-stack">
        <div className="account-center-credential-row">
          <div className="account-center-section-stack">
            <div className="account-center-panel-title-row">
              <h3>{credential.name}</h3>
              <div className="account-center-section-badges">
                <span className={`account-center-badge ${credential.status === "active" ? "is-soft" : ""}`}>
                  {credential.status}
                </span>
              </div>
            </div>
            <p className="account-center-surface-copy">{credential.purpose || "No purpose"}</p>
            <div className="account-center-credential-meta">
              <span className="account-center-badge">{credential.prefix}</span>
              <span className="account-center-badge">created {formatAccountDate(credential.created_at)}</span>
              <span className="account-center-badge">last used {formatAccountDate(credential.last_used_at)}</span>
            </div>
          </div>

          <div className="account-center-action-row">
            <button
              type="button"
              className="account-center-action"
              onClick={() => onRotateCredential(credential.id)}
              disabled={saving || loading}
            >
              Rotate
            </button>
            <button
              type="button"
              className="account-center-action"
              onClick={() => onRevokeCredential(credential.id)}
              disabled={saving || loading}
            >
              Revoke
            </button>
          </div>
        </div>

        <input
          className="account-center-field"
          value={joinScopes(credentialScopeDrafts[credential.id] || credential.scopes)}
          placeholder="Update scopes"
          disabled={loading || saving}
          onChange={(event) => onCredentialScopeDraftChange(credential.id, event.target.value)}
        />

        <div className="account-center-action-row">
          <button
            type="button"
            className="account-center-action is-primary"
            onClick={() => onApplyCredentialScopes(credential.id)}
            disabled={saving || loading}
          >
            Apply Scopes
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountCredentialsSection({
  loading,
  saving,
  credentialDraft,
  credentialScopeDrafts,
  credentialsPayload,
  onCredentialDraftChange,
  onCredentialScopeDraftChange,
  onCreateCredential,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: AccountCredentialsSectionProps) {
  return (
    <>
      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>Credential Factory</h2>
          <p className="account-center-panel-description">Create a personal API credential and set initial scopes.</p>
        </div>

        <div className="account-center-form-grid">
          <input
            className="account-center-field"
            value={credentialDraft.name}
            placeholder="Credential name"
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ name: event.target.value })}
          />
          <input
            className="account-center-field"
            value={credentialDraft.purpose}
            placeholder="Purpose"
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ purpose: event.target.value })}
          />
          <input
            className="account-center-field"
            type="number"
            value={String(credentialDraft.expiresInDays)}
            placeholder="Expires in days"
            disabled={loading || saving}
            onChange={(event) => onCredentialDraftChange({ expiresInDays: Number(event.target.value || 0) })}
          />
          <input
            className="account-center-field"
            value={joinScopes(credentialDraft.scopes)}
            placeholder="Scopes separated by commas"
            disabled={loading || saving}
            onChange={(event) =>
              onCredentialDraftChange({ scopes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })
            }
          />
        </div>

        <div className="account-center-action-row">
          <button type="button" className="account-center-action is-primary" onClick={onCreateCredential} disabled={saving || loading}>
            Create Credential
          </button>
        </div>
      </section>

      <section className="account-center-stage-panel account-center-section-stack">
        <div className="account-center-panel-title-row">
          <h2>Credential Inventory</h2>
          <p className="account-center-panel-description">
            Rotate, revoke, or change scopes for your active credential set.
          </p>
        </div>

        <div className="account-center-section-stack">
          {(credentialsPayload?.items || []).map((credential) => (
            <CredentialInventoryCard
              key={credential.id}
              credential={credential}
              loading={loading}
              saving={saving}
              credentialScopeDrafts={credentialScopeDrafts}
              onCredentialScopeDraftChange={onCredentialScopeDraftChange}
              onRotateCredential={onRotateCredential}
              onRevokeCredential={onRevokeCredential}
              onApplyCredentialScopes={onApplyCredentialScopes}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export function AccountRouteSections(props: AccountRouteSectionsProps) {
  if (props.route === "/account/profile") {
    return (
      <AccountProfileSection
        loading={props.loading}
        saving={props.saving}
        avatarInitials={props.avatarInitials}
        profileDraft={props.profileDraft}
        onProfileDraftChange={props.onProfileDraftChange}
        onSaveProfile={props.onSaveProfile}
      />
    );
  }

  if (props.route === "/account/security") {
    return (
      <AccountSecuritySection
        loading={props.loading}
        saving={props.saving}
        passwordDraft={props.passwordDraft}
        sessionsPayload={props.sessionsPayload}
        onPasswordDraftChange={props.onPasswordDraftChange}
        onChangePassword={props.onChangePassword}
        onRevokeOtherSessions={props.onRevokeOtherSessions}
      />
    );
  }

  if (props.route === "/account/sessions") {
    return (
      <AccountSessionsSection
        loading={props.loading}
        saving={props.saving}
        sessionsPayload={props.sessionsPayload}
        onRevokeSession={props.onRevokeSession}
      />
    );
  }

  return (
    <AccountCredentialsSection
      loading={props.loading}
      saving={props.saving}
      credentialDraft={props.credentialDraft}
      credentialScopeDrafts={props.credentialScopeDrafts}
      credentialsPayload={props.credentialsPayload}
      onCredentialDraftChange={props.onCredentialDraftChange}
      onCredentialScopeDraftChange={props.onCredentialScopeDraftChange}
      onCreateCredential={props.onCreateCredential}
      onRotateCredential={props.onRotateCredential}
      onRevokeCredential={props.onRevokeCredential}
      onApplyCredentialScopes={props.onApplyCredentialScopes}
    />
  );
}
