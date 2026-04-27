import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public link viewport warmup policy", () => {
  it("consults the shared viewport warmup policy before observing skill links without importing feature-owned policy files", () => {
    const source = readRepoFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain("shouldEnablePublicSkillViewportWarmupForEnvironment");
    expect(source).not.toContain('from "@/src/features/public/marketplace/publicSkillWarmupPolicy"');
    expect(source).toContain("!enableViewportWarmup");
  });
});
