import { AdminEmptyBlock, AdminMetaChipList, AdminSelectableRecordCard, AdminSectionCard } from "@/src/components/admin/AdminPrimitives";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { resolveAccountRoleLabel, resolveAccountStatusLabel, resolveAccountUsernameLabel } from "@/src/lib/accountDisplay";
import { adminAccountsRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import { type AdminAccountItem, type AdminAccountsRoute, buildAccountTableMeta, normalizeAccountStatus } from "./model";

function AccountIdentity({ account, compact = false }: { account: AdminAccountItem; compact?: boolean }) {
  const { messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  const titleClassName = compact
    ? "text-sm font-semibold text-[color:var(--ui-text-primary)]"
    : "text-base font-semibold text-[color:var(--ui-text-primary)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={titleClassName}>
        {resolveAccountUsernameLabel(account.username, accountMessages)} #{account.id}
      </span>
      <Badge variant={normalizeAccountStatus(account.status) === "active" ? "soft" : "outline"}>
        {resolveAccountStatusLabel(account.status, accountMessages)}
      </Badge>
      <Badge variant="outline">{resolveAccountRoleLabel(account.role, accountMessages)}</Badge>
    </div>
  );
}

interface AccountDirectoryCardProps {
  account: AdminAccountItem;
  selected: boolean;
  route: AdminAccountsRoute;
  busyAction: string;
  onSelectAccount: (accountId: number) => void;
  onForceSignout: (userId: number) => void;
}

export function AccountDirectoryCard({
  account,
  selected,
  route,
  busyAction,
  onSelectAccount,
  onForceSignout
}: AccountDirectoryCardProps) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;
  const canForceSignout = route === adminAccountsRoute;

  return (
    <AdminSelectableRecordCard selected={selected} data-testid={`admin-account-card-${account.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <AccountIdentity account={account} compact />
          <AdminMetaChipList
            items={buildAccountTableMeta(account, locale, {
              notAvailable: accountMessages.notAvailable,
              createdPrefix: accountMessages.createdPrefix,
              updatedPrefix: accountMessages.updatedPrefix,
              forceSignOutPrefix: accountMessages.forceSignOutPrefix,
              noPendingSignOut: accountMessages.noPendingSignOut
            })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={selected ? "soft" : "outline"} onClick={() => onSelectAccount(account.id)}>
            {selected ? accountMessages.selectedAction : accountMessages.selectAction}
          </Button>
          {canForceSignout ? (
            <Button size="sm" variant="outline" onClick={() => onForceSignout(account.id)} disabled={Boolean(busyAction)}>
              {busyAction === `force-signout-${account.id}` ? accountMessages.forceSignOutBusy : accountMessages.forceSignOutAction}
            </Button>
          ) : null}
        </div>
      </div>
    </AdminSelectableRecordCard>
  );
}

export function SelectedAccountSnapshot({ account }: { account: AdminAccountItem | null }) {
  const { locale, messages } = useProtectedI18n();
  const accountMessages = messages.adminAccounts;

  if (!account) {
    return (
      <AdminSectionCard title={accountMessages.selectedPanelTitle} description={accountMessages.selectedPanelDescription}>
          <AdminEmptyBlock>{accountMessages.selectedPanelEmpty}</AdminEmptyBlock>
      </AdminSectionCard>
    );
  }

  return (
    <AdminSectionCard
      title={accountMessages.selectedPanelTitle}
      description={accountMessages.selectedPanelDescription}
    >
        <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4">
          <AccountIdentity account={account} />
          <div className="mt-3">
            <AdminMetaChipList
              items={buildAccountTableMeta(account, locale, {
                notAvailable: accountMessages.notAvailable,
                createdPrefix: accountMessages.createdPrefix,
                updatedPrefix: accountMessages.updatedPrefix,
                forceSignOutPrefix: accountMessages.forceSignOutPrefix,
                noPendingSignOut: accountMessages.noPendingSignOut
              })}
              tone="control"
            />
          </div>
        </div>
    </AdminSectionCard>
  );
}
