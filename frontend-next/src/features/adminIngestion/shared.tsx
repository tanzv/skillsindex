import type { ReactNode } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

import {
  formatAdminIngestionDate,
  type ImportsDraft,
  type ManualDraft,
  type RepositoryDraft,
  type SkillInventoryItem
} from "./model";

export const textareaClassName =
  "flex min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500";

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
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function IngestionMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="rounded-2xl">
          <CardHeader className="gap-2 p-5">
            <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
            <CardTitle className="text-base">{metric.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function IngestionMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div>;
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description || "Live inventory records returned by the admin catalog endpoint."}</CardDescription>
          </div>
          <Badge variant="outline">{items.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={`${title}-${item.id}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{item.name}</span>
                    <Badge variant={item.visibility.toLowerCase() === "public" ? "soft" : "outline"}>{item.visibility}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item.sourceType}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item.ownerUsername}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{formatAdminIngestionDate(item.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{emptyText}</div>
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
