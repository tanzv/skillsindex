import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { loadPublicRankingRoute } from "./publicRankingRouteLoader";

export interface PublicRankingRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function renderPublicRankingRoute(
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<ReactElement> {
  const result = await loadPublicRankingRoute(searchParams);

  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  const { PublicRankingPage } = await import("./PublicRankingPage");

  return (
    <PublicRankingPage
      ranking={result.ranking}
      sortKey={result.ranking.sort === "quality" ? "quality" : result.sortKey}
      comparePayload={result.comparePayload}
      leftSkillId={result.leftSkillId}
      rightSkillId={result.rightSkillId}
    />
  );
}
