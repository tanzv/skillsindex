import { describe, expect, it } from "vitest";

import { accountNavigationItems } from "@/src/lib/routing/accountNavigation";
import { accountWorkbenchDefinitions, adminWorkbenchDefinitions } from "@/src/features/workbench/definitions";
import { buildBFFPath, buildPathWithQuery, parseScopes, requiredID } from "@/src/features/workbench/utils";

describe("workbench configuration", () => {
  it("builds stable query paths and BFF routes", () => {
    expect(buildPathWithQuery("/api/v1/admin/skills", { q: "repo", page: 2, empty: "" })).toBe(
      "/api/v1/admin/skills?q=repo&page=2"
    );
    expect(buildBFFPath("/api/v1/admin/skills?q=repo")).toBe("/api/bff/admin/skills?q=repo");
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
      "/account/profile",
      "/account/security",
      "/account/sessions",
      "/account/api-credentials"
    ]);

    expect(accountWorkbenchDefinitions["/account/profile"]).toBeDefined();
    expect(accountWorkbenchDefinitions["/account/api-credentials"]).toBeDefined();
  });

  it("defines admin workbench routes for catalog, operations, and governance", () => {
    expect(adminWorkbenchDefinitions["/admin/jobs"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/ops/release-gates"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/moderation"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/access"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/accounts"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/accounts/new"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/roles"]).toBeDefined();
    expect(adminWorkbenchDefinitions["/admin/roles/new"]).toBeDefined();
  });

  it("removes dedicated admin pages from generic workbench definitions", () => {
    expect(adminWorkbenchDefinitions["/admin/overview"]).toBeUndefined();
    expect(adminWorkbenchDefinitions["/admin/ingestion/manual"]).toBeUndefined();
    expect(adminWorkbenchDefinitions["/admin/ingestion/repository"]).toBeUndefined();
    expect(adminWorkbenchDefinitions["/admin/records/imports"]).toBeUndefined();
  });
});
