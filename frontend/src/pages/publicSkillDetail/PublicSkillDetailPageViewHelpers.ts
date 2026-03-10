import type { MarketplaceSkill } from "../../lib/api";
import type { DetailMetricEntry, SkillDetailPresetKey, SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import type { SkillDetailInteractionFeedbackKey } from "./PublicSkillDetailInteractionActions";
import type { SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";

export function resolveFilePresetLabel(preset: SkillDetailPresetKey): string {
  if (preset === "readme") {
    return "README.md";
  }
  if (preset === "changelog") {
    return "CHANGELOG.md";
  }
  return "SKILL.md";
}

export function resolveResourceTabLabel(text: SkillDetailCopy, tab: SkillDetailResourceTabKey): string {
  if (tab === "installation") {
    return text.tabInstallationMethod;
  }
  if (tab === "skill") {
    return text.tabSkillDocument;
  }
  if (tab === "resources") {
    return text.tabResources;
  }
  if (tab === "related") {
    return text.tabRelatedSkills;
  }
  if (tab === "history") {
    return text.tabVersionHistory;
  }
  return text.tabOverview;
}

export interface SkillDetailMetricSection {
  title: string;
  entries: DetailMetricEntry[];
}

export function resolveTopSummaryEntries(detailModel: SkillDetailViewModel): DetailMetricEntry[] {
  const topEntries = detailModel.summaryMetrics.slice(0, 3);
  const primaryQualityMetric = detailModel.qualityMetrics[0];

  if (primaryQualityMetric) {
    topEntries.push(primaryQualityMetric);
  }

  return topEntries;
}

export function resolveOverviewMetricSections(
  text: SkillDetailCopy,
  detailModel: SkillDetailViewModel
): SkillDetailMetricSection[] {
  const sections: SkillDetailMetricSection[] = [];

  if (detailModel.summaryMetrics.length > 0) {
    sections.push({
      title: text.summaryTitle,
      entries: detailModel.summaryMetrics
    });
  }

  if (detailModel.qualityMetrics.length > 0) {
    sections.push({
      title: text.qualityHealth,
      entries: detailModel.qualityMetrics
    });
  }

  return sections;
}

export function buildAgentInstallPrompt(skill: MarketplaceSkill | null, detailModel: SkillDetailViewModel): string {
  const repositorySlug = String(detailModel.repositorySlug || skill?.name || "skill").trim();
  const sourceURL = String(skill?.source_url || "").trim();
  const installCommand = String(skill?.install_command || "").trim();

  const steps = [
    sourceURL ? `Open ${sourceURL} and review the SKILL.md file for ${repositorySlug}.` : `Review the SKILL.md file for ${repositorySlug}.`,
    installCommand ? `Install the skill with ${installCommand}.` : "Install the skill using the marketplace method available in your environment.",
    "Once installed, read the local SKILL.md file in the installed directory and follow its instructions to complete the task."
  ];

  return steps.join(" ");
}

export function resolveInteractionFeedbackMessage(
  text: SkillDetailCopy,
  feedbackKey: SkillDetailInteractionFeedbackKey
): string {
  if (feedbackKey === "sign_in_required") {
    return text.signInToInteract;
  }
  if (feedbackKey === "favorite_saved") {
    return text.favoriteSaved;
  }
  if (feedbackKey === "favorite_removed") {
    return text.favoriteRemoved;
  }
  if (feedbackKey === "rating_submitted") {
    return text.ratingSubmitted;
  }
  if (feedbackKey === "comment_invalid") {
    return text.commentInvalid;
  }
  if (feedbackKey === "comment_posted") {
    return text.commentPosted;
  }
  return text.commentDeleted;
}

export function scrollToFileContent(documentRef: Document = document): void {
  const fileSection = documentRef.getElementById("skill-detail-file-content");
  if (!fileSection) {
    return;
  }
  fileSection.scrollIntoView({ behavior: "smooth", block: "start" });
}
