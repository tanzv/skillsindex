import {
  accountRouteBySection,
  accountSectionByRoute,
  type AccountSection
} from "@/src/lib/routing/accountRouteMeta";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AccountRoute } from "@/src/lib/routing/routes";
import type { AccountProfileDraft, AccountProfilePayload } from "@/src/lib/account/accountProfile";
import {
  buildAccountProfileDraft,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountProfileDraft
} from "@/src/lib/account/accountProfile";
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

export { accountRouteBySection, accountSectionByRoute };
export type { AccountRoute, AccountSection };
export type { AccountProfileDraft, AccountProfilePayload };
export {
  buildAccountProfileDraft,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountProfileDraft
};

export function formatAccountDate(value: string | null | undefined, locale: PublicLocale = "en", fallback = "n/a"): string {
  if (!value) {
    return fallback;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return fallback;
  }
  return new Date(timestamp).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function buildAccountAPIKeyCreateDraft(payload: AccountAPIKeysPayload | null): AccountAPIKeyCreateDraft {
  return {
    name: "",
    purpose: "",
    expiresInDays: 90,
    scopes: [...(payload?.default_scopes || [])]
  };
}

export function buildAccountAPIKeyScopeDrafts(payload: AccountAPIKeysPayload | null): Record<number, string[]> {
  const drafts: Record<number, string[]> = {};
  for (const item of payload?.items || []) {
    drafts[item.id] = [...item.scopes];
  }
  return drafts;
}

export function sanitizeAccountAPIKeyCreateDraft(draft: AccountAPIKeyCreateDraft): Record<string, unknown> {
  return {
    name: String(draft.name || "").trim(),
    purpose: String(draft.purpose || "").trim(),
    expires_in_days: Number.isFinite(draft.expiresInDays) ? Math.max(0, Math.trunc(draft.expiresInDays)) : 0,
    scopes: Array.from(new Set((draft.scopes || []).map((item) => String(item || "").trim()).filter(Boolean)))
  };
}
