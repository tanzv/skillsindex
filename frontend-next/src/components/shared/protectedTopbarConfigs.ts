import type { AccountShellMessages, AdminNavigationMessages, ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { buildAdminNavigationGroups } from "@/src/lib/routing/adminNavigation";
import { buildWorkspaceNavigationItems } from "@/src/lib/routing/workspaceNavigation";

import type { ProtectedTopbarConfig, ProtectedTopbarEntrySeed } from "./protectedTopbarModel";

export type AccountCenterMenuIcon = "profile" | "security" | "sessions" | "credentials" | "link";

export interface AccountCenterMenuEntry {
  id: string;
  href: string;
  label: string;
  icon: AccountCenterMenuIcon;
}

export interface AccountCenterMenuSection {
  id: string;
  title: string;
  entries: AccountCenterMenuEntry[];
}

export interface AccountCenterMenuConfig {
  sections: AccountCenterMenuSection[];
}

const sharedOverflowGroupOrder = ["marketplace", "primary", "system-access", "related-hubs"];

function buildSharedQuickEntries(messages: ProtectedTopbarMessages): ProtectedTopbarEntrySeed[] {
  return [
    {
      id: "/categories",
      href: "/categories",
      label: messages.quickCategoriesLabel,
      description: messages.quickCategoriesDescription,
      kind: "quick",
      overflowGroupId: "marketplace",
      matchPrefixes: ["/categories"]
    },
    {
      id: "/rankings",
      href: "/rankings",
      label: messages.quickTopLabel,
      description: messages.quickTopDescription,
      kind: "quick",
      overflowGroupId: "marketplace",
      matchPrefixes: ["/rankings"]
    },
    {
      id: "/governance",
      href: "/governance",
      label: messages.quickGovernanceLabel,
      description: messages.quickGovernanceDescription,
      kind: "quick",
      overflowGroupId: "related-hubs",
      matchPrefixes: ["/governance"]
    },
    {
      id: "/docs",
      href: "/docs",
      label: messages.quickDocsLabel,
      description: messages.quickDocsDescription,
      kind: "quick",
      overflowGroupId: "related-hubs",
      matchPrefixes: ["/docs", "/about"]
    }
  ];
}

function buildProtectedWorkbenchPrimaryGroups(
  messages: AdminNavigationMessages
): ProtectedTopbarConfig["primaryGroups"] {
  return [
    {
      id: "protected-workbench-primary-group",
      label: messages.topbarPrimaryGroupLabel,
      tagLabel: messages.topbarPrimaryGroupTag,
      kind: "primary"
    },
    {
      id: "protected-workbench-quick-group",
      label: messages.topbarQuickGroupLabel,
      tagLabel: messages.topbarQuickGroupTag,
      kind: "quick"
    }
  ];
}

function buildProtectedWorkbenchHubEntries(messages: AdminNavigationMessages): ProtectedTopbarEntrySeed[] {
  const adminNavigationGroups = buildAdminNavigationGroups(messages);

  return [
    {
      id: "hub-workspace",
      href: "/workspace",
      label: messages.hubWorkspaceLabel,
      description: messages.hubWorkspaceDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: ["/workspace", "/workspace/activity", "/workspace/queue", "/workspace/policy", "/workspace/runbook", "/workspace/actions"]
    },
    {
      id: "hub-overview",
      href: "/admin/overview",
      label: messages.groupOverviewLabel,
      description: messages.itemOverviewDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: ["/admin/overview"]
    },
    {
      id: "hub-catalog",
      href: "/admin/ingestion/manual",
      label: messages.groupCatalogLabel,
      description: messages.itemRepositoryIntakeDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: resolveAdminMatchPrefixes(adminNavigationGroups, "catalog", ["/admin/ingestion/manual"])
    },
    {
      id: "hub-operations",
      href: "/admin/ops/metrics",
      label: messages.groupOperationsLabel,
      description: messages.itemOpsMetricsDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: resolveAdminMatchPrefixes(adminNavigationGroups, "operations", ["/admin/ops/metrics"])
    },
    {
      id: "hub-users",
      href: "/admin/accounts",
      label: messages.groupUsersLabel,
      description: messages.itemAccountsDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: resolveAdminMatchPrefixes(adminNavigationGroups, "users", ["/admin/accounts"])
    },
    {
      id: "hub-security",
      href: "/admin/apikeys",
      label: messages.groupSecurityLabel,
      description: messages.itemApiKeysDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: resolveAdminMatchPrefixes(adminNavigationGroups, "security", ["/admin/apikeys"])
    },
    {
      id: "hub-account",
      href: "/account/profile",
      label: messages.hubAccountLabel,
      description: messages.hubAccountDescription,
      kind: "primary",
      overflowGroupId: "primary",
      matchPrefixes: ["/account"]
    }
  ];
}

function buildOverflowMetricLabels(messages: ProtectedTopbarMessages) {
  return {
    visible: messages.overflowVisibleMetricLabel,
    hidden: messages.overflowHiddenMetricLabel
  };
}

export function buildAccountCenterMenuConfig(
  messages: ProtectedTopbarMessages,
  extensions: AccountCenterMenuSection[] = []
): AccountCenterMenuConfig {
  return {
    sections: [
      ...extensions,
      {
        id: "account-center",
        title: messages.accountMenuNavigationTitle,
        entries: [
          {
            id: "account-profile",
            href: "/account/profile",
            label: messages.accountMenuProfileLabel,
            icon: "profile"
          },
          {
            id: "account-security",
            href: "/account/security",
            label: messages.accountMenuSecurityLabel,
            icon: "security"
          },
          {
            id: "account-sessions",
            href: "/account/sessions",
            label: messages.accountMenuSessionsLabel,
            icon: "sessions"
          },
          {
            id: "account-api-credentials",
            href: "/account/api-credentials",
            label: messages.accountMenuApiCredentialsLabel,
            icon: "credentials"
          }
        ]
      }
    ]
  };
}

export function buildAdminAccountCenterMenuConfig(
  topbarMessages: ProtectedTopbarMessages,
  navigationMessages: AdminNavigationMessages
): AccountCenterMenuConfig {
  return buildAccountCenterMenuConfig(topbarMessages, [
    {
      id: "admin-identity-services",
      title: navigationMessages.groupUsersLabel,
      entries: [
        {
          id: "admin-access",
          href: "/admin/access",
          label: navigationMessages.itemAccessLabel,
          icon: "security"
        },
        {
          id: "admin-roles",
          href: "/admin/roles",
          label: navigationMessages.itemRolesLabel,
          icon: "link"
        },
        {
          id: "admin-organizations",
          href: "/admin/organizations",
          label: navigationMessages.itemOrganizationsLabel,
          icon: "link"
        }
      ]
    },
    {
      id: "admin-runtime-services",
      title: navigationMessages.groupOperationsLabel,
      entries: [
        {
          id: "admin-integrations",
          href: "/admin/integrations",
          label: navigationMessages.itemIntegrationsLabel,
          icon: "link"
        },
        {
          id: "admin-release-gates",
          href: "/admin/ops/release-gates",
          label: navigationMessages.itemReleaseGatesLabel,
          icon: "link"
        }
      ]
    }
  ]);
}

function resolveAdminMatchPrefixes(groups: ReturnType<typeof buildAdminNavigationGroups>, id: string, fallback: string[]) {
  return groups.find((group) => group.id === id)?.items.map((item) => item.href) || fallback;
}

export function buildAdminProtectedTopbarConfig(
  navigationMessages: AdminNavigationMessages,
  topbarMessages: ProtectedTopbarMessages
): ProtectedTopbarConfig {
  return {
    entries: [...buildProtectedWorkbenchHubEntries(navigationMessages), ...buildSharedQuickEntries(topbarMessages)],
    primaryGroups: buildProtectedWorkbenchPrimaryGroups(navigationMessages),
    overflowGroupTitles: {
      primary: navigationMessages.topbarOverflowPrimaryTitle,
      "related-hubs": navigationMessages.topbarOverflowRelatedTitle,
      marketplace: navigationMessages.topbarOverflowMarketplaceTitle
    },
    overflowGroupOrder: ["primary", "related-hubs", "marketplace"],
    overflowTitle: navigationMessages.topbarOverflowTitle,
    overflowHint: navigationMessages.topbarOverflowHint,
    overflowMetricLabels: buildOverflowMetricLabels(topbarMessages)
  };
}

export function buildAccountProtectedTopbarConfig(
  navigationMessages: AdminNavigationMessages,
  shellMessages: AccountShellMessages,
  topbarMessages: ProtectedTopbarMessages
): ProtectedTopbarConfig {
  return {
    entries: [...buildProtectedWorkbenchHubEntries(navigationMessages), ...buildSharedQuickEntries(topbarMessages)],
    primaryGroups: buildProtectedWorkbenchPrimaryGroups(navigationMessages),
    overflowGroupTitles: {
      primary: navigationMessages.topbarOverflowPrimaryTitle,
      "related-hubs": navigationMessages.topbarOverflowRelatedTitle,
      marketplace: navigationMessages.topbarOverflowMarketplaceTitle
    },
    overflowGroupOrder: ["primary", "related-hubs", "marketplace"],
    overflowTitle: shellMessages.topbarOverflowTitle,
    overflowHint: shellMessages.topbarOverflowHint,
    overflowMetricLabels: buildOverflowMetricLabels(topbarMessages)
  };
}

export function buildWorkspaceProtectedTopbarConfig(
  messages: WorkspaceMessages,
  topbarMessages: ProtectedTopbarMessages
): ProtectedTopbarConfig {
  const workspaceNavigationItems = buildWorkspaceNavigationItems(messages);

  return {
    entries: [
      ...workspaceNavigationItems.map((item) => ({
        id: item.href,
        href: item.href,
        label: item.label,
        description: item.description || item.label,
        kind: "primary" as const,
        overflowGroupId: "primary",
        exactMatch: item.href === "/workspace",
        matchPrefixes: [item.href]
      })),
      {
        id: "/admin/overview",
        href: "/admin/overview",
        label: messages.relatedAdminLabel,
        description: messages.relatedAdminDescription,
        kind: "access",
        overflowGroupId: "system-access",
        matchPrefixes: ["/admin"]
      },
      {
        id: "/account/profile",
        href: "/account/profile",
        label: messages.relatedAccountLabel,
        description: messages.relatedAccountDescription,
        kind: "access",
        overflowGroupId: "system-access",
        matchPrefixes: ["/account"]
      },
      ...buildSharedQuickEntries(topbarMessages)
    ],
    primaryGroups: [
      { id: "protected-primary-group", label: messages.topbarPrimaryGroupLabel, tagLabel: messages.topbarPrimaryGroupTag, kind: "primary" },
      {
        id: "protected-access-group",
        label: messages.topbarSystemAccessGroupLabel,
        tagLabel: messages.topbarSystemAccessGroupTag,
        kind: "access"
      },
      {
        id: "protected-quick-group",
        label: messages.topbarGlobalLinksGroupLabel,
        tagLabel: messages.topbarGlobalLinksGroupTag,
        kind: "quick"
      }
    ],
    overflowGroupTitles: {
      marketplace: messages.topbarOverflowMarketplaceTitle,
      primary: messages.topbarOverflowAppSectionsTitle,
      "system-access": messages.topbarOverflowSystemAccessTitle,
      "related-hubs": messages.topbarOverflowRelatedHubsTitle
    },
    overflowGroupOrder: sharedOverflowGroupOrder,
    overflowTitle: messages.topbarOverflowTitle,
    overflowHint: messages.topbarOverflowHint,
    overflowMetricLabels: buildOverflowMetricLabels(topbarMessages)
  };
}
