import type { ReactNode } from "react";

import { TabsContent } from "@/src/components/ui/tabs";

import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse
} from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailOverviewPanel } from "./SkillDetailOverviewPanel";
import { SkillDetailWorkbenchDeferredPanels } from "./SkillDetailWorkbenchDeferredPanels";
import { buildSkillDetailOverviewModel } from "./skillDetailWorkbenchOverview";
import {
  skillDetailWorkspacePanelIdByKey,
  skillDetailWorkspaceTabIdByKey,
  type SkillDetailWorkspaceTab
} from "./skillDetailWorkspaceConfig";
export type { SkillDetailWorkspaceTab } from "./skillDetailWorkspaceConfig";

interface SkillDetailWorkbenchProps {
  activeTab: SkillDetailWorkspaceTab;
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "rankingOpenSkillLabel"
    | "skillDetailContentTitle"
    | "skillDetailOverviewDescription"
    | "skillDetailOverviewFactsTitle"
    | "skillDetailOverviewMetricsTitle"
    | "skillDetailOverviewTitle"
    | "skillDetailInstallDescription"
    | "skillDetailInstallTitle"
    | "skillDetailNoInstall"
    | "skillDetailNoComments"
    | "skillDetailNotAvailable"
    | "skillDetailNoResources"
    | "skillDetailNoVersions"
    | "skillDetailRelatedDescription"
    | "skillDetailRelatedTitle"
    | "skillDetailResourcesDescription"
    | "skillDetailResourcesTitle"
    | "skillDetailMetricsComments"
    | "skillDetailMetricsRatings"
    | "skillDetailSelectFile"
    | "skillDetailUnknownLanguage"
    | "skillDetailUpdatedBadgePrefix"
    | "skillDetailVersionsDescription"
    | "skillDetailVersionsTitle"
  >;
  model: PublicSkillDetailModel;
  onOpenFile: (fileName: string) => void;
  resourceContent: PublicSkillResourceContentResponse | null;
  resourcesPending?: boolean;
  resources: PublicSkillResourcesResponse | null;
  selectedFileName: string;
  versionsPending?: boolean;
}

function SkillWorkbenchPanel({
  activeTab,
  children,
  tab
}: {
  activeTab: SkillDetailWorkspaceTab;
  children: ReactNode;
  tab: SkillDetailWorkspaceTab;
}) {
  return (
    <TabsContent
      value={tab}
      activeValue={activeTab}
      panelId={skillDetailWorkspacePanelIdByKey[tab]}
      labelledBy={skillDetailWorkspaceTabIdByKey[tab]}
      className="skill-detail-workbench-panel"
    >
      {children}
    </TabsContent>
  );
}

export function SkillDetailWorkbench({
  activeTab,
  detail,
  locale,
  messages,
  model,
  onOpenFile,
  resourceContent,
  resourcesPending = false,
  resources,
  selectedFileName,
  versionsPending = false
}: SkillDetailWorkbenchProps) {
  const overviewModel = buildSkillDetailOverviewModel({
    detail,
    resourceContent,
    resources,
    messages: {
      skillDetailContentTitle: messages.skillDetailContentTitle,
      skillDetailSelectFile: messages.skillDetailSelectFile,
      skillDetailUnknownLanguage: messages.skillDetailUnknownLanguage
    }
  });
  return (
    <section
      className="marketplace-section-card skill-detail-workbench-card"
      data-active-tab={activeTab}
      data-testid="skill-detail-resource-workbench"
    >
      <SkillWorkbenchPanel activeTab={activeTab} tab="overview">
        <SkillDetailOverviewPanel
          detail={detail}
          locale={locale}
          messages={messages}
          model={model}
          overviewModel={overviewModel}
        />
      </SkillWorkbenchPanel>

      {activeTab !== "overview" ? (
        <SkillDetailWorkbenchDeferredPanels
          activeTab={activeTab}
          detail={detail}
          locale={locale}
          messages={messages}
          model={model}
          onOpenFile={onOpenFile}
          resourceContent={resourceContent}
          resourcesPending={resourcesPending}
          resources={resources}
          selectedFileName={selectedFileName}
          versionsPending={versionsPending}
        />
      ) : null}
    </section>
  );
}
