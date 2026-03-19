import { describe, expect, it } from "vitest";

import {
  buildSkillDetailPreviewStatus,
  skillDetailWorkspaceTabs
} from "@/src/features/public/skill-detail/skillDetailWorkspaceConfig";

describe("skillDetailWorkspaceConfig", () => {
  it("keeps the tab order and ids stable", () => {
    expect(skillDetailWorkspaceTabs.map((item) => item.key)).toEqual([
      "overview",
      "installation",
      "skill",
      "resources",
      "related",
      "history"
    ]);
    expect(skillDetailWorkspaceTabs.map((item) => item.tabId)).toEqual([
      "skill-detail-tab-overview",
      "skill-detail-tab-installation",
      "skill-detail-tab-skill",
      "skill-detail-tab-resources",
      "skill-detail-tab-related",
      "skill-detail-tab-history"
    ]);
  });

  it("builds a compact preview status label", () => {
    expect(
      buildSkillDetailPreviewStatus({
        activeTab: "resources",
        selectedFileName: "docs/README.md",
        versionCount: 4
      })
    ).toContain("README.md");
    expect(
      buildSkillDetailPreviewStatus({
        activeTab: "history",
        versionCount: 4
      })
    ).toContain("4");
  });
});
