"use client";

import Link from "next/link";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { AccountRouteSections } from "./AccountCenterSections";
import {
  accountRouteBySection,
  accountSectionByRoute,
  formatAccountDate,
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  type AccountProfileDraft,
  type AccountRoute,
  type AccountSection,
  type AccountSessionsPayload
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

function resolveRouteMeta(route: AccountRoute, messages: ReturnType<typeof useProtectedI18n>["messages"]["accountCenter"]) {
  switch (route) {
    case "/account/security":
      return {
        kicker: messages.routeSecurityKicker,
        description: messages.routeSecurityDescription
      };
    case "/account/sessions":
      return {
        kicker: messages.routeSessionsKicker,
        description: messages.routeSessionsDescription
      };
    case "/account/api-credentials":
      return {
        kicker: messages.routeCredentialsKicker,
        description: messages.routeCredentialsDescription
      };
    case "/account/profile":
    default:
      return {
        kicker: messages.routeProfileKicker,
        description: messages.routeProfileDescription
      };
  }
}

function resolveRouteActions(route: AccountRoute, messages: ReturnType<typeof useProtectedI18n>["messages"]["accountCenter"]) {
  switch (route) {
    case "/account/security":
      return [
        { href: "/account/sessions", label: messages.routeActionReviewSessions },
        { href: "/admin/overview", label: messages.routeActionOpenAdmin }
      ];
    case "/account/sessions":
      return [
        { href: "/account/security", label: messages.routeActionOpenSecurity },
        { href: "/admin/overview", label: messages.routeActionOpenAdmin }
      ];
    case "/account/api-credentials":
      return [
        { href: "/", label: messages.routeActionOpenMarketplace },
        { href: "/account/profile", label: messages.routeActionOpenProfile }
      ];
    case "/account/profile":
    default:
      return [
        { href: "/", label: messages.routeActionOpenMarketplace },
        { href: "/admin/overview", label: messages.routeActionOpenAdmin }
      ];
  }
}

function resolveRouteSignal(route: AccountRoute, messages: ReturnType<typeof useProtectedI18n>["messages"]["accountCenter"]) {
  switch (route) {
    case "/account/security":
      return messages.routeSignalSecurity;
    case "/account/sessions":
      return messages.routeSignalSessions;
    case "/account/api-credentials":
      return messages.routeSignalCredentials;
    case "/account/profile":
    default:
      return messages.routeSignalProfile;
  }
}

function resolveSectionLabel(section: AccountSection, messages: ReturnType<typeof useProtectedI18n>["messages"]["accountCenter"]) {
  switch (section) {
    case "security":
      return messages.sectionSecurity;
    case "sessions":
      return messages.sectionSessions;
    case "credentials":
      return messages.sectionCredentials;
    case "profile":
    default:
      return messages.sectionProfile;
  }
}

function resolveSectionRouteHint(section: AccountSection, messages: ReturnType<typeof useProtectedI18n>["messages"]["accountCenter"]) {
  switch (section) {
    case "security":
      return messages.routeHintSecurity;
    case "sessions":
      return messages.routeHintSessions;
    case "credentials":
      return messages.routeHintCredentials;
    case "profile":
    default:
      return messages.routeHintProfile;
  }
}

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
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.accountCenter;
  const routeMeta = resolveRouteMeta(route, accountMessages);
  const routeActions = resolveRouteActions(route, accountMessages);
  const activeSection = accountSectionByRoute[route];
  const activeSectionLabel = resolveSectionLabel(activeSection, accountMessages);
  const latestCredentialSecretMessage = latestCredentialSecret
    ? formatProtectedMessage(
        latestCredentialSecret.action === "created"
          ? accountMessages.latestSecretCreatedTemplate
          : accountMessages.latestSecretRotatedTemplate,
        {
          name: latestCredentialSecret.name,
          plaintextKey: latestCredentialSecret.plaintextKey
        }
      )
    : "";

  return (
    <div className="account-center-stage">
      <section className="account-center-stage-panel account-center-hero">
        <div className="account-center-panel-title-row">
          <p className="account-center-kicker">{routeMeta.kicker}</p>
          <h1>{accountMessages.pageTitle}</h1>
          <p className="account-center-description">{routeMeta.description}</p>
        </div>

        <div className="account-center-summary-grid">
          {metricItems.map((metric) => (
            <div key={metric.label} className="account-center-summary-card">
              <div className="account-center-summary-label">{metric.label}</div>
              <div className="account-center-summary-value">{metric.value}</div>
              <div className="account-center-summary-detail">{accountMessages.metricLiveSnapshotDetail}</div>
            </div>
          ))}
        </div>

        <div className="account-center-hero-actions">
          <button type="button" className="account-center-action is-primary" onClick={onRefresh} disabled={loading || saving}>
            {loading ? accountMessages.refreshingAction : accountMessages.refreshAction}
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
        {latestCredentialSecretMessage ? <div className="account-center-secret">{latestCredentialSecretMessage}</div> : null}
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
              <p className="account-center-section-kicker">{accountMessages.navigationKicker}</p>
              <h2>{accountMessages.navigationTitle}</h2>
              <p className="account-center-panel-description">{accountMessages.navigationDescription}</p>
            </div>

            <div className="account-center-links">
              {Object.entries(accountRouteBySection).map(([section, href]) => (
                <Link key={href} href={href} className={`account-center-tab-link ${route === href ? "is-active" : ""}`}>
                  <span>{resolveSectionLabel(section as AccountSection, accountMessages)}</span>
                  <span>{resolveSectionRouteHint(section as AccountSection, accountMessages)}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">{accountMessages.signalsKicker}</p>
              <h2>{accountMessages.signalsTitle}</h2>
            </div>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.signalCurrentSectionTemplate, { section: activeSectionLabel })}
            </p>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.signalAvatarInitialsTemplate, { initials: avatarInitials })}
            </p>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.signalSessionsTemplate, { count: sessionsPayload?.total || 0 })}
            </p>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.signalCredentialsTemplate, { count: credentialsPayload?.total || 0 })}
            </p>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.signalRouteFocusTemplate, { value: routeMeta.kicker })}
            </p>
            <p className="account-center-surface-copy">{resolveRouteSignal(route, accountMessages)}</p>
          </section>

          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">{accountMessages.quickActionsKicker}</p>
              <h2>{accountMessages.quickActionsTitle}</h2>
            </div>
            <div className="account-center-action-row">
              <Link href="/" className="account-center-action">
                {accountMessages.quickActionMarketplace}
              </Link>
              <Link href="/admin/overview" className="account-center-action">
                {accountMessages.quickActionAdmin}
              </Link>
              <Link href="/account/sessions" className="account-center-action">
                {accountMessages.quickActionSessions}
              </Link>
              <Link href="/account/api-credentials" className="account-center-action">
                {accountMessages.quickActionApiCredentials}
              </Link>
            </div>
          </section>

          <section className="account-center-stage-panel account-center-section-stack account-center-side-panel-highlight">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">{accountMessages.safetyKicker}</p>
              <h2>{accountMessages.safetyTitle}</h2>
            </div>
            <p className="account-center-surface-copy">{accountMessages.safetyNotePrimary}</p>
            <p className="account-center-surface-copy">
              {formatProtectedMessage(accountMessages.safetyCurrentSessionExpiresTemplate, {
                value: formatAccountDate(sessionsPayload?.session_expires_at || null, locale, accountMessages.valueNotAvailable)
              })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
