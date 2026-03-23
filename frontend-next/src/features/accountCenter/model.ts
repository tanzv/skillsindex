import {
  accountRouteBySection,
  accountSectionByRoute,
  type AccountSection
} from "@/src/lib/routing/accountRouteMeta";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AccountRoute } from "@/src/lib/routing/routes";
export type AccountRevokeMode = "keep" | "revoke";
export type AccountAPIKeyStatus = "active" | "revoked" | "expired";

export interface SessionUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  status: string;
}

export interface AccountProfilePayload {
  user: SessionUser;
  profile: {
    display_name: string;
    avatar_url: string;
    bio: string;
  };
}

export interface AccountProfileDraft {
  displayName: string;
  avatarURL: string;
  bio: string;
}

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

export function profileCompletenessScore(profile: AccountProfilePayload | null): number {
  if (!profile) {
    return 0;
  }

  const fields = [profile.user.displayName, profile.profile.display_name, profile.profile.avatar_url, profile.profile.bio];
  const completed = fields.filter((item) => String(item || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
}

export function buildAccountProfileDraft(payload: AccountProfilePayload | null): AccountProfileDraft {
  return {
    displayName: payload?.profile.display_name || payload?.user.displayName || payload?.user.username || "",
    avatarURL: payload?.profile.avatar_url || "",
    bio: payload?.profile.bio || ""
  };
}

export function sanitizeAccountProfileDraft(draft: AccountProfileDraft): Record<string, string> {
  return {
    display_name: String(draft.displayName || "").trim(),
    avatar_url: String(draft.avatarURL || "").trim(),
    bio: String(draft.bio || "").trim()
  };
}

export function resolveAvatarInitials(displayName: string, fallback: string): string {
  const normalized = String(displayName || "").trim();
  if (!normalized) {
    return String(fallback || "U").slice(0, 2).toUpperCase() || "U";
  }

  const segments = normalized.split(/\s+/).filter(Boolean);
  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0]?.[0] || ""}${segments[segments.length - 1]?.[0] || ""}`.toUpperCase() || "U";
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
