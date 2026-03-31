"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";

import { resolveEntryTone, resolveStatusLabel, useSelectedEntry } from "./WorkspaceRouteViewPrimitives";
import styles from "./WorkspaceRouteSurface.module.scss";
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

export function WorkspaceEntryDetailPane({
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
  if (!open || !entry) {
    return null;
  }

  return (
    <DetailFormSurface
      open
      title={entry.name || messages.queueDetailTitle}
      description={description || messages.queueDetailDescription}
      closeLabel={messages.actionClosePanel}
      onClose={onClose}
      variant="drawer"
      dataTestId="workspace-entry-detail-pane"
      footer={
        <div className={styles.detailActionRow}>
          <Button asChild>
            <Link href={`/skills/${entry.id}`}>{messages.actionOpenSkillDetail}</Link>
          </Button>
          {actions?.map((action) => (
            <Button key={action.href} asChild variant={resolveActionVariant(action.variant)}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      }
    >
      <div className="space-y-5">
        <div className={styles.detailHero}>
          <div className={styles.detailHeroHeader}>
            <div className={styles.detailHeroCopy}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={resolveEntryTone(entry.status)}>{resolveStatusLabel(entry.status, messages)}</Badge>
                <span className={styles.detailEyebrow}>{entry.category}</span>
                <span className={styles.detailEyebrow}>{entry.subcategory}</span>
              </div>
              <div className={styles.detailHeroCopy}>
                <h3 className={styles.detailTitle}>{entry.name}</h3>
                <p className={styles.detailSummary}>{entry.summary}</p>
              </div>
            </div>
            <div className={styles.detailStatGrid}>
              {[
                { label: messages.queueDetailOwnerLabel, value: entry.owner },
                { label: messages.queueDetailQualityLabel, value: entry.qualityScore.toFixed(1) },
                { label: messages.queueDetailStarsLabel, value: String(entry.starCount) },
                {
                  label: messages.queueDetailUpdatedLabel,
                  value: new Date(entry.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")
                }
              ].map((item) => (
                <div key={item.label} className={styles.detailStatCard}>
                  <div className={styles.detailStatLabel}>{item.label}</div>
                  <div className={styles.detailStatValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.detailTagRow}>
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
      </div>
    </DetailFormSurface>
  );
}
