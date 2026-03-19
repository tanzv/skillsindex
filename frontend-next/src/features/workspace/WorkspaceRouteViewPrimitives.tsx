"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { cn } from "@/src/lib/utils";

import type { WorkspaceQueueEntry, WorkspaceSection } from "./types";

function resolveEntryTone(status: WorkspaceQueueEntry["status"]) {
  if (status === "risk") {
    return "default";
  }

  if (status === "running") {
    return "soft";
  }

  return "outline";
}

function resolveStatusLabel(status: WorkspaceQueueEntry["status"], messages: WorkspaceMessages) {
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
  messages
}: {
  entry: WorkspaceQueueEntry;
  active: boolean;
  onSelect: () => void;
  messages: WorkspaceMessages;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-[24px] border px-4 py-4 text-left transition-colors",
        active
          ? "border-zinc-900/20 bg-zinc-900/[0.04] shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
          : "border-zinc-900/10 bg-white hover:border-zinc-900/18 hover:bg-zinc-50"
      )}
      aria-pressed={active}
      data-testid={`workspace-entry-${entry.id}`}
    >
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
  );
}

export function QueueDetailPanel({
  entry,
  actions,
  locale,
  messages
}: {
  entry: WorkspaceQueueEntry | null;
  actions: WorkspaceSection["actions"];
  locale: PublicLocale;
  messages: WorkspaceMessages;
}) {
  if (!entry) {
    return (
      <SectionPanel
        title={messages.queueDetailEmptyTitle}
        description={messages.queueDetailEmptyDescription}
      >
        <div className="rounded-[24px] border border-dashed border-zinc-300 px-5 py-6 text-sm text-zinc-600">
          {messages.queueDetailEmptyPlaceholder}
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title={messages.queueDetailTitle}
      description={messages.queueDetailDescription}
      actions={
        <>
          <Button asChild>
            <Link href={`/skills/${entry.id}`}>{messages.actionOpenSkillDetail}</Link>
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
      <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={resolveEntryTone(entry.status)}>{resolveStatusLabel(entry.status, messages)}</Badge>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{entry.category}</span>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{entry.subcategory}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-zinc-900">{entry.name}</h3>
              <p className="max-w-3xl text-sm leading-6 text-zinc-600">{entry.summary}</p>
            </div>
          </div>
          <div className="grid min-w-[220px] gap-3 sm:grid-cols-2">
            {[
              { label: messages.queueDetailOwnerLabel, value: entry.owner },
              { label: messages.queueDetailQualityLabel, value: entry.qualityScore.toFixed(1) },
              { label: messages.queueDetailStarsLabel, value: String(entry.starCount) },
              {
                label: messages.queueDetailUpdatedLabel,
                value: new Date(entry.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")
              }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-zinc-100 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.length ? (
            entry.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">{messages.queueDetailUntagged}</Badge>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
