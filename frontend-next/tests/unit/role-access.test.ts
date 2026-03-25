import { describe, expect, it } from "vitest";

import {
  canAccessProtectedConsole,
  canManagePlatformUsers,
  canViewAllAdminData,
  normalizeSessionRole
} from "@/src/lib/auth/roleAccess";

describe("role access", () => {
  it("normalizes role values before capability checks", () => {
    expect(normalizeSessionRole(" SUPER_ADMIN ")).toBe("super_admin");
    expect(normalizeSessionRole(undefined)).toBe("");
  });

  it("grants protected console access only to member, admin, and super admin", () => {
    expect(canAccessProtectedConsole({ user: null, marketplacePublicAccess: true })).toBe(false);
    expect(
      canAccessProtectedConsole({
        user: { id: 1, username: "viewer", displayName: "Viewer", role: "viewer", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(false);
    expect(
      canAccessProtectedConsole({
        user: { id: 2, username: "member", displayName: "Member", role: "member", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(true);
  });

  it("grants platform user management only to super admin", () => {
    expect(
      canManagePlatformUsers({
        user: { id: 1, username: "admin", displayName: "Admin", role: "admin", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(false);
    expect(
      canManagePlatformUsers({
        user: { id: 2, username: "root", displayName: "Root", role: "super_admin", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(true);
  });

  it("grants admin-wide governance access only to admin and super admin", () => {
    expect(
      canViewAllAdminData({
        user: { id: 1, username: "member", displayName: "Member", role: "member", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(false);
    expect(
      canViewAllAdminData({
        user: { id: 2, username: "admin", displayName: "Admin", role: "admin", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(true);
    expect(
      canViewAllAdminData({
        user: { id: 3, username: "root", displayName: "Root", role: "super_admin", status: "active" },
        marketplacePublicAccess: true
      })
    ).toBe(true);
  });
});
