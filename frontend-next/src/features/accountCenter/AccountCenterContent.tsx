import Link from "next/link";

import { AccountRouteSections } from "./AccountCenterSections";
import {
  accountRouteBySection,
  accountSectionByRoute,
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  type AccountProfileDraft,
  type AccountRoute,
  type AccountSessionsPayload,
  formatAccountDate
} from "./model";

interface AccountCenterContentProps {
  route: AccountRoute;
  loading: boolean;
  saving: boolean;
  error: string;
  message: string;
  metricItems: Array<{ label: string; value: string }>;
  avatarInitials: string;
  profileDraft: AccountProfileDraft;
  sessionsPayload: AccountSessionsPayload | null;
  credentialsPayload: AccountAPIKeysPayload | null;
  credentialDraft: AccountAPIKeyCreateDraft;
  credentialScopeDrafts: Record<number, string[]>;
  latestCredentialSecret: AccountAPIKeySecretState | null;
  passwordDraft: {
    currentPassword: string;
    newPassword: string;
    revokeOthers: boolean;
  };
  onRefresh: () => void;
  onProfileDraftChange: (patch: Partial<AccountProfileDraft>) => void;
  onPasswordDraftChange: (patch: Partial<AccountCenterContentProps["passwordDraft"]>) => void;
  onCredentialDraftChange: (patch: Partial<AccountAPIKeyCreateDraft>) => void;
  onCredentialScopeDraftChange: (keyId: number, rawValue: string) => void;
  onSaveProfile: () => void;
  onChangePassword: () => void;
  onRevokeOtherSessions: () => void;
  onRevokeSession: (sessionId: string) => void;
  onCreateCredential: () => void;
  onRotateCredential: (keyId: number) => void;
  onRevokeCredential: (keyId: number) => void;
  onApplyCredentialScopes: (keyId: number) => void;
}

const accountRouteMeta: Record<AccountRoute, { description: string; kicker: string }> = {
  "/account/profile": {
    description: "Review your public identity, session hygiene, and personal credentials from the prototype-aligned account workbench.",
    kicker: "Profile Workspace"
  },
  "/account/security": {
    description: "Manage password rotation, revoke stale sessions, and keep the signed-in operator posture tight.",
    kicker: "Security Workspace"
  },
  "/account/sessions": {
    description: "Inspect active sessions, expiration windows, and per-device access context.",
    kicker: "Sessions Workspace"
  },
  "/account/api-credentials": {
    description: "Create, rotate, scope, and revoke personal API credentials without leaving the account workbench.",
    kicker: "Credentials Workspace"
  }
};

const accountRouteActionLinks: Record<AccountRoute, Array<{ href: string; label: string }>> = {
  "/account/profile": [
    { href: "/", label: "Open Marketplace" },
    { href: "/admin/overview", label: "Open Admin" }
  ],
  "/account/security": [
    { href: "/account/sessions", label: "Review Sessions" },
    { href: "/admin/overview", label: "Open Admin" }
  ],
  "/account/sessions": [
    { href: "/account/security", label: "Open Security" },
    { href: "/admin/overview", label: "Open Admin" }
  ],
  "/account/api-credentials": [
    { href: "/", label: "Open Marketplace" },
    { href: "/account/profile", label: "Open Profile" }
  ]
};

const accountRouteSignalDescriptions: Record<AccountRoute, string> = {
  "/account/profile": "Use the profile route for identity edits, public metadata, and personal presentation.",
  "/account/security": "Use the security route for password posture and session-revocation decisions.",
  "/account/sessions": "Use the sessions route to inspect device access and revoke suspicious browsers.",
  "/account/api-credentials": "Use the credentials route to issue, scope, rotate, and revoke personal API keys."
};

export function AccountCenterContent({
  route,
  loading,
  saving,
  error,
  message,
  metricItems,
  avatarInitials,
  profileDraft,
  sessionsPayload,
  credentialsPayload,
  credentialDraft,
  credentialScopeDrafts,
  latestCredentialSecret,
  passwordDraft,
  onRefresh,
  onProfileDraftChange,
  onPasswordDraftChange,
  onCredentialDraftChange,
  onCredentialScopeDraftChange,
  onSaveProfile,
  onChangePassword,
  onRevokeOtherSessions,
  onRevokeSession,
  onCreateCredential,
  onRotateCredential,
  onRevokeCredential,
  onApplyCredentialScopes
}: AccountCenterContentProps) {
  const routeMeta = accountRouteMeta[route];
  const routeActions = accountRouteActionLinks[route];
  const activeSection = accountSectionByRoute[route];

  return (
    <div className="account-center-stage">
      <section className="account-center-stage-panel account-center-hero">
        <div className="account-center-panel-title-row">
          <p className="account-center-kicker">{routeMeta.kicker}</p>
          <h1>Account Center</h1>
          <p className="account-center-description">{routeMeta.description}</p>
        </div>

        <div className="account-center-summary-grid">
          {metricItems.map((metric) => (
            <div key={metric.label} className="account-center-summary-card">
              <div className="account-center-summary-label">{metric.label}</div>
              <div className="account-center-summary-value">{metric.value}</div>
              <div className="account-center-summary-detail">Live account snapshot</div>
            </div>
          ))}
        </div>

        <div className="account-center-hero-actions">
          <button type="button" className="account-center-action is-primary" onClick={onRefresh} disabled={loading || saving}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          {routeActions.map((action) => (
            <Link key={action.href} href={action.href} className="account-center-action">
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="account-center-feedback-stack">
        {error ? <div className="account-center-message is-error">{error}</div> : null}
        {message ? <div className="account-center-message is-success">{message}</div> : null}
        {latestCredentialSecret ? (
          <div className="account-center-secret">
            {latestCredentialSecret.action} credential <strong>{latestCredentialSecret.name}</strong>: {latestCredentialSecret.plaintextKey}
          </div>
        ) : null}
      </div>

      <div className="account-center-stage-grid">
        <div className="account-center-left">
          <AccountRouteSections
            route={route}
            loading={loading}
            saving={saving}
            avatarInitials={avatarInitials}
            profileDraft={profileDraft}
            sessionsPayload={sessionsPayload}
            credentialsPayload={credentialsPayload}
            credentialDraft={credentialDraft}
            credentialScopeDrafts={credentialScopeDrafts}
            passwordDraft={passwordDraft}
            onProfileDraftChange={onProfileDraftChange}
            onPasswordDraftChange={onPasswordDraftChange}
            onCredentialDraftChange={onCredentialDraftChange}
            onCredentialScopeDraftChange={onCredentialScopeDraftChange}
            onSaveProfile={onSaveProfile}
            onChangePassword={onChangePassword}
            onRevokeOtherSessions={onRevokeOtherSessions}
            onRevokeSession={onRevokeSession}
            onCreateCredential={onCreateCredential}
            onRotateCredential={onRotateCredential}
            onRevokeCredential={onRevokeCredential}
            onApplyCredentialScopes={onApplyCredentialScopes}
          />
        </div>

        <aside className="account-center-right">
          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">Navigation</p>
              <h2>Section Links</h2>
              <p className="account-center-panel-description">
                Open the dedicated account subsection routes while keeping one shared shell and summary layer.
              </p>
            </div>

            <div className="account-center-links">
              {Object.entries(accountRouteBySection).map(([section, href]) => (
                <Link key={href} href={href} className={`account-center-tab-link ${route === href ? "is-active" : ""}`}>
                  <span>{section}</span>
                  <span>{href.replace("/account/", "")}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">Signals</p>
              <h2>Route Signals</h2>
            </div>
            <p className="account-center-surface-copy">Current section: {activeSection}</p>
            <p className="account-center-surface-copy">Avatar initials: {avatarInitials}</p>
            <p className="account-center-surface-copy">Sessions: {sessionsPayload?.total || 0}</p>
            <p className="account-center-surface-copy">Credentials: {credentialsPayload?.total || 0}</p>
            <p className="account-center-surface-copy">Route focus: {routeMeta.kicker}</p>
            <p className="account-center-surface-copy">{accountRouteSignalDescriptions[route]}</p>
          </section>

          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">Quick Actions</p>
              <h2>Action Shortcuts</h2>
            </div>
            <div className="account-center-action-row">
              <Link href="/" className="account-center-action">
                Open Marketplace
              </Link>
              <Link href="/admin/overview" className="account-center-action">
                Open Admin
              </Link>
              <Link href="/account/sessions" className="account-center-action">
                Sessions
              </Link>
              <Link href="/account/api-credentials" className="account-center-action">
                API Credentials
              </Link>
            </div>
          </section>

          <section className="account-center-stage-panel account-center-section-stack account-center-side-panel-highlight">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">Security</p>
              <h2>Safety Notes</h2>
            </div>
            <p className="account-center-surface-copy">
              Rotate stale credentials, revoke unknown devices, and keep profile data current before opening admin workflows.
            </p>
            <p className="account-center-surface-copy">
              Current session expires: {formatAccountDate(sessionsPayload?.session_expires_at || null)}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
