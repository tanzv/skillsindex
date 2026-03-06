import { describe, expect, it, vi } from "vitest";
import type { SkillDetailCopy } from "../PublicSkillDetailPage.copy";
import {
  resolveFilePresetLabel,
  resolveInteractionFeedbackMessage,
  scrollToFileContent
} from "./PublicSkillDetailPageViewHelpers";

const baseCopy = {
  signInToInteract: "Sign in to interact",
  favoriteSaved: "Favorited",
  favoriteRemoved: "Unfavorited",
  ratingSubmitted: "Rating submitted",
  commentInvalid: "Comment invalid",
  commentPosted: "Comment posted",
  commentDeleted: "Comment deleted"
} as SkillDetailCopy;

describe("PublicSkillDetailPageViewHelpers", () => {
  it("resolves preset labels", () => {
    expect(resolveFilePresetLabel("skill")).toBe("SKILL.md");
    expect(resolveFilePresetLabel("readme")).toBe("README.md");
    expect(resolveFilePresetLabel("changelog")).toBe("CHANGELOG.md");
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
