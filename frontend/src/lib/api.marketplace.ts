import type {
  MarketplaceQueryParams,
  PublicMarketplaceResponse,
  PublicSkillCompareResponse,
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse,
  SkillCommentCreateMutationResponse,
  SkillCommentDeleteMutationResponse,
  SkillFavoriteMutationResponse,
  SkillRatingMutationResponse
} from "./api.types";
import { requestJSON } from "./api.core";
import { postConsoleJSON } from "./api.console";

export async function fetchPublicMarketplace(query: MarketplaceQueryParams): Promise<PublicMarketplaceResponse> {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.tags) {
    params.set("tags", query.tags);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.subcategory) {
    params.set("subcategory", query.subcategory);
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.mode) {
    params.set("mode", query.mode);
  }
  const page = Number(query.page || "");
  if (Number.isFinite(page) && page > 0) {
    params.set("page", String(page));
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJSON<PublicMarketplaceResponse>(`/api/v1/public/marketplace${suffix}`, {
    method: "GET"
  });
}

export async function fetchPublicSkillDetail(skillID: number): Promise<PublicSkillDetailResponse> {
  const resolvedSkillID = Number(skillID);
  if (!Number.isFinite(resolvedSkillID) || resolvedSkillID <= 0) {
    throw new Error("Invalid skill id");
  }
  return requestJSON<PublicSkillDetailResponse>(`/api/v1/public/skills/${Math.trunc(resolvedSkillID)}`, {
    method: "GET"
  });
}

export async function fetchPublicSkillCompare(leftSkillID: number, rightSkillID: number): Promise<PublicSkillCompareResponse> {
  const left = Number(leftSkillID);
  const right = Number(rightSkillID);
  if (!Number.isFinite(left) || left <= 0 || !Number.isFinite(right) || right <= 0) {
    throw new Error("Invalid compare skill ids");
  }
  const params = new URLSearchParams({
    left: String(Math.trunc(left)),
    right: String(Math.trunc(right))
  });
  return requestJSON<PublicSkillCompareResponse>(`/api/v1/public/skills/compare?${params.toString()}`, {
    method: "GET"
  });
}

export async function fetchPublicSkillResources(skillID: number): Promise<PublicSkillResourcesResponse> {
  const resolvedSkillID = Number(skillID);
  if (!Number.isFinite(resolvedSkillID) || resolvedSkillID <= 0) {
    throw new Error("Invalid skill id");
  }
  return requestJSON<PublicSkillResourcesResponse>(`/api/v1/public/skills/${Math.trunc(resolvedSkillID)}/resources`, {
    method: "GET"
  });
}

export async function fetchPublicSkillResourceContent(
  skillID: number,
  path: string
): Promise<PublicSkillResourceContentResponse> {
  const resolvedSkillID = Number(skillID);
  if (!Number.isFinite(resolvedSkillID) || resolvedSkillID <= 0) {
    throw new Error("Invalid skill id");
  }
  const params = new URLSearchParams();
  const normalizedPath = String(path || "").trim();
  if (normalizedPath) {
    params.set("path", normalizedPath);
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJSON<PublicSkillResourceContentResponse>(
    `/api/v1/public/skills/${Math.trunc(resolvedSkillID)}/resource-file${suffix}`,
    {
      method: "GET"
    }
  );
}

export async function fetchPublicSkillVersions(skillID: number): Promise<PublicSkillVersionsResponse> {
  const resolvedSkillID = Number(skillID);
  if (!Number.isFinite(resolvedSkillID) || resolvedSkillID <= 0) {
    throw new Error("Invalid skill id");
  }
  return requestJSON<PublicSkillVersionsResponse>(`/api/v1/public/skills/${Math.trunc(resolvedSkillID)}/versions`, {
    method: "GET"
  });
}

export async function setSkillFavorite(skillID: number, favorite?: boolean): Promise<SkillFavoriteMutationResponse> {
  const payload = typeof favorite === "boolean" ? { favorite } : undefined;
  return postConsoleJSON<SkillFavoriteMutationResponse>(`/api/v1/skills/${skillID}/favorite`, payload);
}

export async function submitSkillRating(skillID: number, score: number): Promise<SkillRatingMutationResponse> {
  return postConsoleJSON<SkillRatingMutationResponse>(`/api/v1/skills/${skillID}/rating`, { score });
}

export async function createSkillComment(skillID: number, content: string): Promise<SkillCommentCreateMutationResponse> {
  return postConsoleJSON<SkillCommentCreateMutationResponse>(`/api/v1/skills/${skillID}/comments`, { content });
}

export async function deleteSkillComment(skillID: number, commentID: number): Promise<SkillCommentDeleteMutationResponse> {
  return postConsoleJSON<SkillCommentDeleteMutationResponse>(`/api/v1/skills/${skillID}/comments/${commentID}/delete`);
}
