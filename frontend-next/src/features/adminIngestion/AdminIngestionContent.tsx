"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
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

  function renderDetailDrawer() {
    if (!overlay) {
      return null;
    }

    switch (overlay.entity) {
      case "manualForm":
        return (
          <AdminDetailDrawer
            open
            title={ingestionMessages.manualAuthoringTitle}
            description={ingestionMessages.manualAuthoringDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-manual-pane"
          >
            <ManualAuthoringCard {...manualView} />
          </AdminDetailDrawer>
        );
      case "repositoryForm":
        return (
          <AdminDetailDrawer
            open
            title={ingestionMessages.repositoryIntakeTitle}
            description={ingestionMessages.repositoryIntakeDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-repository-pane"
          >
            <RepositoryIntakeCard {...repositoryView} />
          </AdminDetailDrawer>
        );
      case "repositoryPolicy":
        return (
          <AdminDetailDrawer
            open
            title={ingestionMessages.schedulerPolicyTitle}
            description={ingestionMessages.schedulerPolicyDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-policy-pane"
          >
            <SchedulerPolicyCard {...repositoryView} />
          </AdminDetailDrawer>
        );
      case "archiveForm":
        return (
          <AdminDetailDrawer
            open
            title={ingestionMessages.archiveImportTitle}
            description={ingestionMessages.archiveImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-archive-pane"
          >
            <ArchiveImportCard {...importsView} />
          </AdminDetailDrawer>
        );
      case "skillmpForm":
        return (
          <AdminDetailDrawer
            open
            title={ingestionMessages.skillmpImportTitle}
            description={ingestionMessages.skillmpImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-skillmp-pane"
          >
            <SkillMPImportCard {...importsView} />
          </AdminDetailDrawer>
        );
      case "skillDetail": {
        const selectedSkill = manualView.selectedSkill || repositoryView.selectedSkill || importsView.selectedSkill;
        if (!selectedSkill) {
          return null;
        }
        return (
          <AdminDetailDrawer
            open
            title={selectedSkill.name || ingestionMessages.valueUnnamedSkill}
            description={selectedSkill.description || ingestionMessages.valueNoDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-skill-pane"
          >
            <IngestionSkillDetail item={selectedSkill} />
          </AdminDetailDrawer>
        );
      }
      case "syncRunDetail":
        return repositoryView.selectedSyncRun ? (
          <AdminDetailDrawer
            open
            title={ingestionMessages.recentSyncRunsTitle}
            description={ingestionMessages.recentSyncRunsDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
            dataTestId="admin-ingestion-sync-run-pane"
          >
            <IngestionSyncRunDetail run={repositoryView.selectedSyncRun} />
          </AdminDetailDrawer>
        ) : null;
      case "importJobDetail":
        return importsView.selectedJob ? (
          <AdminDetailDrawer
            open
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
          </AdminDetailDrawer>
        ) : null;
      default:
        return null;
    }
  }

  const detailDrawer = renderDetailDrawer();

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
      {route === "/admin/ingestion/manual" ? <ManualIngestionView {...manualView} detailDrawer={detailDrawer} /> : null}
      {route === "/admin/ingestion/repository" ? <RepositoryIngestionView {...repositoryView} detailDrawer={detailDrawer} /> : null}
      {route === "/admin/records/imports" ? <ImportsIngestionView {...importsView} detailDrawer={detailDrawer} /> : null}
    </AdminPageScaffold>
  );
}
