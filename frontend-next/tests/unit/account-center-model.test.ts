import { describe, expect, it } from "vitest";

import {
  accountRouteBySection,
  accountSectionByRoute,
  buildAccountAPIKeyCreateDraft,
  buildAccountAPIKeyScopeDrafts,
  buildAccountProfileDraft,
  formatAccountDate,
  profileCompletenessScore,
  resolveAvatarInitials,
  sanitizeAccountAPIKeyCreateDraft,
  sanitizeAccountProfileDraft
} from "@/src/features/accountCenter/model";
import { buildAccessOverview, buildAdminAccessGovernanceData, resolveSelectedAccessAccount } from "@/src/features/adminAccess/model";

describe("account center model", () => {
  it("maps account routes to sections and back", () => {
    expect(accountSectionByRoute["/account/profile"]).toBe("profile");
    expect(accountSectionByRoute["/account/security"]).toBe("security");
    expect(accountRouteBySection.credentials).toBe("/account/api-credentials");
  });

  it("builds and sanitizes profile drafts", () => {
    const draft = buildAccountProfileDraft({
      user: { id: 1, username: "alex", display_name: "Alex", role: "admin", status: "active" },
      profile: { display_name: "", avatar_url: "https://example.test/a.png", bio: "  Maintainer  " }
    });

    expect(draft).toEqual({
      displayName: "Alex",
      avatarURL: "https://example.test/a.png",
      bio: "  Maintainer  "
    });
    expect(
      sanitizeAccountProfileDraft({
        displayName: "  Alex  ",
        avatarURL: " https://example.test/a.png ",
        bio: "  Maintainer  "
      })
    ).toEqual({
      display_name: "Alex",
      avatar_url: "https://example.test/a.png",
      bio: "Maintainer"
    });
  });

  it("falls back to username when explicit display names are empty", () => {
    const draft = buildAccountProfileDraft({
      user: { id: 2, username: "admin", display_name: "", role: "super_admin", status: "active" },
      profile: { display_name: "", avatar_url: "", bio: "" }
    });

    expect(draft.displayName).toBe("admin");
  });

  it("computes completeness, formatting, and initials safely", () => {
    expect(
      profileCompletenessScore({
        user: { id: 1, username: "alex", display_name: "Alex", role: "admin", status: "active" },
        profile: { display_name: "", avatar_url: "", bio: "" }
      })
    ).toBe(25);
    expect(formatAccountDate("invalid")).toBe("n/a");
    expect(resolveAvatarInitials("Alex Smith", "user")).toBe("AS");
    expect(resolveAvatarInitials(" ", "user")).toBe("US");
  });

  it("builds api key drafts and sanitizes create payloads", () => {
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
    expect(buildAccountAPIKeyScopeDrafts(payload)).toEqual({ 7: ["skills.search.read"] });
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

describe("admin access model", () => {
  it("merges access governance payloads and builds metrics", () => {
    const data = buildAdminAccessGovernanceData({
      accounts: {
        total: 2,
        items: [
          {
            id: 1,
            username: "admin.user",
            role: "admin",
            status: "active",
            created_at: "2026-03-01T00:00:00Z",
            updated_at: "2026-03-02T00:00:00Z"
          },
          {
            id: 2,
            username: "viewer.user",
            role: "viewer",
            status: "disabled",
            created_at: "2026-03-01T00:00:00Z",
            updated_at: "2026-03-02T00:00:00Z",
            force_logout_at: "2026-03-03T00:00:00Z"
          }
        ]
      },
      registration: { allow_registration: true, marketplace_public_access: false },
      marketplaceRanking: {
        default_sort: "quality",
        ranking_limit: 18,
        highlight_limit: 4,
        category_leader_limit: 2
      },
      authProviders: { auth_providers: ["password", "sso"], available_auth_providers: ["password", "sso", "oidc"] }
    });

    expect(data.enabledProviders).toEqual(["password", "sso"]);
    expect(data.accountsTotal).toBe(2);
    expect(data.marketplacePublicAccess).toBe(false);
    expect(data.rankingDefaultSort).toBe("quality");
    expect(data.rankingLimit).toBe(18);
    expect(data.highlightLimit).toBe(4);
    expect(data.categoryLeaderLimit).toBe(2);

    const overview = buildAccessOverview(data);
    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Accounts", value: "2" }),
        expect.objectContaining({ label: "Disabled", value: "1" }),
        expect.objectContaining({ label: "Pending Sign-out", value: "1" })
      ])
    );
    expect(overview.roleSummary).toEqual(expect.arrayContaining([expect.objectContaining({ role: "admin", count: 1 })]));
  });

  it("resolves selected access account by id", () => {
    const selectedAccount = resolveSelectedAccessAccount(
      [
        {
          id: 9,
          username: "viewer.user",
          role: "viewer",
          status: "active",
          createdAt: "2026-03-01T00:00:00Z",
          updatedAt: "2026-03-02T00:00:00Z",
          forceLogoutAt: ""
        }
      ],
      9
    );

    expect(selectedAccount).toEqual(expect.objectContaining({ id: 9, username: "viewer.user" }));
    expect(resolveSelectedAccessAccount([], 9)).toBeNull();
    expect(resolveSelectedAccessAccount([], null)).toBeNull();
  });
});
