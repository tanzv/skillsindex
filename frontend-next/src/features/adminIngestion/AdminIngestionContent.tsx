"use client";

import { AdminDetailDrawer } from "@/src/components/admin/AdminOverlaySurface";
import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
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

  function renderOverlay() {
    if (!overlay) {
      return null;
    }

    switch (overlay.entity) {
      case "manualForm":
        return (
          <AdminDetailDrawer
            open
            size="wide"
            title={ingestionMessages.manualAuthoringTitle}
            description={ingestionMessages.manualAuthoringDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
          >
            <ManualAuthoringCard {...manualView} />
          </AdminDetailDrawer>
        );
      case "repositoryForm":
        return (
          <AdminDetailDrawer
            open
            size="wide"
            title={ingestionMessages.repositoryIntakeTitle}
            description={ingestionMessages.repositoryIntakeDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
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
          >
            <SchedulerPolicyCard {...repositoryView} />
          </AdminDetailDrawer>
        );
      case "archiveForm":
        return (
          <AdminDetailDrawer
            open
            size="wide"
            title={ingestionMessages.archiveImportTitle}
            description={ingestionMessages.archiveImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
          >
            <ArchiveImportCard {...importsView} />
          </AdminDetailDrawer>
        );
      case "skillmpForm":
        return (
          <AdminDetailDrawer
            open
            size="wide"
            title={ingestionMessages.skillmpImportTitle}
            description={ingestionMessages.skillmpImportDescription}
            closeLabel={ingestionMessages.closePanelAction}
            onClose={onCloseOverlay}
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

  return (
    <>
      <AdminPageScaffold
        eyebrow={commonMessages.adminEyebrow}
        title={title}
        description={description}
        actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
        error={error}
      >
        <IngestionMessage message={message} />
        <IngestionMetricGrid metrics={metrics} />
        {route === "/admin/ingestion/manual" ? <ManualIngestionView {...manualView} /> : null}
        {route === "/admin/ingestion/repository" ? <RepositoryIngestionView {...repositoryView} /> : null}
        {route === "/admin/records/imports" ? <ImportsIngestionView {...importsView} /> : null}
      </AdminPageScaffold>
      {renderOverlay()}
    </>
  );
}
