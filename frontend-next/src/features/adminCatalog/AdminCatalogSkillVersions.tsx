"use client";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import styles from "./AdminCatalogSkillVersions.module.scss";
import surfaceStyles from "./AdminCatalogSurface.module.scss";

export interface SkillVersionActionItem {
  id: number;
  versionNumber: number;
  trigger: string;
  changeSummary: string;
  capturedAt: string;
  actorDisplayName: string;
  archivedAt: string | null;
}

export interface SkillVersionRefreshState {
  detailDrawerOpen: boolean;
  selectedSkillId: number | null;
  loadedSkillId: number | null;
  dirtySkillId: number | null;
}

export function resolveSkillVersionLoadState({
  skillId,
  dirtySkillId,
}: {
  skillId: number;
  dirtySkillId: number | null;
}): {
  loadedSkillId: number;
  dirtySkillId: number | null;
} {
  return {
    loadedSkillId: skillId,
    dirtySkillId: dirtySkillId === skillId ? null : dirtySkillId,
  };
}

export function resolveDirtySkillIdAfterSkillSync({
  selectedSkillId,
  syncedSkillId,
  dirtySkillId,
}: {
  selectedSkillId: number | null;
  syncedSkillId: number;
  dirtySkillId: number | null;
}): number | null {
  if (selectedSkillId === syncedSkillId) {
    return syncedSkillId;
  }

  return dirtySkillId;
}

export function shouldLoadSkillVersions({
  detailDrawerOpen,
  selectedSkillId,
  loadedSkillId,
  dirtySkillId,
}: SkillVersionRefreshState): boolean {
  if (!detailDrawerOpen || selectedSkillId === null) {
    return false;
  }

  if (loadedSkillId !== selectedSkillId) {
    return true;
  }

  return dirtySkillId === selectedSkillId;
}

export function shouldPreserveSkillVersions(
  selectedSkillId: number | null,
  loadedSkillId: number | null,
): boolean {
  return selectedSkillId !== null && loadedSkillId === selectedSkillId;
}

function formatCapturedAt(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value.trim();
  }

  return new Date(parsed).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return String(value || "").trim();
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function normalizeSkillVersionActionItems(
  payload: unknown,
): SkillVersionActionItem[] {
  const record = asRecord(payload);
  const items = Array.isArray(record.items) ? record.items : [];

  return items.map((item) => {
    const entry = asRecord(item);

    return {
      id: asNumber(entry.id),
      versionNumber: asNumber(entry.version_number),
      trigger: asString(entry.trigger),
      changeSummary: asString(entry.change_summary),
      capturedAt: asString(entry.captured_at),
      actorDisplayName:
        asString(entry.actor_display_name) || asString(entry.actor_username),
      archivedAt: asString(entry.archived_at) || null,
    };
  });
}

export function SkillVersionActionsSection({
  versions,
  loading,
  error,
  busyAction,
  onRollback,
  onRestore,
}: {
  versions: SkillVersionActionItem[];
  loading: boolean;
  error: string;
  busyAction: string;
  onRollback: (versionId: number) => void;
  onRestore: (versionId: number) => void;
}) {
  const { messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;

  return (
    <Card className={surfaceStyles.sectionCard}>
      <CardHeader className={surfaceStyles.sectionHeaderCompact}>
        <CardTitle>{adminCatalogMessages.versionsSectionTitle}</CardTitle>
        <CardDescription className={surfaceStyles.sectionDescription}>
          {adminCatalogMessages.versionsSectionDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className={styles.versionSectionContent}>
        {loading ? (
          <div className={styles.versionSectionState}>
            {adminCatalogMessages.versionsLoading}
          </div>
        ) : null}
        {!loading && error ? (
          <div className={surfaceStyles.rowDetail}>
            {error || adminCatalogMessages.versionsLoadError}
          </div>
        ) : null}
        {!loading && !error && versions.length === 0 ? (
          <div className={styles.versionSectionState}>
            {adminCatalogMessages.versionsEmpty}
          </div>
        ) : null}
        {!loading && !error
          ? versions.map((version) => {
              const restoreBusy =
                busyAction === `restore-version-${version.id}`;
              const rollbackBusy =
                busyAction === `rollback-version-${version.id}`;
              const isArchived = Boolean(version.archivedAt);

              return (
                <div
                  key={version.id}
                  className={styles.versionCard}
                  data-testid={`skill-version-${version.id}`}
                >
                  <div className={styles.versionCardHeader}>
                    <div
                      className={styles.versionCardTitle}
                    >{`Version ${version.versionNumber}`}</div>
                    <div className={styles.versionCardMeta}>
                      {[
                        version.trigger,
                        formatCapturedAt(version.capturedAt),
                        version.actorDisplayName,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div className={styles.versionCardSummary}>
                    {version.changeSummary ||
                      adminCatalogMessages.versionsEmpty}
                  </div>
                  <div className={styles.versionCardActions}>
                    {isArchived ? (
                      <Button
                        variant="outline"
                        onClick={() => onRestore(version.id)}
                        disabled={Boolean(busyAction)}
                      >
                        {restoreBusy
                          ? adminCatalogMessages.restoringVersionAction
                          : adminCatalogMessages.restoreVersionAction}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => onRollback(version.id)}
                        disabled={Boolean(busyAction)}
                      >
                        {rollbackBusy
                          ? adminCatalogMessages.rollingBackVersionAction
                          : adminCatalogMessages.rollbackVersionAction}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          : null}
      </CardContent>
    </Card>
  );
}
