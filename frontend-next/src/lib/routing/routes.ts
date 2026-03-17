export const publicRoutes = [
  "/",
  "/search",
  "/results",
  "/categories",
  "/compare",
  "/rankings",
  "/rollout",
  "/timeline",
  "/governance",
  "/docs",
  "/about",
  "/login"
] as const;

export const workspaceRoutes = [
  "/workspace",
  "/workspace/activity",
  "/workspace/queue",
  "/workspace/policy",
  "/workspace/runbook",
  "/workspace/actions"
] as const;

export const accountRoutes = ["/account/profile", "/account/security", "/account/sessions", "/account/api-credentials"] as const;

export const adminRoutes = [
  "/admin/overview",
  "/admin/ingestion/manual",
  "/admin/ingestion/repository",
  "/admin/records/imports",
  "/admin/skills",
  "/admin/jobs",
  "/admin/sync-jobs",
  "/admin/sync-policy/repository",
  "/admin/integrations",
  "/admin/ops/metrics",
  "/admin/ops/alerts",
  "/admin/ops/audit-export",
  "/admin/ops/release-gates",
  "/admin/ops/recovery-drills",
  "/admin/ops/releases",
  "/admin/ops/change-approvals",
  "/admin/ops/backup/plans",
  "/admin/ops/backup/runs",
  "/admin/accounts",
  "/admin/accounts/new",
  "/admin/roles",
  "/admin/roles/new",
  "/admin/access",
  "/admin/organizations",
  "/admin/apikeys",
  "/admin/moderation"
] as const;

export type WorkspaceRoute = (typeof workspaceRoutes)[number];
export type AccountRoute = (typeof accountRoutes)[number];
export type AdminRoute = (typeof adminRoutes)[number];

export function isProtectedRoute(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/workspace") || pathname.startsWith("/admin") || pathname.startsWith("/account");
}

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isWorkspacePath(pathname: string): boolean {
  return pathname.startsWith("/workspace");
}

export function isAccountPath(pathname: string): boolean {
  return pathname.startsWith("/account");
}

export interface AppNavItem {
  href: string;
  label: string;
  matchPrefixes?: string[];
}

export const appTopNavItems: AppNavItem[] = [
  {
    href: "/",
    label: "Marketplace",
    matchPrefixes: ["/", "/search", "/results", "/categories", "/skills", "/compare", "/rankings", "/rollout", "/timeline", "/governance", "/states"]
  },
  {
    href: "/workspace",
    label: "Workspace",
    matchPrefixes: ["/workspace"]
  },
  {
    href: "/admin/overview",
    label: "Admin",
    matchPrefixes: ["/admin"]
  },
  {
    href: "/account/profile",
    label: "Account",
    matchPrefixes: ["/account"]
  },
  {
    href: "/docs",
    label: "Docs",
    matchPrefixes: ["/docs", "/about"]
  }
];
