"use client";

import {
  AdminEmptyBlock,
  AdminPageScaffold,
} from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  adminJobsRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute,
} from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  AdminCatalogRoute,
  AdminCatalogViewModel,
  RepositorySyncPolicy,
} from "./model";
import { QueryFilters } from "./AdminCatalogShared";
import { SkillsView } from "./AdminCatalogSkillsView";
import {
  JobsView,
  PolicyView,
  SyncRunsView,
} from "./AdminCatalogViews";
import styles from "./AdminCatalogSurface.module.scss";

interface AdminCatalogContentProps {
  route: AdminCatalogRoute;
  title: string;
  description: string;
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  query: Record<string, string>;
  viewModel: AdminCatalogViewModel;
  policyDraft: RepositorySyncPolicy;
  onQueryChange: (key: string, value: string) => void;
  onResetQuery: () => void;
  onRefresh: () => void;
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
  onRunJobAction: (jobId: number, action: "retry" | "cancel") => void;
  onPolicyDraftChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onResetPolicyDraft: () => void;
  onSavePolicy: () => void;
}

export function AdminCatalogContent({
  route,
  title,
  description,
  loading,
  busyAction,
  error,
  message,
  query,
  viewModel,
  policyDraft,
  onQueryChange,
  onResetQuery,
  onRefresh,
  onPageChange,
  onSyncSkill,
  onUpdateSkillVisibility,
  onDeleteSkill,
  onRollbackSkillVersion,
  onRestoreSkillVersion,
  onRunJobAction,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy,
}: AdminCatalogContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const catalogMessages = messages.adminCatalog;
  const rows = viewModel.table?.rows || [];
  const isSkillsRoute = route === adminSkillsRoute;
  const isJobsRoute = route === adminJobsRoute;
  const isSyncJobsRoute = route === adminSyncJobsRoute;
  const isSyncPolicyRoute = route === adminSyncPolicyRoute;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={title}
      description={description}
      actions={
        <Button onClick={onRefresh}>
          {loading ? commonMessages.refreshing : commonMessages.refresh}
        </Button>
      }
      metrics={isSyncPolicyRoute ? undefined : viewModel.metrics}
      error={error}
      message={message}
    >
      <QueryFilters
        route={route}
        loading={loading}
        query={query}
        onQueryChange={onQueryChange}
        onResetQuery={onResetQuery}
        onRefresh={onRefresh}
      />

      {loading ? (
        <Card className={styles.sectionCard}>
          <CardContent className={styles.loadingCardContent}>
            {catalogMessages.loadingData}
          </CardContent>
        </Card>
      ) : null}

      {!loading && !rows.length && !isSyncPolicyRoute ? (
        <AdminEmptyBlock>{catalogMessages.emptyRows}</AdminEmptyBlock>
      ) : null}

      {isSkillsRoute ? (
        <SkillsView
          rows={rows}
          loading={loading}
          busyAction={busyAction}
          pagination={viewModel.table?.pagination}
          sidePanels={viewModel.sidePanel}
          onPageChange={onPageChange}
          onSyncSkill={onSyncSkill}
          onUpdateSkillVisibility={onUpdateSkillVisibility}
          onDeleteSkill={onDeleteSkill}
          onRollbackSkillVersion={onRollbackSkillVersion}
          onRestoreSkillVersion={onRestoreSkillVersion}
        />
      ) : null}
      {isJobsRoute ? (
        <JobsView
          rows={rows}
          busyAction={busyAction}
          sidePanels={viewModel.sidePanel}
          onRunJobAction={onRunJobAction}
        />
      ) : null}
      {isSyncJobsRoute ? (
        <SyncRunsView rows={rows} sidePanels={viewModel.sidePanel} />
      ) : null}
      {isSyncPolicyRoute ? (
        <PolicyView
          busyAction={busyAction}
          sidePanels={viewModel.sidePanel}
          metrics={viewModel.metrics}
          policyDraft={policyDraft}
          onPolicyDraftChange={onPolicyDraftChange}
          onResetPolicyDraft={onResetPolicyDraft}
          onSavePolicy={onSavePolicy}
        />
      ) : null}
    </AdminPageScaffold>
  );
}
