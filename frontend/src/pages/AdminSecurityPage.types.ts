export type AdminSecurityRoute = "/admin/apikeys" | "/admin/access" | "/admin/moderation";

export interface AdminSecurityPageProps {
  route: AdminSecurityRoute;
}

export interface ApiKeyItem {
  id: number;
  ownerUsername: string;
  name: string;
  status: string;
  scopes: string[];
  expiresAt: string;
  lastUsedAt: string;
  updatedAt: string;
}

export interface AccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  forceLogoutAt: string;
}

export interface ModerationCaseItem {
  id: number;
  targetType: string;
  reasonCode: string;
  reasonDetail: string;
  status: string;
  action: string;
  createdAt: string;
  resolvedAt: string;
}

export interface ApiKeysViewData {
  items: ApiKeyItem[];
  total: number;
}

export interface AccessViewData {
  accounts: AccountItem[];
  accountsTotal: number;
  allowRegistration: boolean;
  enabledProviders: string[];
  availableProviders: string[];
}

export interface ModerationViewData {
  items: ModerationCaseItem[];
  total: number;
}

export type SecurityViewData = ApiKeysViewData | AccessViewData | ModerationViewData;

export interface RouteCopy {
  title: string;
  subtitle: string;
}

export interface MetricItem {
  label: string;
  value: number | string;
}
