import { describe, expect, it } from "vitest";
import { resolveMarketplaceCategorySubcategoryState } from "./MarketplaceHomePage.subcategory";

describe("MarketplaceHomePage subcategory helpers", () => {
  it("returns sorted top subcategory options for matched category", () => {
    const state = resolveMarketplaceCategorySubcategoryState(
      [
        {
          slug: "tools",
          name: "Tools",
          description: "",
          count: 10,
          subcategories: [
            { slug: "lint", name: "Lint", count: 2 },
            { slug: "test", name: "Test", count: 9 },
            { slug: "build", name: "Build", count: 4 }
          ]
        }
      ],
      "tools",
      "Categories"
    );

    expect(state.categoryName).toBe("Tools");
    expect(state.options.map((item) => item.slug)).toEqual(["test", "build", "lint"]);
  });

  it("returns fallback state when no category match exists", () => {
    const state = resolveMarketplaceCategorySubcategoryState([], "tools", "Categories");
    expect(state.categoryName).toBe("Categories");
    expect(state.options).toEqual([]);
  });
});
