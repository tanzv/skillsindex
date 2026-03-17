export type AdminSecurityRoute = "/admin/apikeys" | "/admin/moderation";

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

export interface ModerationViewData {
  items: ModerationCaseItem[];
  total: number;
}

export type SecurityViewData = ApiKeysViewData | ModerationViewData;

export interface RouteCopy {
  title: string;
  subtitle: string;
}

export interface MetricItem {
  label: string;
  value: number | string;
}
