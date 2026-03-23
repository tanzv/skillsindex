import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse
} from "@/src/lib/schemas/public";

export interface SkillDetailOverviewModel {
  summary: string;
  previewTitle: string;
  previewLanguage: string;
  previewContent: string;
  previewUpdatedAt: string | null;
}

interface BuildSkillDetailOverviewModelOptions {
  detail: Pick<PublicSkillDetailResponse, "skill">;
  resourceContent: PublicSkillResourceContentResponse | null;
  resources: PublicSkillResourcesResponse | null;
  messages: Pick<
    PublicMarketplaceMessages,
    "skillDetailContentTitle" | "skillDetailSelectFile" | "skillDetailUnknownLanguage"
  >;
}

export function buildSkillDetailOverviewModel({
  detail,
  resourceContent,
  resources,
  messages
}: BuildSkillDetailOverviewModelOptions): SkillDetailOverviewModel {
  const selectedFile = resources?.files.find((file) => file.name === resourceContent?.path) || resources?.files[0] || null;
  const summary = String(detail.skill.description || "").trim();

  return {
    summary,
    previewTitle: resourceContent?.display_name || selectedFile?.display_name || messages.skillDetailContentTitle,
    previewLanguage: resourceContent?.language || selectedFile?.language || messages.skillDetailUnknownLanguage,
    previewContent: resourceContent?.content || detail.skill.content || messages.skillDetailSelectFile,
    previewUpdatedAt: resourceContent?.updated_at || null
  };
}
