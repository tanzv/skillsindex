import { describe, expect, it } from "vitest";

import { buildPublicSkillDetailFallback } from "@/src/features/public/publicSkillDetailFallback";
import {
  buildPublicSkillInteractivePageModel,
  resolveInitialSelectedSkillResourceName
} from "@/src/features/public/publicSkillInteractivePageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

const messages = {
  shellHome: "Home",
  skillDetailContentTitle: "Skill",
  skillDetailInstallTitle: "Installation",
  skillDetailOverviewTitle: "Overview",
  skillDetailRelatedTitle: "Related",
  skillDetailResourcesTitle: "Resources",
  skillDetailVersionsTitle: "Versions"
} as PublicMarketplaceMessages;

describe("public skill interactive page model", () => {
  it("resolves initial resource selection from resource content, resource tree, or fallback skill content", () => {
    const fallback = buildPublicSkillDetailFallback(101);

    expect(
      resolveInitialSelectedSkillResourceName({
        detail: fallback.detail,
        resources: fallback.resources,
        initialResourceContent: fallback.resourceContent
      })
    ).toBe(fallback.resourceContent?.path);

    expect(
      resolveInitialSelectedSkillResourceName({
        detail: fallback.detail,
        resources: fallback.resources,
        initialResourceContent: null
      })
    ).toBe(fallback.resources?.source_path);

    expect(
      resolveInitialSelectedSkillResourceName({
        detail: fallback.detail,
        resources: null,
        initialResourceContent: null
      })
    ).toBe("SKILL.md");
  });

  it("builds canonical breadcrumb items and preview status for the active workspace tab", () => {
    const fallback = buildPublicSkillDetailFallback(101);

    const model = buildPublicSkillInteractivePageModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      activeTab: "history",
      selectedResourceName: "",
      messages
    });

    expect(model.activeWorkspaceLabel).toBe("Versions");
    expect(model.breadcrumbItems).toEqual([
      { href: "/", label: "Home" },
      { href: "/skills/101", label: fallback.detail.skill.name },
      { label: "Versions", isCurrent: true, isSoft: true }
    ]);
    expect(model.previewStatus).toBe(`${fallback.versions?.total || 0} versions`);
    expect(model.resolvedSelectedFileName).toBe(fallback.resources?.files[0]?.name || "");
  });

  it("uses the selected resource name as preview status on skill and resources tabs", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const selectedFileName = fallback.resources?.files[1]?.name || fallback.resources?.files[0]?.name || "";

    const model = buildPublicSkillInteractivePageModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      activeTab: "resources",
      selectedResourceName: selectedFileName,
      messages
    });

    expect(model.previewStatus).toBe(selectedFileName.split("/").pop());
    expect(model.resolvedSelectedFileName).toBe(selectedFileName);
  });
});
