import { buildMarketplacePresentationPayload } from "@/src/lib/marketplace/taxonomy";

import { serverFetchJSON } from "../http/serverFetch";
import type {
  PublicMarketplaceResponse,
  PublicRankingResponse,
  PublicSkillCompareResponse
} from "../schemas/public";
export {
  anonymousMarketplaceRevalidateSeconds,
  type MarketplaceRequestStrategy,
  resolveMarketplaceRequestStrategy
} from "./publicRequest";
import {
  buildMarketplaceQuery,
  buildPublicRequestJSONOptions
} from "./publicRequest";
export {
  fetchSkillDetail,
  fetchSkillResourceContent,
  fetchSkillResources,
  fetchSkillVersions
} from "./publicSkillDetail";

export async function fetchMarketplace(
  requestHeaders: Headers,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<PublicMarketplaceResponse> {
  const payload = await serverFetchJSON<PublicMarketplaceResponse>(
    `/api/v1/public/marketplace${buildMarketplaceQuery(searchParams)}`,
    buildPublicRequestJSONOptions(requestHeaders)
  );

  return buildMarketplacePresentationPayload(payload);
}

export async function fetchRanking(
  requestHeaders: Headers,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<PublicRankingResponse> {
  return serverFetchJSON<PublicRankingResponse>(
    `/api/v1/public/rankings${buildMarketplaceQuery(searchParams)}`,
    buildPublicRequestJSONOptions(requestHeaders)
  );
}

export async function fetchSkillCompare(
  requestHeaders: Headers,
  leftSkillId: number,
  rightSkillId: number
): Promise<PublicSkillCompareResponse> {
  return serverFetchJSON<PublicSkillCompareResponse>(
    `/api/v1/public/skills/compare?left=${leftSkillId}&right=${rightSkillId}`,
    buildPublicRequestJSONOptions(requestHeaders)
  );
}
