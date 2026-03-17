import { describe, expect, it } from "vitest";

import { buildSkillDetailInstallPrompt } from "@/src/features/public/skill-detail/skillDetailInstallPrompt";

describe("skill detail install prompt", () => {
  it("builds an agent-oriented prompt from the public detail payload", () => {
    const prompt = buildSkillDetailInstallPrompt({
      detail: {
        skill: {
          name: "Repository Sync Auditor",
          source_url: "https://github.com/example/repository-sync-auditor",
          install_command: "uvx skillsindex sync-auditor"
        }
      },
      fallbackInstallValue: "uvx skillsindex sync-auditor"
    });

    expect(prompt).toContain("https://github.com/example/repository-sync-auditor");
    expect(prompt).toContain("Repository Sync Auditor");
    expect(prompt).toContain("uvx skillsindex sync-auditor");
    expect(prompt).toContain("SKILL.md");
  });
});
