"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";

import { resolveEntryTone, resolveStatusLabel, useSelectedEntry } from "./WorkspaceRouteViewPrimitives";
import type { WorkspaceAction, WorkspaceQueueEntry } from "./types";

export function useWorkspaceEntryDetailState(entries: WorkspaceQueueEntry[], preferredId?: number | null) {
  const { selectedEntry, selectedId, setSelectedId } = useSelectedEntry(entries, preferredId);
  const [detailOpen, setDetailOpen] = useState(false);

  function openDetail(entryId: number) {
    setSelectedId(entryId);
    setDetailOpen(true);
  }

  return {
    selectedEntry,
    selectedId,
    setSelectedId,
    detailOpen,
    setDetailOpen,
    openDetail
  };
}

function resolveActionVariant(variant?: WorkspaceAction["variant"]) {
  if (variant === "default") {
    return "default";
  }

  if (variant === "soft") {
    return "soft";
  }

  return "outline";
}

export function WorkspaceEntryDetailDrawer({
  open,
  entry,
  onClose,
  locale,
  messages,
  actions,
  description,
  children
}: {
  open: boolean;
  entry: WorkspaceQueueEntry | null;
  onClose: () => void;
  locale: PublicLocale;
  messages: WorkspaceMessages;
  actions?: WorkspaceAction[];
  description?: string;
  children?: ReactNode;
}) {
  return (
    <DetailFormSurface
      open={open && Boolean(entry)}
      variant="drawer"
      size="wide"
      title={entry?.name || messages.queueDetailTitle}
      description={description || messages.queueDetailDescription}
      closeLabel={messages.actionClosePanel}
      onClose={onClose}
    >
      {entry ? (
        <div className="space-y-5">
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

          {children}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/skills/${entry.id}`}>{messages.actionOpenSkillDetail}</Link>
            </Button>
            {actions?.map((action) => (
              <Button key={action.href} asChild variant={resolveActionVariant(action.variant)}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </DetailFormSurface>
  );
}
