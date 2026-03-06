import type { SkillDetailPresetKey } from "../PublicSkillDetailPage.helpers";
import type { SkillDetailCopy } from "../PublicSkillDetailPage.copy";
import type { SkillDetailInteractionFeedbackKey } from "./PublicSkillDetailInteractionActions";

export function resolveFilePresetLabel(preset: SkillDetailPresetKey): string {
  if (preset === "readme") {
    return "README.md";
  }
  if (preset === "changelog") {
    return "CHANGELOG.md";
  }
  return "SKILL.md";
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
