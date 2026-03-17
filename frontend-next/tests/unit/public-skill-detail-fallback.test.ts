import { describe, expect, it } from "vitest";

import { buildPublicSkillDetailFallback, resolvePublicSkillFallback } from "@/src/features/public/publicSkillDetailFallback";

describe("public skill detail fallback", () => {
  it("resolves a stable fallback skill by id", () => {
    const skill = resolvePublicSkillFallback(101);

    expect(skill?.name).toBe("Next.js UX Audit Agent");
  });

  it("builds detail, resources, versions, and file content for a fallback skill", () => {
    const fallback = buildPublicSkillDetailFallback(101);

    expect(fallback.detail.skill.id).toBe(101);
    expect(fallback.resources.files.length).toBeGreaterThan(0);
    expect(fallback.versions.items.length).toBeGreaterThan(0);
    expect(fallback.resourceContent?.content.length).toBeGreaterThan(0);
    expect(fallback.detail.viewer_state.can_interact).toBe(false);
  });
});
