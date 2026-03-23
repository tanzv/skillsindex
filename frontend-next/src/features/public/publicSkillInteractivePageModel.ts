import type { MarketplaceTopbarBreadcrumbItem } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { buildSkillDetailPreviewStatus, type SkillDetailWorkspaceTab } from "./skill-detail/skillDetailWorkspaceConfig";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

export interface PublicSkillInteractivePageModel {
  activeWorkspaceLabel: string;
  breadcrumbItems: MarketplaceTopbarBreadcrumbItem[];
  previewStatus: string;
  resolvedSelectedFileName: string;
}

export type PublicSkillInteractivePageMessages = Pick<
  PublicMarketplaceMessages,
  | "shellHome"
  | "skillDetailContentTitle"
  | "skillDetailInstallTitle"
  | "skillDetailOverviewTitle"
  | "skillDetailRelatedTitle"
  | "skillDetailResourcesTitle"
  | "skillDetailVersionsTitle"
>;

export interface ResolveInitialSelectedSkillResourceNameInput {
  detail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse | null;
  initialResourceContent: PublicSkillResourceContentResponse | null;
}

export interface BuildPublicSkillInteractivePageModelInput {
  detail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
  activeTab: SkillDetailWorkspaceTab;
  selectedResourceName: string;
  messages: PublicSkillInteractivePageMessages;
}

export function resolveInitialSelectedSkillResourceName({
  detail,
  resources,
  initialResourceContent
}: ResolveInitialSelectedSkillResourceNameInput): string {
  return (
    initialResourceContent?.path ||
    resources?.source_path ||
    resources?.files[0]?.name ||
    (detail.skill.content ? "SKILL.md" : "")
  );
}

function resolveActiveSkillDetailWorkspaceLabel(
  activeTab: SkillDetailWorkspaceTab,
  messages: PublicSkillInteractivePageMessages
): string {
  switch (activeTab) {
    case "overview":
      return messages.skillDetailOverviewTitle;
    case "installation":
      return messages.skillDetailInstallTitle;
    case "skill":
      return messages.skillDetailContentTitle;
    case "history":
      return messages.skillDetailVersionsTitle;
    case "related":
      return messages.skillDetailRelatedTitle;
    case "resources":
    default:
      return messages.skillDetailResourcesTitle;
  }
}

export function buildPublicSkillInteractivePageModel({
  detail,
  resources,
  versions,
  activeTab,
  selectedResourceName,
  messages
}: BuildPublicSkillInteractivePageModelInput): PublicSkillInteractivePageModel {
  const resolvedSelectedFileName = selectedResourceName || resources?.files[0]?.name || "";
  const activeWorkspaceLabel = resolveActiveSkillDetailWorkspaceLabel(activeTab, messages);

  return {
    activeWorkspaceLabel,
    breadcrumbItems: [
      { href: "/", label: messages.shellHome },
      { href: `/skills/${detail.skill.id}`, label: detail.skill.name },
      { label: activeWorkspaceLabel, isCurrent: true, isSoft: true }
    ],
    previewStatus: buildSkillDetailPreviewStatus({
      activeTab,
      selectedFileName: resolvedSelectedFileName,
      versionCount: versions?.total || 0
    }),
    resolvedSelectedFileName
  };
}
