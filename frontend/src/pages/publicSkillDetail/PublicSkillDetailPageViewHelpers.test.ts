import { describe, expect, it, vi } from "vitest";
import type { MarketplaceSkill } from "../../lib/api";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import type { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import {
  buildAgentInstallPrompt,
  resolveFilePresetLabel,
  resolveInteractionFeedbackMessage,
  resolveOverviewMetricSections,
  resolveResourceTabLabel,
  resolveTopSummaryEntries,
  scrollToFileContent
} from "./PublicSkillDetailPageViewHelpers";

const baseCopy = {
  signInToInteract: "Sign in to interact",
  favoriteSaved: "Favorited",
  favoriteRemoved: "Unfavorited",
  ratingSubmitted: "Rating submitted",
  commentInvalid: "Comment invalid",
  commentPosted: "Comment posted",
  commentDeleted: "Comment deleted",
  tabOverview: "Overview",
  tabInstallationMethod: "Installation Method",
  tabResources: "Resources",
  tabRelatedSkills: "Related Skills",
  tabVersionHistory: "Version History",
  tabSkillDocument: "SKILL.md",
  summaryTitle: "Summary",
  qualityHealth: "Quality and Maintenance Health"
} as SkillDetailCopy;

describe("PublicSkillDetailPageViewHelpers", () => {
  it("resolves preset labels", () => {
    expect(resolveFilePresetLabel("skill")).toBe("SKILL.md");
    expect(resolveFilePresetLabel("readme")).toBe("README.md");
    expect(resolveFilePresetLabel("changelog")).toBe("CHANGELOG.md");
  });

  it("resolves resource tab labels", () => {
    expect(resolveResourceTabLabel(baseCopy, "overview")).toBe("Overview");
    expect(resolveResourceTabLabel(baseCopy, "installation")).toBe("Installation Method");
    expect(resolveResourceTabLabel(baseCopy, "skill")).toBe("SKILL.md");
    expect(resolveResourceTabLabel(baseCopy, "resources")).toBe("Resources");
    expect(resolveResourceTabLabel(baseCopy, "related")).toBe("Related Skills");
    expect(resolveResourceTabLabel(baseCopy, "history")).toBe("Version History");
  });

  it("moves the compact primary metrics into the top summary strip", () => {
    const detailModel = {
      summaryMetrics: [
        { label: "Install Command", value: "Available" },
        { label: "Favorites and Rating", value: "0 · No ratings" },
        { label: "Recent Release", value: "2026/2/20 10:36" }
      ],
      qualityMetrics: [
        { label: "Quality Score", value: "9.0" },
        { label: "Docs Score", value: "N/A" }
      ]
    } as SkillDetailViewModel;

    expect(resolveTopSummaryEntries(detailModel)).toEqual([
      { label: "Install Command", value: "Available" },
      { label: "Favorites and Rating", value: "0 · No ratings" },
      { label: "Recent Release", value: "2026/2/20 10:36" },
      { label: "Quality Score", value: "9.0" }
    ]);
  });

  it("keeps overview tab sections grouped for detailed inspection", () => {
    const detailModel = {
      summaryMetrics: [{ label: "Install Command", value: "Available" }],
      qualityMetrics: [{ label: "Quality Score", value: "9.0" }]
    } as SkillDetailViewModel;

    expect(resolveOverviewMetricSections(baseCopy, detailModel)).toEqual([
      {
        title: "Summary",
        entries: [{ label: "Install Command", value: "Available" }]
      },
      {
        title: "Quality and Maintenance Health",
        entries: [{ label: "Quality Score", value: "9.0" }]
      }
    ]);
  });

  it("builds an agent install prompt from backend-backed data", () => {
    const skill = {
      name: "paper-to-production",
      source_url: "https://github.com/example/paper-to-production",
      install_command: "codex skill install github:example/paper-to-production"
    } as MarketplaceSkill;
    const detailModel = {
      repositorySlug: "paper-to-production"
    } as SkillDetailViewModel;

    const prompt = buildAgentInstallPrompt(skill, detailModel);

    expect(prompt).toContain("https://github.com/example/paper-to-production");
    expect(prompt).toContain("codex skill install github:example/paper-to-production");
    expect(prompt).toContain("SKILL.md");
  });

  it("maps interaction feedback key to localized message", () => {
    expect(resolveInteractionFeedbackMessage(baseCopy, "sign_in_required")).toBe("Sign in to interact");
    expect(resolveInteractionFeedbackMessage(baseCopy, "favorite_saved")).toBe("Favorited");
    expect(resolveInteractionFeedbackMessage(baseCopy, "favorite_removed")).toBe("Unfavorited");
    expect(resolveInteractionFeedbackMessage(baseCopy, "rating_submitted")).toBe("Rating submitted");
    expect(resolveInteractionFeedbackMessage(baseCopy, "comment_invalid")).toBe("Comment invalid");
    expect(resolveInteractionFeedbackMessage(baseCopy, "comment_posted")).toBe("Comment posted");
    expect(resolveInteractionFeedbackMessage(baseCopy, "comment_deleted")).toBe("Comment deleted");
  });

  it("scrolls to file content section when target exists", () => {
    const scrollIntoView = vi.fn();
    const getElementById = vi.fn().mockReturnValue({
      scrollIntoView
    });
    const mockDocument = {
      getElementById
    } as unknown as Document;

    scrollToFileContent(mockDocument);

    expect(getElementById).toHaveBeenCalledWith("skill-detail-file-content");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("does not throw when file content section is missing", () => {
    const getElementById = vi.fn().mockReturnValue(null);
    const mockDocument = {
      getElementById
    } as unknown as Document;

    expect(() => scrollToFileContent(mockDocument)).not.toThrow();
  });
});
