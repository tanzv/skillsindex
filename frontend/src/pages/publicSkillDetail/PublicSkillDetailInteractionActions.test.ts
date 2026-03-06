import { describe, expect, it, vi } from "vitest";
import {
  deleteCommentInteraction,
  submitCommentInteraction,
  submitRatingInteraction,
  toggleFavoriteInteraction
} from "./PublicSkillDetailInteractionActions";

describe("PublicSkillDetailInteractionActions", () => {
  it("returns blocked sign-in when favorite action requires login", async () => {
    const outcome = await toggleFavoriteInteraction({
      canInteract: false,
      interactionBusy: false,
      favorited: false,
      skillID: 1,
      setFavorite: vi.fn(),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome).toEqual({
      status: "blocked",
      feedback: "sign_in_required"
    });
  });

  it("returns idle when favorite action is busy", async () => {
    const outcome = await toggleFavoriteInteraction({
      canInteract: true,
      interactionBusy: true,
      favorited: false,
      skillID: 1,
      setFavorite: vi.fn(),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome).toEqual({
      status: "idle"
    });
  });

  it("toggles favorite and refreshes detail", async () => {
    const setFavorite = vi.fn().mockResolvedValue(undefined);
    const refreshLiveDetail = vi.fn().mockResolvedValue(undefined);

    const outcome = await toggleFavoriteInteraction({
      canInteract: true,
      interactionBusy: false,
      favorited: false,
      skillID: 2,
      setFavorite,
      refreshLiveDetail
    });

    expect(outcome).toEqual({
      status: "success",
      feedback: "favorite_saved"
    });
    expect(setFavorite).toHaveBeenCalledWith(2, true);
    expect(refreshLiveDetail).toHaveBeenCalledTimes(1);
  });

  it("returns failure when favorite request throws", async () => {
    const outcome = await toggleFavoriteInteraction({
      canInteract: true,
      interactionBusy: false,
      favorited: true,
      skillID: 2,
      setFavorite: vi.fn().mockRejectedValue(new Error("favorite failed")),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome.status).toBe("failure");
  });

  it("returns idle for zero rating score", async () => {
    const outcome = await submitRatingInteraction({
      canInteract: true,
      interactionBusy: false,
      ratingScore: 0,
      skillID: 3,
      submitRating: vi.fn(),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome).toEqual({
      status: "idle"
    });
  });

  it("submits rating and refreshes detail", async () => {
    const submitRating = vi.fn().mockResolvedValue(undefined);
    const refreshLiveDetail = vi.fn().mockResolvedValue(undefined);

    const outcome = await submitRatingInteraction({
      canInteract: true,
      interactionBusy: false,
      ratingScore: 5,
      skillID: 3,
      submitRating,
      refreshLiveDetail
    });

    expect(outcome).toEqual({
      status: "success",
      feedback: "rating_submitted"
    });
    expect(submitRating).toHaveBeenCalledWith(3, 5);
    expect(refreshLiveDetail).toHaveBeenCalledTimes(1);
  });

  it("blocks comment submit when draft invalid", async () => {
    const outcome = await submitCommentInteraction({
      canInteract: true,
      interactionBusy: false,
      commentDraft: " ",
      isCommentDraftValid: () => false,
      skillID: 4,
      createComment: vi.fn(),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome).toEqual({
      status: "blocked",
      feedback: "comment_invalid"
    });
  });

  it("submits comment and trims draft", async () => {
    const createComment = vi.fn().mockResolvedValue(undefined);
    const refreshLiveDetail = vi.fn().mockResolvedValue(undefined);

    const outcome = await submitCommentInteraction({
      canInteract: true,
      interactionBusy: false,
      commentDraft: "  useful feedback  ",
      isCommentDraftValid: () => true,
      skillID: 4,
      createComment,
      refreshLiveDetail
    });

    expect(outcome).toEqual({
      status: "success",
      feedback: "comment_posted"
    });
    expect(createComment).toHaveBeenCalledWith(4, "useful feedback");
  });

  it("returns idle when delete comment is busy", async () => {
    const outcome = await deleteCommentInteraction({
      canInteract: true,
      interactionBusy: true,
      commentID: 9,
      skillID: 4,
      deleteComment: vi.fn(),
      refreshLiveDetail: vi.fn()
    });

    expect(outcome).toEqual({
      status: "idle"
    });
  });

  it("deletes comment and refreshes detail", async () => {
    const deleteComment = vi.fn().mockResolvedValue(undefined);
    const refreshLiveDetail = vi.fn().mockResolvedValue(undefined);

    const outcome = await deleteCommentInteraction({
      canInteract: true,
      interactionBusy: false,
      commentID: 9,
      skillID: 4,
      deleteComment,
      refreshLiveDetail
    });

    expect(outcome).toEqual({
      status: "success",
      feedback: "comment_deleted"
    });
    expect(deleteComment).toHaveBeenCalledWith(4, 9);
    expect(refreshLiveDetail).toHaveBeenCalledTimes(1);
  });
});
