"use client";

import { useMemo } from "react";

import {
  AdminPageLoadStateFrame,
  resolveAdminPageLoadState,
} from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAdminAccountsPageRouteMeta } from "@/src/lib/routing/adminRoutePageMeta";

import { AdminAccountsContent } from "./AdminAccountsContent";
import {
  type AdminAccountsRoute,
  resolveAdminAccountsDisplayRoute,
} from "./model";
import { useAdminAccountsController } from "./useAdminAccountsController";

export function AdminAccountsPage({ route }: { route: AdminAccountsRoute }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  const displayRoute = useMemo(() => resolveAdminAccountsDisplayRoute(route), [route]);
  const meta = useMemo(
    () => resolveAdminAccountsPageRouteMeta(displayRoute, accountMessages),
    [accountMessages, displayRoute],
  );
  const controller = useAdminAccountsController({
    route,
    accountMessages,
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
    <AdminAccountsContent
      route={route}
      loading={controller.loading}
      busyAction={controller.busyAction}
      error={controller.error}
      message={controller.message}
      searchQuery={controller.searchQuery}
      statusFilter={controller.statusFilter}
      metrics={controller.overview.metrics}
      accounts={controller.filteredAccounts}
      selectedAccount={controller.selectedAccount}
      registration={controller.registration}
      authProviders={controller.authProviders}
      roleSummary={controller.roleSummary}
      accountEditor={controller.accountEditor}
      roleEditor={controller.roleEditor}
      detailPaneOpen={controller.detailPaneOpen}
      createDrawer={controller.createDrawer}
      settingsDraft={controller.settingsDraft}
      onRefresh={controller.refresh}
      onSelectAccount={controller.openAccountDetail}
      onSearchQueryChange={controller.setSearchQuery}
      onStatusFilterChange={(value) => controller.setStatusFilter(value as "all" | "active" | "disabled")}
      onAccountEditorChange={controller.updateAccountEditor}
      onRoleEditorChange={controller.updateRoleEditor}
      onOpenProvisioningDrawer={controller.openProvisioningDrawer}
      onOpenRolePlaybookDrawer={controller.openRolePlaybookDrawer}
      onCloseDetailPane={controller.closeOverlay}
      onCloseCreateDrawer={controller.closeOverlay}
      onSettingsDraftChange={controller.patchSettingsDraft}
      onToggleProvider={controller.toggleProvider}
      onApplyAccountStatus={controller.applyAccountStatus}
      onForceSignout={controller.forceSignout}
      onResetPassword={controller.resetPassword}
      onApplyRole={controller.applyRole}
      onSaveSettings={controller.saveSettings}
    />
  );
}
