"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { InlineWorkPaneSurface } from "@/src/components/shared/InlineWorkPaneSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { AdminIngestionRoute } from "@/src/lib/routing/adminRouteRegistry";

import {
  type ImportsIngestionViewProps,
  type ManualIngestionViewProps,
  type RepositoryIngestionViewProps,
  type AdminIngestionOverlayState
} from "./AdminIngestionViewProps";
import {
  ArchiveImportCard,
  ManualAuthoringCard,
  RepositoryIntakeCard,
  SchedulerPolicyCard,
  SkillMPImportCard
} from "./AdminIngestionFormCards";
import {
  ImportsIngestionView,
  ManualIngestionView,
  RepositoryIngestionView
} from "./AdminIngestionViews";
import {
  IngestionImportJobDetail,
  IngestionMessage,
  IngestionMetricGrid,
  IngestionSkillDetail,
  IngestionSyncRunDetail
} from "./shared";

interface AdminIngestionContentProps {
  route: AdminIngestionRoute;
  title: string;
  description: string;
  loading: boolean;
  error: string;
  message: string;
  metrics: Array<{ label: string; value: string }>;
  overlay: AdminIngestionOverlayState | null;
  onCloseOverlay: () => void;
  onRefresh: () => void;
  manualView: ManualIngestionViewProps;
  repositoryView: RepositoryIngestionViewProps;
  importsView: ImportsIngestionViewProps;
}

export function AdminIngestionContent({
  route,
  title,
  description,
  loading,
  error,
  message,
  metrics,
  overlay,
  onCloseOverlay,
  onRefresh,
  manualView,
  repositoryView,
  importsView
}: AdminIngestionContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const ingestionMessages = messages.adminIngestion;

  function renderWorkPane() {
    if (!overlay) {
      return null;
    }

    switch (overlay.entity) {
      case "manualForm":
        return (
          <InlineWorkPaneSurface
            title={ingestionMessages.manualAuthoringTitle}
            description={ingestionMessages.manualAuthoringDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-manual-pane"
          >
            <ManualAuthoringCard {...manualView} />
          </InlineWorkPaneSurface>
        );
      case "repositoryForm":
        return (
          <InlineWorkPaneSurface
            title={ingestionMessages.repositoryIntakeTitle}
            description={ingestionMessages.repositoryIntakeDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-repository-pane"
          >
            <RepositoryIntakeCard {...repositoryView} />
          </InlineWorkPaneSurface>
        );
      case "repositoryPolicy":
        return (
          <InlineWorkPaneSurface
            title={ingestionMessages.schedulerPolicyTitle}
            description={ingestionMessages.schedulerPolicyDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-policy-pane"
          >
            <SchedulerPolicyCard {...repositoryView} />
          </InlineWorkPaneSurface>
        );
      case "archiveForm":
        return (
          <InlineWorkPaneSurface
            title={ingestionMessages.archiveImportTitle}
            description={ingestionMessages.archiveImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-archive-pane"
          >
            <ArchiveImportCard {...importsView} />
          </InlineWorkPaneSurface>
        );
      case "skillmpForm":
        return (
          <InlineWorkPaneSurface
            title={ingestionMessages.skillmpImportTitle}
            description={ingestionMessages.skillmpImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-skillmp-pane"
          >
            <SkillMPImportCard {...importsView} />
          </InlineWorkPaneSurface>
        );
      case "skillDetail": {
        const selectedSkill = manualView.selectedSkill || repositoryView.selectedSkill || importsView.selectedSkill;
        if (!selectedSkill) {
          return null;
        }
        return (
          <InlineWorkPaneSurface
            title={selectedSkill.name || ingestionMessages.valueUnnamedSkill}
            description={selectedSkill.description || ingestionMessages.valueNoDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-skill-pane"
          >
            <IngestionSkillDetail item={selectedSkill} />
          </InlineWorkPaneSurface>
        );
      }
      case "syncRunDetail":
        return repositoryView.selectedSyncRun ? (
          <InlineWorkPaneSurface
            title={ingestionMessages.recentSyncRunsTitle}
            description={ingestionMessages.recentSyncRunsDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-sync-run-pane"
          >
            <IngestionSyncRunDetail run={repositoryView.selectedSyncRun} />
          </InlineWorkPaneSurface>
        ) : null;
      case "importJobDetail":
        return importsView.selectedJob ? (
          <InlineWorkPaneSurface
            title={ingestionMessages.importJobsTitle}
            description={ingestionMessages.importJobsDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-job-pane"
          >
            <IngestionImportJobDetail
              job={importsView.selectedJob}
              busyAction={importsView.busyAction}
              onRunJobAction={importsView.onRunJobAction}
            />
          </InlineWorkPaneSurface>
        ) : null;
      default:
        return null;
    }
  }

  const workPane = renderWorkPane();

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={title}
      description={description}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      error={error}
    >
      <IngestionMessage message={message} />
      <IngestionMetricGrid metrics={metrics} />
      {route === "/admin/ingestion/manual" ? <ManualIngestionView {...manualView} workPane={workPane} /> : null}
      {route === "/admin/ingestion/repository" ? <RepositoryIngestionView {...repositoryView} workPane={workPane} /> : null}
      {route === "/admin/records/imports" ? <ImportsIngestionView {...importsView} workPane={workPane} /> : null}
    </AdminPageScaffold>
  );
}
