"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { DetailFormSurface } from "@/src/components/shared/DetailFormSurface";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

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
  policyDrawerOpen: boolean;
  accountDrawerOpen: boolean;
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    rankingDefaultSort: "stars" | "quality";
    rankingLimit: number;
    highlightLimit: number;
    categoryLeaderLimit: number;
    enabledProviders: string[];
  };
  onRefresh: () => void;
  onKeywordChange: (value: string) => void;
  onClearKeyword: () => void;
  onOpenPolicyDrawer: () => void;
  onClosePolicyDrawer: () => void;
  onOpenAccountDrawer: (accountId: number) => void;
  onCloseAccountDrawer: () => void;
  onToggleProvider: (provider: string) => void;
  onSettingsDraftChange: (
    patch: Partial<{
      allowRegistration: boolean;
      marketplacePublicAccess: boolean;
      rankingDefaultSort: "stars" | "quality";
      rankingLimit: number;
      highlightLimit: number;
      categoryLeaderLimit: number;
    }>
  ) => void;
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
  policyDrawerOpen,
  accountDrawerOpen,
  settingsDraft,
  onRefresh,
  onKeywordChange,
  onClearKeyword,
  onOpenPolicyDrawer,
  onClosePolicyDrawer,
  onOpenAccountDrawer,
  onCloseAccountDrawer,
  onToggleProvider,
  onSettingsDraftChange,
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
            onOpenDetail={onOpenAccountDrawer}
          />
        </div>

        <div className="space-y-6">
          <AccessPolicyTriggerPanel loading={loading} busyAction={busyAction} onOpen={onOpenPolicyDrawer} />
          <AccessSnapshotPanel data={data} />
          <AccessRoleSummaryPanel overview={overview} />
        </div>
      </div>

      <DetailFormSurface
        open={policyDrawerOpen}
        variant="drawer"
        size="default"
        title={accessMessages.policyTitle}
        description={accessMessages.policyDescription}
        closeLabel={accessMessages.closePanelAction}
        onClose={onClosePolicyDrawer}
      >
        <AccessPolicyForm
          data={data}
          settingsDraft={settingsDraft}
          busyAction={busyAction}
          onToggleProvider={onToggleProvider}
          onSettingsDraftChange={onSettingsDraftChange}
          onSave={onSavePolicy}
        />
      </DetailFormSurface>

      <DetailFormSurface
        open={accountDrawerOpen && Boolean(selectedAccount)}
        variant="drawer"
        size="default"
        title={
          selectedAccount
            ? `${selectedAccount.username || accessMessages.valueUnknownUser} #${selectedAccount.id}`
            : accessMessages.selectedAccountTitle
        }
        description={accessMessages.selectedAccountDescription}
        closeLabel={accessMessages.closePanelAction}
        onClose={onCloseAccountDrawer}
      >
        <SelectedAccessAccountSummary account={selectedAccount} />
      </DetailFormSurface>
    </AdminPageScaffold>
  );
}
