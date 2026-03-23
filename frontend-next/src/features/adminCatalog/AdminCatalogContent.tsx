"use client";

import { AdminEmptyBlock, AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import type { AdminCatalogRoute, AdminCatalogViewModel, RepositorySyncPolicy } from "./model";
import { JobsView, PolicyView, QueryFilters, SkillsView, SyncRunsView } from "./AdminCatalogViews";
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
  onSyncSkill: (skillId: number) => void;
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
  onSyncSkill,
  onRunJobAction,
  onPolicyDraftChange,
  onResetPolicyDraft,
  onSavePolicy
}: AdminCatalogContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const catalogMessages = messages.adminCatalog;
  const rows = viewModel.table?.rows || [];

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={title}
      description={description}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      metrics={viewModel.metrics}
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
          <CardContent className={styles.loadingCardContent}>{catalogMessages.loadingData}</CardContent>
        </Card>
      ) : null}

      {!loading && !rows.length && route !== "/admin/sync-policy/repository" ? (
        <AdminEmptyBlock>{catalogMessages.emptyRows}</AdminEmptyBlock>
      ) : null}

      {route === "/admin/skills" ? (
        <SkillsView rows={rows} busyAction={busyAction} sidePanels={viewModel.sidePanel} onSyncSkill={onSyncSkill} />
      ) : null}
      {route === "/admin/jobs" ? (
        <JobsView rows={rows} busyAction={busyAction} sidePanels={viewModel.sidePanel} onRunJobAction={onRunJobAction} />
      ) : null}
      {route === "/admin/sync-jobs" ? <SyncRunsView rows={rows} sidePanels={viewModel.sidePanel} /> : null}
      {route === "/admin/sync-policy/repository" ? (
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
