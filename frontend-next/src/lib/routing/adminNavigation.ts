export interface NavigationLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  href: string;
  items: NavigationLink[];
}

export const adminNavigationGroups: NavigationGroup[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin/overview",
    items: [{ href: "/admin/overview", label: "Overview", description: "Dashboard summary" }]
  },
  {
    id: "catalog",
    label: "Catalog",
    href: "/admin/ingestion/manual",
    items: [
      { href: "/admin/ingestion/manual", label: "Manual Intake" },
      { href: "/admin/ingestion/repository", label: "Repository Intake" },
      { href: "/admin/records/imports", label: "Imports" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/sync-jobs", label: "Sync Jobs" },
      { href: "/admin/sync-policy/repository", label: "Sync Policy" }
    ]
  },
  {
    id: "operations",
    label: "Operations",
    href: "/admin/ops/metrics",
    items: [
      { href: "/admin/ops/metrics", label: "Ops Metrics" },
      { href: "/admin/integrations", label: "Integrations" },
      { href: "/admin/ops/alerts", label: "Ops Alerts" },
      { href: "/admin/ops/audit-export", label: "Audit Export" },
      { href: "/admin/ops/release-gates", label: "Release Gates" },
      { href: "/admin/ops/recovery-drills", label: "Recovery Drills" },
      { href: "/admin/ops/releases", label: "Releases" },
      { href: "/admin/ops/change-approvals", label: "Change Approvals" },
      { href: "/admin/ops/backup/plans", label: "Backup Plans" },
      { href: "/admin/ops/backup/runs", label: "Backup Runs" }
    ]
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/accounts",
    items: [
      { href: "/admin/accounts", label: "Accounts" },
      { href: "/admin/roles", label: "Roles" },
      { href: "/admin/access", label: "Access" },
      { href: "/admin/organizations", label: "Organizations" }
    ]
  },
  {
    id: "security",
    label: "Security",
    href: "/admin/apikeys",
    items: [
      { href: "/admin/apikeys", label: "API Keys" },
      { href: "/admin/moderation", label: "Moderation" }
    ]
  }
];

export const adminQuickLinks: NavigationLink[] = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/ingestion/repository", label: "Repository Intake" },
  { href: "/admin/records/imports", label: "Imports" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/sync-jobs", label: "Sync Jobs" },
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/access", label: "Access" }
];

export function resolveAdminGroup(pathname: string): NavigationGroup {
  return adminNavigationGroups.find((group) => group.items.some((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))) || adminNavigationGroups[0];
}
