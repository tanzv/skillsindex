"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { AdminEmptyBlock } from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input as TextInput } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { adminSyncPolicyRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import {
  CatalogDetailPane,
  RowSelectionButton,
  SidePanels,
  useSelectedRow,
} from "./AdminCatalogShared";
import type {
  AdminCatalogRow,
  AdminCatalogViewModel,
  RepositorySyncPolicy,
} from "./model";
import policyStyles from "./AdminCatalogPolicy.module.scss";
import styles from "./AdminCatalogSurface.module.scss";

export function JobsView({
  rows,
  busyAction,
  sidePanels,
  onRunJobAction,
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
            <CardDescription className={styles.sectionDescription}>
              {adminCatalogMessages.jobsQueueDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.listCardContent}>
            {rows.map((row) => {
              const normalized = row.status.toLowerCase();
              const canRetry =
                normalized.includes("failed") ||
                normalized.includes("canceled");
              const canCancel =
                normalized.includes("running") ||
                normalized.includes("pending");

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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunJobAction(row.id, "retry")}
                      disabled={Boolean(busyAction)}
                    >
                      {busyAction === `retry-${row.id}`
                        ? adminCatalogMessages.retryingAction
                        : adminCatalogMessages.retryAction}
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunJobAction(row.id, "cancel")}
                      disabled={Boolean(busyAction)}
                    >
                      {busyAction === `cancel-${row.id}`
                        ? adminCatalogMessages.cancelingAction
                        : adminCatalogMessages.cancelAction}
                    </Button>
                  ) : null}
                </RowSelectionButton>
              );
            })}
            {!rows.length ? (
              <AdminEmptyBlock>
                {adminCatalogMessages.jobsEmpty}
              </AdminEmptyBlock>
            ) : null}
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
                    (!selectedRow.status.toLowerCase().includes("failed") &&
                      !selectedRow.status.toLowerCase().includes("canceled"))
                  }
                >
                  {adminCatalogMessages.retrySelectedAction}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRunJobAction(selectedRow.id, "cancel")}
                  disabled={
                    Boolean(busyAction) ||
                    (!selectedRow.status.toLowerCase().includes("running") &&
                      !selectedRow.status.toLowerCase().includes("pending"))
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
  sidePanels,
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
            <CardDescription className={styles.sectionDescription}>
              {adminCatalogMessages.syncRunsDescription}
            </CardDescription>
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
            {!rows.length ? (
              <AdminEmptyBlock>
                {adminCatalogMessages.syncRunsEmpty}
              </AdminEmptyBlock>
            ) : null}
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
                <Link href={adminSyncPolicyRoute}>
                  {adminCatalogMessages.openSyncPolicyAction}
                </Link>
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
  onSavePolicy,
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
  const policyGuidancePanels = sidePanels.filter((panel) => panel.items.length > 0);

  function renderPolicyField(
    label: string,
    help: string,
    input: ReactNode,
  ) {
    return (
      <label className={policyStyles.policyField}>
        <span className={policyStyles.policyFieldLabel}>{label}</span>
        <span className={policyStyles.policyFieldHelp}>{help}</span>
        {input}
      </label>
    );
  }

  return (
    <div
      className={policyStyles.policyPage}
      data-testid="admin-sync-policy-page"
    >
      <Card
        className={styles.sectionCard}
        data-testid="admin-sync-policy-current-posture"
      >
        <CardHeader className={styles.sectionHeaderCompact}>
          <CardTitle>{adminCatalogMessages.policyPostureTitle}</CardTitle>
          <CardDescription className={styles.sectionDescription}>
            {adminCatalogMessages.policyPostureDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className={policyStyles.policyStatusGrid}>
          {metrics.map((metric) => (
            <div key={metric.label} className={policyStyles.policyStatusItem}>
              <div className={policyStyles.policyStatusLabel}>{metric.label}</div>
              <div className={policyStyles.policyStatusValue}>{metric.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className={policyStyles.policyWorkbench}>
        <Card className={styles.sectionCard}>
          <div data-testid="admin-sync-policy-editor">
            <CardHeader className={styles.sectionHeader}>
              <CardTitle>{adminCatalogMessages.policyEditorTitle}</CardTitle>
              <CardDescription className={styles.sectionDescription}>
                {adminCatalogMessages.policyEditorDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className={policyStyles.policyEditorContent}>
              <div className={policyStyles.policyToggleCard}>
                <div className={policyStyles.policyToggleCopy}>
                  <span className={policyStyles.policyFieldLabel}>
                    {adminCatalogMessages.schedulerEnabledLabel}
                  </span>
                  <span className={policyStyles.policyFieldHelp}>
                    {adminCatalogMessages.schedulerEnabledHelp}
                  </span>
                </div>
                <Switch
                  aria-label={adminCatalogMessages.schedulerEnabledLabel}
                  checked={policyDraft.enabled}
                  onCheckedChange={(checked) =>
                    onPolicyDraftChange({ enabled: checked })
                  }
                />
              </div>
              <div className={policyStyles.policyFieldGrid}>
                {renderPolicyField(
                  adminCatalogMessages.intervalLabel,
                  adminCatalogMessages.intervalHelp,
                  <TextInput
                    value={policyDraft.interval}
                    aria-label={adminCatalogMessages.intervalLabel}
                    placeholder={adminCatalogMessages.intervalPlaceholder}
                    onChange={(event) =>
                      onPolicyDraftChange({ interval: event.target.value })
                    }
                  />,
                )}
                {renderPolicyField(
                  adminCatalogMessages.timeoutLabel,
                  adminCatalogMessages.timeoutHelp,
                  <TextInput
                    value={policyDraft.timeout}
                    aria-label={adminCatalogMessages.timeoutLabel}
                    placeholder={adminCatalogMessages.timeoutPlaceholder}
                    onChange={(event) =>
                      onPolicyDraftChange({ timeout: event.target.value })
                    }
                  />,
                )}
              </div>
              {renderPolicyField(
                adminCatalogMessages.batchSizeLabel,
                adminCatalogMessages.batchSizeHelp,
                <TextInput
                  type="number"
                  value={String(policyDraft.batchSize)}
                  aria-label={adminCatalogMessages.batchSizeLabel}
                  placeholder={adminCatalogMessages.batchSizePlaceholder}
                  onChange={(event) =>
                    onPolicyDraftChange({
                      batchSize: Number(event.target.value) || 0,
                    })
                  }
                />,
              )}
              <div className={policyStyles.policyActions}>
                <Button
                  onClick={onSavePolicy}
                  disabled={busyAction === "save-policy"}
                >
                  {busyAction === "save-policy"
                    ? adminCatalogMessages.savingPolicyAction
                    : adminCatalogMessages.savePolicyAction}
                </Button>
                <Button variant="outline" onClick={onResetPolicyDraft}>
                  {adminCatalogMessages.resetDraftAction}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card
          className={styles.sectionCard}
          data-testid="admin-sync-policy-guidance"
        >
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.policySaveImpactTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>
              {adminCatalogMessages.policySaveImpactDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className={policyStyles.policyGuidanceContent}>
            <div className={policyStyles.policyImpactNote}>
              {adminCatalogMessages.policySaveImpactBody}
            </div>
            {policyGuidancePanels.map((panel) => (
              <section
                key={panel.title}
                className={policyStyles.policyGuidanceSection}
              >
                <div className={policyStyles.policyGuidanceSectionTitle}>
                  {panel.title}
                </div>
                <div className={policyStyles.policyGuidanceList}>
                  {panel.items.map((item) => (
                    <div
                      key={`${panel.title}-${item.label}`}
                      className={policyStyles.policyGuidanceItem}
                    >
                      <div className={policyStyles.policyGuidanceItemLabel}>
                        {item.label}
                      </div>
                      <div className={policyStyles.policyGuidanceItemValue}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
