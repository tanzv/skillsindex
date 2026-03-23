import { describe, expect, it } from "vitest";

import { buildPublicCategoryDetailRoute, buildPublicSkillDetailRoute } from "@/src/lib/routing/publicRouteBuilders";

describe("public route builders", () => {
  it("builds stable public detail routes from shared route prefixes", () => {
    expect(buildPublicSkillDetailRoute(101)).toBe("/skills/101");
    expect(buildPublicSkillDetailRoute("agent-browser")).toBe("/skills/agent-browser");
    expect(buildPublicCategoryDetailRoute("automation")).toBe("/categories/automation");
  });
});
