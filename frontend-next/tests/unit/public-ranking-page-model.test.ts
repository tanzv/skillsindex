import { describe, expect, it } from "vitest";

import { buildPublicRankingPageModel } from "@/src/features/public/publicRankingPageModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { buildPublicRankingResponseFixture } from "./stubs/publicRankingFixture";

const messages = {
  rankingAverageQualityPrefix: "Average quality",
  rankingCompareLeftLabel: "Left",
  rankingCompareRightLabel: "Right",
  rankingComparedSuffix: "compared",
  rankingSortByQuality: "Sort by quality",
  rankingSortByStars: "Sort by stars",
  rankingTopStarsPrefix: "Top stars",
  shellCategories: "Categories",
  shellHome: "Home",
  skillQualitySuffix: "quality",
  skillStarsSuffix: "stars",
  statTopQuality: "Top quality"
} as PublicMarketplaceMessages;

describe("public ranking page model", () => {
  it("builds warmup targets, sort links, compare defaults, and support content from ranking inputs", () => {
    const ranking = buildPublicRankingResponseFixture("stars");
    const comparePayload: PublicSkillCompareResponse = {
      left_skill: ranking.ranked_items[3]!,
      right_skill: ranking.ranked_items[4]!
    };

    const model = buildPublicRankingPageModel({
      ranking,
      sortKey: "stars",
      comparePayload,
      leftSkillId: comparePayload.left_skill.id,
      rightSkillId: comparePayload.right_skill.id,
      messages,
      resolvePath: (route) => `/light${route}`
    });

    expect(model.displayItems).toHaveLength(ranking.highlights.length + ranking.list_items.length);
    expect(model.skillWarmupTargets).toEqual([
      "/light/skills/101",
      "/light/skills/104",
      "/light/skills/105",
      "/light/skills/102",
      "/light/skills/103",
      "/light/skills/111"
    ]);
    expect(model.summaryChips).toEqual([
      { key: "compared", text: `${ranking.summary.total_compared} compared` },
      { key: "top-stars", text: `Top stars ${ranking.summary.top_stars}` },
      { key: "top-quality", text: `Top quality ${ranking.summary.top_quality.toFixed(1)}` },
      { key: "average-quality", text: `Average quality ${ranking.summary.average_quality.toFixed(1)}` }
    ]);
    expect(model.sortItems).toEqual([
      {
        key: "ranking-sort-stars",
        href: "/light/rankings?left=102&right=103",
        label: "Sort by stars",
        isActive: true
      },
      {
        key: "ranking-sort-quality",
        href: "/light/rankings?sort=quality&left=102&right=103",
        label: "Sort by quality",
        isActive: false
      }
    ]);
    expect(model.compareSelections).toEqual([
      {
        key: `${comparePayload.left_skill.id}-0`,
        label: "Left",
        title: comparePayload.left_skill.name,
        description: comparePayload.left_skill.description,
        metrics: [
          "Programming & Development",
          `${comparePayload.left_skill.star_count} stars`,
          `${comparePayload.left_skill.quality_score.toFixed(1)} quality`
        ]
      },
      {
        key: `${comparePayload.right_skill.id}-1`,
        label: "Right",
        title: comparePayload.right_skill.name,
        description: comparePayload.right_skill.description,
        metrics: [
          "Programming & Development",
          `${comparePayload.right_skill.star_count} stars`,
          `${comparePayload.right_skill.quality_score.toFixed(1)} quality`
        ]
      }
    ]);
    expect(model.compareFormAction).toBe("/light/rankings");
    expect(model.compareFormLeftValue).toBe("102");
    expect(model.compareFormRightValue).toBe("103");
    expect(model.compareHiddenFields).toEqual([{ name: "sort", value: "stars" }]);
    expect(model.categoryLeaders[0]).toMatchObject({
      category: "Programming & Development",
      leadingSkillName: "Next.js UX Audit Agent"
    });
  });

  it("drops compare query params when the current pair is invalid and defaults form values from ranked items", () => {
    const ranking = buildPublicRankingResponseFixture("quality");

    const model = buildPublicRankingPageModel({
      ranking,
      sortKey: "quality",
      comparePayload: null,
      leftSkillId: ranking.ranked_items[0]!.id,
      rightSkillId: ranking.ranked_items[0]!.id,
      messages,
      resolvePath: (route) => route
    });

    expect(model.sortItems[0]).toEqual({
      key: "ranking-sort-stars",
      href: "/rankings",
      label: "Sort by stars",
      isActive: false
    });
    expect(model.sortItems[1]).toEqual({
      key: "ranking-sort-quality",
      href: "/rankings?sort=quality",
      label: "Sort by quality",
      isActive: true
    });
    expect(model.compareFormLeftValue).toBe(String(ranking.ranked_items[0]!.id));
    expect(model.compareFormRightValue).toBe(String(ranking.ranked_items.find((item) => item.id !== ranking.ranked_items[0]!.id)!.id));
  });
});
