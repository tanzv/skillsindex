import { describe, expect, it } from "vitest";

import {
  buildAccountsOverview,
  buildRoleSummary,
  filterAccounts,
  normalizeAccountsPayload,
  normalizeAuthProvidersPayload,
  normalizeRegistrationPayload,
  sortAccountsByUpdatedAt
} from "@/src/features/adminAccounts/model";

describe("admin accounts model", () => {
  const payload = normalizeAccountsPayload({
    total: 3,
    items: [
      {
        id: 1,
        username: "ops.lead",
        role: "admin",
        status: "active",
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-03T10:00:00Z"
      },
      {
        id: 2,
        username: "security.audit",
        role: "auditor",
        status: "active",
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-04T10:00:00Z"
      },
      {
        id: 3,
        username: "viewer.user",
        role: "viewer",
        status: "disabled",
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-02T10:00:00Z",
        force_logout_at: "2026-03-05T10:00:00Z"
      }
    ]
  });

  it("normalizes accounts, registration, and auth providers payloads", () => {
    expect(payload.total).toBe(3);
    expect(normalizeRegistrationPayload({ allow_registration: true, marketplace_public_access: false })).toEqual({
      allowRegistration: true,
      marketplacePublicAccess: false
    });
    expect(
      normalizeAuthProvidersPayload({
        auth_providers: ["password", "github"],
        available_auth_providers: ["password", "github", "oidc"]
      })
    ).toEqual({
      authProviders: ["password", "github"],
      availableAuthProviders: ["password", "github", "oidc"]
    });
  });

  it("sorts and filters accounts predictably", () => {
    const sorted = sortAccountsByUpdatedAt(payload.items);
    expect(sorted[0]?.username).toBe("security.audit");
    expect(filterAccounts(payload.items, "audit", "all").map((item) => item.username)).toEqual(["security.audit"]);
    expect(filterAccounts(payload.items, "", "disabled").map((item) => item.username)).toEqual(["viewer.user"]);
  });

  it("builds role summary and overview metrics", () => {
    expect(buildRoleSummary(payload.items)).toEqual(
      expect.arrayContaining([expect.objectContaining({ role: "admin", count: 1 })])
    );
    const overview = buildAccountsOverview(payload);
    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Total Accounts", value: "3" }),
        expect.objectContaining({ label: "Disabled Accounts", value: "1" })
      ])
    );
  });
});
