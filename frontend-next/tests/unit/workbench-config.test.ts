import { describe, expect, it } from "vitest";

import type { AccountShellMessages } from "@/src/lib/i18n/protectedMessages";
import { buildAccountNavigationItems } from "@/src/lib/routing/accountNavigation";
import { adminSkillsEndpoint } from "@/src/lib/routing/protectedSurfaceEndpoints";
import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute,
  adminAccessRoute,
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminJobsRoute,
  adminManualIntakeRoute,
  adminModerationRoute,
  adminOverviewRoute,
  adminReleaseGatesRoute,
  adminRepositoryIntakeRoute,
  adminRolesNewRoute,
  adminRolesRoute,
  adminImportsRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import {
  accountWorkbenchDefinitions,
  listAdminWorkbenchRouteContracts,
  resolveAdminRenderableWorkbenchDefinition,
  resolveAdminWorkbenchRouteContract
} from "@/src/features/workbench/definitions";
import { buildBFFPath, buildPathWithQuery, parseScopes, requiredID } from "@/src/features/workbench/utils";

const accountNavigationItems = buildAccountNavigationItems({
  brandSubtitleSuffix: "Account",
  sectionsTitle: "Sections",
  currentUserTitle: "Current User",
  marketplaceAccessLine: "Marketplace access",
  marketplaceAccessPublic: "Public",
  marketplaceAccessRestricted: "Restricted",
  unknownUser: "Unknown User",
  guestRole: "Guest",
  inactiveStatus: "Inactive",
  navProfileLabel: "Profile",
  navProfileNote: "Manage account profile.",
  navSecurityLabel: "Security",
  navSecurityNote: "Manage passwords and sessions.",
  navSessionsLabel: "Sessions",
  navSessionsNote: "Review active sessions.",
  navApiCredentialsLabel: "API Credentials",
  navApiCredentialsNote: "Manage personal API keys.",
  topbarOverflowTitle: "Overflow",
  topbarOverflowHint: "Overflow hint."
} satisfies AccountShellMessages);

describe("workbench configuration", () => {
  it("builds stable query paths and BFF routes", () => {
    expect(buildPathWithQuery(adminSkillsEndpoint, { q: "repo", page: 2, empty: "" })).toBe(
      `${adminSkillsEndpoint}?q=repo&page=2`
    );
    expect(buildBFFPath(`${adminSkillsEndpoint}?q=repo`)).toBe("/api/bff/admin/skills?q=repo");
  });

  it("normalizes ids and comma separated scopes", () => {
    expect(requiredID("42")).toBe(42);
    expect(requiredID("0")).toBeNull();
    expect(parseScopes("skills.search.read, skills.ai_search.read , skills.search.read")).toEqual([
      "skills.search.read",
      "skills.ai_search.read"
    ]);
  });

  it("defines account navigation and workbench pages", () => {
    expect(accountNavigationItems.map((item) => item.href)).toEqual([
      accountProfileRoute,
      accountSecurityRoute,
      accountSessionsRoute,
      accountApiCredentialsRoute
    ]);

    expect(accountWorkbenchDefinitions[accountProfileRoute]).toBeDefined();
    expect(accountWorkbenchDefinitions[accountApiCredentialsRoute]).toBeDefined();
  });

  it("defines admin workbench routes for catalog, operations, and governance", () => {
    expect(resolveAdminWorkbenchRouteContract(adminJobsRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminReleaseGatesRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminModerationRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminAccessRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminAccountsRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminAccountsNewRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminRolesRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminWorkbenchRouteContract(adminRolesNewRoute)?.renderMode).toBe("definition-only");
    expect(resolveAdminRenderableWorkbenchDefinition(adminRolesRoute)).toBeNull();
  });

  it("removes dedicated admin pages from generic workbench definitions", () => {
    expect(resolveAdminWorkbenchRouteContract(adminOverviewRoute)).toBeNull();
    expect(resolveAdminWorkbenchRouteContract(adminManualIntakeRoute)).toBeNull();
    expect(resolveAdminWorkbenchRouteContract(adminRepositoryIntakeRoute)).toBeNull();
    expect(resolveAdminWorkbenchRouteContract(adminImportsRoute)).toBeNull();
  });

  it("lists admin workbench contracts with explicit render modes", () => {
    const contracts = listAdminWorkbenchRouteContracts();

    expect(contracts.some((contract) => contract.route === adminAccountsNewRoute && contract.renderMode === "definition-only")).toBe(true);
    expect(contracts.some((contract) => contract.route === adminJobsRoute && contract.renderMode === "definition-only")).toBe(true);
  });
});
