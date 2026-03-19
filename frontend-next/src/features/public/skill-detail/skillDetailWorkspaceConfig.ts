import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

export type SkillDetailWorkspaceTab = "overview" | "installation" | "skill" | "resources" | "related" | "history";

export interface SkillDetailWorkspaceTabConfig {
  key: SkillDetailWorkspaceTab;
  panelId: string;
  tabId: string;
}

export const skillDetailWorkspaceTabs: SkillDetailWorkspaceTabConfig[] = [
  {
    key: "overview",
    panelId: "skill-detail-panel-overview",
    tabId: "skill-detail-tab-overview"
  },
  {
    key: "installation",
    panelId: "skill-detail-panel-installation",
    tabId: "skill-detail-tab-installation"
  },
  {
    key: "skill",
    panelId: "skill-detail-panel-skill",
    tabId: "skill-detail-tab-skill"
  },
  {
    key: "resources",
    panelId: "skill-detail-panel-resources",
    tabId: "skill-detail-tab-resources"
  },
  {
    key: "related",
    panelId: "skill-detail-panel-related",
    tabId: "skill-detail-tab-related"
  },
  {
    key: "history",
    panelId: "skill-detail-panel-history",
    tabId: "skill-detail-tab-history"
  }
];

export const skillDetailWorkspacePanelIdByKey = skillDetailWorkspaceTabs.reduce(
  (accumulator, item) => {
    accumulator[item.key] = item.panelId;
    return accumulator;
  },
  {} as Record<SkillDetailWorkspaceTab, string>
);

export const skillDetailWorkspaceTabIdByKey = skillDetailWorkspaceTabs.reduce(
  (accumulator, item) => {
    accumulator[item.key] = item.tabId;
    return accumulator;
  },
  {} as Record<SkillDetailWorkspaceTab, string>
);

type WorkspaceCopyMessages = Pick<
  PublicMarketplaceMessages,
  | "skillDetailContentTitle"
  | "skillDetailOverviewDescription"
  | "skillDetailOverviewTitle"
  | "skillDetailInstallDescription"
  | "skillDetailInstallTitle"
  | "skillDetailRelatedDescription"
  | "skillDetailRelatedTitle"
  | "skillDetailResourcesDescription"
  | "skillDetailResourcesTitle"
  | "skillDetailVersionsDescription"
  | "skillDetailVersionsTitle"
>;

export function buildSkillDetailWorkspaceCopy(messages: WorkspaceCopyMessages) {
  return {
    overview: {
      title: messages.skillDetailOverviewTitle,
      description: messages.skillDetailOverviewDescription
    },
    installation: {
      title: messages.skillDetailInstallTitle,
      description: messages.skillDetailInstallDescription
    },
    skill: {
      title: messages.skillDetailContentTitle,
      description: ""
    },
    resources: {
      title: messages.skillDetailResourcesTitle,
      description: messages.skillDetailResourcesDescription
    },
    related: {
      title: messages.skillDetailRelatedTitle,
      description: messages.skillDetailRelatedDescription
    },
    history: {
      title: messages.skillDetailVersionsTitle,
      description: messages.skillDetailVersionsDescription
    }
  } satisfies Record<SkillDetailWorkspaceTab, { description: string; title: string }>;
}

export function buildSkillDetailPreviewStatus({
  activeTab,
  selectedFileName,
  versionCount
}: {
  activeTab: SkillDetailWorkspaceTab;
  selectedFileName?: string;
  versionCount?: number;
}) {
  if ((activeTab === "resources" || activeTab === "skill") && selectedFileName) {
    return selectedFileName.split("/").filter(Boolean).pop() || selectedFileName;
  }

  if (activeTab === "history" && Number.isFinite(versionCount)) {
    return `${versionCount || 0} versions`;
  }

  return activeTab;
}
