"use client";

import type { ReactNode } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { ImportsIngestionViewProps, ManualIngestionViewProps, RepositoryIngestionViewProps } from "./AdminIngestionViewProps";
import { ImportJobsCard, ManualGuidanceCard, RecentSyncRunsCard } from "./AdminIngestionPanels";
import { IngestionTriggerCard, SkillInventoryList } from "./shared";

export function ManualIngestionView(props: ManualIngestionViewProps & { workPane?: ReactNode }) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <SkillInventoryList
        title={ingestionMessages.manualInventoryTitle}
        description={ingestionMessages.manualInventoryDescription}
        items={props.skills}
        emptyText={ingestionMessages.manualInventoryEmpty}
        actionLabel={ingestionMessages.openDetailAction}
        onOpenItem={props.onOpenSkillDetail}
      />
      <div className="space-y-6">
        <IngestionTriggerCard
          title={ingestionMessages.manualAuthoringTitle}
          description={ingestionMessages.manualAuthoringDescription}
          actionLabel={ingestionMessages.createManualAction}
          onAction={props.onOpenCreate}
        />
        {props.workPane}
        <ManualGuidanceCard />
      </div>
    </div>
  );
}

export function RepositoryIngestionView(props: RepositoryIngestionViewProps & { workPane?: ReactNode }) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <SkillInventoryList
        title={ingestionMessages.repositoryInventoryTitle}
        description={ingestionMessages.repositoryInventoryDescription}
        items={props.skills}
        emptyText={ingestionMessages.repositoryInventoryEmpty}
        actionLabel={ingestionMessages.openDetailAction}
        onOpenItem={props.onOpenSkillDetail}
      />
      <div className="space-y-6">
        <IngestionTriggerCard
          title={ingestionMessages.repositoryIntakeTitle}
          description={ingestionMessages.repositoryIntakeDescription}
          actionLabel={ingestionMessages.startRepositoryAction}
          onAction={props.onOpenRepositoryIntake}
        />
        <IngestionTriggerCard
          title={ingestionMessages.schedulerPolicyTitle}
          description={ingestionMessages.schedulerPolicyDescription}
          actionLabel={ingestionMessages.savePolicyAction}
          onAction={props.onOpenPolicy}
        />
        {props.workPane}
        <RecentSyncRunsCard syncRuns={props.syncRuns} onOpenDetail={props.onOpenSyncRunDetail} />
      </div>
    </div>
  );
}

export function ImportsIngestionView(props: ImportsIngestionViewProps & { workPane?: ReactNode }) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <IngestionTriggerCard
          title={ingestionMessages.archiveImportTitle}
          description={ingestionMessages.archiveImportDescription}
          actionLabel={ingestionMessages.importArchiveAction}
          onAction={props.onOpenArchiveImport}
        />
        <IngestionTriggerCard
          title={ingestionMessages.skillmpImportTitle}
          description={ingestionMessages.skillmpImportDescription}
          actionLabel={ingestionMessages.importSkillmpAction}
          onAction={props.onOpenSkillMPImport}
        />
      </div>
      {props.workPane}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SkillInventoryList
          title={ingestionMessages.importedInventoryTitle}
          description={ingestionMessages.importedInventoryDescription}
          items={props.skills}
          emptyText={ingestionMessages.importedInventoryEmpty}
          actionLabel={ingestionMessages.openDetailAction}
          onOpenItem={props.onOpenSkillDetail}
        />
        <ImportJobsCard jobs={props.jobs} busyAction={props.busyAction} onRunJobAction={props.onRunJobAction} onOpenDetail={props.onOpenJobDetail} />
      </div>
    </div>
  );
}
