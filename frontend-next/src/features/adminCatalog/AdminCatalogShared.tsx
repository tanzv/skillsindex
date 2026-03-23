"use client";

import { type ReactNode, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminMetaChipList, AdminSelectableRecordCard } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import type { AdminCatalogRoute, AdminCatalogRow, AdminCatalogViewModel } from "./model";
import styles from "./AdminCatalogSurface.module.scss";

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
    <Card className={styles.sectionCard}>
      <CardHeader className={styles.sectionHeader}>
        <CardTitle>{adminCatalogMessages.filtersTitle}</CardTitle>
        <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.filtersDescription}</CardDescription>
      </CardHeader>
      <CardContent className={styles.filtersContent}>
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
        <div className={styles.filterActions}>
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
    <AdminSelectableRecordCard
      selected={selected}
      className={selected ? `${styles.rowCard} ${styles.rowCardSelected}` : styles.rowCard}
      data-testid={`admin-catalog-row-${row.id}`}
    >
      <div className={styles.rowLayout}>
        <div className={styles.rowContent}>
          <div className={styles.rowHeader}>
            <div className={styles.rowTitle}>{row.name}</div>
            <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
          </div>
          <div className={styles.rowSummary}>{row.summary}</div>
          <AdminMetaChipList items={row.meta} />
          {row.detail ? <div className={styles.rowDetail}>{row.detail}</div> : null}
        </div>
        <div className={styles.rowActions}>
          <Button size="sm" variant={selected ? "soft" : "outline"} onClick={onSelect}>
            {selected ? adminCatalogMessages.selectedAction : buttonLabel}
          </Button>
          {children}
        </div>
      </div>
    </AdminSelectableRecordCard>
  );
}

interface CatalogDetailDrawerProps {
  open: boolean;
  row: AdminCatalogRow | null;
  description: string;
  closeLabel: string;
  onClose: () => void;
  actions?: ReactNode;
}

export function CatalogDetailDrawer({
  open,
  row,
  description,
  closeLabel,
  onClose,
  actions
}: CatalogDetailDrawerProps) {
  const statusLabel = row?.statusLabel || row?.status || "";

  return (
    <DetailFormSurface
      open={open && Boolean(row)}
      variant="drawer"
      size="default"
      title={row?.name || ""}
      description={description}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      {row ? (
        <div className={styles.detailContent}>
          <div className={styles.detailSurface}>
            <div className={styles.detailHeader}>
              <span className={styles.detailTitle}>{row.name}</span>
              <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
            </div>
            <p className={styles.detailSummary}>{row.summary}</p>
            <AdminMetaChipList items={row.meta} tone="control" />
            {row.detail ? <div className={styles.rowDetail}>{row.detail}</div> : null}
          </div>
          {actions ? <div className={styles.detailActions}>{actions}</div> : null}
        </div>
      ) : (
        <AdminEmptyBlock>{description}</AdminEmptyBlock>
      )}
    </DetailFormSurface>
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
    <Card className={styles.sectionCard}>
      <CardHeader className={styles.sectionHeader}>
        <CardTitle>{title}</CardTitle>
        <CardDescription className={styles.sectionDescription}>{description}</CardDescription>
      </CardHeader>
      <CardContent className={styles.detailContent}>
        {row ? (
          <>
            <div className={styles.detailSurface}>
              <div className={styles.detailHeader}>
                <span className={styles.detailTitle}>{row.name}</span>
                <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
              </div>
              <p className={styles.detailSummary}>{row.summary}</p>
              <AdminMetaChipList items={row.meta} tone="control" />
              {row.detail ? <div className={styles.rowDetail}>{row.detail}</div> : null}
            </div>
            {actions ? <div className={styles.detailActions}>{actions}</div> : null}
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
    <div className={styles.panelStack}>
      {panels.map((panel) => (
        <Card key={panel.title} className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeaderCompact}>
            <CardTitle>{panel.title}</CardTitle>
          </CardHeader>
          <CardContent className={styles.panelContent}>
            {panel.items.map((item) => (
              <div key={`${panel.title}-${item.label}`} className={styles.panelItem}>
                <div className={styles.panelItemLabel}>{item.label}</div>
                <div className={styles.panelItemValue}>{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
