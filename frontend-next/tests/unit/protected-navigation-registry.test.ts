import { describe, expect, it } from "vitest";

import {
  buildAccountShellNavigationRegistry,
  buildAdminShellNavigationRegistry,
  buildProtectedNavigationRegistry,
  buildWorkspaceShellNavigationRegistry
} from "@/src/lib/navigation/protectedNavigationRegistry";
import {
  adminNavigationMessageFallbacks,
  protectedTopbarMessageFallbacks,
  workspaceShellMessageFallbacks
} from "@/src/lib/i18n/protectedMessages";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";

describe("protected navigation registry", () => {
  it("keeps skill management sidebar grouped by intake, governance, and synchronization", () => {
    const registry = buildProtectedNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks,
      workspaceShell: workspaceShellMessageFallbacks
    });

    const skillModule = registry.modules.find((module) => module.id === "skill-management");

    expect(skillModule?.sidebar.groups.map((group) => group.title)).toEqual([
      "Intake Sources",
      "Governance",
      "Synchronization"
    ]);
    expect(skillModule?.sidebar.groups[0]?.items.map((item) => item.href)).toEqual([
      "/admin/ingestion/manual",
      "/admin/ingestion/repository",
      "/admin/records/imports"
    ]);
    expect(skillModule?.sidebar.groups[1]?.items.map((item) => item.href)).toEqual([
      "/admin/skills",
      "/admin/jobs"
    ]);
    expect(skillModule?.sidebar.groups[2]?.items.map((item) => item.href)).toEqual([
      "/admin/sync-jobs",
      "/admin/sync-policy/repository"
    ]);
  });

  it("keeps organization management sidebar grouped by directory and permissions", () => {
    const registry = buildProtectedNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks,
      workspaceShell: workspaceShellMessageFallbacks
    });

    const organizationModule = registry.modules.find((module) => module.id === "organization-management");

    expect(organizationModule?.sidebar.groups.map((group) => group.title)).toEqual([
      "Directory",
      "Permissions"
    ]);
    expect(organizationModule?.sidebar.groups[0]?.items.map((item) => item.href)).toEqual([
      "/admin/accounts",
      "/admin/organizations"
    ]);
    expect(organizationModule?.sidebar.groups[1]?.items.map((item) => item.href)).toEqual([
      "/admin/roles",
      "/admin/access"
    ]);
  });

  it("keeps first-level modules registered for the header only", () => {
    const registry = buildProtectedNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks,
      workspaceShell: workspaceShellMessageFallbacks
    });

    expect(registry.modules.map((module) => module.topLevel.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
    expect(protectedTopbarMessageFallbacks.moreLabel).toBe("More");
  });

  it("keeps workspace shell registry scoped to workspace sidebar data", () => {
    const registry = buildWorkspaceShellNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks,
      workspaceShell: workspaceShellMessageFallbacks
    });

    expect(registry.modules.map((module) => module.topLevel.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
    expect(registry.modules.find((module) => module.id === "workspace")?.sidebar.groups[0]?.items).toHaveLength(6);
    expect(registry.modules.filter((module) => module.id !== "workspace").every((module) => module.sidebar.groups.length === 0)).toBe(true);
  });

  it("keeps admin shell registry scoped to admin sidebars", () => {
    const registry = buildAdminShellNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks
    });

    expect(registry.modules.find((module) => module.id === "workspace")?.sidebar.groups).toHaveLength(0);
    expect(registry.modules.find((module) => module.id === "skill-management")?.sidebar.groups).not.toHaveLength(0);
    expect(registry.modules.find((module) => module.id === "organization-management")?.sidebar.groups).not.toHaveLength(0);
    expect(registry.modules.find((module) => module.id === "administration")?.sidebar.groups).not.toHaveLength(0);
    expect(registry.modules.find((module) => module.id === "account")?.sidebar.groups).toHaveLength(0);
  });

  it("keeps account shell registry scoped to account sidebar data", () => {
    const registry = buildAccountShellNavigationRegistry({
      adminNavigation: adminNavigationMessageFallbacks,
      workspacePage: workspaceMessageFallbacks
    });

    expect(registry.modules.find((module) => module.id === "account")?.sidebar.groups[0]?.items).toHaveLength(4);
    expect(registry.modules.filter((module) => module.id !== "account").every((module) => module.sidebar.groups.length === 0)).toBe(true);
  });
});
