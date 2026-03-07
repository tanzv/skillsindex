import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";

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

export interface AccountProfilePreviewItem {
  key: "display-name" | "avatar-url" | "bio";
  label: string;
  value: string;
}

export interface AccountProfilePreviewLabels {
  displayName: string;
  avatarURL: string;
  bio: string;
}

export function formatAccountDate(value: string | null | undefined, locale: AppLocale, fallback: string): string {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return fallback;
  }
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

export function profileCompletenessScore(profile: AccountProfilePayload | null): number {
  if (!profile) {
    return 0;
  }
  const checks = [
    profile.user.display_name,
    profile.profile.display_name,
    profile.profile.avatar_url,
    profile.profile.bio
  ];
  const hit = checks.filter((item) => String(item || "").trim().length > 0).length;
  return Math.round((hit / checks.length) * 100);
}

export function buildAccountProfileDraft(payload: AccountProfilePayload | null): AccountProfileDraft {
  if (!payload) {
    return {
      displayName: "",
      avatarURL: "",
      bio: ""
    };
  }

  return {
    displayName: payload.profile.display_name || payload.user.display_name || "",
    avatarURL: payload.profile.avatar_url || "",
    bio: payload.profile.bio || ""
  };
}

export function sanitizeAccountProfileDraft(draft: AccountProfileDraft): Record<string, string> {
  return {
    display_name: String(draft.displayName || "").trim(),
    avatar_url: String(draft.avatarURL || "").trim(),
    bio: String(draft.bio || "").trim()
  };
}

export function buildAccountProfilePreviewItems(
  payload: AccountProfilePayload | null,
  labels: AccountProfilePreviewLabels,
  fallback: string
): AccountProfilePreviewItem[] {
  const draft = buildAccountProfileDraft(payload);

  return [
    {
      key: "display-name",
      label: labels.displayName,
      value: draft.displayName || fallback
    },
    {
      key: "avatar-url",
      label: labels.avatarURL,
      value: draft.avatarURL || fallback
    },
    {
      key: "bio",
      label: labels.bio,
      value: draft.bio || fallback
    }
  ];
}

export function resolveAvatarInitials(displayName: string, fallback: string): string {
  const normalized = String(displayName || "").trim();
  if (!normalized) {
    return String(fallback || "U").trim().slice(0, 2).toUpperCase() || "U";
  }

  const segments = normalized
    .split(/\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return "U";
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0] || ""}${segments[segments.length - 1][0] || ""}`.toUpperCase();
}
