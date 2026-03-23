import { describe, expect, it, vi } from "vitest";

import {
  shouldEnableBatchSkillWarmupForEnvironment,
  shouldEnablePublicSkillViewportWarmupForEnvironment,
  shouldWarmPublicSkillViewportLinksInDev
} from "@/src/lib/marketplace/publicSkillWarmupPolicy";

describe("public skill warmup policy", () => {
  it("keeps batch warmup limited to production", () => {
    expect(shouldEnableBatchSkillWarmupForEnvironment("production")).toBe(true);
    expect(shouldEnableBatchSkillWarmupForEnvironment("development")).toBe(false);
  });

  it("keeps viewport skill warmup disabled by default in development", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_PUBLIC_SKILL_VIEWPORT_WARMUP", undefined);

    expect(shouldWarmPublicSkillViewportLinksInDev()).toBe(false);
    expect(shouldEnablePublicSkillViewportWarmupForEnvironment("development")).toBe(false);
  });

  it("allows viewport skill warmup in development when explicitly enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_PUBLIC_SKILL_VIEWPORT_WARMUP", "true");

    expect(shouldWarmPublicSkillViewportLinksInDev()).toBe(true);
    expect(shouldEnablePublicSkillViewportWarmupForEnvironment("development")).toBe(true);
  });

  it("keeps viewport skill warmup enabled outside development", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_PUBLIC_SKILL_VIEWPORT_WARMUP", undefined);

    expect(shouldEnablePublicSkillViewportWarmupForEnvironment("production")).toBe(true);
    expect(shouldEnablePublicSkillViewportWarmupForEnvironment("test")).toBe(true);
  });
});
