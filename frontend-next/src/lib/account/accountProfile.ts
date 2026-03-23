export interface AccountProfileUserPayload {
  id: number;
  username: string;
  display_name: string;
  role: string;
  status: string;
}

export interface AccountProfilePayload {
  user: AccountProfileUserPayload;
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

export function resolveAccountProfileDisplayName(
  payload: AccountProfilePayload | null,
  fallback = ""
): string {
  return String(
    payload?.profile.display_name ||
      payload?.user.display_name ||
      payload?.user.username ||
      fallback
  ).trim();
}

export function buildAccountProfileDraft(
  payload: AccountProfilePayload | null,
  fallbackDisplayName = ""
): AccountProfileDraft {
  return {
    displayName: resolveAccountProfileDisplayName(payload, fallbackDisplayName),
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

export function profileCompletenessScore(profile: AccountProfilePayload | null): number {
  if (!profile) {
    return 0;
  }

  const fields = [
    profile.user.display_name,
    profile.profile.display_name,
    profile.profile.avatar_url,
    profile.profile.bio
  ];
  const completed = fields.filter((item) => String(item || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
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
