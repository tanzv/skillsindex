import { headers } from "next/headers";

import { fetchRanking, fetchSkillCompare } from "@/src/lib/api/public";
import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";
import { publicRankingsRoute } from "@/src/lib/routing/publicRouteRegistry";
import type { PublicRankingResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { buildRankingMarketplaceRequestQuery } from "./marketplace/marketplaceRequestQuery";
import { resolvePublicLoadErrorMessage, type PublicLoadFailure } from "./publicLoadFailure";
import {
  resolvePublicIntegerSearchParam,
  resolvePublicRankingSortKey
} from "./publicRouteSearchParams";
import type { RankingSortKey } from "./publicRankingModel";

interface PublicRankingRouteLoadSuccess {
  ok: true;
  ranking: PublicRankingResponse;
  comparePayload: PublicSkillCompareResponse | null;
  sortKey: RankingSortKey;
  leftSkillId: number;
  rightSkillId: number;
}

interface PublicRankingRouteLoadFailure extends PublicLoadFailure {
  sortKey: RankingSortKey;
  leftSkillId: number;
  rightSkillId: number;
}

export type PublicRankingRouteLoadResult = PublicRankingRouteLoadSuccess | PublicRankingRouteLoadFailure;

export async function loadPublicRankingRoute(
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<PublicRankingRouteLoadResult> {
  const resolvedSearchParams = await searchParams;
  const sortKey = resolvePublicRankingSortKey(resolvedSearchParams);
  const leftSkillId = resolvePublicIntegerSearchParam(resolvedSearchParams, "left");
  const rightSkillId = resolvePublicIntegerSearchParam(resolvedSearchParams, "right");
  const requestQuery = buildRankingMarketplaceRequestQuery(resolvedSearchParams, sortKey);
  let comparePayload: PublicSkillCompareResponse | null = null;

  try {
    const requestHeaders = new Headers(await headers());
    const ranking = await fetchRanking(requestHeaders, requestQuery);

    if (leftSkillId > 0 && rightSkillId > 0 && leftSkillId !== rightSkillId) {
      comparePayload = await fetchSkillCompare(requestHeaders, leftSkillId, rightSkillId).catch((error) => {
        reportPublicFallbackError("public-rankings-compare", error, {
          leftSkillId,
          rightSkillId,
          route: publicRankingsRoute,
          sortKey
        });
        return null;
      });
    }

    return {
      ok: true,
      ranking,
      comparePayload,
      sortKey,
      leftSkillId,
      rightSkillId
    };
  } catch (error) {
    reportPublicFallbackError("public-rankings-marketplace", error, {
      leftSkillId,
      rightSkillId,
      route: publicRankingsRoute,
      sortKey
    });

    return {
      ok: false,
      errorMessage: resolvePublicLoadErrorMessage(error, "Failed to load rankings."),
      sortKey,
      leftSkillId,
      rightSkillId
    };
  }
}
