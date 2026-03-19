import { describe, expect, it } from "vitest";

import {
  shouldLoadDeferredSkillResourceContent,
  shouldLoadDeferredSkillResources,
  shouldLoadDeferredSkillVersions
} from "@/src/features/public/skill-detail/skillDetailDeferredLoad";

describe("skill detail deferred load", () => {
  it("loads resource payloads only for the skill and resources tabs", () => {
    expect(shouldLoadDeferredSkillResources("overview")).toBe(false);
    expect(shouldLoadDeferredSkillResources("installation")).toBe(false);
    expect(shouldLoadDeferredSkillResources("related")).toBe(false);
    expect(shouldLoadDeferredSkillResources("history")).toBe(false);
    expect(shouldLoadDeferredSkillResources("skill")).toBe(true);
    expect(shouldLoadDeferredSkillResources("resources")).toBe(true);
  });

  it("loads version history only for the history tab", () => {
    expect(shouldLoadDeferredSkillVersions("overview")).toBe(false);
    expect(shouldLoadDeferredSkillVersions("skill")).toBe(false);
    expect(shouldLoadDeferredSkillVersions("resources")).toBe(false);
    expect(shouldLoadDeferredSkillVersions("history")).toBe(true);
  });

  it("loads resource preview content only for content-oriented tabs", () => {
    expect(shouldLoadDeferredSkillResourceContent("overview")).toBe(false);
    expect(shouldLoadDeferredSkillResourceContent("installation")).toBe(false);
    expect(shouldLoadDeferredSkillResourceContent("related")).toBe(false);
    expect(shouldLoadDeferredSkillResourceContent("history")).toBe(false);
    expect(shouldLoadDeferredSkillResourceContent("skill")).toBe(true);
    expect(shouldLoadDeferredSkillResourceContent("resources")).toBe(true);
  });
});
