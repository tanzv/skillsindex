import { describe, expect, it } from "vitest";
import { normalizeFilterFormQuery, normalizeQueryText, normalizeRouteCategorySlug } from "./MarketplacePublicQuery";

describe("MarketplacePublicQuery", () => {
  it("normalizes route category slug with trimmed spaces", () => {
    expect(normalizeRouteCategorySlug("  tools   automation ")).toBe("tools automation");
    expect(normalizeRouteCategorySlug("")).toBe("");
    expect(normalizeRouteCategorySlug(null)).toBe("");
  });

  it("normalizes single query field text", () => {
    expect(normalizeQueryText("   repo    lint   ")).toBe("repo lint");
    expect(normalizeQueryText("")).toBe("");
  });

  it("normalizes marketplace filter form query", () => {
    expect(
      normalizeFilterFormQuery({
        q: "  repo  lint ",
        tags: "  semantic   query ",
        category: "  tools ",
        subcategory: "  devops   automation ",
        sort: "recent",
        mode: "keyword"
      })
    ).toEqual({
      q: "repo lint",
      tags: "semantic query",
      category: "tools",
      subcategory: "devops automation",
      sort: "recent",
      mode: "keyword"
    });
  });
});
