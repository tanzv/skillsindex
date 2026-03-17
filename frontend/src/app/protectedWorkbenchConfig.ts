import { navItems, type NavigationItem, type ProtectedRoute } from "../appNavigationConfig";

export type ProtectedWorkbenchSectionID = "workspace" | "overview" | "catalog" | "operations" | "users" | "security" | "account";

export interface ProtectedWorkbenchSection {
  id: ProtectedWorkbenchSectionID;
  label: string;
  landingRoute: ProtectedRoute;
  matchRoutes: ProtectedRoute[];
  secondaryRoutes: ProtectedRoute[];
}

export const protectedWorkbenchSections: ProtectedWorkbenchSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    landingRoute: "/workspace",
    matchRoutes: [
      "/workspace",
      "/workspace/activity",
      "/workspace/queue",
      "/workspace/runbook",
      "/workspace/policy",
      "/workspace/actions"
    ],
    secondaryRoutes: [
      "/workspace",
      "/workspace/activity",
      "/workspace/queue",
      "/workspace/runbook",
      "/workspace/policy",
      "/workspace/actions"
    ]
  },
  {
    id: "overview",
    label: "Overview",
    landingRoute: "/admin/overview",
    matchRoutes: ["/admin/overview"],
    secondaryRoutes: ["/admin/overview"]
  },
  {
    id: "catalog",
    label: "Catalog",
    landingRoute: "/admin/ingestion/manual",
    matchRoutes: [
      "/admin/ingestion/manual",
      "/admin/ingestion/repository",
      "/admin/records/imports",
      "/admin/skills",
      "/admin/jobs",
      "/admin/sync-jobs",
      "/admin/sync-policy/repository"
    ],
    secondaryRoutes: [
      "/admin/ingestion/manual",
      "/admin/ingestion/repository",
      "/admin/records/imports",
      "/admin/skills",
      "/admin/jobs",
      "/admin/sync-jobs",
      "/admin/sync-policy/repository"
    ]
  },
  {
    id: "operations",
    label: "Operations",
    landingRoute: "/admin/ops/metrics",
    matchRoutes: [
      "/admin/ops/metrics",
      "/admin/integrations",
      "/admin/ops/alerts",
      "/admin/ops/audit-export",
      "/admin/ops/release-gates",
      "/admin/ops/recovery-drills",
      "/admin/ops/releases",
      "/admin/ops/change-approvals",
      "/admin/ops/backup/plans",
      "/admin/ops/backup/runs"
    ],
    secondaryRoutes: [
      "/admin/ops/metrics",
      "/admin/integrations",
      "/admin/ops/alerts",
      "/admin/ops/audit-export",
      "/admin/ops/release-gates",
      "/admin/ops/recovery-drills",
      "/admin/ops/releases",
      "/admin/ops/change-approvals",
      "/admin/ops/backup/plans",
      "/admin/ops/backup/runs"
    ]
  },
  {
    id: "users",
    label: "Users",
    landingRoute: "/admin/accounts",
    matchRoutes: [
      "/admin/accounts",
      "/admin/accounts/new",
      "/admin/roles",
      "/admin/roles/new",
      "/admin/access",
      "/admin/organizations"
    ],
    secondaryRoutes: ["/admin/accounts", "/admin/roles", "/admin/access", "/admin/organizations"]
  },
  {
    id: "security",
    label: "Security",
    landingRoute: "/admin/apikeys",
    matchRoutes: ["/admin/apikeys", "/admin/moderation"],
    secondaryRoutes: ["/admin/apikeys", "/admin/moderation"]
  },
  {
    id: "account",
    label: "Account",
    landingRoute: "/account/profile",
    matchRoutes: ["/account/profile", "/account/security", "/account/sessions", "/account/api-credentials"],
    secondaryRoutes: ["/account/profile", "/account/security", "/account/sessions", "/account/api-credentials"]
  }
];

export function resolveProtectedWorkbenchSection(
  route: ProtectedRoute,
  sections: ProtectedWorkbenchSection[] = protectedWorkbenchSections
): ProtectedWorkbenchSection {
  return sections.find((section) => section.matchRoutes.includes(route)) || sections[0];
}

export function resolveProtectedWorkbenchSecondaryItems(
  route: ProtectedRoute,
  items: NavigationItem[] = navItems,
  sections: ProtectedWorkbenchSection[] = protectedWorkbenchSections
): NavigationItem[] {
  const activeSection = resolveProtectedWorkbenchSection(route, sections);
  const routeOrder = new Map(activeSection.secondaryRoutes.map((path, index) => [path, index]));

  return items
    .filter((item) => routeOrder.has(item.path))
    .sort((left, right) => (routeOrder.get(left.path) ?? Number.MAX_SAFE_INTEGER) - (routeOrder.get(right.path) ?? Number.MAX_SAFE_INTEGER));
}
