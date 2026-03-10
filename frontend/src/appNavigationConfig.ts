import { AccountRoute } from "./pages/accountWorkbench/AccountWorkbenchPage";
import { AdminCatalogRoute } from "./pages/adminCatalog/AdminCatalogPage";
import { AdminOpsControlRoute } from "./pages/adminOps/AdminOpsControlPage";
import { AdminSecurityRoute } from "./pages/adminSecurity/AdminSecurityPage";
import { AdminRoute } from "./pages/adminWorkbench/AdminWorkbenchPage";

export type ProtectedRoute = AdminRoute | AccountRoute;

export type NavigationSection = "admin" | "account";

export interface NavigationItem {
  path: ProtectedRoute;
  title: string;
  subtitle: string;
  section: NavigationSection;
}

export const protectedRoutes: ProtectedRoute[] = [
  "/admin/overview",
  "/admin/skills",
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
  "/admin/jobs",
  "/admin/sync-jobs",
  "/admin/sync-policy/repository",
  "/admin/apikeys",
  "/admin/access",
  "/admin/organizations",
  "/admin/moderation",
  "/account/profile",
  "/account/security",
  "/account/sessions"
];

export const adminQuickRoutes: AdminRoute[] = [
  "/admin/overview",
  "/admin/skills",
  "/admin/integrations",
  "/admin/ops/metrics",
  "/admin/jobs",
  "/admin/access"
];

export const accountQuickRoutes: AccountRoute[] = ["/account/profile", "/account/security", "/account/sessions"];

export const adminCatalogRoutes: AdminRoute[] = [
  "/admin/skills",
  "/admin/jobs",
  "/admin/sync-jobs",
  "/admin/sync-policy/repository"
];

export const adminSecurityRoutes: AdminRoute[] = ["/admin/apikeys", "/admin/access", "/admin/moderation"];

export const adminOpsControlRoutes: AdminRoute[] = [
  "/admin/ops/alerts",
  "/admin/ops/audit-export",
  "/admin/ops/release-gates",
  "/admin/ops/recovery-drills",
  "/admin/ops/releases",
  "/admin/ops/change-approvals",
  "/admin/ops/backup/plans",
  "/admin/ops/backup/runs"
];

export function isAdminCatalogRoute(route: AdminRoute): route is AdminCatalogRoute {
  return adminCatalogRoutes.includes(route);
}

export function isAdminSecurityRoute(route: AdminRoute): route is AdminSecurityRoute {
  return adminSecurityRoutes.includes(route);
}

export function isAdminOpsControlRoute(route: AdminRoute): route is AdminOpsControlRoute {
  return adminOpsControlRoutes.includes(route);
}

export const navItems: NavigationItem[] = [
  {
    path: "/admin/overview",
    title: "Overview",
    subtitle: "Counts and capability posture",
    section: "admin"
  },
  {
    path: "/admin/skills",
    title: "Skills",
    subtitle: "Governed skill inventory",
    section: "admin"
  },
  {
    path: "/admin/integrations",
    title: "Integrations",
    subtitle: "Connectors and webhook deliveries",
    section: "admin"
  },
  {
    path: "/admin/ops/metrics",
    title: "Ops Metrics",
    subtitle: "Reliability baseline snapshot",
    section: "admin"
  },
  {
    path: "/admin/ops/alerts",
    title: "Ops Alerts",
    subtitle: "Derived operational alerts",
    section: "admin"
  },
  {
    path: "/admin/ops/audit-export",
    title: "Audit Export",
    subtitle: "Compliance export controls",
    section: "admin"
  },
  {
    path: "/admin/ops/release-gates",
    title: "Release Gates",
    subtitle: "Readiness checks and run",
    section: "admin"
  },
  {
    path: "/admin/ops/recovery-drills",
    title: "Recovery Drills",
    subtitle: "RPO and RTO drill records",
    section: "admin"
  },
  {
    path: "/admin/ops/releases",
    title: "Releases",
    subtitle: "Release timeline records",
    section: "admin"
  },
  {
    path: "/admin/ops/change-approvals",
    title: "Change Approvals",
    subtitle: "Approval decision records",
    section: "admin"
  },
  {
    path: "/admin/ops/backup/plans",
    title: "Backup Plans",
    subtitle: "Backup policy definitions",
    section: "admin"
  },
  {
    path: "/admin/ops/backup/runs",
    title: "Backup Runs",
    subtitle: "Execution evidence and status",
    section: "admin"
  },
  {
    path: "/admin/jobs",
    title: "Jobs",
    subtitle: "Async orchestration queue",
    section: "admin"
  },
  {
    path: "/admin/sync-jobs",
    title: "Sync Jobs",
    subtitle: "Repository run history",
    section: "admin"
  },
  {
    path: "/admin/sync-policy/repository",
    title: "Sync Policy",
    subtitle: "Repository scheduler policy",
    section: "admin"
  },
  {
    path: "/admin/apikeys",
    title: "API Keys",
    subtitle: "Token issuance and rotation",
    section: "admin"
  },
  {
    path: "/admin/access",
    title: "Access",
    subtitle: "Registration and account controls",
    section: "admin"
  },
  {
    path: "/admin/organizations",
    title: "Organizations",
    subtitle: "Org and membership governance",
    section: "admin"
  },
  {
    path: "/admin/moderation",
    title: "Moderation",
    subtitle: "Case queue and resolution",
    section: "admin"
  },
  {
    path: "/account/profile",
    title: "Profile",
    subtitle: "Identity profile settings",
    section: "account"
  },
  {
    path: "/account/security",
    title: "Security",
    subtitle: "Password and session policy",
    section: "account"
  },
  {
    path: "/account/sessions",
    title: "Sessions",
    subtitle: "Active device sessions",
    section: "account"
  }
];
