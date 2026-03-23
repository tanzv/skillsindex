"use client";

import Link from "next/link";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  buildAccountQuickActions,
  listAccountSectionEntries,
  resolveAccountSectionLabel,
  resolveAccountSectionRouteHint,
  resolveAccountRouteActions,
  resolveAccountRouteMeta,
  resolveAccountRouteSignal
} from "@/src/lib/routing/accountRouteMeta";

import { AccountRouteSections } from "./AccountCenterSections";
import {
  accountSectionByRoute,
  formatAccountDate,
  type AccountAPIKeyCreateDraft,
  type AccountAPIKeySecretState,
  type AccountAPIKeysPayload,
  type AccountProfileDraft,
  type AccountRoute,
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
  const routeMeta = resolveAccountRouteMeta(route, accountMessages);
  const routeActions = resolveAccountRouteActions(route, accountMessages);
  const quickActions = buildAccountQuickActions(accountMessages);
  const activeSection = accountSectionByRoute[route];
  const activeSectionLabel = resolveAccountSectionLabel(activeSection, accountMessages);
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
              {listAccountSectionEntries().map(({ section, route: sectionRoute }) => (
                <Link
                  key={sectionRoute}
                  href={sectionRoute}
                  className={`account-center-tab-link ${route === sectionRoute ? "is-active" : ""}`}
                >
                  <span>{resolveAccountSectionLabel(section, accountMessages)}</span>
                  <span>{resolveAccountSectionRouteHint(section, accountMessages)}</span>
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
            <p className="account-center-surface-copy">{resolveAccountRouteSignal(route, accountMessages)}</p>
          </section>

          <section className="account-center-stage-panel account-center-section-stack">
            <div className="account-center-panel-title-row">
              <p className="account-center-section-kicker">{accountMessages.quickActionsKicker}</p>
              <h2>{accountMessages.quickActionsTitle}</h2>
            </div>
            <div className="account-center-action-row">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="account-center-action">
                  {action.label}
                </Link>
              ))}
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
