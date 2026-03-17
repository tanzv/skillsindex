import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCenterContent } from "@/src/features/accountCenter/AccountCenterContent";
import type {
  AccountAPIKeysPayload,
  AccountProfilePayload,
  AccountRoute,
  AccountSessionsPayload
} from "@/src/features/accountCenter/model";

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
      onCreateCredential: () => undefined,
      onRotateCredential: () => undefined,
      onRevokeCredential: () => undefined,
      onApplyCredentialScopes: () => undefined
    })
  );
}

describe("account center content", () => {
  it("renders profile route with profile editor only", () => {
    const markup = renderAccountRoute("/account/profile");

    expect(markup).toContain("Profile");
    expect(markup).toContain("Save Profile");
    expect(markup).not.toContain("Change Password");
    expect(markup).not.toContain("Credential Factory");
    expect(markup).not.toContain("Session Inventory");
  });

  it("renders security route with password and session posture content", () => {
    const markup = renderAccountRoute("/account/security");

    expect(markup).toContain("Session Security");
    expect(markup).toContain("Change Password");
    expect(markup).toContain("Revoke Other Sessions");
    expect(markup).toContain("Security Snapshot");
    expect(markup).not.toContain("Credential Factory");
  });

  it("renders credentials route with create and inventory sections", () => {
    const markup = renderAccountRoute("/account/api-credentials");

    expect(markup).toContain("Credential Factory");
    expect(markup).toContain("Credential Inventory");
    expect(markup).toContain("Apply Scopes");
    expect(markup).not.toContain("Change Password");
  });
});
