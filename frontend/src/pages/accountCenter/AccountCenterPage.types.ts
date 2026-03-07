import type { AccountRoute } from "../AccountWorkbenchPage";

export type AccountSection = "profile" | "security" | "sessions";

export type AccountRevokeMode = "keep" | "revoke";

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

export const accountSectionByRoute: Record<AccountRoute, AccountSection> = {
  "/account/profile": "profile",
  "/account/security": "security",
  "/account/sessions": "sessions"
};

export const accountRouteBySection: Record<AccountSection, AccountRoute> = {
  profile: "/account/profile",
  security: "/account/security",
  sessions: "/account/sessions"
};
