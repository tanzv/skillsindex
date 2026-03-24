import {
  AdminEmptyBlock,
  AdminFilterBar,
  AdminInsetBlock,
  AdminMetaChipList,
  AdminRecordCard,
  AdminSectionCard,
  AdminToggleField
} from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAccountRoleLabel, resolveAccountStatusLabel, resolveAccountUsernameLabel } from "@/src/lib/accountDisplay";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { AccessAccountItem, AccessOverview, AdminAccessGovernanceData } from "./model";
import { formatDateTime } from "../adminGovernance/shared";

export function AccessDirectoryPanel({
  loading,
  keyword,
  accounts,
  onKeywordChange,
  onClear,
  onOpenDetail
}: {
  loading: boolean;
  keyword: string;
  accounts: AccessAccountItem[];
  onKeywordChange: (value: string) => void;
  onClear: () => void;
  onOpenDetail: (accountId: number) => void;
}) {
  const { locale, messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const accessMessages = messages.adminAccess;

  return (
    <AdminSectionCard title={accessMessages.directoryTitle} description={accessMessages.directoryDescription}>
      <AdminFilterBar className="md:grid-cols-[1fr_auto]">
        <Input
          aria-label={accessMessages.searchLabel}
          value={keyword}
          placeholder={accessMessages.searchPlaceholder}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <Button variant="outline" onClick={onClear}>
          {commonMessages.clear}
        </Button>
      </AdminFilterBar>

      <div className="space-y-3">
        {accounts.map((account) => (
          <AdminRecordCard key={account.id} data-testid={`admin-access-account-${account.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">
                    {resolveAccountUsernameLabel(account.username, accessMessages)} #{account.id}
                  </span>
                  <Badge variant={account.status.toLowerCase() === "active" ? "soft" : "outline"}>
                    {resolveAccountStatusLabel(account.status, accessMessages)}
                  </Badge>
                  <Badge variant="outline">{resolveAccountRoleLabel(account.role, accessMessages)}</Badge>
                </div>
                <AdminMetaChipList
                  items={[
                    `${accessMessages.createdPrefix} ${formatDateTime(account.createdAt, locale, accessMessages.notAvailable)}`,
                    `${accessMessages.updatedPrefix} ${formatDateTime(account.updatedAt, locale, accessMessages.notAvailable)}`,
                    ...(account.forceLogoutAt
                      ? [
                          `${accessMessages.forceSignOutPrefix} ${formatDateTime(
                            account.forceLogoutAt,
                            locale,
                            accessMessages.notAvailable
                          )}`
                        ]
                      : [])
                  ]}
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpenDetail(account.id)}>
                {accessMessages.openAccountDetailAction}
              </Button>
            </div>
          </AdminRecordCard>
        ))}

        {!accounts.length && !loading ? <AdminEmptyBlock>{accessMessages.directoryEmpty}</AdminEmptyBlock> : null}
      </div>
    </AdminSectionCard>
  );
}

export function AccessPolicyTriggerPanel({
  loading,
  busyAction,
  onOpen
}: {
  loading: boolean;
  busyAction: string;
  onOpen: () => void;
}) {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;

  return (
    <AdminSectionCard title={accessMessages.policyTitle} description={accessMessages.policyDescription} contentClassName="space-y-3">
      <Button onClick={onOpen} disabled={Boolean(busyAction) || loading}>
        {accessMessages.openPolicyPanelAction}
      </Button>
    </AdminSectionCard>
  );
}

export function AccessPolicyForm({
  data,
  settingsDraft,
  busyAction,
  onToggleProvider,
  onSettingsDraftChange,
  onSave
}: {
  data: AdminAccessGovernanceData;
  settingsDraft: {
    allowRegistration: boolean;
    marketplacePublicAccess: boolean;
    rankingDefaultSort: "stars" | "quality";
    rankingLimit: number;
    highlightLimit: number;
    categoryLeaderLimit: number;
    enabledProviders: string[];
  };
  busyAction: string;
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
  onSave: () => void;
}) {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <AdminToggleField
          ariaLabel={accessMessages.allowRegistrationLabel}
          label={accessMessages.allowRegistrationLabel}
          checked={settingsDraft.allowRegistration}
          onChange={(checked) => onSettingsDraftChange({ allowRegistration: checked })}
        />
        <AdminToggleField
          ariaLabel={accessMessages.marketplacePublicAccessLabel}
          label={accessMessages.marketplacePublicAccessLabel}
          checked={settingsDraft.marketplacePublicAccess}
          onChange={(checked) => onSettingsDraftChange({ marketplacePublicAccess: checked })}
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{accessMessages.providersTitle}</div>
        {data.availableProviders.map((provider) => (
          <label
            key={provider}
            className="flex items-center gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-secondary)]"
          >
            <input
              aria-label={formatProtectedMessage(accessMessages.providerAriaLabel, { provider })}
              type="checkbox"
              checked={settingsDraft.enabledProviders.includes(provider)}
              onChange={() => onToggleProvider(provider)}
            />
            <span>{provider}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{accessMessages.marketplaceRankingTitle}</div>
          <p className="text-sm text-[color:var(--ui-text-secondary)]">{accessMessages.marketplaceRankingDescription}</p>
        </div>

        <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
          <span className="font-medium text-[color:var(--ui-text-primary)]">{accessMessages.rankingDefaultSortLabel}</span>
          <select
            aria-label={accessMessages.rankingDefaultSortLabel}
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-primary)]"
            value={settingsDraft.rankingDefaultSort}
            onChange={(event) =>
              onSettingsDraftChange({ rankingDefaultSort: event.target.value === "quality" ? "quality" : "stars" })
            }
          >
            <option value="stars">{accessMessages.rankingDefaultSortStars}</option>
            <option value="quality">{accessMessages.rankingDefaultSortQuality}</option>
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
            <span className="font-medium text-[color:var(--ui-text-primary)]">{accessMessages.rankingLimitLabel}</span>
            <Input
              aria-label={accessMessages.rankingLimitLabel}
              type="number"
              min={1}
              value={String(settingsDraft.rankingLimit)}
              onChange={(event) => onSettingsDraftChange({ rankingLimit: Number(event.target.value) || 1 })}
            />
          </label>
          <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
            <span className="font-medium text-[color:var(--ui-text-primary)]">{accessMessages.highlightLimitLabel}</span>
            <Input
              aria-label={accessMessages.highlightLimitLabel}
              type="number"
              min={1}
              value={String(settingsDraft.highlightLimit)}
              onChange={(event) => onSettingsDraftChange({ highlightLimit: Number(event.target.value) || 1 })}
            />
          </label>
          <label className="space-y-2 text-sm text-[color:var(--ui-text-secondary)]">
            <span className="font-medium text-[color:var(--ui-text-primary)]">{accessMessages.categoryLeaderLimitLabel}</span>
            <Input
              aria-label={accessMessages.categoryLeaderLimitLabel}
              type="number"
              min={1}
              value={String(settingsDraft.categoryLeaderLimit)}
              onChange={(event) => onSettingsDraftChange({ categoryLeaderLimit: Number(event.target.value) || 1 })}
            />
          </label>
        </div>
      </div>

      <AccessSnapshotPanel data={data} />

      <Button onClick={onSave} disabled={Boolean(busyAction)}>
        {busyAction === "save-settings" ? accessMessages.savingAction : accessMessages.saveAction}
      </Button>
    </div>
  );
}

export function AccessSnapshotPanel({
  data
}: {
  data: AdminAccessGovernanceData;
}) {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;

  return (
    <AdminSectionCard
      title={accessMessages.snapshotTitle}
      description={accessMessages.snapshotDescription}
      contentClassName="space-y-3"
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant={data.allowRegistration ? "soft" : "outline"}>
          {data.allowRegistration ? accessMessages.registrationEnabled : accessMessages.registrationDisabled}
        </Badge>
        <Badge variant={data.marketplacePublicAccess ? "soft" : "outline"}>
          {data.marketplacePublicAccess ? accessMessages.marketplacePublic : accessMessages.marketplacePrivate}
        </Badge>
        {data.enabledProviders.map((provider) => (
          <Badge key={provider} variant="outline">
            {provider}
          </Badge>
        ))}
      </div>
      <AdminInsetBlock>
        {accessMessages.availableProvidersLabel}
        <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
          {data.availableProviders.length ? data.availableProviders.join(", ") : accessMessages.notAvailable}
        </div>
      </AdminInsetBlock>
      <div className="grid gap-3 md:grid-cols-2">
        <AdminInsetBlock data-testid="admin-access-ranking-default-sort">
          {accessMessages.rankingDefaultSortLabel}
          <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
            {data.rankingDefaultSort === "quality" ? accessMessages.rankingDefaultSortQuality : accessMessages.rankingDefaultSortStars}
          </div>
        </AdminInsetBlock>
        <AdminInsetBlock data-testid="admin-access-ranking-limit">
          {accessMessages.rankingLimitLabel}
          <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{data.rankingLimit}</div>
        </AdminInsetBlock>
        <AdminInsetBlock data-testid="admin-access-highlight-limit">
          {accessMessages.highlightLimitLabel}
          <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{data.highlightLimit}</div>
        </AdminInsetBlock>
        <AdminInsetBlock data-testid="admin-access-category-leader-limit">
          {accessMessages.categoryLeaderLimitLabel}
          <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">{data.categoryLeaderLimit}</div>
        </AdminInsetBlock>
      </div>
    </AdminSectionCard>
  );
}

export function AccessRoleSummaryPanel({
  overview
}: {
  overview: AccessOverview;
}) {
  const { messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;

  return (
    <AdminSectionCard
      title={accessMessages.roleSummaryTitle}
      description={accessMessages.roleSummaryDescription}
      contentClassName="space-y-3"
    >
      {overview.roleSummary.map((item) => (
        <AdminInsetBlock key={item.role} className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ui-text-secondary)]">
            {resolveAccountRoleLabel(item.role, accessMessages)}
          </span>
          <span className="text-sm font-semibold text-[color:var(--ui-text-primary)]">{item.count}</span>
        </AdminInsetBlock>
      ))}
    </AdminSectionCard>
  );
}

export function SelectedAccessAccountSummary({
  account
}: {
  account: AccessAccountItem | null;
}) {
  const { locale, messages } = useProtectedI18n();
  const accessMessages = messages.adminAccess;

  return (
    <div className="space-y-3 text-sm text-[color:var(--ui-text-secondary)]">
      <AdminInsetBlock>
        <div className="font-semibold text-[color:var(--ui-text-primary)]">
          {account ? `${resolveAccountUsernameLabel(account.username, accessMessages)} #${account.id}` : accessMessages.noSelection}
        </div>
        <div className="mt-1">
          {accessMessages.accountStatusLabel}:{" "}
          {account ? resolveAccountStatusLabel(account.status, accessMessages) : accessMessages.notAvailable}
        </div>
        <div className="mt-1">
          {accessMessages.accountRoleLabel}:{" "}
          {account ? resolveAccountRoleLabel(account.role, accessMessages) : accessMessages.notAvailable}
        </div>
        <div className="mt-1">
          {accessMessages.updatedPrefix}:{" "}
          {account ? formatDateTime(account.updatedAt, locale, accessMessages.notAvailable) : accessMessages.notAvailable}
        </div>
      </AdminInsetBlock>
      {account?.forceLogoutAt ? (
        <AdminInsetBlock>
          {accessMessages.forceSignOutPrefix}
          <div className="mt-1 font-semibold text-[color:var(--ui-text-primary)]">
            {formatDateTime(account.forceLogoutAt, locale, accessMessages.notAvailable)}
          </div>
        </AdminInsetBlock>
      ) : null}
    </div>
  );
}
