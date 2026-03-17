import { AccountRoute } from "./pages/accountWorkbench/AccountWorkbenchPage";
import { AdminCatalogRoute } from "./pages/adminCatalog/AdminCatalogPage";
import { AdminOpsControlRoute } from "./pages/adminOps/AdminOpsControlPage";
import { AdminSecurityRoute } from "./pages/adminSecurity/AdminSecurityPage";
import { AdminRoute } from "./pages/adminWorkbench/AdminWorkbenchPage";
import { WorkspaceRoute } from "./pages/workspace/WorkspaceCenterPage.types";

export type ProtectedRoute = AdminRoute | AccountRoute | WorkspaceRoute;

export type NavigationSection = "workspace" | "admin" | "account";

export interface NavigationItem {
  path: ProtectedRoute;
  title: string;
  subtitle: string;
  section: NavigationSection;
}

export const protectedRoutes: ProtectedRoute[] = [
  "/workspace",
  "/workspace/activity",
  "/workspace/queue",
  "/workspace/policy",
  "/workspace/runbook",
  "/workspace/actions",
  "/admin/overview",
  "/admin/ingestion/manual",
  "/admin/ingestion/repository",
  "/admin/records/imports",
  "/admin/accounts",
  "/admin/accounts/new",
  "/admin/roles",
  "/admin/roles/new",
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
  "/account/sessions",
  "/account/api-credentials"
];

export const workspaceRoutes: WorkspaceRoute[] = [
  "/workspace",
  "/workspace/activity",
  "/workspace/queue",
  "/workspace/policy",
  "/workspace/runbook",
  "/workspace/actions"
];

export const adminQuickRoutes: AdminRoute[] = [
  "/admin/overview",
  "/admin/ingestion/repository",
  "/admin/records/imports",
  "/admin/skills",
  "/admin/sync-jobs",
  "/admin/integrations",
  "/admin/access"
];

export const accountQuickRoutes: AccountRoute[] = [
  "/account/profile",
  "/account/security",
  "/account/sessions",
  "/account/api-credentials"
];

export const adminCatalogRoutes: AdminRoute[] = [
  "/admin/skills",
  "/admin/jobs",
  "/admin/sync-jobs",
  "/admin/sync-policy/repository"
];

export const adminSecurityRoutes: AdminRoute[] = ["/admin/apikeys", "/admin/moderation"];

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
    path: "/workspace",
    title: "Overview",
    subtitle: "Operational workspace summary",
    section: "workspace"
  },
  {
    path: "/workspace/activity",
    title: "Activity Feed",
    subtitle: "Recent team execution signals",
    section: "workspace"
  },
  {
    path: "/workspace/queue",
    title: "Queue Execution",
    subtitle: "Active run queue and risk hotspots",
    section: "workspace"
  },
  {
    path: "/workspace/runbook",
    title: "Runbook Preview",
    subtitle: "Operational steps and release drills",
    section: "workspace"
  },
  {
    path: "/workspace/policy",
    title: "Policy Summary",
    subtitle: "Governance coverage and exceptions",
    section: "workspace"
  },
  {
    path: "/workspace/actions",
    title: "Quick Actions",
    subtitle: "Shortcuts for common operator tasks",
    section: "workspace"
  },
  {
    path: "/admin/overview",
    title: "Overview",
    subtitle: "Counts and capability posture",
    section: "admin"
  },
  {
    path: "/admin/ingestion/manual",
    title: "Manual Intake",
    subtitle: "Direct authoring ingestion",
    section: "admin"
  },
  {
    path: "/admin/ingestion/repository",
    title: "Repository Intake",
    subtitle: "Git-backed onboarding",
    section: "admin"
  },
  {
    path: "/admin/records/imports",
    title: "Imports",
    subtitle: "Archive and SkillMP intake",
    section: "admin"
  },
  {
    path: "/admin/skills",
    title: "Skills",
    subtitle: "Governed skill inventory",
    section: "admin"
  },
  {
    path: "/admin/accounts",
    title: "Account Management",
    subtitle: "User records and provisioning controls",
    section: "admin"
  },
  {
    path: "/admin/roles",
    title: "Role Management",
    subtitle: "Role definitions and assignment governance",
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
  },
  {
    path: "/account/api-credentials",
    title: "API Credentials",
    subtitle: "Personal OpenAPI credentials",
    section: "account"
  }
];
