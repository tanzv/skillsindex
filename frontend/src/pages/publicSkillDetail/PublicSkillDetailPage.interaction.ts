import { PublicSkillDetailComment, PublicSkillDetailResponse, PublicSkillDetailViewerState, SkillInteractionStats } from "../../lib/api";

export interface SkillDetailInteractionSnapshot {
  stats: SkillInteractionStats;
  viewerState: PublicSkillDetailViewerState;
  comments: PublicSkillDetailComment[];
}

export const defaultSkillInteractionStats: SkillInteractionStats = {
  favorite_count: 0,
  rating_count: 0,
  rating_average: 0,
  comment_count: 0
};

export const defaultSkillViewerState: PublicSkillDetailViewerState = {
  can_interact: false,
  favorited: false,
  rated: false,
  rating: 0
};

export function buildInteractionSnapshot(detail: PublicSkillDetailResponse | null | undefined): SkillDetailInteractionSnapshot {
  if (!detail) {
    return {
      stats: defaultSkillInteractionStats,
      viewerState: defaultSkillViewerState,
      comments: []
    };
  }
  return {
    stats: {
      favorite_count: Number(detail.stats?.favorite_count || 0),
      rating_count: Number(detail.stats?.rating_count || 0),
      rating_average: Number(detail.stats?.rating_average || 0),
      comment_count: Number(detail.stats?.comment_count || 0)
    },
    viewerState: {
      can_interact: Boolean(detail.viewer_state?.can_interact),
      favorited: Boolean(detail.viewer_state?.favorited),
      rated: Boolean(detail.viewer_state?.rated),
      rating: Number(detail.viewer_state?.rating || 0)
    },
    comments: clampComments(detail.comments || [], detail.comments_limit || 80)
  };
}

export function clampComments(comments: PublicSkillDetailComment[], limit: number): PublicSkillDetailComment[] {
  if (!Array.isArray(comments) || comments.length === 0) {
    return [];
  }
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.trunc(limit) : 80;
  return comments.slice(0, normalizedLimit);
}

export function normalizeRatingScore(rawValue: number): number {
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  const integer = Math.trunc(numericValue);
  if (integer < 1 || integer > 5) {
    return 0;
  }
  return integer;
}

export function isCommentDraftValid(content: string, maxLength = 3000): boolean {
  const normalized = String(content || "").trim();
  return normalized.length > 0 && normalized.length <= maxLength;
}

export function formatRatingAverage(average: number): string {
  const numericAverage = Number(average);
  if (!Number.isFinite(numericAverage) || numericAverage <= 0) {
    return "0.0";
  }
  return numericAverage.toFixed(1);
}
