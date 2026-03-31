import { describe, expect, it } from "vitest";

import {
  resolveAdminAccountsCreateOverlayEntity,
  resolveAdminAccountsDisplayRoute,
  resolveRoleTargetUserId,
  resolveSelectedAdminAccount
} from "@/src/features/adminAccounts/model";

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
  it("maps compatibility create routes back to the canonical surface route", () => {
    expect(resolveAdminAccountsDisplayRoute("/admin/accounts")).toBe("/admin/accounts");
    expect(resolveAdminAccountsDisplayRoute("/admin/accounts/new")).toBe("/admin/accounts");
    expect(resolveAdminAccountsDisplayRoute("/admin/roles")).toBe("/admin/roles");
    expect(resolveAdminAccountsDisplayRoute("/admin/roles/new")).toBe("/admin/roles");
  });

  it("derives create-overlay intent from compatibility create routes", () => {
    expect(resolveAdminAccountsCreateOverlayEntity("/admin/accounts")).toBeNull();
    expect(resolveAdminAccountsCreateOverlayEntity("/admin/accounts/new")).toBe("provisioningPolicy");
    expect(resolveAdminAccountsCreateOverlayEntity("/admin/roles")).toBeNull();
    expect(resolveAdminAccountsCreateOverlayEntity("/admin/roles/new")).toBe("rolePlaybook");
  });

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

  it("keeps the selected account when it remains inside the visible directory set", () => {
    expect(resolveSelectedAdminAccount(accounts, [accounts[1]], 2)?.id).toBe(2);
  });

  it("clears the selected account instead of silently remapping to the first visible row", () => {
    expect(resolveSelectedAdminAccount(accounts, [accounts[1]], 1)).toBeNull();
  });

  it("clears the selected account when the filtered directory is empty", () => {
    expect(resolveSelectedAdminAccount(accounts, [], 2)).toBeNull();
  });
});
