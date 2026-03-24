import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCenterContent } from "@/src/features/accountCenter/AccountCenterContent";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type {
  AccountAPIKeysPayload,
  AccountProfilePayload,
  AccountRoute,
  AccountSessionsPayload
} from "@/src/features/accountCenter/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const profilePayload: AccountProfilePayload = {
  user: {
    id: 1,
    username: "admin",
    displayName: "Admin Operator",
    role: "super_admin",
    status: "active"
  },
  profile: {
    display_name: "Admin Operator",
    avatar_url: "https://example.test/avatar.png",
    bio: "Maintains the control plane."
  }
};

const sessionsPayload: AccountSessionsPayload = {
  current_session_id: "session-current",
  session_issued_at: "2026-03-16T10:00:00Z",
  session_expires_at: "2026-03-17T10:00:00Z",
  total: 2,
  items: [
    {
      session_id: "session-current",
      user_agent: "Mock Browser",
      issued_ip: "127.0.0.1",
      last_seen: "2026-03-16T10:00:00Z",
      expires_at: "2026-03-17T10:00:00Z",
      is_current: true
    },
    {
      session_id: "session-cli",
      user_agent: "CLI Session",
      issued_ip: "127.0.0.2",
      last_seen: "2026-03-16T09:00:00Z",
      expires_at: "2026-03-16T18:00:00Z",
      is_current: false
    }
  ]
};

const credentialsPayload: AccountAPIKeysPayload = {
  items: [
    {
      id: 1,
      name: "Primary CLI",
      purpose: "CLI access",
      prefix: "sk_test_123",
      scopes: ["skills.search.read"],
      status: "active",
      created_at: "2026-03-15T10:00:00Z",
      updated_at: "2026-03-15T10:00:00Z"
    }
  ],
  total: 1,
  supported_scopes: ["skills.search.read", "skills.ai_search.read"],
  default_scopes: ["skills.search.read"]
};

function renderAccountRoute(route: AccountRoute) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          accountCenter: {
            pageTitle: "Account Center",
            metricLiveSnapshotDetail: "Live account snapshot",
            refreshAction: "Refresh",
            refreshingAction: "Refreshing...",
            routeProfileKicker: "Profile Workspace",
            routeProfileDescription: "Profile route description",
            routeSecurityKicker: "Security Workspace",
            routeSecurityDescription: "Security route description",
            routeSessionsKicker: "Sessions Workspace",
            routeSessionsDescription: "Sessions route description",
            routeCredentialsKicker: "Credentials Workspace",
            routeCredentialsDescription: "Credentials route description",
            navigationKicker: "Navigation",
            navigationTitle: "Section Links",
            navigationDescription: "Navigation description",
            sectionProfile: "Profile",
            sectionSecurity: "Security",
            sectionSessions: "Sessions",
            sectionCredentials: "Credentials",
            routeHintProfile: "profile lane",
            routeHintSecurity: "security lane",
            routeHintSessions: "sessions lane",
            routeHintCredentials: "credentials lane",
            signalsKicker: "Signals",
            signalsTitle: "Route Signals",
            signalCurrentSectionTemplate: "Current section: {section}",
            signalAvatarInitialsTemplate: "Avatar initials: {initials}",
            signalSessionsTemplate: "Sessions: {count}",
            signalCredentialsTemplate: "Credentials: {count}",
            signalRouteFocusTemplate: "Route focus: {value}",
            routeSignalProfile: "Profile signal",
            routeSignalSecurity: "Security signal",
            routeSignalSessions: "Sessions signal",
            routeSignalCredentials: "Credentials signal",
            quickActionsKicker: "Quick Actions",
            quickActionsTitle: "Action Shortcuts",
            quickActionMarketplace: "Open Marketplace",
            quickActionAdmin: "Open Admin",
            quickActionSessions: "Sessions",
            quickActionApiCredentials: "API Credentials",
            safetyKicker: "Security",
            safetyTitle: "Safety Notes",
            safetyNotePrimary: "Rotate stale credentials.",
            safetyCurrentSessionExpiresTemplate: "Current session expires: {value}",
            latestSecretCreatedTemplate: "Created credential {name}: {plaintextKey}",
            latestSecretRotatedTemplate: "Rotated credential {name}: {plaintextKey}",
            profileSectionTitle: "Profile",
            profileSectionDescription: "Edit public identity fields.",
            profileLoadingMessage: "Loading profile…",
            profileDisplayNamePlaceholder: "Display name",
            profileAvatarUrlPlaceholder: "Avatar URL",
            profileBioPlaceholder: "Bio",
            profileSaveAction: "Save Profile",
            securitySectionTitle: "Session Security",
            securitySectionDescription: "Rotate your password and review active sessions.",
            currentPasswordPlaceholder: "Current password",
            newPasswordPlaceholder: "New password",
            revokeOthersCheckboxLabel: "Revoke other sessions after password change",
            changePasswordAction: "Change Password",
            revokeOtherSessionsAction: "Revoke Other Sessions",
            securitySnapshotTitle: "Security Snapshot",
            securitySnapshotDescription: "Security snapshot description",
            currentSessionTitle: "Current Session",
            currentSessionIssuedTemplate: "issued {value}",
            currentSessionExpiresTemplate: "expires {value}",
            otherActiveSessionsTitle: "Other Active Sessions",
            otherActiveSessionsTemplate: "{count} additional sessions remain active outside the current browser.",
            sessionsSectionTitle: "Session Inventory",
            sessionsSectionDescription: "Device-level access context.",
            unknownDeviceLabel: "Unknown device",
            sessionStateCurrent: "current",
            sessionStateActive: "active",
            sessionLastSeenTemplate: "last seen {value}",
            sessionExpiresTemplate: "expires {value}",
            revokeSessionAction: "Revoke",
            credentialsFactoryTitle: "Credential Factory",
            credentialsFactoryDescription: "Create a personal API credential and set initial scopes.",
            credentialNamePlaceholder: "Credential name",
            credentialPurposePlaceholder: "Purpose",
            credentialExpiresInDaysPlaceholder: "Expires in days",
            credentialScopesPlaceholder: "Scopes separated by commas",
            createCredentialAction: "Create Credential",
            openCredentialDetailAction: "Open Details",
            closePanelAction: "Close Panel",
            credentialsInventoryTitle: "Credential Inventory",
            credentialsInventoryDescription: "Rotate, revoke, or change scopes.",
            credentialNoPurpose: "No purpose",
            credentialCreatedTemplate: "created {value}",
            credentialLastUsedTemplate: "last used {value}",
            rotateCredentialAction: "Rotate",
            revokeCredentialAction: "Revoke",
            updateScopesPlaceholder: "Update scopes",
            applyScopesAction: "Apply Scopes",
            roleLabelSuperAdmin: "Super Admin",
            roleLabelAdmin: "Admin",
            roleLabelAuditor: "Auditor",
            roleLabelMember: "Member",
            roleLabelViewer: "Viewer",
            roleLabelUnknown: "Unknown Role",
            accountStatusLabelActive: "Account Active",
            accountStatusLabelDisabled: "Account Disabled",
            accountStatusLabelUnknown: "Unknown Account Status",
            statusLabelActive: "Credential Active",
            statusLabelRevoked: "Credential Revoked",
            statusLabelExpired: "Credential Expired",
            statusLabelUnknown: "Unknown Credential Status",
            valueNotAvailable: "n/a",
            valueUserFallback: "User",
            valueUserInitialFallback: "U"
          }
        })
      },
      createElement(AccountCenterContent, {
        route,
        loading: false,
        saving: false,
        error: "",
        message: "",
        metricItems: [
          { label: "Role", value: "super_admin" },
          { label: "Status", value: "active" }
        ],
        avatarInitials: "AO",
        profileDraft: {
          displayName: profilePayload.profile.display_name,
          avatarURL: profilePayload.profile.avatar_url,
          bio: profilePayload.profile.bio
        },
        sessionsPayload,
        credentialsPayload,
        credentialDraft: {
          name: "",
          purpose: "",
          expiresInDays: 90,
          scopes: ["skills.search.read"]
        },
        credentialScopeDrafts: {
          1: ["skills.search.read"]
        },
        latestCredentialSecret: null,
        passwordDraft: {
          currentPassword: "",
          newPassword: "",
          revokeOthers: false
        },
        onRefresh: () => undefined,
        onProfileDraftChange: () => undefined,
        onPasswordDraftChange: () => undefined,
        onCredentialDraftChange: () => undefined,
        onCredentialScopeDraftChange: () => undefined,
        onSaveProfile: () => undefined,
        onChangePassword: () => undefined,
        onRevokeOtherSessions: () => undefined,
        onRevokeSession: () => undefined,
        onCreateCredential: async () => true,
        onRotateCredential: () => undefined,
        onRevokeCredential: () => undefined,
        onApplyCredentialScopes: () => undefined
      })
    )
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

describe("account center content", () => {
  it("renders the profile route contract with profile editor controls only", () => {
    const markup = renderAccountRoute("/account/profile");

    expectMarkupToContainAll(markup, [
      "Profile Workspace",
      "Profile route description",
      "Profile",
      "Display name",
      "Avatar URL",
      "Bio",
      "Save Profile",
      "Current section: Profile",
      "profile lane"
    ]);
    expectMarkupToExcludeAll(markup, ["Change Password", "Credential Factory", "Session Inventory"]);
  });

  it("renders the security route contract with password and session posture content", () => {
    const markup = renderAccountRoute("/account/security");

    expectMarkupToContainAll(markup, [
      "Security Workspace",
      "Security route description",
      "Session Security",
      "Current password",
      "New password",
      "Revoke other sessions after password change",
      "Change Password",
      "Revoke Other Sessions",
      "Security Snapshot",
      "Current Session",
      "Other Active Sessions",
      "Current section: Security",
      "security lane"
    ]);
    expectMarkupToExcludeAll(markup, ["Credential Factory"]);
  });

  it("renders the credentials route contract with create and inventory sections", () => {
    const markup = renderAccountRoute("/account/api-credentials");

    expectMarkupToContainAll(markup, [
      "Credentials Workspace",
      "Credentials route description",
      "Credential Factory",
      "Credential Inventory",
      "Create Credential",
      "Open Details",
      "Credential Active",
      'data-testid="account-credential-card-1"',
      "Primary CLI",
      "CLI access",
      "Current section: Credentials",
      "credentials lane"
    ]);
    expectMarkupToExcludeAll(markup, ["Change Password", 'role="dialog"']);
  });
});
