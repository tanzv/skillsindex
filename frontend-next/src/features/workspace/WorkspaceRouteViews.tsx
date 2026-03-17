"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import { WorkspaceOverviewGrid, WorkspaceSectionCard } from "./WorkspaceRouteShared";
import type { WorkspacePageModel, WorkspaceQueueEntry, WorkspaceSection } from "./types";

function resolveEntryTone(status: WorkspaceQueueEntry["status"]) {
  if (status === "risk") {
    return "default";
  }

  if (status === "running") {
    return "soft";
  }

  return "outline";
}

function useSelectedEntry(entries: WorkspaceQueueEntry[], preferredId?: number | null) {
  const [selectedId, setSelectedId] = useState<number | null>(() => preferredId ?? entries[0]?.id ?? null);
  const resolvedSelectedId = useMemo(() => {
    if (entries.length === 0) {
      return null;
    }

    if (selectedId && entries.some((entry) => entry.id === selectedId)) {
      return selectedId;
    }

    if (preferredId && entries.some((entry) => entry.id === preferredId)) {
      return preferredId;
    }

    return entries[0].id;
  }, [entries, preferredId, selectedId]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === resolvedSelectedId) || entries[0] || null,
    [entries, resolvedSelectedId]
  );

  return {
    selectedEntry,
    selectedId: resolvedSelectedId,
    setSelectedId
  };
}

function SectionPanel({
  title,
  description,
  children,
  actions,
  dataTestId
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  dataTestId?: string;
}) {
  return (
    <section className="workspace-stage-panel workspace-section-card" data-testid={dataTestId}>
      <div className="workspace-section-header">
        <div className="workspace-section-title-block">
          <h2>{title}</h2>
          <p className="workspace-section-description">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      {actions ? <div className="workspace-stage-action-row">{actions}</div> : null}
    </section>
  );
}

function QueueListButton({
  entry,
  active,
  onSelect
}: {
  entry: WorkspaceQueueEntry;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-[24px] border px-4 py-4 text-left transition-colors",
        active
          ? "border-sky-300/55 bg-sky-400/10 shadow-[0_12px_28px_rgba(4,10,23,0.22)]"
          : "border-white/10 bg-slate-950/30 hover:border-sky-300/30 hover:bg-slate-950/45"
      )}
      aria-pressed={active}
      data-testid={`workspace-entry-${entry.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-50">{entry.name}</span>
            <Badge variant={resolveEntryTone(entry.status)}>{entry.status}</Badge>
          </div>
          <p className="text-sm leading-6 text-slate-300">{entry.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full bg-white/5 px-2.5 py-1">{entry.category}</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1">{entry.owner}</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1">{entry.qualityScore.toFixed(1)} quality</span>
          </div>
        </div>
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{entry.subcategory}</div>
      </div>
    </button>
  );
}

function QueueDetailPanel({
  entry,
  actions
}: {
  entry: WorkspaceQueueEntry | null;
  actions: WorkspaceSection["actions"];
}) {
  if (!entry) {
    return (
      <SectionPanel
        title="Execution Spotlight"
        description="No queue item is currently available. Load workspace data to populate the decision view."
      >
        <div className="rounded-[24px] border border-dashed border-white/15 px-5 py-6 text-sm text-slate-300">
          Queue detail becomes available once the workspace snapshot returns at least one tracked skill.
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Execution Spotlight"
      description="Focused detail for the selected queue item with direct hand-off into related admin surfaces."
      actions={
        <>
          <Button asChild>
            <Link href={`/skills/${entry.id}`}>Open Skill Detail</Link>
          </Button>
          {actions?.map((action) => (
            <Button key={action.href} asChild variant={action.variant === "default" ? "default" : action.variant === "soft" ? "soft" : "outline"}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </>
      }
      dataTestId="workspace-queue-detail"
    >
      <div className="rounded-[24px] border border-white/10 bg-slate-950/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={resolveEntryTone(entry.status)}>{entry.status}</Badge>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{entry.category}</span>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{entry.subcategory}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-50">{entry.name}</h3>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">{entry.summary}</p>
            </div>
          </div>
          <div className="grid min-w-[220px] gap-3 sm:grid-cols-2">
            {[
              { label: "Owner", value: entry.owner },
              { label: "Quality", value: entry.qualityScore.toFixed(1) },
              { label: "Stars", value: String(entry.starCount) },
              { label: "Updated", value: new Date(entry.updatedAt).toLocaleDateString("en-US") }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                <div className="mt-1 text-sm font-semibold text-slate-50">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.length ? entry.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>) : <Badge variant="outline">untagged</Badge>}
        </div>
      </div>
    </SectionPanel>
  );
}

function ActivityFeedView({ model }: { model: WorkspacePageModel }) {
  const activityEntries = model.snapshot.recentActivity;
  const ownerCoverageSection = model.primarySections.find((section) => section.title === "Owner Coverage");
  const { selectedEntry, setSelectedId } = useSelectedEntry(activityEntries, activityEntries[0]?.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <SectionPanel
          title="Activity Feed"
          description="Read the latest operator-facing movements first, then pivot to the selected activity detail."
          dataTestId="workspace-activity-feed"
        >
          <div className="flex flex-wrap gap-2">
            {model.snapshot.topTags.map((tag) => (
              <Badge key={tag.name} variant="outline">
                {tag.name} · {tag.count}
              </Badge>
            ))}
          </div>
          <div className="space-y-3">
            {activityEntries.map((entry) => (
              <QueueListButton key={entry.id} entry={entry} active={selectedEntry?.id === entry.id} onSelect={() => setSelectedId(entry.id)} />
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        <QueueDetailPanel entry={selectedEntry} actions={[{ label: "Open Queue", href: "/workspace/queue", variant: "default" }]} />
        {ownerCoverageSection ? <WorkspaceSectionCard section={ownerCoverageSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

function QueueExecutionView({ model }: { model: WorkspacePageModel }) {
  const detailSection = model.primarySections.find((section) => section.title === "Execution Spotlight");
  const insightsSection = model.primarySections.find((section) => section.title === "Queue Insights");
  const { selectedEntry, setSelectedId } = useSelectedEntry(model.snapshot.queueEntries, model.snapshot.spotlightEntry?.id);
  const supplementalActions = useMemo(
    () =>
      (detailSection?.actions || []).filter((action) => {
        if (!selectedEntry) {
          return true;
        }

        return action.href !== `/skills/${selectedEntry.id}`;
      }),
    [detailSection?.actions, selectedEntry]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <SectionPanel
          title="Queue Backlog"
          description="Treat this route as a live list-detail console: select a row, inspect the focused item, then jump to the next control surface."
          dataTestId="workspace-queue-backlog"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Running", value: model.snapshot.queueCounts.running },
              { label: "Pending", value: model.snapshot.queueCounts.pending },
              { label: "Risk", value: model.snapshot.queueCounts.risk }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-slate-50">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {model.snapshot.queueEntries.map((entry) => (
              <QueueListButton key={entry.id} entry={entry} active={selectedEntry?.id === entry.id} onSelect={() => setSelectedId(entry.id)} />
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        <QueueDetailPanel entry={selectedEntry} actions={supplementalActions} />
        {insightsSection ? <WorkspaceSectionCard section={insightsSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

function PolicyView({ model }: { model: WorkspacePageModel }) {
  const prioritiesSection = model.primarySections.find((section) => section.title === "Governance Priorities");
  const reviewPressureSection = model.primarySections.find((section) => section.title === "Review Pressure");
  const sourceEntries = model.snapshot.riskWatchlist.length ? model.snapshot.riskWatchlist : model.snapshot.queueEntries.slice(0, 4);
  const { selectedEntry, setSelectedId } = useSelectedEntry(sourceEntries, sourceEntries[0]?.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="space-y-6">
        <SectionPanel
          title="Policy Focus Queue"
          description="Keep governance review anchored to a concrete item, not only summary cards. Select the item that currently drives the highest attention."
        >
          <div className="space-y-3">
            {sourceEntries.map((entry) => (
              <QueueListButton key={entry.id} entry={entry} active={selectedEntry?.id === entry.id} onSelect={() => setSelectedId(entry.id)} />
            ))}
          </div>
        </SectionPanel>
        <QueueDetailPanel entry={selectedEntry} actions={[{ label: "Open Queue", href: "/workspace/queue", variant: "outline" }]} />
      </div>

      <div className="space-y-6">
        {prioritiesSection ? <WorkspaceSectionCard section={prioritiesSection} /> : null}
        {reviewPressureSection ? <WorkspaceSectionCard section={reviewPressureSection} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

function RunbookView({ model }: { model: WorkspacePageModel }) {
  const responseScriptSection = model.primarySections.find((section) => section.title === "Response Script");
  const targets = model.snapshot.queueEntries.slice(0, 5);
  const { selectedEntry, setSelectedId } = useSelectedEntry(targets, model.snapshot.runbookEntry?.id);

  const responseScript = useMemo(() => {
    if (!selectedEntry) {
      return responseScriptSection || null;
    }

    const baseSection: WorkspaceSection =
      responseScriptSection || {
        title: "Response Script",
        description: "Suggested command path for the selected route target.",
        variant: "code-emphasis",
        items: [],
        actions: [{ label: "Open Queue", href: "/workspace/queue", variant: "outline" }]
      };

    return {
      ...baseSection,
      items: [
        { label: "Focus Skill", value: selectedEntry.name, description: `${selectedEntry.category}/${selectedEntry.subcategory}` },
        { label: "Current Status", value: selectedEntry.status.toUpperCase(), description: "Selected route target inside the runbook deck." },
        { label: "Owner", value: selectedEntry.owner, description: "Operator or squad that should close the loop." }
      ],
      code: [
        `workspace queue --skill ${selectedEntry.id} --status ${selectedEntry.status}`,
        `workspace verify --skill ${selectedEntry.id} --quality ${selectedEntry.qualityScore.toFixed(1)}`,
        `workspace rollout --skill ${selectedEntry.id} --owner ${selectedEntry.owner}`,
        `workspace observe --skill ${selectedEntry.id} --channel ${selectedEntry.category.toLowerCase()}`
      ].join("\n")
    } satisfies WorkspaceSection;
  }, [responseScriptSection, selectedEntry]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <SectionPanel
          title="Runbook Targets"
          description="Choose the skill that needs a response script, then copy the commands and checklist from the right column."
        >
          <div className="space-y-3">
            {targets.map((entry) => (
              <QueueListButton key={entry.id} entry={entry} active={selectedEntry?.id === entry.id} onSelect={() => setSelectedId(entry.id)} />
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        {responseScript ? <WorkspaceSectionCard section={responseScript} /> : null}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

function ActionsView({ model }: { model: WorkspacePageModel }) {
  type GroupedAction = {
    href: string;
    label: string;
    variant?: "default" | "outline" | "soft" | "ghost";
    groupTitle?: string;
  };

  const actionGroups: Array<{ title: string; description: string; actions: GroupedAction[] }> = [
    {
      title: "Execution",
      description: "Move from workspace monitoring into the routes that unblock queue throughput.",
      actions: model.quickActions.filter((action) => action.href.startsWith("/workspace") || action.href.includes("sync"))
    },
    {
      title: "Connected Surfaces",
      description: "Open linked admin and account destinations without leaving the protected shell hierarchy.",
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
                  className="rounded-[24px] border border-white/10 bg-slate-950/30 px-4 py-4 transition-colors hover:border-sky-300/30 hover:bg-slate-950/45"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-50">{action.label}</span>
                      <Badge variant="outline">{action.groupTitle || group.title}</Badge>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{action.href}</p>
                  </div>
                </Link>
              ))}
            </div>
          </SectionPanel>
        ))}
      </div>

      <div className="space-y-6">
        {model.primarySections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
        {model.railSections.map((section) => (
          <WorkspaceSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

export function WorkspaceRouteContent({ model }: { model: WorkspacePageModel }) {
  if (model.route === "/workspace/activity") {
    return <ActivityFeedView model={model} />;
  }

  if (model.route === "/workspace/queue") {
    return <QueueExecutionView model={model} />;
  }

  if (model.route === "/workspace/policy") {
    return <PolicyView model={model} />;
  }

  if (model.route === "/workspace/runbook") {
    return <RunbookView model={model} />;
  }

  if (model.route === "/workspace/actions") {
    return <ActionsView model={model} />;
  }

  return <WorkspaceOverviewGrid model={model} />;
}
