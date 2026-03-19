import type { AccountRoute } from "./model";
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
