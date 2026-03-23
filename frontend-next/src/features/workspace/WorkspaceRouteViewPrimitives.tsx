"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { cn } from "@/src/lib/utils";

import type { WorkspaceQueueEntry } from "./types";
import styles from "./WorkspaceRouteSurface.module.scss";

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
        styles.queueEntryCard,
        active ? styles.queueEntryCardActive : styles.queueEntryCardIdle
      )}
      data-testid={`workspace-entry-${entry.id}`}
    >
      <button type="button" onClick={onSelect} className={styles.queueEntryButton} aria-pressed={active}>
        <div className={styles.queueEntryBody}>
          <div className={styles.queueEntryHeader}>
            <div className={styles.queueEntryCopy}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={styles.queueEntryTitle}>{entry.name}</span>
                <Badge variant={resolveEntryTone(entry.status)}>{resolveStatusLabel(entry.status, messages)}</Badge>
              </div>
              <p className={styles.queueEntrySummary}>{entry.summary}</p>
              <div className={styles.inlineMetaRow}>
                <span className={styles.inlineMetaPill}>{entry.category}</span>
                <span className={styles.inlineMetaPill}>{entry.owner}</span>
                <span className={styles.inlineMetaPill}>
                  {entry.qualityScore.toFixed(1)} {messages.itemQualitySuffix}
                </span>
              </div>
            </div>
            <div className={styles.queueEntryEyebrow}>{entry.subcategory}</div>
          </div>
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
