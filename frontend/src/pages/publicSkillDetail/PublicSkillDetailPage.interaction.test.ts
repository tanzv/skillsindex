import { describe, expect, it } from "vitest";
import {
  buildInteractionSnapshot,
  clampComments,
  formatRatingAverage,
  isCommentDraftValid,
  normalizeRatingScore
} from "./PublicSkillDetailPage.interaction";

describe("PublicSkillDetailPage.interaction", () => {
  it("builds a default snapshot when detail payload is absent", () => {
    const snapshot = buildInteractionSnapshot(null);
    expect(snapshot.stats.favorite_count).toBe(0);
    expect(snapshot.viewerState.can_interact).toBe(false);
    expect(snapshot.comments).toEqual([]);
  });

  it("normalizes stats, viewer state, and comment limit from detail payload", () => {
    const snapshot = buildInteractionSnapshot({
      skill: {
        id: 101,
        name: "sample",
        description: "d",
        content: "c",
        category: "development",
        subcategory: "qa",
        tags: [],
        source_type: "manual",
        source_url: "",
        star_count: 1,
        quality_score: 9.1,
        install_command: "",
        updated_at: "2026-03-01T00:00:00Z"
      },
      stats: {
        favorite_count: 12,
        rating_count: 4,
        rating_average: 4.5,
        comment_count: 3
      },
      viewer_state: {
        can_interact: true,
        favorited: true,
        rated: true,
        rating: 5
      },
      comments_limit: 1,
      comments: [
        {
          id: 8,
          skill_id: 101,
          user_id: 2,
          username: "alice",
          display_name: "Alice",
          content: "Looks good",
          created_at: "2026-03-01T00:00:00Z",
          can_delete: false
        },
        {
          id: 9,
          skill_id: 101,
          user_id: 3,
          username: "bob",
          display_name: "Bob",
          content: "Second comment",
          created_at: "2026-03-01T01:00:00Z",
          can_delete: true
        }
      ]
    });

    expect(snapshot.stats.favorite_count).toBe(12);
    expect(snapshot.viewerState.favorited).toBe(true);
    expect(snapshot.comments).toHaveLength(1);
  });

  it("clamps comments with a safe default limit", () => {
    const comments = [
      {
        id: 1,
        skill_id: 1,
        user_id: 1,
        username: "a",
        display_name: "A",
        content: "x",
        created_at: "2026-03-01T00:00:00Z",
        can_delete: false
      },
      {
        id: 2,
        skill_id: 1,
        user_id: 2,
        username: "b",
        display_name: "B",
        content: "y",
        created_at: "2026-03-01T00:01:00Z",
        can_delete: false
      }
    ];
    expect(clampComments(comments, 1)).toHaveLength(1);
    expect(clampComments(comments, 0)).toHaveLength(2);
  });

  it("normalizes rating score and validates comment draft", () => {
    expect(normalizeRatingScore(5.8)).toBe(5);
    expect(normalizeRatingScore(0)).toBe(0);
    expect(normalizeRatingScore(8)).toBe(0);
    expect(isCommentDraftValid("  useful feedback  ")).toBe(true);
    expect(isCommentDraftValid("   ")).toBe(false);
  });

  it("formats rating average with one decimal place", () => {
    expect(formatRatingAverage(4.25)).toBe("4.3");
    expect(formatRatingAverage(0)).toBe("0.0");
    expect(formatRatingAverage(Number.NaN)).toBe("0.0");
  });
});
