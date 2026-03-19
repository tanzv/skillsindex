import { headers } from "next/headers";

import { PublicRankingPage } from "@/src/features/public/PublicRankingPage";
import { buildRankingMarketplaceRequestQuery } from "@/src/features/public/marketplace/marketplaceRequestQuery";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { fetchMarketplace, fetchSkillCompare } from "@/src/lib/api/public";

interface RankingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedSort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "";
  const sortKey = requestedSort === "quality" ? "quality" : "stars";
  const leftSkillId = Number(Array.isArray(resolvedSearchParams.left) ? resolvedSearchParams.left[0] : resolvedSearchParams.left || 0);
  const rightSkillId = Number(Array.isArray(resolvedSearchParams.right) ? resolvedSearchParams.right[0] : resolvedSearchParams.right || 0);
  const requestQuery = buildRankingMarketplaceRequestQuery(resolvedSearchParams, sortKey);
  let marketplace = buildPublicMarketplaceFallback(requestQuery);
  let comparePayload = null;

  try {
    const requestHeaders = new Headers(await headers());
    marketplace = await fetchMarketplace(requestHeaders, requestQuery);

    if (
      Number.isInteger(leftSkillId) &&
      Number.isInteger(rightSkillId) &&
      leftSkillId > 0 &&
      rightSkillId > 0 &&
      leftSkillId !== rightSkillId
    ) {
      comparePayload = await fetchSkillCompare(requestHeaders, leftSkillId, rightSkillId).catch(() => null);
    }
  } catch {}

  return (
    <PublicRankingPage
      marketplace={marketplace}
      sortKey={sortKey}
      comparePayload={comparePayload}
      leftSkillId={Number.isInteger(leftSkillId) ? leftSkillId : 0}
      rightSkillId={Number.isInteger(rightSkillId) ? rightSkillId : 0}
    />
  );
}
