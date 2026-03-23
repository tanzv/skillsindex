import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicRankingResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { buildPublicRankingResponseFixture } from "./stubs/publicRankingFixture";

vi.mock("next/headers", () => ({
  headers: vi.fn()
}));

vi.mock("@/src/lib/api/public", () => ({
  fetchRanking: vi.fn(),
  fetchSkillCompare: vi.fn()
}));

vi.mock("@/src/lib/api/publicFallbackLogging", () => ({
  reportPublicFallbackError: vi.fn()
}));

import { headers } from "next/headers";

import { fetchRanking, fetchSkillCompare } from "@/src/lib/api/public";
import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";
import { publicRankingsRoute } from "@/src/lib/routing/publicRouteRegistry";
import { loadPublicRankingRoute } from "@/src/features/public/publicRankingRouteLoader";

const rankingPayload = buildPublicRankingResponseFixture("stars") satisfies PublicRankingResponse;

const comparePayload = {
  left_skill: rankingPayload.ranked_items[0]!,
  right_skill: rankingPayload.ranked_items[1]!
} satisfies PublicSkillCompareResponse;

describe("loadPublicRankingRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(headers).mockResolvedValue(new Headers());
  });

  it("returns ranking data when the backend request succeeds", async () => {
    vi.mocked(fetchRanking).mockResolvedValue(rankingPayload);
    vi.mocked(fetchSkillCompare).mockResolvedValue(comparePayload);

    const result = await loadPublicRankingRoute(
      Promise.resolve({
        sort: "stars",
        left: "101",
        right: "102"
      })
    );

    expect(result).toEqual({
      ok: true,
      ranking: rankingPayload,
      comparePayload,
      sortKey: "stars",
      leftSkillId: 101,
      rightSkillId: 102
    });
  });

  it("returns an explicit error result instead of fallback ranking data when the backend request fails", async () => {
    vi.mocked(fetchRanking).mockRejectedValue(new Error("ranking backend down"));

    const result = await loadPublicRankingRoute(Promise.resolve({ sort: "quality" }));

    expect(reportPublicFallbackError).toHaveBeenCalledWith("public-rankings-marketplace", expect.any(Error), {
      leftSkillId: 0,
      rightSkillId: 0,
      route: publicRankingsRoute,
      sortKey: "quality"
    });
    expect(result).toEqual({
      ok: false,
      errorMessage: "ranking backend down",
      sortKey: "quality",
      leftSkillId: 0,
      rightSkillId: 0
    });
  });
});
