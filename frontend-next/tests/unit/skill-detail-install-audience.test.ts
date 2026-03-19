import { describe, expect, it } from "vitest";

import { resolveSkillDetailInstallAudience } from "@/src/features/public/skill-detail/skillDetailInstallAudience";

describe("skill detail install audience", () => {
  it("forces the resources tab to use the agent audience", () => {
    expect(resolveSkillDetailInstallAudience("resources", "human")).toBe("agent");
    expect(resolveSkillDetailInstallAudience("resources", "agent")).toBe("agent");
  });

  it("preserves the selected audience on non-resource tabs", () => {
    expect(resolveSkillDetailInstallAudience("overview", "human")).toBe("human");
    expect(resolveSkillDetailInstallAudience("installation", "agent")).toBe("agent");
  });
});
