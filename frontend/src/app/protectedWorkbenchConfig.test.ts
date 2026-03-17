import { describe, expect, it } from "vitest";

import { navItems } from "../appNavigationConfig";
import {
  resolveProtectedWorkbenchSecondaryItems,
  resolveProtectedWorkbenchSection
} from "./protectedWorkbenchConfig";

describe("protectedWorkbenchConfig", () => {
  it("maps workspace routes into a dedicated primary section with one leaf per view", () => {
    const activeSection = resolveProtectedWorkbenchSection("/workspace/policy");
    const secondaryItems = resolveProtectedWorkbenchSecondaryItems("/workspace/policy", navItems);

    expect(activeSection.id).toBe("workspace");
    expect(secondaryItems.map((item) => item.path)).toEqual([
      "/workspace",
      "/workspace/activity",
      "/workspace/queue",
      "/workspace/runbook",
      "/workspace/policy",
      "/workspace/actions"
    ]);
  });

  it("keeps nested account creation routes in the users primary section without exposing them as secondary leaves", () => {
    const activeSection = resolveProtectedWorkbenchSection("/admin/accounts/new");
    const secondaryItems = resolveProtectedWorkbenchSecondaryItems("/admin/accounts/new", navItems);

    expect(activeSection.id).toBe("users");
    expect(secondaryItems.map((item) => item.path)).toEqual([
      "/admin/accounts",
      "/admin/roles",
      "/admin/access",
      "/admin/organizations"
    ]);
  });

  it("keeps nested role creation routes in the users primary section without exposing them as secondary leaves", () => {
    const activeSection = resolveProtectedWorkbenchSection("/admin/roles/new");
    const secondaryItems = resolveProtectedWorkbenchSecondaryItems("/admin/roles/new", navItems);

    expect(activeSection.id).toBe("users");
    expect(secondaryItems.map((item) => item.path)).toEqual([
      "/admin/accounts",
      "/admin/roles",
      "/admin/access",
      "/admin/organizations"
    ]);
  });

  it("maps repository routes to the catalog primary section", () => {
    const activeSection = resolveProtectedWorkbenchSection("/admin/ingestion/repository");
    const secondaryItems = resolveProtectedWorkbenchSecondaryItems("/admin/ingestion/repository", navItems);

    expect(activeSection.id).toBe("catalog");
    expect(secondaryItems.map((item) => item.path)).toContain("/admin/ingestion/repository");
    expect(secondaryItems.map((item) => item.path)).not.toContain("/admin/accounts");
  });

  it("orders operations secondary routes from the section manifest and lands on ops metrics", () => {
    const activeSection = resolveProtectedWorkbenchSection("/admin/integrations");
    const secondaryItems = resolveProtectedWorkbenchSecondaryItems("/admin/integrations", navItems);

    expect(activeSection.id).toBe("operations");
    expect(activeSection.landingRoute).toBe("/admin/ops/metrics");
    expect(secondaryItems.slice(0, 2).map((item) => item.path)).toEqual([
      "/admin/ops/metrics",
      "/admin/integrations"
    ]);
  });
});
