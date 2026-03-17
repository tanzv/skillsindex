import { describe, expect, it } from "vitest";

import { isAdminSecurityRoute, navItems } from "./appNavigationConfig";

describe("appNavigationConfig", () => {
  it("keeps protected secondary navigation routes unique", () => {
    const protectedNavRoutes = navItems.map((item) => item.path);

    expect(new Set(protectedNavRoutes).size).toBe(protectedNavRoutes.length);
  });

  it("registers dedicated user management leaves for backend navigation", () => {
    const adminRoutes = navItems.filter((item) => item.section === "admin").map((item) => item.path);

    expect(adminRoutes).toEqual(
      expect.arrayContaining([
        "/admin/accounts",
        "/admin/roles",
        "/admin/access",
        "/admin/organizations",
        "/admin/ingestion/manual",
        "/admin/ingestion/repository",
        "/admin/records/imports",
        "/admin/skills",
        "/admin/jobs",
        "/admin/sync-jobs",
        "/admin/sync-policy/repository"
      ])
    );
  });

  it("registers workspace leaves as a dedicated secondary tree", () => {
    const workspaceRoutes = navItems.filter((item) => item.section === "workspace").map((item) => item.path);

    expect(workspaceRoutes).toEqual([
      "/workspace",
      "/workspace/activity",
      "/workspace/queue",
      "/workspace/runbook",
      "/workspace/policy",
      "/workspace/actions"
    ]);
  });

  it("keeps access governance outside the security route classifier", () => {
    expect(isAdminSecurityRoute("/admin/apikeys")).toBe(true);
    expect(isAdminSecurityRoute("/admin/moderation")).toBe(true);
    expect(isAdminSecurityRoute("/admin/access")).toBe(false);
  });
});
