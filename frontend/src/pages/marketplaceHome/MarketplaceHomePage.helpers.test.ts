import { describe, expect, it } from "vitest";

import {
  buildPrototypeCardGroups,
  buildMarketplacePath,
  buildPageWindow,
  computePrototypeScale,
  parseQueryState,
  resolveStateClass,
  resolveStateLabel
} from "./MarketplaceHomePage.helpers";
import type { MarketplaceSkill } from "../../lib/api";

function createSkill(qualityScore: number): MarketplaceSkill {
  return {
    id: 1,
    name: "Skill",
    description: "description",
    content: "content",
    category: "category",
    subcategory: "subcategory",
    tags: [],
    source_type: "github",
    source_url: "https://example.com",
    star_count: 0,
    quality_score: qualityScore,
    install_command: "npx example",
    updated_at: "2026-01-01T00:00:00Z"
  };
}

describe("parseQueryState", () => {
  it("parses values with normalization and trims whitespace", () => {
    const state = parseQueryState("?q=%20hello%20&tags=%20react%20&category=%20frontend%20&subcategory=%20tools%20&sort=%20POPULAR%20&mode=%20SEMANTIC%20&page=3");

    expect(state).toEqual({
      q: "hello",
      tags: "react",
      category: "frontend",
      subcategory: "tools",
      sort: "popular",
      mode: "semantic",
      page: 3
    });
  });

  it("falls back to defaults for invalid page and missing fields", () => {
    const state = parseQueryState("?page=-3");

    expect(state).toEqual({
      q: "",
      tags: "",
      category: "",
      subcategory: "",
      sort: "recent",
      mode: "keyword",
      page: 1
    });
  });
});

describe("buildMarketplacePath", () => {
  it("omits default values and normalizes base path", () => {
    const path = buildMarketplacePath(
      {
        q: "",
        tags: "",
        category: "",
        subcategory: "",
        sort: "recent",
        mode: "keyword",
        page: 1
      },
      " marketplace/ "
    );

    expect(path).toBe("/marketplace");
  });

  it("includes non-default query values and page greater than one", () => {
    const path = buildMarketplacePath(
      {
        q: "agent",
        tags: "automation",
        category: "tools",
        subcategory: "dev",
        sort: "popular",
        mode: "semantic",
        page: 2
      },
      "/"
    );

    expect(path).toBe("/?q=agent&tags=automation&category=tools&subcategory=dev&sort=popular&mode=semantic&page=2");
  });
});

describe("buildPageWindow", () => {
  it("returns [1] when total pages is one or less", () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
    expect(buildPageWindow(3, 0)).toEqual([1]);
  });

  it("builds a middle page window including first and last pages", () => {
    expect(buildPageWindow(5, 10)).toEqual([1, 4, 5, 6, 7, 10]);
  });

  it("handles edges near beginning and end", () => {
    expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageWindow(5, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageWindow(2, 109)).toEqual([1, 2, 3, 4, 5, 109]);
    expect(buildPageWindow(108, 109)).toEqual([1, 105, 106, 107, 108, 109]);
  });

  it("returns sorted unique pages for large totals", () => {
    const window = buildPageWindow(44, 109);
    expect(window).toEqual([1, 43, 44, 45, 46, 109]);
    expect(new Set(window).size).toBe(window.length);
  });
});

describe("resolveStateClass and resolveStateLabel", () => {
  it("resolves stable state for quality score >= 9", () => {
    const skill = createSkill(9);

    expect(resolveStateClass(skill)).toBe("is-stable");
    expect(resolveStateLabel(skill, "en")).toBe("Stable");
  });

  it("resolves growing state for quality score >= 8 and < 9", () => {
    const skill = createSkill(8.2);

    expect(resolveStateClass(skill)).toBe("is-growing");
    expect(resolveStateLabel(skill, "en")).toBe("Growing");
  });

  it("resolves risk state for quality score < 8", () => {
    const skill = createSkill(7.9);

    expect(resolveStateClass(skill)).toBe("is-risk");
    expect(resolveStateLabel(skill, "en")).toBe("Risk");
  });
});

describe("buildPrototypeCardGroups", () => {
  it("returns fixed featured and latest card counts", () => {
    const cards = buildPrototypeCardGroups([createSkill(9.1), createSkill(8.9), createSkill(8.2)]);

    expect(cards.featured).toHaveLength(3);
    expect(cards.latest).toHaveLength(12);
    expect(cards.featured[0]?.code).toBe("PL");
    expect(cards.latest[0]?.code).toBe("RE");
    expect(cards.latest[0]?.chips).toEqual(["Repo", "Diff"]);
    expect(cards.latest[0]?.meta).toBe("Details | Install | Queue");
  });

  it("keeps latest cards splittable into four rows of three", () => {
    const cards = buildPrototypeCardGroups([createSkill(9.1), createSkill(8.9), createSkill(8.2)]);
    const latestRows = [
      cards.latest.slice(0, 3),
      cards.latest.slice(3, 6),
      cards.latest.slice(6, 9),
      cards.latest.slice(9, 12)
    ];

    expect(latestRows).toHaveLength(4);
    expect(latestRows.every((row) => row.length === 3)).toBe(true);
  });

  it("cycles skill ids when source list is shorter than card count", () => {
    const first = createSkill(9.3);
    first.id = 101;
    const second = createSkill(8.4);
    second.id = 202;

    const cards = buildPrototypeCardGroups([first, second]);
    const latestIDs = cards.latest.map((entry) => entry.skillID);

    expect(latestIDs).toEqual([202, 101, 202, 101, 202, 101, 202, 101, 202, 101, 202, 101]);
  });

  it("uses null skill ids when source list is empty", () => {
    const cards = buildPrototypeCardGroups([]);

    expect(cards.featured.every((entry) => entry.skillID === null)).toBe(true);
    expect(cards.latest.every((entry) => entry.skillID === null)).toBe(true);
  });

  it("keeps template copy in prototype mode when skill payload override is disabled", () => {
    const skill = createSkill(9.6);
    skill.name = "Runtime Skill Name";
    skill.description = "Runtime Description";
    skill.tags = ["runtime", "override"];
    const cards = buildPrototypeCardGroups([skill], "en", { useSkillPayload: false });

    expect(cards.featured[0]?.title).toBe("Playwright Flow Guardian");
    expect(cards.featured[0]?.subtitle).toBe("Reason: stable regression flow and high script reuse.");
    expect(cards.latest[0]?.title).toBe("Repository Diff Sentinel");
    expect(cards.latest[0]?.subtitle).toBe("Tags: repository / diff");
    expect(cards.latest[0]?.chips).toEqual(["Repo", "Diff"]);
  });

  it("uses light-theme cover URLs when requested", () => {
    const cards = buildPrototypeCardGroups([], "en", { theme: "light", useSkillPayload: false });

    expect(cards.featured[0]?.coverImageURL).toContain("photo-1590030535521-e69873a44ee0");
    expect(cards.latest[0]?.coverImageURL).toContain("photo-1760392441483-f3fe304ddb9a");
  });
});

describe("computePrototypeScale", () => {
  it("uses the tighter side ratio after applying safe inset", () => {
    const scale = computePrototypeScale(1448, 908);
    expect(scale).toBeCloseTo(1, 4);
  });

  it("shrinks to fit smaller viewports", () => {
    const scale = computePrototypeScale(512, 342);
    expect(scale).toBeCloseTo(0.35, 3);
  });

  it("returns positive fallback for invalid viewport values", () => {
    const scale = computePrototypeScale(0, 0);
    expect(scale).toBeGreaterThan(0);
  });
});
