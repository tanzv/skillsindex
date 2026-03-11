import { describe, expect, it } from "vitest";

import {
  buildAccountAPIKeyCreateDraft,
  buildAccountAPIKeyScopeDrafts,
  buildAccountProfileDraft,
  formatAccountDate,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountAPIKeyCreateDraft,
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

  it("builds api key drafts from response metadata", () => {
    const payload = {
      items: [
        {
          id: 7,
          name: "CLI",
          purpose: "Local usage",
          prefix: "sk_live_demo",
          scopes: ["skills.search.read"],
          status: "active" as const,
          created_at: "2026-03-10T10:00:00Z",
          updated_at: "2026-03-10T10:00:00Z"
        }
      ],
      total: 1,
      supported_scopes: ["skills.search.read", "skills.ai_search.read"],
      default_scopes: ["skills.search.read"]
    };

    expect(buildAccountAPIKeyCreateDraft(payload)).toEqual({
      name: "",
      purpose: "",
      expiresInDays: 90,
      scopes: ["skills.search.read"]
    });
    expect(buildAccountAPIKeyScopeDrafts(payload)).toEqual({
      7: ["skills.search.read"]
    });
  });

  it("sanitizes api key creation payloads before submit", () => {
    expect(
      sanitizeAccountAPIKeyCreateDraft({
        name: "  CI Token  ",
        purpose: "  Build agent  ",
        expiresInDays: 30.8,
        scopes: ["skills.search.read", " skills.search.read ", "skills.ai_search.read"]
      })
    ).toEqual({
      name: "CI Token",
      purpose: "Build agent",
      expires_in_days: 30,
      scopes: ["skills.search.read", "skills.ai_search.read"]
    });
  });
});
