import { describe, expect, it } from "vitest";

import {
  resolvePublicAudience,
  resolvePublicIntegerSearchParam,
  resolvePublicMode,
  resolvePublicQueryText,
  resolvePublicRankingSortKey,
  resolvePublicSemanticQuery,
  resolvePublicSort,
  resolvePublicSubcategory,
  resolveScalarPublicSearchParam
} from "@/src/features/public/publicRouteSearchParams";

describe("public route search params", () => {
  it("resolves scalar public route params with stable defaults", () => {
    const searchParams = {
      q: "release",
      tags: "ops",
      audience: "human",
      subcategory: "ui",
      sort: "recent",
      mode: "keyword"
    };

    expect(resolveScalarPublicSearchParam(searchParams, "q")).toBe("release");
    expect(resolvePublicQueryText(searchParams)).toBe("release");
    expect(resolvePublicSemanticQuery(searchParams)).toBe("ops");
    expect(resolvePublicAudience(searchParams)).toBe("human");
    expect(resolvePublicSubcategory(searchParams)).toBe("ui");
    expect(resolvePublicSort(searchParams)).toBe("recent");
    expect(resolvePublicMode(searchParams)).toBe("keyword");
  });

  it("falls back for missing or array-based scalar values", () => {
    const searchParams = {
      q: ["ignored"],
      left: ["13"],
      right: "invalid"
    };

    expect(resolvePublicQueryText(searchParams)).toBe("");
    expect(resolvePublicSemanticQuery(searchParams)).toBe("");
    expect(resolvePublicAudience(searchParams)).toBe("agent");
    expect(resolvePublicSort(searchParams)).toBe("relevance");
    expect(resolvePublicMode(searchParams)).toBe("hybrid");
    expect(resolvePublicRankingSortKey(searchParams)).toBe("stars");
    expect(resolvePublicIntegerSearchParam(searchParams, "left")).toBe(13);
    expect(resolvePublicIntegerSearchParam(searchParams, "right")).toBe(0);
  });

  it("normalizes quality sort into the ranking sort key", () => {
    expect(resolvePublicRankingSortKey({ sort: "quality" })).toBe("quality");
    expect(resolvePublicRankingSortKey({ sort: "stars" })).toBe("stars");
  });
});
