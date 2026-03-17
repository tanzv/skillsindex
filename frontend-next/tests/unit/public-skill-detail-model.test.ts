import { describe, expect, it } from "vitest";

import { buildPublicSkillDetailFallback } from "@/src/features/public/publicSkillDetailFallback";
import { buildPublicSkillDetailModel } from "@/src/features/public/publicSkillDetailModel";

describe("public skill detail model", () => {
  it("builds summary, resource insights, and related skills from the fallback payload", () => {
    const fallback = buildPublicSkillDetailFallback(101);
    const messages = {
      skillDetailNotAvailable: "Not available",
      skillDetailMetricsQuality: "Quality Score",
      skillDetailMetricsFavorites: "Favorites",
      skillDetailMetricsRatings: "Ratings",
      skillDetailMetricsComments: "Comments",
      skillDetailFactCategory: "Category",
      skillDetailFactSourceType: "Source Type",
      skillDetailFactUpdated: "Updated",
      skillDetailFactStars: "Stars",
      skillDetailInstallLabel: "Install",
      skillDetailInstallHelp: "Install help",
      skillDetailRepositoryPathLabel: "Repository Path",
      skillDetailRepositoryPathHelp: "Repository path help",
      skillDetailExecutionContextLabel: "Execution Context",
      skillDetailExecutionContextInteractive: "Interactive viewer",
      skillDetailExecutionContextReadonly: "Read-only viewer",
      skillDetailExecutionContextHelp: "Execution context help",
      skillDetailResourceRepositoryLabel: "Repository",
      skillDetailResourceBranchLabel: "Source Branch",
      skillDetailResourceFilesLabel: "Files",
      skillDetailResourcePreviewLabel: "Preview File",
      skillDetailResourcePreviewLanguage: "Language",
      skillDetailVersionCapturedPrefix: "Captured",
      skillDetailNoInstall: "No install command provided"
    } satisfies Parameters<typeof buildPublicSkillDetailModel>[0]["messages"];

    const model = buildPublicSkillDetailModel({
      detail: fallback.detail,
      resources: fallback.resources,
      versions: fallback.versions,
      resourceContent: fallback.resourceContent,
      locale: "en",
      messages
    });

    expect(model.summaryMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: messages.skillDetailMetricsQuality, value: "9.6" }),
        expect.objectContaining({ label: messages.skillDetailMetricsFavorites, value: "134" })
      ])
    );
    expect(model.overviewFacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: messages.skillDetailFactCategory,
          value: "Programming & Development / Web & Frontend Development"
        })
      ])
    );
    expect(model.installationSteps[0]?.label).toBe(messages.skillDetailInstallLabel);
    expect(model.resourceInsights[0]?.label).toBe(messages.skillDetailResourceRepositoryLabel);
    expect(model.versionHighlights.length).toBeGreaterThan(0);
    expect(model.relatedSkills.some((skill) => skill.id !== fallback.detail.skill.id)).toBe(true);
  });
});
