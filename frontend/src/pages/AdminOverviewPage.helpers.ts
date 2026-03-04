export interface AdminOverviewPayload {
  user?: {
    id?: unknown;
    username?: unknown;
    role?: unknown;
  };
  counts?: {
    total?: unknown;
    public?: unknown;
    private?: unknown;
    syncable?: unknown;
    org_count?: unknown;
    account_count?: unknown;
  };
  capabilities?: {
    can_manage_users?: unknown;
    can_view_all?: unknown;
  };
}

export interface OverviewState {
  username: string;
  role: string;
  totalSkills: number;
  publicSkills: number;
  privateSkills: number;
  syncableSkills: number;
  organizationCount: number;
  accountCount: number;
  canManageUsers: boolean;
  canViewAllSkills: boolean;
}

export interface RouteAction {
  label: string;
  path: string;
}

export interface ModuleAction {
  title: string;
  subtitle: string;
  path: string;
}

export interface TrafficBar {
  label: string;
  value: number;
}

export interface RoleCard {
  label: string;
  value: number;
  risk: string;
}

export const fallbackErrorMessage = "Failed to load admin overview";

export const routeIndexEntries = [
  "/admin/import-center -> iKq35",
  "/admin/accounts -> 1AHaM",
  "/admin/roles -> QPMwn",
  "/admin/sso/providers -> EC25R",
  "/admin/sync/* -> Onzo0 / LCu0c"
] as const;

export const securityEntryRoutes = [
  "/admin/apikeys/scopes -> UDipb",
  "/admin/ops/* -> vzkFw",
  "/admin/release-gates -> MqiFK",
  "/admin/recovery/drills -> n9jqt"
] as const;

export const trafficBars: TrafficBar[] = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 56 },
  { label: "Wed", value: 64 },
  { label: "Thu", value: 50 },
  { label: "Fri", value: 70 }
];

export const roleCards: RoleCard[] = [
  { label: "Owner", value: 12, risk: "Stable" },
  { label: "Maintainer", value: 36, risk: "Watch" },
  { label: "Reader", value: 88, risk: "High" }
];

export function buildModuleActions(adminBase: string): ModuleAction[] {
  return [
    {
      title: "Import Center",
      subtitle: "records · dialog · validation",
      path: `${adminBase}/records/exports`
    },
    {
      title: "Account Center",
      subtitle: "account and credentials policy",
      path: `${adminBase}/accounts`
    },
    {
      title: "Role Permissions",
      subtitle: "role matrix and rollout",
      path: `${adminBase}/roles`
    },
    {
      title: "Integration Gateway",
      subtitle: "connector and webhook",
      path: `${adminBase}/integrations/list`
    },
    {
      title: "Incident Center",
      subtitle: "alert and response flow",
      path: `${adminBase}/incidents/list`
    },
    {
      title: "Sync Export",
      subtitle: "external sync and audit",
      path: `${adminBase}/records/exports`
    }
  ];
}

export function computeAdminOverviewScale(
  viewportWidth: number,
  viewportHeight: number,
  canvasWidth = 1440,
  canvasHeight = 900
): number {
  const safeWidth = Math.max(1, viewportWidth);
  const safeHeight = Math.max(1, viewportHeight);
  const widthScale = safeWidth / canvasWidth;
  const heightScale = safeHeight / canvasHeight;
  const scale = Math.min(widthScale, heightScale);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function parseString(value: unknown, fallback = ""): string {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

export function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
  return fallback;
}

export function normalizeOverview(payload: AdminOverviewPayload | null): OverviewState {
  const user = payload?.user || {};
  const counts = payload?.counts || {};
  const capabilities = payload?.capabilities || {};

  return {
    username: parseString(user.username, "-"),
    role: parseString(user.role, "viewer"),
    totalSkills: Math.max(parseNumber(counts.total), 0),
    publicSkills: Math.max(parseNumber(counts.public), 0),
    privateSkills: Math.max(parseNumber(counts.private), 0),
    syncableSkills: Math.max(parseNumber(counts.syncable), 0),
    organizationCount: Math.max(parseNumber(counts.org_count), 0),
    accountCount: Math.max(parseNumber(counts.account_count), 0),
    canManageUsers: parseBoolean(capabilities.can_manage_users),
    canViewAllSkills: parseBoolean(capabilities.can_view_all)
  };
}

export function ratioPart(value: number, total: number): number {
  if (total <= 0 || value <= 0) {
    return 0;
  }
  const raw = Math.round((value / total) * 100);
  return Math.max(0, Math.min(100, raw));
}
