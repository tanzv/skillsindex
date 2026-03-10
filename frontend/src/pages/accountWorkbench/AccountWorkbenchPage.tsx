import { ConsoleWorkbench, WorkbenchDefinition } from "./ConsoleWorkbench";

export type AccountRoute = "/account/profile" | "/account/security" | "/account/sessions";

interface AccountWorkbenchPageProps {
  route: AccountRoute;
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function requiredSessionID(raw: unknown): string | null {
  const value = String(raw || "").trim();
  return value || null;
}

const accountWorkbenchDefinitions: Record<AccountRoute, WorkbenchDefinition> = {
  "/account/profile": {
    title: "Account Profile",
    subtitle: "Read and update identity metadata for the current session account.",
    resources: [
      {
        key: "profile",
        title: "Profile Detail",
        description: "User identity and profile metadata.",
        buildPath: () => "/api/v1/account/profile"
      }
    ],
    actions: [
      {
        key: "updateProfile",
        title: "Update Profile",
        submitText: "Save Profile",
        fields: [
          { key: "display_name", label: "Display Name", type: "text", placeholder: "Display name" },
          { key: "avatar_url", label: "Avatar URL", type: "text", placeholder: "https://..." },
          { key: "bio", label: "Bio", type: "textarea", placeholder: "Short profile bio" }
        ],
        buildPath: () => "/api/v1/account/profile",
        refreshResources: ["profile"]
      }
    ]
  },
  "/account/security": {
    title: "Account Security",
    subtitle: "Rotate password and optionally revoke other active sessions.",
    resources: [
      {
        key: "profile",
        title: "Current Account",
        description: "Identity context before credential rotation.",
        buildPath: () => "/api/v1/account/profile"
      }
    ],
    actions: [
      {
        key: "changePassword",
        title: "Change Password",
        submitText: "Rotate Password",
        fields: [
          { key: "current_password", label: "Current Password", type: "password", required: true },
          { key: "new_password", label: "New Password", type: "password", required: true },
          { key: "revoke_other_sessions", label: "Revoke Other Sessions", type: "switch", defaultValue: false }
        ],
        buildPath: () => "/api/v1/account/security/password"
      }
    ]
  },
  "/account/sessions": {
    title: "Session Management",
    subtitle: "List active sessions, revoke one session, or revoke all others.",
    resources: [
      {
        key: "sessions",
        title: "Active Sessions",
        description: "Current and historical active sessions for this account.",
        buildPath: () => "/api/v1/account/sessions"
      }
    ],
    actions: [
      {
        key: "revokeSession",
        title: "Revoke Session",
        fields: [{ key: "session_id", label: "Session ID", type: "text", required: true }],
        buildPath: (values) => {
          const sessionID = requiredSessionID(values.session_id);
          if (!sessionID) {
            return null;
          }
          return `/api/v1/account/sessions/${encodeURIComponent(sessionID)}/revoke`;
        },
        refreshResources: ["sessions"]
      },
      {
        key: "revokeOthers",
        title: "Revoke Other Sessions",
        submitText: "Revoke Others",
        buildPath: () => "/api/v1/account/sessions/revoke-others",
        refreshResources: ["sessions"]
      }
    ],
    summary: (resources) => {
      const payload = asObject(resources.sessions);
      return [
        { label: "Total Sessions", value: Number(payload.total || 0) },
        { label: "Current Session", value: String(payload.current_session_id || "n/a") }
      ];
    }
  }
};

export default function AccountWorkbenchPage({ route }: AccountWorkbenchPageProps) {
  return <ConsoleWorkbench definition={accountWorkbenchDefinitions[route]} scope="account" />;
}
