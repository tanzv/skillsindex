import type { AccountRoute } from "../accountWorkbench/AccountWorkbenchPage";

export type AccountSection = "profile" | "security" | "sessions" | "credentials";

export type AccountRevokeMode = "keep" | "revoke";
export type AccountAPIKeyStatus = "active" | "revoked" | "expired";

export interface AccountSessionItem {
  session_id: string;
  user_agent: string;
  issued_ip: string;
  last_seen: string;
  expires_at: string;
  is_current: boolean;
}

export interface AccountSessionsPayload {
  current_session_id: string;
  session_issued_at: string | null;
  session_expires_at: string | null;
  total: number;
  items: AccountSessionItem[];
}

export interface AccountMetricItem {
  key: string;
  label: string;
  value: string;
}

export interface AccountAPIKeyItem {
  id: number;
  name: string;
  purpose: string;
  prefix: string;
  scopes: string[];
  status: AccountAPIKeyStatus;
  revoked_at?: string | null;
  expires_at?: string | null;
  last_rotated_at?: string | null;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountAPIKeysPayload {
  items: AccountAPIKeyItem[];
  total: number;
  supported_scopes: string[];
  default_scopes: string[];
}

export interface AccountAPIKeyItemResponse {
  item: AccountAPIKeyItem;
}

export interface AccountAPIKeyCredentialResponse {
  item: AccountAPIKeyItem;
  plaintext_key: string;
}

export interface AccountAPIKeyCreateDraft {
  name: string;
  purpose: string;
  expiresInDays: number;
  scopes: string[];
}

export interface AccountAPIKeySecretState {
  action: "created" | "rotated";
  name: string;
  plaintextKey: string;
}

export const accountSectionByRoute: Record<AccountRoute, AccountSection> = {
  "/account/profile": "profile",
  "/account/security": "security",
  "/account/sessions": "sessions",
  "/account/api-credentials": "credentials"
};

export const accountRouteBySection: Record<AccountSection, AccountRoute> = {
  profile: "/account/profile",
  security: "/account/security",
  sessions: "/account/sessions",
  credentials: "/account/api-credentials"
};
