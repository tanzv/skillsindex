"use client";

import type { ReactNode } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { ImportsIngestionViewProps, ManualIngestionViewProps, RepositoryIngestionViewProps } from "./AdminIngestionViewProps";
import { ImportJobsCard, ManualGuidanceCard, RecentSyncRunsCard, RepositoryPolicySummaryCard } from "./AdminIngestionPanels";
import { SkillInventoryList } from "./shared";

export function ManualIngestionView(props: ManualIngestionViewProps & { detailDrawer?: ReactNode }) {
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
        {props.detailDrawer}
        <ManualGuidanceCard />
      </div>
    </div>
  );
}

export function RepositoryIngestionView(props: RepositoryIngestionViewProps & { detailDrawer?: ReactNode }) {
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
        {props.detailDrawer}
        <RepositoryPolicySummaryCard policy={props.policy} onOpenPolicy={props.onOpenPolicy} />
        <RecentSyncRunsCard syncRuns={props.syncRuns} onOpenDetail={props.onOpenSyncRunDetail} />
      </div>
    </div>
  );
}

export function ImportsIngestionView(props: ImportsIngestionViewProps & { detailDrawer?: ReactNode }) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-6">
      {props.detailDrawer}
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
