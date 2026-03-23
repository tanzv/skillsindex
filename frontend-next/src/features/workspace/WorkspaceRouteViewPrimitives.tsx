"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { cn } from "@/src/lib/utils";

import type { WorkspaceQueueEntry } from "./types";

export function resolveEntryTone(status: WorkspaceQueueEntry["status"]) {
  if (status === "risk") {
    return "default";
  }

  if (status === "running") {
    return "soft";
  }

  return "outline";
}

export function resolveStatusLabel(status: WorkspaceQueueEntry["status"], messages: WorkspaceMessages) {
  switch (status) {
    case "running":
      return messages.statusRunning;
    case "risk":
      return messages.statusRisk;
    case "pending":
    default:
      return messages.statusPending;
  }
}

export function useSelectedEntry(entries: WorkspaceQueueEntry[], preferredId?: number | null) {
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

export function SectionPanel({
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

export function QueueListButton({
  entry,
  active,
  onSelect,
  onOpenDetail,
  messages
}: {
  entry: WorkspaceQueueEntry;
  active: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
  messages: WorkspaceMessages;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border px-4 py-4 transition-colors",
        active
          ? "border-zinc-900/20 bg-zinc-900/[0.04] shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
          : "border-zinc-900/10 bg-white hover:border-zinc-900/18 hover:bg-zinc-50"
      )}
      data-testid={`workspace-entry-${entry.id}`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left" aria-pressed={active}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900">{entry.name}</span>
              <Badge variant={resolveEntryTone(entry.status)}>{resolveStatusLabel(entry.status, messages)}</Badge>
            </div>
            <p className="text-sm leading-6 text-zinc-600">{entry.summary}</p>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">{entry.category}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">{entry.owner}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                {entry.qualityScore.toFixed(1)} {messages.itemQualitySuffix}
              </span>
            </div>
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{entry.subcategory}</div>
        </div>
      </button>
      <div className="mt-4 flex justify-end">
        <Button size="sm" variant="outline" onClick={onOpenDetail}>
          {messages.actionOpenDetails}
        </Button>
      </div>
    </div>
  );
}
