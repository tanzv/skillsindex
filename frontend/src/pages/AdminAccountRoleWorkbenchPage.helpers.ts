export type AccountStatusFilter = "all" | "active" | "disabled";

export interface AdminAccountListItem {
  id?: number;
  username: string;
  role: string;
  status: string;
  updated_at: string;
}

export interface RoleSummaryRow {
  role: string;
  count: number;
}

export function normalizeRoleName(roleValue: string): string {
  const roleName = String(roleValue || "member").trim().toLowerCase();
  return roleName || "member";
}

export function normalizeAccountStatus(statusValue: string): string {
  const normalizedStatus = String(statusValue || "").trim().toLowerCase();
  return normalizedStatus || "unknown";
}

export function sortAccountsByUpdatedAt<TAccount extends AdminAccountListItem>(accounts: TAccount[]): TAccount[] {
  return [...accounts].sort((left, right) => {
    const leftTimestamp = Date.parse(left.updated_at);
    const rightTimestamp = Date.parse(right.updated_at);
    const safeLeftTimestamp = Number.isNaN(leftTimestamp) ? 0 : leftTimestamp;
    const safeRightTimestamp = Number.isNaN(rightTimestamp) ? 0 : rightTimestamp;
    return safeRightTimestamp - safeLeftTimestamp;
  });
}

export function buildRoleSummary(accounts: AdminAccountListItem[]): RoleSummaryRow[] {
  const countByRole = new Map<string, number>();
  accounts.forEach((account) => {
    const roleName = normalizeRoleName(account.role);
    countByRole.set(roleName, (countByRole.get(roleName) || 0) + 1);
  });

  return Array.from(countByRole.entries())
    .map(([role, count]) => ({
      role,
      count
    }))
    .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role));
}

export function filterAccounts<TAccount extends AdminAccountListItem>(
  accounts: TAccount[],
  searchQuery: string,
  statusFilter: AccountStatusFilter
): TAccount[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return accounts.filter((account) => {
    const status = normalizeAccountStatus(account.status);
    const matchesStatus = statusFilter === "all" ? true : status === statusFilter;
    if (!matchesStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = `${account.username} ${normalizeRoleName(account.role)} ${status}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
}

export function resolveStatusPillClassName(statusValue: string): string {
  return normalizeAccountStatus(statusValue) === "active" ? "pill active" : "pill muted";
}

export interface AccountEditorPatch {
  username: string;
  role: string;
  status: string;
  updatedAtISO: string;
}

export interface AccountEditMutationRequest {
  path: string;
  payload: Record<string, string>;
}

export function buildAccountEditMutationRequests(input: {
  accountID: number;
  currentRole: string;
  currentStatus: string;
  nextRole: string;
  nextStatus: string;
}): AccountEditMutationRequest[] {
  const requests: AccountEditMutationRequest[] = [];
  const normalizedCurrentRole = normalizeRoleName(input.currentRole);
  const normalizedCurrentStatus = normalizeAccountStatus(input.currentStatus);
  const normalizedNextRole = normalizeRoleName(input.nextRole);
  const normalizedNextStatus = normalizeAccountStatus(input.nextStatus);

  if (normalizedCurrentRole !== normalizedNextRole) {
    requests.push({
      path: `/api/v1/admin/users/${input.accountID}/role`,
      payload: { role: normalizedNextRole }
    });
  }
  if (normalizedCurrentStatus !== normalizedNextStatus) {
    requests.push({
      path: `/api/v1/admin/accounts/${input.accountID}/status`,
      payload: { status: normalizedNextStatus }
    });
  }

  return requests;
}

export function applyAccountEdit<TAccount extends AdminAccountListItem>(
  accounts: TAccount[],
  targetAccountID: number,
  patch: AccountEditorPatch
): TAccount[] {
  return accounts.map((account) => {
    if (account.id !== targetAccountID) {
      return account;
    }
    return {
      ...account,
      username: patch.username,
      role: patch.role,
      status: patch.status,
      updated_at: patch.updatedAtISO
    };
  });
}
