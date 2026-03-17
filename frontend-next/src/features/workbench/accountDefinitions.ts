import type { WorkbenchDefinition } from "./types";
import { asNumber, asObject, parseScopes, requiredID } from "./utils";

export const accountWorkbenchDefinitions: Record<string, WorkbenchDefinition> = {
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
        buildPath: () => "/api/v1/account/security/password",
        refreshResources: ["profile"]
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
          const sessionID = String(values.session_id || "").trim();
          return sessionID ? `/api/v1/account/sessions/${encodeURIComponent(sessionID)}/revoke` : null;
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
        { label: "Total Sessions", value: asNumber(payload.total) },
        { label: "Current Session", value: String(payload.current_session_id || "n/a") }
      ];
    }
  },
  "/account/api-credentials": {
    title: "API Credentials",
    subtitle: "Issue, rotate, revoke, and scope personal OpenAPI credentials.",
    resources: [
      {
        key: "credentials",
        title: "Personal Credentials",
        description: "Current account API credential inventory and scope catalog.",
        buildPath: () => "/api/v1/account/apikeys"
      }
    ],
    actions: [
      {
        key: "createCredential",
        title: "Create Credential",
        submitText: "Create Credential",
        fields: [
          { key: "name", label: "Name", type: "text", placeholder: "CLI credential" },
          { key: "purpose", label: "Purpose", type: "textarea", placeholder: "Usage purpose" },
          { key: "expires_in_days", label: "Expires In Days", type: "number", placeholder: "90" },
          { key: "scopes", label: "Scopes", type: "textarea", placeholder: "skills.search.read,skills.ai_search.read" }
        ],
        buildPath: () => "/api/v1/account/apikeys",
        buildPayload: (values) => ({
          name: String(values.name || "").trim(),
          purpose: String(values.purpose || "").trim(),
          expires_in_days: Number(values.expires_in_days || 0) || 0,
          scopes: parseScopes(values.scopes)
        }),
        refreshResources: ["credentials"]
      },
      {
        key: "rotateCredential",
        title: "Rotate Credential",
        fields: [{ key: "key_id", label: "Credential ID", type: "number", required: true }],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          return keyID ? `/api/v1/account/apikeys/${keyID}/rotate` : null;
        },
        refreshResources: ["credentials"]
      },
      {
        key: "revokeCredential",
        title: "Revoke Credential",
        fields: [{ key: "key_id", label: "Credential ID", type: "number", required: true }],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          return keyID ? `/api/v1/account/apikeys/${keyID}/revoke` : null;
        },
        refreshResources: ["credentials"]
      },
      {
        key: "updateCredentialScopes",
        title: "Update Credential Scopes",
        submitText: "Apply Scopes",
        fields: [
          { key: "key_id", label: "Credential ID", type: "number", required: true },
          { key: "scopes", label: "Scopes", type: "textarea", required: true, placeholder: "skills.search.read" }
        ],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          return keyID ? `/api/v1/account/apikeys/${keyID}/scopes` : null;
        },
        buildPayload: (values) => ({ scopes: parseScopes(values.scopes) }),
        refreshResources: ["credentials"]
      }
    ],
    summary: (resources) => {
      const payload = asObject(resources.credentials);
      const defaultScopes = Array.isArray(payload.default_scopes) ? payload.default_scopes.join(", ") : "n/a";
      return [
        { label: "Total Credentials", value: asNumber(payload.total) },
        { label: "Default Scopes", value: defaultScopes || "n/a" }
      ];
    }
  }
};
