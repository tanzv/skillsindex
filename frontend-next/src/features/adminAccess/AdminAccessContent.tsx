"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { InlineWorkPaneSurface } from "@/src/components/shared/InlineWorkPaneSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type {
  AdminNormalizedCategoryCatalogItem,
  AdminNormalizedCategoryCatalogSubcategory
} from "@/src/lib/admin/adminAccountSettingsModel";

import type { AccessAccountItem, AccessOverview, AdminAccessGovernanceData } from "./model";
import {
  AccessDirectoryPanel,
  AccessPolicyForm,
  AccessPolicyTriggerPanel,
  AccessRoleSummaryPanel,
  AccessSnapshotPanel,
  SelectedAccessAccountSummary
} from "./AdminAccessPanels";

interface AdminAccessContentProps {
  loading: boolean;
  busyAction: string;
  error: string;
  message: string;
  keyword: string;
  data: AdminAccessGovernanceData;
  overview: AccessOverview;
  filteredAccounts: AccessAccountItem[];
  selectedAccount: AccessAccountItem | null;
  activePane: "idle" | "policy" | "account";
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    rankingDefaultSort: "stars" | "quality";
    rankingLimit: number;
    highlightLimit: number;
    categoryLeaderLimit: number;
    categoryCatalog: AdminNormalizedCategoryCatalogItem[];
    enabledProviders: string[];
  };
  onRefresh: () => void;
  onKeywordChange: (value: string) => void;
  onClearKeyword: () => void;
  onOpenPolicyPane: () => void;
  onOpenAccountPane: (accountId: number) => void;
  onClosePane: () => void;
  onToggleProvider: (provider: string) => void;
  onSettingsDraftChange: (
    patch: Partial<{
      allowRegistration: boolean;
      marketplacePublicAccess: boolean;
      rankingDefaultSort: "stars" | "quality";
      rankingLimit: number;
      highlightLimit: number;
      categoryLeaderLimit: number;
      categoryCatalog: AdminNormalizedCategoryCatalogItem[];
    }>
  ) => void;
  onAddCategory: () => void;
  onUpdateCategory: (categoryIndex: number, patch: Partial<AdminNormalizedCategoryCatalogItem>) => void;
  onRemoveCategory: (categoryIndex: number) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onAddSubcategory: (categoryIndex: number) => void;
  onUpdateSubcategory: (
    categoryIndex: number,
    subcategoryIndex: number,
    patch: Partial<AdminNormalizedCategoryCatalogSubcategory>
  ) => void;
  onRemoveSubcategory: (categoryIndex: number, subcategoryIndex: number) => void;
  onMoveSubcategory: (categoryIndex: number, subcategoryIndex: number, direction: -1 | 1) => void;
  onSavePolicy: () => void;
}

export function AdminAccessContent({
  loading,
  busyAction,
  error,
  message,
  keyword,
  data,
  overview,
  filteredAccounts,
  selectedAccount,
  activePane,
  settingsDraft,
  onRefresh,
  onKeywordChange,
  onClearKeyword,
  onOpenPolicyPane,
  onOpenAccountPane,
  onClosePane,
  onToggleProvider,
  onSettingsDraftChange,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onMoveCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onRemoveSubcategory,
  onMoveSubcategory,
  onSavePolicy
}: AdminAccessContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const accessMessages = messages.adminAccess;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={accessMessages.pageTitle}
      description={accessMessages.pageDescription}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      metrics={overview.metrics}
      error={error}
      message={message}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <AccessDirectoryPanel
            loading={loading}
            keyword={keyword}
            accounts={filteredAccounts}
            onKeywordChange={onKeywordChange}
            onClear={onClearKeyword}
            onOpenDetail={onOpenAccountPane}
          />
        </div>

        <div className="space-y-6">
          <AccessPolicyTriggerPanel loading={loading} busyAction={busyAction} onOpen={onOpenPolicyPane} />
          {activePane === "policy" ? (
            <InlineWorkPaneSurface
              title={accessMessages.policyTitle}
              description={accessMessages.policyDescription}
              closeLabel={accessMessages.closePanelAction}
              onClose={onClosePane}
              dataTestId="admin-access-policy-pane"
            >
              <AccessPolicyForm
                data={data}
                settingsDraft={settingsDraft}
                busyAction={busyAction}
                onToggleProvider={onToggleProvider}
                onSettingsDraftChange={onSettingsDraftChange}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onRemoveCategory={onRemoveCategory}
                onMoveCategory={onMoveCategory}
                onAddSubcategory={onAddSubcategory}
                onUpdateSubcategory={onUpdateSubcategory}
                onRemoveSubcategory={onRemoveSubcategory}
                onMoveSubcategory={onMoveSubcategory}
                onSave={onSavePolicy}
              />
            </InlineWorkPaneSurface>
          ) : null}
          {activePane === "account" && selectedAccount ? (
            <InlineWorkPaneSurface
              title={`${selectedAccount.username || accessMessages.valueUnknownUser} #${selectedAccount.id}`}
              description={accessMessages.selectedAccountDescription}
              closeLabel={accessMessages.closePanelAction}
              onClose={onClosePane}
              dataTestId="admin-access-account-pane"
            >
              <SelectedAccessAccountSummary account={selectedAccount} />
            </InlineWorkPaneSurface>
          ) : null}
          <AccessSnapshotPanel data={data} />
          <AccessRoleSummaryPanel overview={overview} />
        </div>
      </div>
    </AdminPageScaffold>
  );
}
