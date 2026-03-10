import { describe, expect, it } from "vitest";
import { createPublicPageNavigator } from "./publicPageNavigation";

describe("createPublicPageNavigator", () => {
  it("keeps default public and admin routes unchanged", () => {
    const navigator = createPublicPageNavigator("/");
    expect(navigator.publicBase).toBe("");
    expect(navigator.adminBase).toBe("/admin");
    expect(navigator.toPublic("/compare")).toBe("/compare");
    expect(navigator.toAdmin("/admin/overview")).toBe("/admin/overview");
    expect(navigator.toApp("/skills/8")).toBe("/skills/8");
  });

  it("prefixes light routes for public/admin navigation", () => {
    const navigator = createPublicPageNavigator("/light/skills/9");
    expect(navigator.publicBase).toBe("/light");
    expect(navigator.adminBase).toBe("/light/admin");
    expect(navigator.toPublic("/docs")).toBe("/light/docs");
    expect(navigator.toAdmin("/admin/overview")).toBe("/light/admin/overview");
    expect(navigator.toApp("/admin/ops/metrics")).toBe("/light/admin/ops/metrics");
    expect(navigator.toAdmin("/login")).toBe("/light/login");
  });

  it("supports mobile light routes and query/hash suffixes", () => {
    const navigator = createPublicPageNavigator("/mobile/light/compare");
    expect(navigator.publicBase).toBe("/mobile/light");
    expect(navigator.adminBase).toBe("/mobile/light/admin");
    expect(navigator.toPublic("/skills/19?tab=files#top")).toBe("/mobile/light/skills/19?tab=files#top");
    expect(navigator.toAdmin("/admin/incidents?status=open#list")).toBe("/mobile/light/admin/incidents?status=open#list");
    expect(navigator.toApp("compare?left=1&right=2")).toBe("/mobile/light/compare?left=1&right=2");
  });
});
