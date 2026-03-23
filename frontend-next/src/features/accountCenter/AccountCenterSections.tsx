import type { ReactElement } from "react";

import type { AccountRoute } from "./model";
import { accountSectionByRoute, type AccountSection } from "./model";
import {
  type AccountCredentialsSectionProps,
  type AccountProfileSectionProps,
  type AccountSecuritySectionProps,
  type AccountSessionsSectionProps
} from "./AccountCenterSectionProps";
import { AccountCredentialsSection } from "./AccountCenterCredentialSections";
import {
  AccountProfileSection,
  AccountSecuritySection,
  AccountSessionsSection
} from "./AccountCenterProfileSecuritySections";

interface AccountRouteSectionsProps
  extends AccountProfileSectionProps,
    AccountSecuritySectionProps,
    AccountSessionsSectionProps,
    AccountCredentialsSectionProps {
  route: AccountRoute;
}

type AccountSectionRenderer = (props: AccountRouteSectionsProps) => ReactElement;

const accountSectionRenderers: Record<AccountSection, AccountSectionRenderer> = {
  profile: (props) => (
    <AccountProfileSection
      loading={props.loading}
      saving={props.saving}
      avatarInitials={props.avatarInitials}
      profileDraft={props.profileDraft}
      onProfileDraftChange={props.onProfileDraftChange}
      onSaveProfile={props.onSaveProfile}
    />
  ),
  security: (props) => (
    <AccountSecuritySection
      loading={props.loading}
      saving={props.saving}
      passwordDraft={props.passwordDraft}
      sessionsPayload={props.sessionsPayload}
      onPasswordDraftChange={props.onPasswordDraftChange}
      onChangePassword={props.onChangePassword}
      onRevokeOtherSessions={props.onRevokeOtherSessions}
    />
  ),
  sessions: (props) => (
    <AccountSessionsSection
      loading={props.loading}
      saving={props.saving}
      sessionsPayload={props.sessionsPayload}
      onRevokeSession={props.onRevokeSession}
    />
  ),
  credentials: (props) => (
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
  )
};

export function AccountRouteSections(props: AccountRouteSectionsProps) {
  const section = accountSectionByRoute[props.route];

  return accountSectionRenderers[section](props);
}
