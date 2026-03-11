import { describe, expect, it } from "vitest";

import { extractCategorySlug, extractSkillID, normalizeAppRoute } from "./appPathnameResolver";

describe("extractSkillID", () => {
  it("returns skill id for canonical and light/mobile routes", () => {
    expect(extractSkillID("/skills/9")).toBe(9);
    expect(extractSkillID("/light/skills/12/")).toBe(12);
    expect(extractSkillID("/mobile/light/skills/101")).toBe(101);
  });

  it("returns null for invalid skill paths", () => {
    expect(extractSkillID("/skills")).toBeNull();
    expect(extractSkillID("/skills/not-a-number")).toBeNull();
    expect(extractSkillID("/skills/0")).toBeNull();
  });
});

describe("extractCategorySlug", () => {
  it("returns category slug for canonical and light/mobile category routes", () => {
    expect(extractCategorySlug("/categories/testing-automation")).toBe("testing-automation");
    expect(extractCategorySlug("/light/categories/testing-automation/")).toBe("testing-automation");
    expect(extractCategorySlug("/mobile/light/categories/release%20gates")).toBe("release gates");
  });

  it("returns null for invalid category detail paths", () => {
    expect(extractCategorySlug("/categories")).toBeNull();
    expect(extractCategorySlug("/categories/")).toBeNull();
    expect(extractCategorySlug("/categories/testing/automation")).toBeNull();
  });
});

describe("normalizeAppRoute", () => {
  it("normalizes known public aliases", () => {
    expect(normalizeAppRoute("/light")).toBe("/");
    expect(normalizeAppRoute("/mobile/light/login")).toBe("/login");
    expect(normalizeAppRoute("/mobile/compare")).toBe("/compare");
    expect(normalizeAppRoute("/mobile/light/results")).toBe("/results");
    expect(normalizeAppRoute("/light/docs")).toBe("/docs");
    expect(normalizeAppRoute("/mobile/categories")).toBe("/categories");
    expect(normalizeAppRoute("/mobile/light/categories/testing-automation")).toBe("/categories/:slug");
    expect(normalizeAppRoute("/mobile/light/rankings")).toBe("/rankings");
  });

  it("normalizes dashboard aliases to admin overview", () => {
    expect(normalizeAppRoute("/dashboard")).toBe("/admin/overview");
    expect(normalizeAppRoute("/dashboard/ops/metrics")).toBe("/admin/ops/metrics");
  });

  it("maps representative prototype routes to prototype shell route", () => {
    expect(normalizeAppRoute("/rollout")).toBe("/prototype");
    expect(normalizeAppRoute("/light/workspace")).toBe("/prototype");
    expect(normalizeAppRoute("/workspace/activity")).toBe("/prototype");
    expect(normalizeAppRoute("/mobile/light/workspace/actions")).toBe("/prototype");
    expect(normalizeAppRoute("/states/error")).toBe("/prototype");
    expect(normalizeAppRoute("/admin/records/exports")).toBe("/prototype");
    expect(normalizeAppRoute("/admin/integrations/list")).toBe("/prototype");
    expect(normalizeAppRoute("/admin/integrations/new")).toBe("/prototype");
    expect(normalizeAppRoute("/admin/access")).toBe("/prototype");
  });

  it("promotes skill operation routes to protected admin routes", () => {
    expect(normalizeAppRoute("/admin/ingestion/manual")).toBe("/admin/ingestion/manual");
    expect(normalizeAppRoute("/light/admin/ingestion/repository")).toBe("/admin/ingestion/repository");
    expect(normalizeAppRoute("/admin/records/imports")).toBe("/admin/records/imports");
    expect(normalizeAppRoute("/light/admin/records/sync-jobs")).toBe("/admin/sync-jobs");
  });

  it("promotes organization management routes to protected admin routes", () => {
    expect(normalizeAppRoute("/admin/accounts")).toBe("/admin/accounts");
    expect(normalizeAppRoute("/light/admin/accounts/new")).toBe("/admin/accounts/new");
    expect(normalizeAppRoute("/admin/permissions/accounts")).toBe("/admin/accounts");
    expect(normalizeAppRoute("/light/admin/permissions/accounts/new")).toBe("/admin/accounts/new");
    expect(normalizeAppRoute("/admin/roles")).toBe("/admin/roles");
    expect(normalizeAppRoute("/mobile/light/admin/roles/new")).toBe("/admin/roles/new");
  });
});
