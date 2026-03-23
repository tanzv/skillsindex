"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { Badge } from "@/src/components/ui/badge";
import {
  adminSyncJobsRoute,
  isWorkspaceSurfaceRoute,
  workspaceQueueRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import type { WorkspaceRoute } from "@/src/lib/routing/routes";

import { WorkspaceOverviewGrid, WorkspaceSectionCard } from "./WorkspaceRouteShared";
import { ActivityFeedView, QueueExecutionView } from "./WorkspaceRouteActivityViews";
import { WorkspaceEntryDetailDrawer, useWorkspaceEntryDetailState } from "./WorkspaceRouteDetailSurface";
import { QueueListButton, SectionPanel } from "./WorkspaceRouteViewPrimitives";
import { buildRunbookResponseScriptSection } from "./pageSectionShared";
import type { WorkspacePageModel } from "./types";

function PolicyView({ model }: { model: WorkspacePageModel }) {
  const workspaceMessages = model.messages;
  const prioritiesSection = model.primarySections.find((section) => section.id === "governance-priorities");
  const reviewPressureSection = model.primarySections.find((section) => section.id === "review-pressure");
  const sourceEntries = model.snapshot.riskWatchlist.length ? model.snapshot.riskWatchlist : model.snapshot.queueEntries.slice(0, 4);
  const { selectedEntry, selectedId, setSelectedId, detailOpen, setDetailOpen, openDetail } = useWorkspaceEntryDetailState(
    sourceEntries,
    sourceEntries[0]?.id
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="space-y-6">
        <SectionPanel
          title={workspaceMessages.panelPolicyFocusQueueTitle}
          description={workspaceMessages.panelPolicyFocusQueueDescription}
        >
          <div className="space-y-3">
            {sourceEntries.map((entry) => (
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
        {prioritiesSection ? <WorkspaceSectionCard section={prioritiesSection} /> : null}
        {reviewPressureSection ? <WorkspaceSectionCard section={reviewPressureSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>

      <WorkspaceEntryDetailDrawer
        open={detailOpen}
        entry={selectedEntry}
        locale={model.locale}
        messages={workspaceMessages}
        actions={[{ label: workspaceMessages.actionOpenQueue, href: workspaceQueueRoute, variant: "outline" }]}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

function RunbookView({ model }: { model: WorkspacePageModel }) {
  const workspaceMessages = model.messages;
  const targets = model.snapshot.queueEntries.slice(0, 5);
  const { selectedEntry, selectedId, setSelectedId, detailOpen, setDetailOpen, openDetail } = useWorkspaceEntryDetailState(
    targets,
    model.snapshot.runbookEntry?.id
  );
  const responseScript = buildRunbookResponseScriptSection(selectedEntry, workspaceMessages);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SectionPanel
          title={workspaceMessages.panelRunbookTargetsTitle}
          description={workspaceMessages.panelRunbookTargetsDescription}
        >
          <div className="space-y-3">
            {targets.map((entry) => (
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
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>

      <WorkspaceEntryDetailDrawer
        open={detailOpen}
        entry={selectedEntry}
        locale={model.locale}
        messages={workspaceMessages}
        actions={[{ label: workspaceMessages.actionOpenQueue, href: workspaceQueueRoute, variant: "outline" }]}
        description={workspaceMessages.sectionResponseScriptDescription}
        onClose={() => setDetailOpen(false)}
      >
        {responseScript ? <WorkspaceSectionCard section={responseScript} /> : null}
      </WorkspaceEntryDetailDrawer>
    </div>
  );
}

function ActionsView({ model }: { model: WorkspacePageModel }) {
  const workspaceMessages = model.messages;
  type GroupedAction = {
    href: string;
    label: string;
    variant?: "default" | "outline" | "soft" | "ghost";
    groupTitle?: string;
  };

  const actionGroups: Array<{ title: string; description: string; actions: GroupedAction[] }> = [
    {
      title: workspaceMessages.panelActionGroupExecutionTitle,
      description: workspaceMessages.panelActionGroupExecutionDescription,
      actions: model.quickActions.filter((action) => isWorkspaceSurfaceRoute(action.href) || action.href === adminSyncJobsRoute)
    },
    {
      title: workspaceMessages.panelActionGroupConnectedSurfacesTitle,
      description: workspaceMessages.panelActionGroupConnectedSurfacesDescription,
      actions: [
        ...model.primarySections.flatMap((section) =>
          section.actions?.map((action) => ({
            ...action,
            groupTitle: section.title
          })) || []
        ),
        ...model.railSections.flatMap((section) =>
          section.actions?.map((action) => ({
            ...action,
            groupTitle: section.title
          })) || []
        )
      ]
    }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        {actionGroups.map((group) => (
          <SectionPanel key={group.title} title={group.title} description={group.description}>
            <div className="grid gap-3 md:grid-cols-2">
              {group.actions.map((action) => (
                <Link
                  key={`${group.title}-${action.href}`}
                  href={action.href}
                  className="rounded-[24px] border border-zinc-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-zinc-900">{action.label}</span>
                      <Badge variant="outline">{action.groupTitle || group.title}</Badge>
                    </div>
                    <p className="text-sm leading-6 text-zinc-600">{action.href}</p>
                  </div>
                </Link>
              ))}
            </div>
          </SectionPanel>
        ))}
      </div>

      <div className="space-y-6">
        {model.primarySections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

type WorkspaceRouteViewRenderer = (props: { model: WorkspacePageModel }) => ReactElement;

const workspaceRouteViewRenderers: Partial<Record<WorkspaceRoute, WorkspaceRouteViewRenderer>> = {
  "/workspace/activity": ActivityFeedView,
  "/workspace/queue": QueueExecutionView,
  "/workspace/policy": PolicyView,
  "/workspace/runbook": RunbookView,
  "/workspace/actions": ActionsView
};

export function WorkspaceRouteContent({ model }: { model: WorkspacePageModel }) {
  const renderRouteView = workspaceRouteViewRenderers[model.route];

  return renderRouteView ? renderRouteView({ model }) : <WorkspaceOverviewGrid model={model} />;
}
