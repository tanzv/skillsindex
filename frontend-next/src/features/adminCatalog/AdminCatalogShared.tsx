"use client";

import { type ReactNode, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminMetaChipList, AdminSelectableRecordCard } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import type { AdminCatalogRoute, AdminCatalogRow, AdminCatalogViewModel } from "./model";

export function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "default";
  }
  if (normalized.includes("running") || normalized.includes("active") || normalized.includes("success")) {
    return "soft";
  }
  return "outline";
}

export function useSelectedRow(rows: AdminCatalogRow[]) {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(rows[0]?.id ?? null);

  const selectedRow = useMemo(() => {
    if (rows.length === 0) {
      return null;
    }

    return rows.find((row) => row.id === selectedRowId) || rows[0] || null;
  }, [rows, selectedRowId]);

  return {
    selectedRow,
    selectedRowId: selectedRow?.id || null,
    setSelectedRowId
  };
}

interface QueryFiltersProps {
  route: AdminCatalogRoute;
  loading: boolean;
  query: Record<string, string>;
  onQueryChange: (key: string, value: string) => void;
  onResetQuery: () => void;
  onRefresh: () => void;
}

export function QueryFilters({
  route,
  loading,
  query,
  onQueryChange,
  onResetQuery,
  onRefresh
}: QueryFiltersProps) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  if (route !== "/admin/skills" && route !== "/admin/jobs") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{adminCatalogMessages.filtersTitle}</CardTitle>
        <CardDescription>{adminCatalogMessages.filtersDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Input
          aria-label={adminCatalogMessages.keywordLabel}
          value={query.q || ""}
          placeholder={adminCatalogMessages.keywordPlaceholder}
          onChange={(event) => onQueryChange("q", event.target.value)}
        />
        <Input
          aria-label={route === "/admin/skills" ? adminCatalogMessages.sourceLabel : adminCatalogMessages.statusLabel}
          value={route === "/admin/skills" ? query.source || "" : query.status || ""}
          placeholder={route === "/admin/skills" ? adminCatalogMessages.sourcePlaceholder : adminCatalogMessages.statusPlaceholder}
          onChange={(event) => onQueryChange(route === "/admin/skills" ? "source" : "status", event.target.value)}
        />
        <Input
          aria-label={route === "/admin/skills" ? adminCatalogMessages.visibilityLabel : adminCatalogMessages.jobTypeLabel}
          value={route === "/admin/skills" ? query.visibility || "" : query.job_type || ""}
          placeholder={route === "/admin/skills" ? adminCatalogMessages.visibilityPlaceholder : adminCatalogMessages.jobTypePlaceholder}
          onChange={(event) => onQueryChange(route === "/admin/skills" ? "visibility" : "job_type", event.target.value)}
        />
        <div className="flex flex-wrap gap-3 md:col-span-3">
          <Button onClick={onRefresh} disabled={loading}>
            {adminCatalogMessages.applyFiltersAction}
          </Button>
          <Button variant="outline" onClick={onResetQuery}>
            {adminCatalogMessages.resetFiltersAction}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface RowSelectionButtonProps {
  row: AdminCatalogRow;
  selected: boolean;
  buttonLabel: string;
  onSelect: () => void;
  children?: ReactNode;
}

export function RowSelectionButton({ row, selected, buttonLabel, onSelect, children }: RowSelectionButtonProps) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const statusLabel = row.statusLabel || row.status;

  return (
    <AdminSelectableRecordCard selected={selected} data-testid={`admin-catalog-row-${row.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{row.name}</div>
            <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
          </div>
          <div className="text-sm text-[color:var(--ui-text-secondary)]">{row.summary}</div>
          <AdminMetaChipList items={row.meta} />
          {row.detail ? (
            <div className="rounded-xl border border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] px-3 py-2 text-xs text-[color:var(--ui-danger-text)]">
              {row.detail}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={selected ? "soft" : "outline"} onClick={onSelect}>
            {selected ? adminCatalogMessages.selectedAction : buttonLabel}
          </Button>
          {children}
        </div>
      </div>
    </AdminSelectableRecordCard>
  );
}

interface DetailCardProps {
  title: string;
  description: string;
  row: AdminCatalogRow | null;
  emptyText: string;
  actions?: ReactNode;
}

export function DetailCard({ title, description, row, emptyText, actions }: DetailCardProps) {
  const statusLabel = row?.statusLabel || row?.status || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {row ? (
          <>
            <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-[color:var(--ui-text-primary)]">{row.name}</span>
                <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ui-text-secondary)]">{row.summary}</p>
              <AdminMetaChipList items={row.meta} tone="control" className="mt-3" />
              {row.detail ? (
                <div className="mt-3 rounded-xl border border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] px-3 py-2 text-xs text-[color:var(--ui-danger-text)]">
                  {row.detail}
                </div>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </>
        ) : (
          <AdminEmptyBlock>{emptyText}</AdminEmptyBlock>
        )}
      </CardContent>
    </Card>
  );
}

interface SidePanelsProps {
  panels: AdminCatalogViewModel["sidePanel"];
}

export function SidePanels({ panels }: SidePanelsProps) {
  return (
    <div className="space-y-6">
      {panels.map((panel) => (
        <Card key={panel.title}>
          <CardHeader>
            <CardTitle>{panel.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.items.map((item) => (
              <div
                key={`${panel.title}-${item.label}`}
                className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ui-text-muted)]">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
