import { serverFetchJSON } from "../http/serverFetch";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "../schemas/public";
import { buildPublicRequestJSONOptions } from "./publicRequest";

export async function fetchSkillDetail(requestHeaders: Headers, skillId: number): Promise<PublicSkillDetailResponse> {
  return serverFetchJSON<PublicSkillDetailResponse>(`/api/v1/public/skills/${skillId}`, buildPublicRequestJSONOptions(requestHeaders));
}

export async function fetchSkillResources(requestHeaders: Headers, skillId: number): Promise<PublicSkillResourcesResponse> {
  return serverFetchJSON<PublicSkillResourcesResponse>(
    `/api/v1/public/skills/${skillId}/resources`,
    buildPublicRequestJSONOptions(requestHeaders)
  );
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
  return serverFetchJSON<PublicSkillResourceContentResponse>(
    `/api/v1/public/skills/${skillId}/resource-file${suffix}`,
    buildPublicRequestJSONOptions(requestHeaders)
  );
}

export async function fetchSkillVersions(requestHeaders: Headers, skillId: number): Promise<PublicSkillVersionsResponse> {
  return serverFetchJSON<PublicSkillVersionsResponse>(
    `/api/v1/public/skills/${skillId}/versions`,
    buildPublicRequestJSONOptions(requestHeaders)
  );
}
