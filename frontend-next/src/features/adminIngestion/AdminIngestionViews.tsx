"use client";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import {
  ArchiveImportCard,
  ManualAuthoringCard,
  RepositoryIntakeCard,
  SchedulerPolicyCard,
  SkillMPImportCard
} from "./AdminIngestionFormCards";
import { ImportJobsCard, ManualGuidanceCard, RecentSyncRunsCard } from "./AdminIngestionPanels";
import type {
  ImportsIngestionViewProps,
  ManualIngestionViewProps,
  RepositoryIngestionViewProps
} from "./AdminIngestionViewProps";
import { SkillInventoryList } from "./shared";

export function ManualIngestionView(props: ManualIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <ManualAuthoringCard {...props} />
      <div className="space-y-6">
        <SkillInventoryList
          title={ingestionMessages.manualInventoryTitle}
          description={ingestionMessages.manualInventoryDescription}
          items={props.skills}
          emptyText={ingestionMessages.manualInventoryEmpty}
        />
        <ManualGuidanceCard />
      </div>
    </div>
  );
}

export function RepositoryIngestionView(props: RepositoryIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <RepositoryIntakeCard {...props} />
        <SkillInventoryList
          title={ingestionMessages.repositoryInventoryTitle}
          description={ingestionMessages.repositoryInventoryDescription}
          items={props.skills}
          emptyText={ingestionMessages.repositoryInventoryEmpty}
        />
      </div>
      <div className="space-y-6">
        <SchedulerPolicyCard {...props} />
        <RecentSyncRunsCard syncRuns={props.syncRuns} />
      </div>
    </div>
  );
}

export function ImportsIngestionView(props: ImportsIngestionViewProps) {
  const { messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ArchiveImportCard {...props} />
        <SkillMPImportCard {...props} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SkillInventoryList
          title={ingestionMessages.importedInventoryTitle}
          description={ingestionMessages.importedInventoryDescription}
          items={props.skills}
          emptyText={ingestionMessages.importedInventoryEmpty}
        />
        <ImportJobsCard jobs={props.jobs} busyAction={props.busyAction} onRunJobAction={props.onRunJobAction} />
      </div>
    </div>
  );
}
