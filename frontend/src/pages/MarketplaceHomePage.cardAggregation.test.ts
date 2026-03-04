import { describe, expect, it } from "vitest";

import type { MarketplaceSkill } from "../lib/api";
import type { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";
import { buildMergedLatestCards } from "./MarketplaceHomePage.cardAggregation";

function createSkill(id: number): MarketplaceSkill {
  return {
    id,
    name: `Skill ${id}`,
    description: `Description ${id}`,
    content: "",
    category: "Testing Automation",
    subcategory: "Workflow Regression",
    tags: [`tag-${id}`, `topic-${id}`],
    source_type: "official",
    source_url: "",
    star_count: 100 + id,
    quality_score: 8.5 + (id % 10) * 0.1,
    install_command: `skills install skill-${id}`,
    updated_at: "2026-01-01T00:00:00Z"
  };
}

function createFallbackLatestCards(): PrototypeCardEntry[] {
  return Array.from({ length: 12 }).map((_, index) => ({
    code: `C${index + 1}`,
    chips: ["Tag", "Topic"],
    coverImageURL: `https://example.com/cover-${index + 1}.png`,
    title: `Template ${index + 1}`,
    subtitle: `Template subtitle ${index + 1}`,
    meta: `Template meta ${index + 1}`,
    skillID: null
  }));
}

describe("buildMergedLatestCards", () => {
  it("maps one page of real items into latest cards without template title fallback", () => {
    const fallbackLatestCards = createFallbackLatestCards();
    const items = Array.from({ length: 24 }).map((_, index) => createSkill(index + 1));

    const cards = buildMergedLatestCards({
      items,
      pageSize: 24,
      locale: "en",
      isLightTheme: false,
      useSkillPayload: true,
      fallbackLatestCards
    });

    expect(cards).toHaveLength(12);
    expect(cards[0]?.title).toBe("Skill 1");
    expect(cards[11]?.title).toBe("Skill 12");
    expect(cards.map((card) => card.skillID)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("appends next-page cards in page order for accumulated items", () => {
    const fallbackLatestCards = createFallbackLatestCards();
    const items = Array.from({ length: 48 }).map((_, index) => createSkill(index + 1));

    const cards = buildMergedLatestCards({
      items,
      pageSize: 24,
      locale: "en",
      isLightTheme: true,
      useSkillPayload: true,
      fallbackLatestCards
    });

    expect(cards).toHaveLength(24);
    expect(cards[0]?.title).toBe("Skill 1");
    expect(cards[11]?.title).toBe("Skill 12");
    expect(cards[12]?.title).toBe("Skill 25");
    expect(cards[23]?.title).toBe("Skill 36");
    expect(cards.slice(12).map((card) => card.skillID)).toEqual([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);
  });

  it("keeps template cards when skill payload mapping is disabled", () => {
    const fallbackLatestCards = createFallbackLatestCards();
    const items = Array.from({ length: 24 }).map((_, index) => createSkill(index + 1));

    const cards = buildMergedLatestCards({
      items,
      pageSize: 24,
      locale: "en",
      isLightTheme: false,
      useSkillPayload: false,
      fallbackLatestCards
    });

    expect(cards).toEqual(fallbackLatestCards);
  });

  it("returns empty cards when payload mode is enabled but there is no matching data", () => {
    const fallbackLatestCards = createFallbackLatestCards();

    const cards = buildMergedLatestCards({
      items: [],
      pageSize: 24,
      locale: "en",
      isLightTheme: false,
      useSkillPayload: true,
      fallbackLatestCards
    });

    expect(cards).toEqual([]);
  });
});
