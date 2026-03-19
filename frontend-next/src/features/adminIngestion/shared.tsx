"use client";

import type { ReactNode } from "react";

import { AdminEmptyBlock, AdminMessageBanner, AdminMetricGrid } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import {
  formatAdminIngestionDate,
  type ImportsDraft,
  type ManualDraft,
  type RepositoryDraft,
  type SkillInventoryItem
} from "./model";
import {
  resolveIngestionDescription,
  resolveIngestionOwnerLabel,
  resolveIngestionSkillName,
  resolveIngestionSourceTypeLabel,
  resolveIngestionVisibilityLabel
} from "./display";

export const textareaClassName =
  "flex min-h-28 w-full rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 py-2 text-sm text-[color:var(--ui-control-text)] shadow-sm outline-none ring-offset-0 placeholder:text-[color:var(--ui-control-placeholder)] focus-visible:border-[color:var(--ui-control-border-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)]";

export function toneForStatus(status: string): "default" | "soft" | "outline" {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "default";
  }
  if (normalized.includes("run") || normalized.includes("pending") || normalized.includes("active")) {
    return "soft";
  }
  return "outline";
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">{label}</span>
      {children}
    </label>
  );
}

export function IngestionMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return <AdminMetricGrid metrics={metrics} />;
}

export function IngestionMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <AdminMessageBanner message={message} />;
}

export function SkillInventoryList({
  title,
  description,
  items,
  emptyText
}: {
  title: string;
  description?: string;
  items: SkillInventoryItem[];
  emptyText: string;
}) {
  const { locale, messages } = useProtectedI18n();
  const ingestionMessages = messages.adminIngestion;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline">{formatProtectedMessage(ingestionMessages.itemsCountTemplate, { count: items.length })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={`${title}-${item.id}`}
              className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                      {resolveIngestionSkillName(item.name, ingestionMessages)}
                    </span>
                    <Badge variant={item.visibility.toLowerCase() === "public" ? "soft" : "outline"}>
                      {resolveIngestionVisibilityLabel(item.visibility, ingestionMessages)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[color:var(--ui-text-secondary)]">
                    {resolveIngestionDescription(item.description, ingestionMessages)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {resolveIngestionSourceTypeLabel(item.sourceType, ingestionMessages)}
                    </span>
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {resolveIngestionOwnerLabel(item.ownerUsername, ingestionMessages)}
                    </span>
                    <span className="rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]">
                      {formatAdminIngestionDate(item.updatedAt, locale, ingestionMessages.valueNotAvailable)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <AdminEmptyBlock>{emptyText}</AdminEmptyBlock>
        )}
      </CardContent>
    </Card>
  );
}

export function buildManualPayload(draft: ManualDraft): Record<string, unknown> {
  return {
    name: draft.name,
    description: draft.description,
    content: draft.content,
    tags: draft.tags,
    visibility: draft.visibility,
    install_command: draft.install_command
  };
}

export function buildRepositoryPayload(draft: RepositoryDraft): Record<string, unknown> {
  return {
    repo_url: draft.repo_url,
    repo_branch: draft.repo_branch,
    repo_path: draft.repo_path,
    tags: draft.tags,
    visibility: draft.visibility,
    install_command: draft.install_command
  };
}

export function buildSkillMPPayload(draft: ImportsDraft): Record<string, unknown> {
  return {
    skillmp_url: draft.skillmp_url,
    skillmp_id: draft.skillmp_id,
    skillmp_token: draft.skillmp_token,
    tags: draft.skillmp_tags,
    visibility: draft.skillmp_visibility,
    install_command: draft.skillmp_install_command
  };
}
