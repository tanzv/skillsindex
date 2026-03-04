import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";

export type WorkspaceSidebarItemKind = "section" | "route";

export interface WorkspaceSidebarItem {
  id: string;
  label: string;
  kind: WorkspaceSidebarItemKind;
  target: string;
}

export interface WorkspaceSidebarGroup {
  id: string;
  title: string;
  items: WorkspaceSidebarItem[];
}

interface BuildWorkspaceSidebarNavigationInput {
  text: Pick<
    WorkspaceCenterCopy,
    | "sidebarSectionsTitle"
    | "sidebarHubsTitle"
    | "sidebarOverview"
    | "sidebarActivity"
    | "sidebarQueue"
    | "sidebarPolicy"
    | "sidebarRunbook"
    | "sidebarQuickActions"
    | "sidebarRollout"
    | "sidebarGovernance"
    | "sidebarRecords"
  >;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
}

export function buildWorkspaceSidebarNavigation({
  text,
  toPublicPath,
  toAdminPath
}: BuildWorkspaceSidebarNavigationInput): WorkspaceSidebarGroup[] {
  return [
    {
      id: "sections",
      title: text.sidebarSectionsTitle,
      items: [
        { id: "section-overview", label: text.sidebarOverview, kind: "section", target: "workspace-overview" },
        { id: "section-activity", label: text.sidebarActivity, kind: "section", target: "workspace-activity" },
        { id: "section-queue", label: text.sidebarQueue, kind: "section", target: "workspace-queue" },
        { id: "section-policy", label: text.sidebarPolicy, kind: "section", target: "workspace-policy" },
        { id: "section-runbook", label: text.sidebarRunbook, kind: "section", target: "workspace-runbook" },
        { id: "section-actions", label: text.sidebarQuickActions, kind: "section", target: "workspace-quick-actions" }
      ]
    },
    {
      id: "hubs",
      title: text.sidebarHubsTitle,
      items: [
        { id: "hub-rollout", label: text.sidebarRollout, kind: "route", target: toPublicPath("/rollout") },
        { id: "hub-governance", label: text.sidebarGovernance, kind: "route", target: toPublicPath("/governance") },
        { id: "hub-records", label: text.sidebarRecords, kind: "route", target: toAdminPath("/admin/records/sync-jobs") }
      ]
    }
  ];
}
