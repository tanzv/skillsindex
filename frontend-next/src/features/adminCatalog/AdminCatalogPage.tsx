"use client";

import { useMemo } from "react";

import {
  AdminPageLoadStateFrame,
  resolveAdminPageLoadState,
} from "@/src/features/admin/adminPageLoadState";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAdminCatalogPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";
import { Button } from "@/src/components/ui/button";

import { AdminCatalogContent } from "./AdminCatalogContent";
import { type AdminCatalogRoute } from "./model";
import { useAdminCatalogController } from "./useAdminCatalogController";

export function AdminCatalogPage({
  route,
  initialQuery,
}: {
  route: AdminCatalogRoute;
  initialQuery?: Record<string, string>;
}) {
  const { locale, messages } = useProtectedI18n();
  const adminCatalogMessages = messages.adminCatalog;
  const meta = useMemo(
    () => resolveAdminCatalogPageRouteMeta(route, adminCatalogMessages),
    [adminCatalogMessages, route],
  );
  const controller = useAdminCatalogController({
    route,
    initialQuery,
    locale,
    messages: adminCatalogMessages,
  });

  const loadState = resolveAdminPageLoadState({
    loading: controller.loading,
    error: controller.error,
    hasData: controller.hasData,
  });

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={meta.title}
        description={meta.description}
        error={loadState === "error" ? controller.error : undefined}
        actions={
          <Button onClick={controller.refresh}>
            {controller.loading
              ? messages.adminCommon.refreshing
              : messages.adminCommon.refresh}
          </Button>
        }
      />
    );
  }

  return (
    <AdminCatalogContent
      route={route}
      title={meta.title}
      description={meta.description}
      loading={controller.loading}
      busyAction={controller.busyAction}
      error={controller.error}
      message={controller.message}
      query={controller.query}
      viewModel={controller.viewModel}
      policyDraft={controller.policyDraft}
      onQueryChange={controller.updateQuery}
      onResetQuery={controller.resetQuery}
      onRefresh={controller.refresh}
      onPageChange={controller.changePage}
      onSyncSkill={controller.syncSkill}
      onUpdateSkillVisibility={controller.updateSkillVisibility}
      onDeleteSkill={controller.deleteSkill}
      onRollbackSkillVersion={controller.rollbackSkillVersion}
      onRestoreSkillVersion={controller.restoreSkillVersion}
      onRunJobAction={controller.runJobAction}
      onPolicyDraftChange={controller.patchPolicyDraft}
      onResetPolicyDraft={controller.resetPolicyDraft}
      onSavePolicy={controller.savePolicy}
    />
  );
}
