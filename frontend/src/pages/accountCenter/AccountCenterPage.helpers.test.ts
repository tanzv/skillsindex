import { describe, expect, it } from "vitest";

import {
  buildAccountProfileDraft,
  formatAccountDate,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountProfileDraft
} from "./AccountCenterPage.helpers";

describe("AccountCenterPage.helpers", () => {
  it("builds profile draft from account payload with fallback order", () => {
    const draft = buildAccountProfileDraft({
      user: {
        id: 7,
        username: "profile.user",
        display_name: "Session Name",
        role: "admin",
        status: "active"
      },
      profile: {
        display_name: "",
        avatar_url: "https://example.com/avatar.png",
        bio: "  Profile summary  "
      }
    });

    expect(draft).toEqual({
      displayName: "Session Name",
      avatarURL: "https://example.com/avatar.png",
      bio: "  Profile summary  "
    });
  });

  it("sanitizes profile draft values before submit", () => {
    const normalized = sanitizeAccountProfileDraft({
      displayName: "  Alex  ",
      avatarURL: " https://example.com/a.png ",
      bio: "  Platform maintainer  "
    });

    expect(normalized).toEqual({
      display_name: "Alex",
      avatar_url: "https://example.com/a.png",
      bio: "Platform maintainer"
    });
  });

  it("computes profile completeness from populated fields", () => {
    const score = profileCompletenessScore({
      user: {
        id: 8,
        username: "qa.user",
        display_name: "QA",
        role: "reviewer",
        status: "active"
      },
      profile: {
        display_name: "",
        avatar_url: "",
        bio: ""
      }
    });

    expect(score).toBe(25);
  });

  it("formats account date safely", () => {
    expect(formatAccountDate("invalid", "en", "n/a")).toBe("n/a");
    expect(formatAccountDate("2026-02-01T10:00:00Z", "en", "n/a")).toMatch(/\d/);
  });

  it("resolves avatar initials with deterministic fallbacks", () => {
    expect(resolveAvatarInitials("Alex Smith", "user")).toBe("AS");
    expect(resolveAvatarInitials("alex", "user")).toBe("AL");
    expect(resolveAvatarInitials(" ", "user")).toBe("US");
    expect(resolveAvatarInitials(" ", "")).toBe("U");
  });
});
