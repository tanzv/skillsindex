"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminConfirmModal } from "@/src/components/admin/AdminOverlaySurface";
import { AdminEmptyBlock } from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import {
  CatalogDetailPane,
  CatalogPaginationControls,
  RowSelectionButton,
  SidePanels,
  useSelectedRow,
} from "./AdminCatalogShared";
import {
  normalizeSkillVersionActionItems,
  resolveDirtySkillIdAfterSkillSync,
  resolveSkillVersionLoadState,
  SkillVersionActionsSection,
  type SkillVersionActionItem,
  shouldLoadSkillVersions,
  shouldPreserveSkillVersions,
} from "./AdminCatalogSkillVersions";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { adminRepositoryIntakeRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { buildSkillVersionsBFFEndpoint } from "@/src/lib/routing/protectedSurfaceEndpoints";

import type {
  AdminCatalogPagination,
  AdminCatalogRow,
  AdminCatalogViewModel,
} from "./model";
import styles from "./AdminCatalogSurface.module.scss";

interface SkillsViewProps {
  rows: AdminCatalogRow[];
  loading: boolean;
  busyAction: string;
  pagination?: AdminCatalogPagination | null;
  sidePanels: AdminCatalogViewModel["sidePanel"];
  onPageChange: (page: number) => void;
  onSyncSkill: (skillId: number) => void;
  onUpdateSkillVisibility: (
    skillId: number,
    visibility: "public" | "private",
  ) => Promise<void> | void;
  onDeleteSkill: (skillId: number) => Promise<void> | void;
  onRollbackSkillVersion: (
    skillId: number,
    versionId: number,
  ) => Promise<void> | void;
  onRestoreSkillVersion: (
    skillId: number,
    versionId: number,
  ) => Promise<void> | void;
}

export function SkillsView({
  rows,
  loading,
  busyAction,
  pagination,
  sidePanels,
  onPageChange,
  onSyncSkill,
  onUpdateSkillVisibility,
  onDeleteSkill,
  onRollbackSkillVersion,
  onRestoreSkillVersion,
}: SkillsViewProps) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const { selectedRow, selectedRowId, setSelectedRowId } = useSelectedRow(rows);
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [versions, setVersions] = useState<SkillVersionActionItem[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState("");
  const [loadedSkillId, setLoadedSkillId] = useState<number | null>(null);
  const [dirtySkillId, setDirtySkillId] = useState<number | null>(null);
  const detailDrawerOpen = detailPaneOpen && Boolean(selectedRow);

  const loadSkillVersions = useCallback(
    async (
      skillId: number,
      options: {
        preserveExisting?: boolean;
      } = {},
    ) => {
      const preserveExisting = options.preserveExisting ?? false;
      setVersionsLoading(true);
      setVersionsError("");
      if (!preserveExisting) {
        setVersions([]);
      }
      try {
        const payload = await clientFetchJSON(
          buildSkillVersionsBFFEndpoint(skillId, {
            limit: 6,
            includeArchived: true,
          }),
        );
        setVersions(normalizeSkillVersionActionItems(payload));
        const nextState = resolveSkillVersionLoadState({
          skillId,
          dirtySkillId,
        });
        setLoadedSkillId(nextState.loadedSkillId);
        setDirtySkillId(nextState.dirtySkillId);
      } catch (loadError) {
        setVersionsError(
          resolveRequestErrorDisplayMessage(
            loadError,
            adminCatalogMessages.versionsLoadError,
          ),
        );
      } finally {
        setVersionsLoading(false);
      }
    },
    [adminCatalogMessages.versionsLoadError, dirtySkillId],
  );

  useEffect(() => {
    if (!detailDrawerOpen || !selectedRow) {
      setVersionsError("");
      setVersionsLoading(false);
      return;
    }

    const selectedSkillId = selectedRow.id;
    if (
      !shouldLoadSkillVersions({
        detailDrawerOpen,
        selectedSkillId,
        loadedSkillId,
        dirtySkillId,
      })
    ) {
      return;
    }

    void loadSkillVersions(selectedSkillId, {
      preserveExisting: shouldPreserveSkillVersions(
        selectedSkillId,
        loadedSkillId,
      ),
    });
  }, [
    detailDrawerOpen,
    dirtySkillId,
    loadSkillVersions,
    loadedSkillId,
    selectedRow,
  ]);

  async function handleConfirmDelete() {
    if (!selectedRow) {
      return;
    }

    await Promise.resolve(onDeleteSkill(selectedRow.id));
    setDeleteConfirmOpen(false);
    setDetailPaneOpen(false);
  }

  async function handleRollbackVersion(versionId: number) {
    if (!selectedRow) {
      return;
    }

    await Promise.resolve(onRollbackSkillVersion(selectedRow.id, versionId));
    setDirtySkillId(selectedRow.id);
  }

  async function handleRestoreVersion(versionId: number) {
    if (!selectedRow) {
      return;
    }

    await Promise.resolve(onRestoreSkillVersion(selectedRow.id, versionId));
    setDirtySkillId(selectedRow.id);
  }

  async function handleSyncSkill(skillId: number) {
    await Promise.resolve(onSyncSkill(skillId));
    setDirtySkillId((current) =>
      resolveDirtySkillIdAfterSkillSync({
        selectedSkillId: selectedRowId,
        syncedSkillId: skillId,
        dirtySkillId: current,
      }),
    );
  }

  return (
    <div className={styles.splitLayout}>
      <div className={styles.column}>
        <Card className={styles.sectionCard}>
          <CardHeader className={styles.sectionHeader}>
            <CardTitle>{adminCatalogMessages.skillsInventoryTitle}</CardTitle>
            <CardDescription className={styles.sectionDescription}>
              {adminCatalogMessages.skillsInventoryDescription}
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
                {row.syncable ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleSyncSkill(row.id)}
                    disabled={Boolean(busyAction)}
                  >
                    {busyAction === `sync-skill-${row.id}`
                      ? adminCatalogMessages.syncingAction
                      : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
              </RowSelectionButton>
            ))}
            {!rows.length ? (
              <AdminEmptyBlock>
                {adminCatalogMessages.skillsEmpty}
              </AdminEmptyBlock>
            ) : null}
            <CatalogPaginationControls
              pagination={pagination}
              loading={loading || Boolean(busyAction)}
              onPageChange={onPageChange}
            />
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
                <Button
                  variant="outline"
                  onClick={() =>
                    onUpdateSkillVisibility(
                      selectedRow.id,
                      selectedRow.status.toLowerCase() === "public"
                        ? "private"
                        : "public",
                    )
                  }
                  disabled={Boolean(busyAction)}
                >
                  {busyAction === `visibility-skill-${selectedRow.id}`
                    ? adminCatalogMessages.updatingVisibilityAction
                    : selectedRow.status.toLowerCase() === "public"
                      ? adminCatalogMessages.makePrivateAction
                      : adminCatalogMessages.makePublicAction}
                </Button>
                {selectedRow.syncable ? (
                  <Button
                    variant="outline"
                    onClick={() => void handleSyncSkill(selectedRow.id)}
                    disabled={Boolean(busyAction)}
                  >
                    {busyAction === `sync-skill-${selectedRow.id}`
                      ? adminCatalogMessages.syncingAction
                      : adminCatalogMessages.syncNowAction}
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link href={`/skills/${selectedRow.id}/versions`}>
                    {adminCatalogMessages.openVersionHistoryAction}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/skills/${selectedRow.id}`}>
                    {adminCatalogMessages.openSkillDetailAction}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={adminRepositoryIntakeRoute}>
                    {adminCatalogMessages.openIntakeAction}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={Boolean(busyAction)}
                >
                  {busyAction === `delete-skill-${selectedRow.id}`
                    ? adminCatalogMessages.deletingSkillAction
                    : adminCatalogMessages.deleteSkillAction}
                </Button>
              </>
            ) : null
          }
        />
        {detailDrawerOpen && selectedRow ? (
          <SkillVersionActionsSection
            versions={versions}
            loading={versionsLoading}
            error={versionsError}
            busyAction={busyAction}
            onRollback={(versionId) => void handleRollbackVersion(versionId)}
            onRestore={(versionId) => void handleRestoreVersion(versionId)}
          />
        ) : null}
        <SidePanels panels={sidePanels} />
      </div>

      <AdminConfirmModal
        open={deleteConfirmOpen}
        title={adminCatalogMessages.deleteSkillConfirmTitle}
        description={adminCatalogMessages.deleteSkillConfirmDescription}
        closeLabel={adminCatalogMessages.closePanelAction}
        cancelLabel={adminCatalogMessages.cancelAction}
        confirmLabel={
          busyAction === `delete-skill-${selectedRow?.id || 0}`
            ? adminCatalogMessages.deletingSkillAction
            : adminCatalogMessages.deleteSkillAction
        }
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
        busy={busyAction === `delete-skill-${selectedRow?.id || 0}`}
      >
        {adminCatalogMessages.deleteSkillConfirmBody}
      </AdminConfirmModal>
    </div>
  );
}
