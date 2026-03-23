import { describe, expect, it } from "vitest";

import { resolveRoleTargetUserId, resolveSelectedAdminAccount } from "@/src/features/adminAccounts/model";

const accounts = [
  {
    id: 1,
    username: "owner",
    role: "super_admin",
    status: "active",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-03T00:00:00Z",
    forceLogoutAt: ""
  },
  {
    id: 2,
    username: "operator",
    role: "admin",
    status: "disabled",
    createdAt: "2026-03-02T00:00:00Z",
    updatedAt: "2026-03-04T00:00:00Z",
    forceLogoutAt: ""
  }
];

describe("admin accounts model", () => {
  it("prefers an explicit role editor target over the selected account", () => {
    expect(resolveRoleTargetUserId("7", 2)).toBe(7);
  });

  it("falls back to the selected account when the role editor target is empty", () => {
    expect(resolveRoleTargetUserId("", 2)).toBe(2);
    expect(resolveRoleTargetUserId("   ", 2)).toBe(2);
  });

  it("rejects invalid role editor targets", () => {
    expect(resolveRoleTargetUserId("invalid", 2)).toBeNull();
    expect(resolveRoleTargetUserId("0", 2)).toBeNull();
  });

  it("keeps the selected account inside the currently visible directory set", () => {
    expect(resolveSelectedAdminAccount(accounts, [accounts[1]], 2)?.id).toBe(2);
    expect(resolveSelectedAdminAccount(accounts, [accounts[1]], 1)?.id).toBe(2);
  });

  it("clears the selected account when the filtered directory is empty", () => {
    expect(resolveSelectedAdminAccount(accounts, [], 2)).toBeNull();
  });
});
