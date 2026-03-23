"use client";

import { Badge } from "@/src/components/ui/badge";
import { workspaceQueueRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import { WorkspaceSectionCard } from "./WorkspaceRouteShared";
import { WorkspaceEntryDetailDrawer, useWorkspaceEntryDetailState } from "./WorkspaceRouteDetailSurface";
import { QueueListButton, SectionPanel } from "./WorkspaceRouteViewPrimitives";
import { formatWorkspaceMessage } from "./messages";
import styles from "./WorkspaceRouteSurface.module.scss";
import type { WorkspacePageModel } from "./types";

export function ActivityFeedView({ model }: { model: WorkspacePageModel }) {
  const workspaceMessages = model.messages;
  const activityEntries = model.snapshot.recentActivity;
  const ownerCoverageSection = model.primarySections.find((section) => section.id === "owner-coverage");
  const { selectedEntry, selectedId, setSelectedId, detailOpen, setDetailOpen, openDetail } = useWorkspaceEntryDetailState(
    activityEntries,
    activityEntries[0]?.id
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <SectionPanel
          title={workspaceMessages.sectionActivityFeedTitle}
          description={workspaceMessages.sectionActivityFeedDescription}
          dataTestId="workspace-activity-feed"
        >
          <div className="flex flex-wrap gap-2">
            {model.snapshot.topTags.map((tag) => (
              <Badge key={tag.name} variant="outline">
                {formatWorkspaceMessage(workspaceMessages.topTagBadgeTemplate, { tag: tag.name, count: tag.count })}
              </Badge>
            ))}
          </div>
          <div className="space-y-3">
            {activityEntries.map((entry) => (
              <QueueListButton
                key={entry.id}
                entry={entry}
                active={selectedId === entry.id}
                onSelect={() => setSelectedId(entry.id)}
                onOpenDetail={() => openDetail(entry.id)}
                messages={workspaceMessages}
              />
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        {ownerCoverageSection ? <WorkspaceSectionCard section={ownerCoverageSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>

      <WorkspaceEntryDetailDrawer
        open={detailOpen}
        entry={selectedEntry}
        locale={model.locale}
        messages={workspaceMessages}
        actions={[{ label: workspaceMessages.actionOpenQueue, href: workspaceQueueRoute, variant: "default" }]}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

export function QueueExecutionView({ model }: { model: WorkspacePageModel }) {
  const workspaceMessages = model.messages;
  const detailSection = model.primarySections.find((section) => section.id === "execution-spotlight");
  const insightsSection = model.primarySections.find((section) => section.id === "queue-insights");
  const { selectedEntry, selectedId, setSelectedId, detailOpen, setDetailOpen, openDetail } = useWorkspaceEntryDetailState(
    model.snapshot.queueEntries,
    model.snapshot.spotlightEntry?.id
  );
  const supplementalActions = (detailSection?.actions || []).filter((action) => {
    if (!selectedEntry) {
      return true;
    }

    return action.href !== `/skills/${selectedEntry.id}`;
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <SectionPanel
          title={workspaceMessages.panelQueueBacklogTitle}
          description={workspaceMessages.panelQueueBacklogDescription}
          dataTestId="workspace-queue-backlog"
        >
          <div className={styles.miniMetricGrid}>
            {[
              { label: workspaceMessages.queueCountRunningLabel, value: model.snapshot.queueCounts.running },
              { label: workspaceMessages.queueCountPendingLabel, value: model.snapshot.queueCounts.pending },
              { label: workspaceMessages.queueCountRiskLabel, value: model.snapshot.queueCounts.risk }
            ].map((item) => (
              <div key={item.label} className={styles.miniMetricCard}>
                <div className={styles.miniMetricLabel}>{item.label}</div>
                <div className={styles.miniMetricValue}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {model.snapshot.queueEntries.map((entry) => (
              <QueueListButton
                key={entry.id}
                entry={entry}
                active={selectedId === entry.id}
                onSelect={() => setSelectedId(entry.id)}
                onOpenDetail={() => openDetail(entry.id)}
                messages={workspaceMessages}
              />
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        {insightsSection ? <WorkspaceSectionCard section={insightsSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>

      <WorkspaceEntryDetailDrawer
        open={detailOpen}
        entry={selectedEntry}
        locale={model.locale}
        messages={workspaceMessages}
        actions={supplementalActions}
        description={detailSection?.description || workspaceMessages.queueDetailDescription}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
