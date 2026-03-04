import { describe, expect, it } from "vitest";
import { resolveSearchActionOrder } from "./MarketplaceGlobalSearchBar.helpers";

describe("resolveSearchActionOrder", () => {
  it("returns submit only when filter action is unavailable", () => {
    expect(resolveSearchActionOrder("submit-first", false)).toEqual(["submit"]);
    expect(resolveSearchActionOrder("filter-first", false)).toEqual(["submit"]);
  });

  it("places submit before filter by default", () => {
    expect(resolveSearchActionOrder("submit-first", true)).toEqual(["submit", "filter"]);
  });

  it("supports filter-first ordering for modal-like layouts", () => {
    expect(resolveSearchActionOrder("filter-first", true)).toEqual(["filter", "submit"]);
  });
});
