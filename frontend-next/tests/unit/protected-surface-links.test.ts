import { describe, expect, it } from "vitest";

import {
  accountRoutePrefix,
  adminRoutePrefix,
  isAccountSurfacePath,
  isAdminSurfacePath,
  isProtectedSurfacePath,
  isWorkspaceSurfacePath,
  protectedDashboardRoute,
  protectedRoutePrefixes,
  workspaceRoutePrefix
} from "@/src/lib/routing/protectedSurfaceLinks";

describe("protected surface links", () => {
  it("keeps protected prefixes centralized in one routing contract", () => {
    expect(protectedRoutePrefixes).toEqual([workspaceRoutePrefix, adminRoutePrefix, accountRoutePrefix]);
  });

  it("classifies protected surface paths through shared helpers", () => {
    expect(isProtectedSurfacePath(protectedDashboardRoute)).toBe(true);
    expect(isProtectedSurfacePath("/workspace/queue")).toBe(true);
    expect(isProtectedSurfacePath("/admin/overview")).toBe(true);
    expect(isProtectedSurfacePath("/account/profile")).toBe(true);
    expect(isProtectedSurfacePath("/search")).toBe(false);

    expect(isWorkspaceSurfacePath("/workspace/actions")).toBe(true);
    expect(isAdminSurfacePath("/admin/jobs")).toBe(true);
    expect(isAccountSurfacePath("/account/security")).toBe(true);
  });
});
