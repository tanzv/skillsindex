import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";

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

export function buildAdminNavigationGroups(messages: AdminNavigationMessages): NavigationGroup[] {
  return [
    {
      id: "overview",
      label: messages.groupOverviewLabel,
      href: "/admin/overview",
      items: [
        {
          href: "/admin/overview",
          label: messages.itemOverviewLabel,
          description: messages.itemOverviewDescription
        }
      ]
    },
    {
      id: "catalog",
      label: messages.groupCatalogLabel,
      href: "/admin/ingestion/manual",
      items: [
        {
          href: "/admin/ingestion/manual",
          label: messages.itemManualIntakeLabel,
          description: messages.itemManualIntakeDescription
        },
        {
          href: "/admin/ingestion/repository",
          label: messages.itemRepositoryIntakeLabel,
          description: messages.itemRepositoryIntakeDescription
        },
        {
          href: "/admin/records/imports",
          label: messages.itemImportsLabel,
          description: messages.itemImportsDescription
        },
        {
          href: "/admin/skills",
          label: messages.itemSkillsLabel,
          description: messages.itemSkillsDescription
        },
        {
          href: "/admin/jobs",
          label: messages.itemJobsLabel,
          description: messages.itemJobsDescription
        },
        {
          href: "/admin/sync-jobs",
          label: messages.itemSyncJobsLabel,
          description: messages.itemSyncJobsDescription
        },
        {
          href: "/admin/sync-policy/repository",
          label: messages.itemSyncPolicyLabel,
          description: messages.itemSyncPolicyDescription
        }
      ]
    },
    {
      id: "operations",
      label: messages.groupOperationsLabel,
      href: "/admin/ops/metrics",
      items: [
        {
          href: "/admin/ops/metrics",
          label: messages.itemOpsMetricsLabel,
          description: messages.itemOpsMetricsDescription
        },
        {
          href: "/admin/integrations",
          label: messages.itemIntegrationsLabel,
          description: messages.itemIntegrationsDescription
        },
        {
          href: "/admin/ops/alerts",
          label: messages.itemOpsAlertsLabel,
          description: messages.itemOpsAlertsDescription
        },
        {
          href: "/admin/ops/audit-export",
          label: messages.itemAuditExportLabel,
          description: messages.itemAuditExportDescription
        },
        {
          href: "/admin/ops/release-gates",
          label: messages.itemReleaseGatesLabel,
          description: messages.itemReleaseGatesDescription
        },
        {
          href: "/admin/ops/recovery-drills",
          label: messages.itemRecoveryDrillsLabel,
          description: messages.itemRecoveryDrillsDescription
        },
        {
          href: "/admin/ops/releases",
          label: messages.itemReleasesLabel,
          description: messages.itemReleasesDescription
        },
        {
          href: "/admin/ops/change-approvals",
          label: messages.itemChangeApprovalsLabel,
          description: messages.itemChangeApprovalsDescription
        },
        {
          href: "/admin/ops/backup/plans",
          label: messages.itemBackupPlansLabel,
          description: messages.itemBackupPlansDescription
        },
        {
          href: "/admin/ops/backup/runs",
          label: messages.itemBackupRunsLabel,
          description: messages.itemBackupRunsDescription
        }
      ]
    },
    {
      id: "users",
      label: messages.groupUsersLabel,
      href: "/admin/accounts",
      items: [
        {
          href: "/admin/accounts",
          label: messages.itemAccountsLabel,
          description: messages.itemAccountsDescription
        },
        {
          href: "/admin/roles",
          label: messages.itemRolesLabel,
          description: messages.itemRolesDescription
        },
        {
          href: "/admin/access",
          label: messages.itemAccessLabel,
          description: messages.itemAccessDescription
        },
        {
          href: "/admin/organizations",
          label: messages.itemOrganizationsLabel,
          description: messages.itemOrganizationsDescription
        }
      ]
    },
    {
      id: "security",
      label: messages.groupSecurityLabel,
      href: "/admin/apikeys",
      items: [
        {
          href: "/admin/apikeys",
          label: messages.itemApiKeysLabel,
          description: messages.itemApiKeysDescription
        },
        {
          href: "/admin/moderation",
          label: messages.itemModerationLabel,
          description: messages.itemModerationDescription
        }
      ]
    }
  ];
}

export function buildAdminQuickLinks(messages: AdminNavigationMessages): NavigationLink[] {
  return [
    { href: "/admin/overview", label: messages.itemOverviewLabel },
    { href: "/admin/ingestion/repository", label: messages.itemRepositoryIntakeLabel },
    { href: "/admin/records/imports", label: messages.itemImportsLabel },
    { href: "/admin/skills", label: messages.itemSkillsLabel },
    { href: "/admin/sync-jobs", label: messages.itemSyncJobsLabel },
    { href: "/admin/integrations", label: messages.itemIntegrationsLabel },
    { href: "/admin/access", label: messages.itemAccessLabel }
  ];
}

export function resolveAdminGroup(pathname: string, groups: NavigationGroup[]): NavigationGroup {
  return groups.find((group) => group.items.some((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))) || groups[0];
}
