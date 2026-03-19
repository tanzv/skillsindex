import { describe, expect, it, vi } from "vitest";

import {
  resolvePublicSkillWarmupTarget,
  shouldObservePublicSkillWarmup,
  warmPublicSkillRoute
} from "@/src/components/shared/publicSkillRouteWarmup";

describe("public skill route warmup", () => {
  it("prefers the prefixed browser route when warming a skill detail path", () => {
    expect(resolvePublicSkillWarmupTarget("/skills/103", "/light/skills/103")).toBe("/light/skills/103");
  });

  it("ignores non-skill and external routes", () => {
    expect(resolvePublicSkillWarmupTarget("/categories")).toBeNull();
    expect(resolvePublicSkillWarmupTarget("https://example.com/skills/103")).toBeNull();
  });

  it("only enables viewport observation when both the flag and skill route are present", () => {
    expect(shouldObservePublicSkillWarmup(true, "/light/skills/103")).toBe(true);
    expect(shouldObservePublicSkillWarmup(false, "/light/skills/103")).toBe(false);
    expect(shouldObservePublicSkillWarmup(true, null)).toBe(false);
  });

  it("warms a skill route only once with a HEAD request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const warmedRoutes = new Set<string>();

    await warmPublicSkillRoute(fetchImpl, "/light/skills/103", warmedRoutes);
    await warmPublicSkillRoute(fetchImpl, "/light/skills/103", warmedRoutes);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/light/skills/103", {
      method: "HEAD",
      credentials: "same-origin"
    });
  });
});
