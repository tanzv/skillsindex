"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminEmptyBlock } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input as TextInput } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { adminRepositoryIntakeRoute, adminSyncPolicyRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import type { AdminCatalogRow, AdminCatalogViewModel, RepositorySyncPolicy } from "./model";
import { CatalogDetailPane, RowSelectionButton, SidePanels, useSelectedRow } from "./AdminCatalogShared";
import styles from "./AdminCatalogSurface.module.scss";

export { QueryFilters } from "./AdminCatalogShared";

export function SkillsView({
  rows,
  busyAction,
  sidePanels,
  onSyncSkill
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onSyncSkill: (skillId: number) => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const detailDrawerOpen = detailPaneOpen && Boolean(selectedRow);

  return (
    <div className={styles.splitLayout}>
      <div className={styles.column}>
        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.skillsInventoryTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.skillsInventoryDescription}</CardDescription>
          </CardHeader>
          <CardContent className={styles.listCardContent}>
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel={adminCatalogMessages.inspectAction}
                onSelect={() => setSelectedRowId(row.id)}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRowId(row.id);
                    setDetailPaneOpen(true);
                  }}
                >
                  {adminCatalogMessages.openDetailAction}
                </Button>
                {row.syncable ? (
                  <Button size="sm" variant="outline" onClick={() => onSyncSkill(row.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${row.id}` ? adminCatalogMessages.syncingAction : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
              </RowSelectionButton>
            ))}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.skillsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className={`${styles.column} ${styles.detailRail}`}>
        <CatalogDetailPane
          open={detailDrawerOpen}
          row={selectedRow}
          description={adminCatalogMessages.selectedSkillDescription}
          closeLabel={adminCatalogMessages.closePanelAction}
          onClose={() => setDetailPaneOpen(false)}
          dataTestId="admin-skills-detail-pane"
          actions={
            selectedRow ? (
              <>
                {selectedRow.syncable ? (
                  <Button variant="outline" onClick={() => onSyncSkill(selectedRow.id)} disabled={Boolean(busyAction)}>
                    {busyAction === `sync-skill-${selectedRow.id}` ? adminCatalogMessages.syncingAction : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href={`/skills/${selectedRow.id}`}>{adminCatalogMessages.openSkillDetailAction}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={adminRepositoryIntakeRoute}>{adminCatalogMessages.openIntakeAction}</Link>
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function JobsView({
  rows,
  busyAction,
  sidePanels,
  onRunJobAction
}: {
  rows: AdminCatalogRow[];
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const detailDrawerOpen = detailPaneOpen && Boolean(selectedRow);

  return (
    <div className={styles.splitLayout}>
      <div className={styles.column}>
        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.jobsQueueTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.jobsQueueDescription}</CardDescription>
          </CardHeader>
          <CardContent className={styles.listCardContent}>
            {rows.map((row) => {
              const normalized = row.status.toLowerCase();
              const canRetry = normalized.includes("failed") || normalized.includes("canceled");
              const canCancel = normalized.includes("running") || normalized.includes("pending");

              return (
                <RowSelectionButton
                  key={row.id}
                  row={row}
                  selected={selectedRowId === row.id}
                  buttonLabel={adminCatalogMessages.inspectAction}
                  onSelect={() => setSelectedRowId(row.id)}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRowId(row.id);
                      setDetailPaneOpen(true);
                    }}
                  >
                    {adminCatalogMessages.openDetailAction}
                  </Button>
                  {canRetry ? (
                    <Button size="sm" variant="outline" onClick={() => onRunJobAction(row.id, "retry")} disabled={Boolean(busyAction)}>
                      {busyAction === `retry-${row.id}` ? adminCatalogMessages.retryingAction : adminCatalogMessages.retryAction}
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button size="sm" variant="outline" onClick={() => onRunJobAction(row.id, "cancel")} disabled={Boolean(busyAction)}>
                      {busyAction === `cancel-${row.id}` ? adminCatalogMessages.cancelingAction : adminCatalogMessages.cancelAction}
                    </Button>
                  ) : null}
                </RowSelectionButton>
              );
            })}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.jobsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className={`${styles.column} ${styles.detailRail}`}>
        <CatalogDetailPane
          open={detailDrawerOpen}
          row={selectedRow}
          description={adminCatalogMessages.selectedJobDescription}
          closeLabel={adminCatalogMessages.closePanelAction}
          onClose={() => setDetailPaneOpen(false)}
          dataTestId="admin-jobs-detail-pane"
          actions={
            selectedRow ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "retry")}
                  disabled={
                    Boolean(busyAction) ||
                    (!selectedRow.status.toLowerCase().includes("failed") && !selectedRow.status.toLowerCase().includes("canceled"))
                  }
                >
                  {adminCatalogMessages.retrySelectedAction}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "cancel")}
                  disabled={
                    Boolean(busyAction) ||
                    (!selectedRow.status.toLowerCase().includes("running") && !selectedRow.status.toLowerCase().includes("pending"))
                  }
                >
                  {adminCatalogMessages.cancelSelectedAction}
                </Button>
              </>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function SyncRunsView({
  rows,
  sidePanels
}: {
  rows: AdminCatalogRow[];
  sidePanels: AdminCatalogViewModel["sidePanel"];
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const detailDrawerOpen = detailPaneOpen && Boolean(selectedRow);

  return (
    <div className={styles.compactSplitLayout}>
      <div className={styles.column}>
        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.syncRunsTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.syncRunsDescription}</CardDescription>
          </CardHeader>
          <CardContent className={styles.listCardContent}>
            {rows.map((row) => (
              <RowSelectionButton
                key={row.id}
                row={row}
                selected={selectedRowId === row.id}
                buttonLabel={adminCatalogMessages.inspectAction}
                onSelect={() => setSelectedRowId(row.id)}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRowId(row.id);
                    setDetailPaneOpen(true);
                  }}
                >
                  {adminCatalogMessages.openDetailAction}
                </Button>
              </RowSelectionButton>
            ))}
            {!rows.length ? <AdminEmptyBlock>{adminCatalogMessages.syncRunsEmpty}</AdminEmptyBlock> : null}
          </CardContent>
        </Card>
      </div>

      <div className={`${styles.column} ${styles.detailRail}`}>
        <CatalogDetailPane
          open={detailDrawerOpen}
          row={selectedRow}
          description={adminCatalogMessages.selectedSyncRunDescription}
          closeLabel={adminCatalogMessages.closePanelAction}
          onClose={() => setDetailPaneOpen(false)}
          dataTestId="admin-sync-runs-detail-pane"
          actions={
            selectedRow ? (
              <Button asChild variant="outline">
                <Link href={adminSyncPolicyRoute}>{adminCatalogMessages.openSyncPolicyAction}</Link>
              </Button>
            ) : null
          }
        />
        <SidePanels panels={sidePanels} />
      </div>
    </div>
  );
}

export function PolicyView({
  busyAction,
  sidePanels,
  metrics,
  policyDraft,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy
}: {
  busyAction: string;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  metrics: AdminCatalogViewModel["metrics"];
  policyDraft: RepositorySyncPolicy;
  onPolicyDraftChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onResetPolicyDraft: () => void;
  onSavePolicy: () => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  return (
    <div className={styles.compactSplitLayout}>
      <div className={styles.column}>
        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.policyEditorTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.policyEditorDescription}</CardDescription>
          </CardHeader>
          <CardContent className={styles.detailContent}>
            <label className={styles.policyToggle}>
              <Switch
                aria-label={adminCatalogMessages.schedulerEnabledLabel}
                checked={policyDraft.enabled}
                onCheckedChange={(checked) => onPolicyDraftChange({ enabled: checked })}
              />
              <span>{adminCatalogMessages.schedulerEnabledHelp}</span>
            </label>
            <TextInput
              value={policyDraft.interval}
              aria-label={adminCatalogMessages.intervalLabel}
              placeholder={adminCatalogMessages.intervalPlaceholder}
              onChange={(event) => onPolicyDraftChange({ interval: event.target.value })}
            />
            <TextInput
              value={policyDraft.timeout}
              aria-label={adminCatalogMessages.timeoutLabel}
              placeholder={adminCatalogMessages.timeoutPlaceholder}
              onChange={(event) => onPolicyDraftChange({ timeout: event.target.value })}
            />
            <TextInput
              type="number"
              value={String(policyDraft.batchSize)}
              aria-label={adminCatalogMessages.batchSizeLabel}
              placeholder={adminCatalogMessages.batchSizePlaceholder}
              onChange={(event) => onPolicyDraftChange({ batchSize: Number(event.target.value) || 0 })}
            />
            <div className={styles.policyActions}>
              <Button onClick={onSavePolicy} disabled={busyAction === "save-policy"}>
                {busyAction === "save-policy" ? adminCatalogMessages.savingPolicyAction : adminCatalogMessages.savePolicyAction}
              </Button>
              <Button variant="outline" onClick={onResetPolicyDraft}>
                {adminCatalogMessages.resetDraftAction}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeaderCompact}>
            <CardTitle>{adminCatalogMessages.policyPostureTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>{adminCatalogMessages.policyPostureDescription}</CardDescription>
          </CardHeader>
          <CardContent className={styles.policyMetricGrid}>
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.policyMetricItem}>
                <div className={styles.policyMetricLabel}>{metric.label}</div>
                <div className={styles.policyMetricValue}>{metric.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SidePanels panels={sidePanels} />
    </div>
  );
}
