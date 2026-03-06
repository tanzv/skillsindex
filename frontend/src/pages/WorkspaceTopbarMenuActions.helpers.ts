import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import {
  resolveWorkspaceSidebarActiveGroupID,
  resolveWorkspaceSidebarPrimaryGroupEntries,
  type WorkspaceSidebarGroup
} from "./WorkspaceCenterPage.navigation";

interface BuildWorkspaceTopbarMenuActionsInput {
  sidebarGroups: WorkspaceSidebarGroup[];
  activeMenuID: string;
  onNavigate: (path: string) => void;
  fallbackPath: string;
}

function normalizeGroupClassToken(groupID: string): string {
  return String(groupID || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildWorkspaceTopbarMenuActions({
  sidebarGroups,
  activeMenuID,
  onNavigate,
  fallbackPath
}: BuildWorkspaceTopbarMenuActionsInput): TopbarActionItem[] {
  const actions: TopbarActionItem[] = [];
  const primaryEntries = resolveWorkspaceSidebarPrimaryGroupEntries(sidebarGroups);
  const activeGroupID = resolveWorkspaceSidebarActiveGroupID(sidebarGroups, activeMenuID);

  for (const primaryEntry of primaryEntries) {
    const groupClassToken = normalizeGroupClassToken(primaryEntry.groupID);
    const groupClassName = groupClassToken ? `is-menu-group-${groupClassToken}` : "";
    const className = ["is-menu-entry", groupClassName].filter(Boolean).join(" ");
    actions.push({
      id: primaryEntry.id,
      label: primaryEntry.label,
      active: primaryEntry.groupID === activeGroupID,
      tone: "default",
      className,
      onClick: () => onNavigate(primaryEntry.target || fallbackPath)
    });
  }

  return actions;
}
