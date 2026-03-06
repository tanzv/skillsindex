import { Alert, Typography } from "antd";

import type { AppLocale } from "../lib/i18n";
import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  buildWorkspaceQueueInsightRows,
  buildWorkspaceRecentActivity,
  buildWorkspaceRiskWatchlist
} from "./WorkspaceCenterPageContent.helpers";
import {
  WorkspaceFocusedSection,
  WorkspaceOverviewSections,
  type WorkspaceSectionLayoutContext
} from "./WorkspaceCenterPageSectionLayouts";
import type { WorkspaceSectionPageKey } from "./WorkspaceCenterPage.navigation";
import { WorkspaceMainColumn, WorkspaceSectionAnchor } from "./WorkspaceCenterPage.styles";
import type { WorkspaceSnapshot } from "./WorkspaceCenterPage.types";
import WorkspaceSurfaceCard from "./WorkspaceSurfaceCard";

interface WorkspaceCenterPageContentProps {
  text: WorkspaceCenterCopy;
  locale: AppLocale;
  loading: boolean;
  error: string;
  degradedMessage: string;
  snapshot: WorkspaceSnapshot;
  activeSectionPage: WorkspaceSectionPageKey;
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
}

export default function WorkspaceCenterPageContent({
  text,
  locale,
  loading,
  error,
  degradedMessage,
  snapshot,
  activeSectionPage,
  onNavigate,
  toPublicPath,
  toAdminPath
}: WorkspaceCenterPageContentProps) {
  const context: WorkspaceSectionLayoutContext = {
    text,
    locale,
    snapshot,
    queueInsightRows: buildWorkspaceQueueInsightRows(snapshot, text),
    recentActivity: buildWorkspaceRecentActivity(snapshot.queueEntries),
    riskWatchlist: buildWorkspaceRiskWatchlist(snapshot.queueEntries),
    onNavigate,
    toPublicPath,
    toAdminPath
  };

  return (
    <WorkspaceMainColumn>
      {loading ? (
        <WorkspaceSectionAnchor id="workspace-overview">
          <WorkspaceSurfaceCard tone="panel">
            <Typography.Text style={{ color: "var(--si-color-text-secondary)", fontSize: "0.8rem" }}>{text.loading}</Typography.Text>
          </WorkspaceSurfaceCard>
        </WorkspaceSectionAnchor>
      ) : null}

      {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
      {!loading && degradedMessage ? <Alert type="warning" showIcon message={degradedMessage || text.degradedData} /> : null}

      {!loading && !error
        ? activeSectionPage === "overview"
          ? <WorkspaceOverviewSections context={context} />
          : <WorkspaceFocusedSection pageKey={activeSectionPage} context={context} />
        : null}
    </WorkspaceMainColumn>
  );
}
