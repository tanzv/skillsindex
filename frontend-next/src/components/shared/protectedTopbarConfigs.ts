import { adminNavigationGroups } from "@/src/lib/routing/adminNavigation";
import { workspaceNavigationItems } from "@/src/lib/routing/workspaceNavigation";

import type { ProtectedTopbarConfig, ProtectedTopbarEntrySeed } from "./protectedTopbarModel";

const sharedQuickEntries: ProtectedTopbarEntrySeed[] = [
  {
    id: "/categories",
    href: "/categories",
    label: "Categories",
    description: "Browse the original market taxonomy and entry points.",
    kind: "quick",
    overflowGroupId: "marketplace",
    matchPrefixes: ["/categories"]
  },
  {
    id: "/rankings",
    href: "/rankings",
    label: "Top",
    description: "Open the ranking and leaderboard route from the marketplace shell.",
    kind: "quick",
    overflowGroupId: "marketplace",
    matchPrefixes: ["/rankings"]
  },
  {
    id: "/governance",
    href: "/governance",
    label: "Governance",
    description: "Inspect public governance guidance and policy posture.",
    kind: "quick",
    overflowGroupId: "related-hubs",
    matchPrefixes: ["/governance"]
  },
  {
    id: "/docs",
    href: "/docs",
    label: "Docs",
    description: "Open shared documentation and migration references.",
    kind: "quick",
    overflowGroupId: "related-hubs",
    matchPrefixes: ["/docs", "/about"]
  }
];

const sharedPrimaryGroups: ProtectedTopbarConfig["primaryGroups"] = [
  { id: "protected-primary-group", label: "Control Sections", tagLabel: "Control", kind: "primary" },
  { id: "protected-access-group", label: "System Access", tagLabel: "Access", kind: "access" },
  { id: "protected-quick-group", label: "Global Links", tagLabel: "Global", kind: "quick" }
];

const protectedWorkbenchPrimaryGroups: ProtectedTopbarConfig["primaryGroups"] = [
  { id: "protected-workbench-primary-group", label: "Protected Workbench", tagLabel: "Workbench", kind: "primary" },
  { id: "protected-workbench-quick-group", label: "Related Hubs", tagLabel: "Hubs", kind: "quick" }
];

const sharedOverflowGroupTitles = {
  primary: "Control Sections",
  "system-access": "System Access",
  marketplace: "Marketplace",
  "related-hubs": "Related Hubs"
};

const sharedOverflowGroupOrder = ["marketplace", "primary", "system-access", "related-hubs"];

const protectedWorkbenchHubEntries: ProtectedTopbarEntrySeed[] = [
  {
    id: "hub-workspace",
    href: "/workspace",
    label: "Workspace",
    description: "Open the operator workspace command deck.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: workspaceNavigationItems.map((item) => item.href)
  },
  {
    id: "hub-overview",
    href: "/admin/overview",
    label: "Overview",
    description: "View governed overview metrics and capability posture.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: ["/admin/overview"]
  },
  {
    id: "hub-catalog",
    href: "/admin/ingestion/manual",
    label: "Catalog",
    description: "Manage ingestion, skills, jobs, and sync policy.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: adminNavigationGroups.find((group) => group.id === "catalog")?.items.map((item) => item.href) || ["/admin/ingestion/manual"]
  },
  {
    id: "hub-operations",
    href: "/admin/ops/metrics",
    label: "Operations",
    description: "Review operations metrics, incidents, and releases.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: adminNavigationGroups.find((group) => group.id === "operations")?.items.map((item) => item.href) || ["/admin/ops/metrics"]
  },
  {
    id: "hub-users",
    href: "/admin/accounts",
    label: "Users",
    description: "Manage accounts, roles, access, and organizations.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: adminNavigationGroups.find((group) => group.id === "users")?.items.map((item) => item.href) || ["/admin/accounts"]
  },
  {
    id: "hub-security",
    href: "/admin/apikeys",
    label: "Security",
    description: "Inspect API keys, moderation, and secured controls.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: adminNavigationGroups.find((group) => group.id === "security")?.items.map((item) => item.href) || ["/admin/apikeys"]
  },
  {
    id: "hub-account",
    href: "/account/profile",
    label: "Account",
    description: "Open profile, security, sessions, and API credentials.",
    kind: "primary",
    overflowGroupId: "primary",
    matchPrefixes: ["/account"]
  }
];

export const workspaceProtectedTopbarConfig: ProtectedTopbarConfig = {
  entries: [
    ...workspaceNavigationItems.map((item) => ({
      id: item.href,
      href: item.href,
      label: item.label,
      description: item.description || "Workspace navigation entry.",
      kind: "primary" as const,
      overflowGroupId: "primary",
      exactMatch: item.href === "/workspace",
      matchPrefixes: [item.href]
    })),
    {
      id: "/admin/overview",
      href: "/admin/overview",
      label: "Admin",
      description: "Open governed operations, ingestion, and catalog controls.",
      kind: "access",
      overflowGroupId: "system-access",
      matchPrefixes: ["/admin"]
    },
    {
      id: "/account/profile",
      href: "/account/profile",
      label: "Account",
      description: "Review profile, security posture, and API credentials.",
      kind: "access",
      overflowGroupId: "system-access",
      matchPrefixes: ["/account"]
    },
    ...sharedQuickEntries
  ],
  primaryGroups: sharedPrimaryGroups,
  overflowGroupTitles: {
    ...sharedOverflowGroupTitles,
    primary: "App Sections"
  },
  overflowGroupOrder: sharedOverflowGroupOrder,
  overflowTitle: "App Menu",
  overflowHint: "Continue through workspace, admin, account, and marketplace surfaces without breaking the original shell flow."
};

export const adminProtectedTopbarConfig: ProtectedTopbarConfig = {
  entries: [
    ...protectedWorkbenchHubEntries,
    ...sharedQuickEntries
  ],
  primaryGroups: protectedWorkbenchPrimaryGroups,
  overflowGroupTitles: { primary: "More Sections", "related-hubs": "Related Hubs", marketplace: "Marketplace" },
  overflowGroupOrder: ["primary", "related-hubs", "marketplace"],
  overflowTitle: "Control Matrix",
  overflowHint: "Move across admin domains, operator workspace, and public discovery routes from one governed navigation layer."
};

export const accountProtectedTopbarConfig: ProtectedTopbarConfig = {
  entries: [
    ...protectedWorkbenchHubEntries,
    ...sharedQuickEntries
  ],
  primaryGroups: protectedWorkbenchPrimaryGroups,
  overflowGroupTitles: { primary: "More Sections", "related-hubs": "Related Hubs", marketplace: "Marketplace" },
  overflowGroupOrder: ["primary", "related-hubs", "marketplace"],
  overflowTitle: "Account Deck",
  overflowHint: "Switch between identity controls, governed admin access, workspace actions, and public discovery without losing context."
};
