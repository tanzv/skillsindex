import { fetchSkillDetail } from "@/src/lib/api/publicSkillDetail";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";

import { resolvePublicLoadErrorMessage } from "./publicLoadFailure";

export interface InitialSkillDetailPageData {
  detail: PublicSkillDetailResponse | null;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
  initialResourceContent: PublicSkillResourceContentResponse | null;
  errorMessage: string;
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
    errorMessage = resolvePublicLoadErrorMessage(error, "Failed to load skill detail.");
  }

  if (detail) {
    return {
      detail,
      resources: null,
      versions: null,
      initialResourceContent: null,
      errorMessage
    };
  }
  return {
    detail: null,
    resources: null,
    versions: null,
    initialResourceContent: null,
    errorMessage
  };
}
