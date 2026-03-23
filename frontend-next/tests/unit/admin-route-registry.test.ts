import { describe, expect, it } from "vitest";

import { adminNavigationMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import {
  adminAccountManagementRoutePaths,
  adminCatalogRoutePaths,
  adminIngestionRoutePaths,
  adminOperationsDashboardRoutePaths,
  adminOperationsRecordRoutePaths,
  adminRoutePaths,
  buildAdminRouteDescriptors,
  buildAdminRouteGroups,
  resolveAdminRouteDefinition,
  resolveAdminRouteDescriptor
} from "@/src/lib/routing/adminRouteRegistry";
import { adminRoutes } from "@/src/lib/routing/routes";

describe("admin route registry", () => {
  it("drives visible navigation groups without exposing hidden workbench routes", () => {
    const groups = buildAdminRouteGroups(adminNavigationMessageFallbacks);
    const userGroup = groups.find((group) => group.id === "users");

    expect(userGroup?.items.map((item) => item.href)).toEqual([
      "/admin/accounts",
      "/admin/roles",
      "/admin/access",
      "/admin/organizations"
    ]);
  });

  it("marks quick links and render targets from one descriptor source", () => {
    const descriptors = buildAdminRouteDescriptors(adminNavigationMessageFallbacks);
    const quickLinks = descriptors.filter((descriptor) => descriptor.quickLink).map((descriptor) => descriptor.path);

    expect(quickLinks).toEqual([
      "/admin/overview",
      "/admin/ingestion/repository",
      "/admin/records/imports",
      "/admin/skills",
      "/admin/sync-jobs",
      "/admin/integrations",
      "/admin/access"
    ]);
    expect(resolveAdminRouteDescriptor("/admin/jobs", adminNavigationMessageFallbacks)?.renderTarget).toBe("catalog");
  });

  it("keeps hidden governance routes addressable without placing them in navigation", () => {
    const descriptor = resolveAdminRouteDescriptor("/admin/accounts/new", adminNavigationMessageFallbacks);

    expect(descriptor?.hiddenFromNavigation).toBe(true);
    expect(descriptor?.renderTarget).toBe("accounts");
    expect(descriptor?.label).toBe(adminNavigationMessageFallbacks.itemAccountsLabel);
  });

  it("resolves route definitions from the centralized lookup without changing render contracts", () => {
    expect(resolveAdminRouteDefinition("/admin/ops/alerts")).toEqual({
      path: "/admin/ops/alerts",
      groupId: "operations",
      renderTarget: "ops-dashboard",
      endpoint: "/api/v1/admin/ops/alerts",
      quickLink: false,
      hiddenFromNavigation: false
    });
  });

  it("exposes one admin route path list to shared routing consumers", () => {
    expect(adminRoutes).toEqual(adminRoutePaths);
  });

  it("derives admin family path groups from the centralized route definitions", () => {
    expect(adminIngestionRoutePaths).toEqual([
      "/admin/ingestion/manual",
      "/admin/ingestion/repository",
      "/admin/records/imports"
    ]);
    expect(adminCatalogRoutePaths).toEqual([
      "/admin/skills",
      "/admin/jobs",
      "/admin/sync-jobs",
      "/admin/sync-policy/repository"
    ]);
    expect(adminOperationsDashboardRoutePaths).toEqual([
      "/admin/ops/metrics",
      "/admin/ops/alerts",
      "/admin/ops/release-gates"
    ]);
    expect(adminOperationsRecordRoutePaths).toEqual([
      "/admin/ops/audit-export",
      "/admin/ops/recovery-drills",
      "/admin/ops/releases",
      "/admin/ops/change-approvals",
      "/admin/ops/backup/plans",
      "/admin/ops/backup/runs"
    ]);
    expect(adminAccountManagementRoutePaths).toEqual([
      "/admin/accounts",
      "/admin/accounts/new",
      "/admin/roles",
      "/admin/roles/new"
    ]);
  });
});
