import { buildMarketplacePresentationPayload } from "@/src/features/public/marketplace/marketplaceTaxonomy";
import { sessionCookieName } from "@/src/lib/auth/middleware";

import { serverFetchJSON } from "../http/serverFetch";
import type {
  PublicMarketplaceResponse,
  PublicSkillCompareResponse,
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "../schemas/public";

export const anonymousMarketplaceRevalidateSeconds = 30;

export interface MarketplaceRequestStrategy {
  includeViewerContext: boolean;
  revalidateSeconds?: number;
}

function buildMarketplaceQuery(searchParams?: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  if (!searchParams) {
    return "";
  }

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value) {
          params.append(key, value);
        }
      }
      continue;
    }

    if (rawValue) {
      params.set(key, rawValue);
    }
  }

  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
}

export function resolveMarketplaceRequestStrategy(requestHeaders: Headers): MarketplaceRequestStrategy {
  const cookieHeader = String(requestHeaders.get("cookie") || "").trim();
  const hasSessionCookie = cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .some((segment) => segment.startsWith(`${sessionCookieName}=`));

  if (hasSessionCookie) {
    return {
      includeViewerContext: true
    };
  }

  return {
    includeViewerContext: false,
    revalidateSeconds: anonymousMarketplaceRevalidateSeconds
  };
}

export async function fetchMarketplace(
  requestHeaders: Headers,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<PublicMarketplaceResponse> {
  const requestStrategy = resolveMarketplaceRequestStrategy(requestHeaders);
  const payload = await serverFetchJSON<PublicMarketplaceResponse>(`/api/v1/public/marketplace${buildMarketplaceQuery(searchParams)}`, {
    requestHeaders: requestStrategy.includeViewerContext ? requestHeaders : new Headers(),
    next: requestStrategy.revalidateSeconds
      ? {
          revalidate: requestStrategy.revalidateSeconds
        }
      : undefined
  });

  return buildMarketplacePresentationPayload(payload);
}

export async function fetchSkillDetail(requestHeaders: Headers, skillId: number): Promise<PublicSkillDetailResponse> {
  return serverFetchJSON<PublicSkillDetailResponse>(`/api/v1/public/skills/${skillId}`, {
    requestHeaders
  });
}

export async function fetchSkillCompare(
  requestHeaders: Headers,
  leftSkillId: number,
  rightSkillId: number
): Promise<PublicSkillCompareResponse> {
  return serverFetchJSON<PublicSkillCompareResponse>(`/api/v1/public/skills/compare?left=${leftSkillId}&right=${rightSkillId}`, {
    requestHeaders
  });
}

export async function fetchSkillResources(requestHeaders: Headers, skillId: number): Promise<PublicSkillResourcesResponse> {
  return serverFetchJSON<PublicSkillResourcesResponse>(`/api/v1/public/skills/${skillId}/resources`, {
    requestHeaders
  });
}

export async function fetchSkillResourceContent(
  requestHeaders: Headers,
  skillId: number,
  resourcePath: string
): Promise<PublicSkillResourceContentResponse> {
  const params = new URLSearchParams();
  if (resourcePath.trim()) {
    params.set("path", resourcePath.trim());
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return serverFetchJSON<PublicSkillResourceContentResponse>(`/api/v1/public/skills/${skillId}/resource-file${suffix}`, {
    requestHeaders
  });
}

export async function fetchSkillVersions(requestHeaders: Headers, skillId: number): Promise<PublicSkillVersionsResponse> {
  return serverFetchJSON<PublicSkillVersionsResponse>(`/api/v1/public/skills/${skillId}/versions`, {
    requestHeaders
  });
}
