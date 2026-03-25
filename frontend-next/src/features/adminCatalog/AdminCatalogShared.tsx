"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

import { AdminEmptyBlock, AdminMetaChipList, AdminSelectableRecordCard } from "@/src/components/admin/AdminPrimitives";
import { InlineWorkPaneSurface } from "@/src/components/shared/InlineWorkPaneSurface";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import type {
  AdminCatalogDetailSection,
  AdminCatalogDetailTopology,
  AdminCatalogRoute,
  AdminCatalogRow,
  AdminCatalogViewModel
} from "./model";
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

interface CatalogDetailPaneProps {
  open: boolean;
  row: AdminCatalogRow | null;
  description: string;
  closeLabel: string;
  onClose: () => void;
  actions?: ReactNode;
  dataTestId?: string;
}

export function CatalogDetailPane({
  open,
  row,
  description,
  closeLabel,
  onClose,
  actions,
  dataTestId = "admin-catalog-detail-pane"
}: CatalogDetailPaneProps) {
  if (!open || !row) {
    return null;
  }

  const statusLabel = row?.statusLabel || row?.status || "";

  return (
    <InlineWorkPaneSurface
      title={row.name}
      description={description}
      closeLabel={closeLabel}
      onClose={onClose}
      dataTestId={dataTestId}
      footer={actions ? <div className={styles.detailActions}>{actions}</div> : undefined}
    >
      <div className={styles.detailContent}>
        <div className={styles.detailSurface}>
          <div className={styles.detailHeader}>
            <span className={styles.detailTitle}>{row.name}</span>
            <Badge variant={statusTone(row.status)}>{statusLabel}</Badge>
          </div>
          <p className={styles.detailSummary}>{row.summary}</p>
          <AdminMetaChipList items={row.meta} tone="control" />
          {row.detail ? <div className={styles.rowDetail}>{row.detail}</div> : null}
          <DetailTopology topology={row.detailTopology} />
          <DetailSections sections={row.detailSections} />
        </div>
      </div>
    </InlineWorkPaneSurface>
  );
}

interface DetailCardProps {
  title: string;
  description: string;
  row: AdminCatalogRow | null;
  emptyText: string;
  actions?: ReactNode;
  testId?: string;
}

export function DetailCard({ title, description, row, emptyText, actions, testId }: DetailCardProps) {
  const statusLabel = row?.statusLabel || row?.status || "";

  return (
    <Card className={styles.sectionCard} data-testid={testId}>
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
              <DetailTopology topology={row.detailTopology} />
              <DetailSections sections={row.detailSections} />
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

function DetailTopology({ topology }: { topology?: AdminCatalogDetailTopology }) {
  if (!topology) {
    return null;
  }

  return (
    <section className={styles.topologyCard} data-testid="admin-skill-topology">
      <div className={styles.topologyTitle}>{topology.title}</div>
      <div className={styles.topologyRootWrap}>
        <div className={styles.topologyRootNode}>
          <span className={styles.topologyRootLabel}>{topology.rootLabel}</span>
          <span className={styles.topologyRootValue}>{topology.rootValue}</span>
          <span className={styles.topologyRootMeta}>
            {topology.rootMetaLabel}: {topology.rootMetaValue}
          </span>
        </div>
      </div>
      <div className={styles.topologyLaneGrid}>
        {topology.lanes.map((lane) => (
          <section key={lane.title} className={styles.topologyLane}>
            <div className={styles.topologyLaneTitle}>{lane.title}</div>
            <div className={styles.topologyLaneNodes}>
              {(lane.nodes.length ? lane.nodes : [{ value: lane.emptyValue }]).map((node, index) => (
                <div key={`${lane.title}-${node.label || node.value}-${index}`} className={styles.topologyNode}>
                  {node.label ? <span className={styles.topologyNodeLabel}>{node.label}</span> : null}
                  {node.href ? (
                    <Link href={node.href} className={styles.topologyNodeLink}>
                      {node.value}
                    </Link>
                  ) : (
                    <span className={styles.topologyNodeValue}>{node.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function DetailSections({ sections }: { sections?: AdminCatalogDetailSection[] }) {
  if (!sections?.length) {
    return null;
  }

  return (
    <div className={styles.detailSectionStack}>
      {sections.map((section) => (
        <section key={section.title} className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>{section.title}</div>
          <div className={styles.detailSectionList}>
            {section.items.map((item, index) => (
              <div key={`${section.title}-${item.label || item.value}-${index}`} className={styles.detailSectionItem}>
                {item.label ? <span className={styles.detailSectionLabel}>{item.label}</span> : null}
                {item.href ? (
                  <Link href={item.href} className={styles.detailSectionLink}>
                    {item.value}
                  </Link>
                ) : (
                  <span className={styles.detailSectionValue}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
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
