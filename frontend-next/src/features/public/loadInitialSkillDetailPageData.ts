import { buildPublicSkillDetailFallback, resolvePublicSkillFallback } from "./publicSkillDetailFallback";

import { fetchSkillDetail, fetchSkillResourceContent, fetchSkillResources } from "@/src/lib/api/public";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";

export interface InitialSkillDetailPageData {
  detail: PublicSkillDetailResponse | null;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
  initialResourceContent: PublicSkillResourceContentResponse | null;
  errorMessage: string;
}

async function loadInitialResources(
  requestHeaders: Headers,
  skillId: number
): Promise<Pick<InitialSkillDetailPageData, "initialResourceContent" | "resources">> {
  try {
    const resources = await fetchSkillResources(requestHeaders, skillId);
    const firstResourcePath = resources.files[0]?.name;

    if (!firstResourcePath) {
      return {
        resources,
        initialResourceContent: null
      };
    }

    try {
      const initialResourceContent = await fetchSkillResourceContent(requestHeaders, skillId, firstResourcePath);
      return {
        resources,
        initialResourceContent
      };
    } catch {
      return {
        resources,
        initialResourceContent: null
      };
    }
  } catch {
    return {
      resources: null,
      initialResourceContent: null
    };
  }
}

export async function loadInitialSkillDetailPageData(
  requestHeaders: Headers,
  skillId: number
): Promise<InitialSkillDetailPageData> {
  let detail: PublicSkillDetailResponse | null = null;
  let errorMessage = "";

  try {
    detail = await fetchSkillDetail(requestHeaders, skillId);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load skill detail.";
  }

  if (detail) {
    const { resources, initialResourceContent } = await loadInitialResources(requestHeaders, skillId);

    return {
      detail,
      resources,
      versions: null,
      initialResourceContent,
      errorMessage
    };
  }

  const fallbackSkill = resolvePublicSkillFallback(skillId);
  if (!fallbackSkill) {
    return {
      detail: null,
      resources: null,
      versions: null,
      initialResourceContent: null,
      errorMessage
    };
  }

  const fallback = buildPublicSkillDetailFallback(skillId);
  return {
    detail: fallback.detail,
    resources: fallback.resources,
    versions: fallback.versions,
    initialResourceContent: fallback.resourceContent,
    errorMessage
  };
}
