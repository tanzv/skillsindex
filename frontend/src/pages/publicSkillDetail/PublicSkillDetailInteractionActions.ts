export type SkillDetailInteractionFeedbackKey =
  | "sign_in_required"
  | "favorite_saved"
  | "favorite_removed"
  | "rating_submitted"
  | "comment_invalid"
  | "comment_posted"
  | "comment_deleted";

export type SkillDetailInteractionActionOutcome =
  | {
      status: "idle";
    }
  | {
      status: "blocked";
      feedback: SkillDetailInteractionFeedbackKey;
    }
  | {
      status: "success";
      feedback: SkillDetailInteractionFeedbackKey;
    }
  | {
      status: "failure";
      error: unknown;
    };

export interface ToggleFavoriteInteractionOptions {
  canInteract: boolean;
  interactionBusy: boolean;
  favorited: boolean;
  skillID: number;
  setFavorite: (skillID: number, nextFavoriteState: boolean) => Promise<unknown>;
  refreshLiveDetail: () => Promise<void>;
}

export interface SubmitRatingInteractionOptions {
  canInteract: boolean;
  interactionBusy: boolean;
  ratingScore: number;
  skillID: number;
  submitRating: (skillID: number, ratingScore: number) => Promise<unknown>;
  refreshLiveDetail: () => Promise<void>;
}

export interface SubmitCommentInteractionOptions {
  canInteract: boolean;
  interactionBusy: boolean;
  commentDraft: string;
  isCommentDraftValid: (value: string) => boolean;
  skillID: number;
  createComment: (skillID: number, content: string) => Promise<unknown>;
  refreshLiveDetail: () => Promise<void>;
}

export interface DeleteCommentInteractionOptions {
  canInteract: boolean;
  interactionBusy: boolean;
  commentID: number;
  skillID: number;
  deleteComment: (skillID: number, commentID: number) => Promise<unknown>;
  refreshLiveDetail: () => Promise<void>;
}

export async function toggleFavoriteInteraction(
  options: ToggleFavoriteInteractionOptions
): Promise<SkillDetailInteractionActionOutcome> {
  if (!options.canInteract) {
    return {
      status: "blocked",
      feedback: "sign_in_required"
    };
  }
  if (options.interactionBusy) {
    return {
      status: "idle"
    };
  }

  const nextFavoriteState = !options.favorited;
  try {
    await options.setFavorite(options.skillID, nextFavoriteState);
    await options.refreshLiveDetail();
    return {
      status: "success",
      feedback: nextFavoriteState ? "favorite_saved" : "favorite_removed"
    };
  } catch (error) {
    return {
      status: "failure",
      error
    };
  }
}

export async function submitRatingInteraction(
  options: SubmitRatingInteractionOptions
): Promise<SkillDetailInteractionActionOutcome> {
  if (!options.canInteract) {
    return {
      status: "blocked",
      feedback: "sign_in_required"
    };
  }
  if (options.ratingScore === 0 || options.interactionBusy) {
    return {
      status: "idle"
    };
  }

  try {
    await options.submitRating(options.skillID, options.ratingScore);
    await options.refreshLiveDetail();
    return {
      status: "success",
      feedback: "rating_submitted"
    };
  } catch (error) {
    return {
      status: "failure",
      error
    };
  }
}

export async function submitCommentInteraction(
  options: SubmitCommentInteractionOptions
): Promise<SkillDetailInteractionActionOutcome> {
  if (!options.canInteract) {
    return {
      status: "blocked",
      feedback: "sign_in_required"
    };
  }
  if (!options.isCommentDraftValid(options.commentDraft) || options.interactionBusy) {
    return {
      status: "blocked",
      feedback: "comment_invalid"
    };
  }

  try {
    await options.createComment(options.skillID, options.commentDraft.trim());
    await options.refreshLiveDetail();
    return {
      status: "success",
      feedback: "comment_posted"
    };
  } catch (error) {
    return {
      status: "failure",
      error
    };
  }
}

export async function deleteCommentInteraction(
  options: DeleteCommentInteractionOptions
): Promise<SkillDetailInteractionActionOutcome> {
  if (!options.canInteract || options.interactionBusy) {
    return {
      status: "idle"
    };
  }

  try {
    await options.deleteComment(options.skillID, options.commentID);
    await options.refreshLiveDetail();
    return {
      status: "success",
      feedback: "comment_deleted"
    };
  } catch (error) {
    return {
      status: "failure",
      error
    };
  }
}
