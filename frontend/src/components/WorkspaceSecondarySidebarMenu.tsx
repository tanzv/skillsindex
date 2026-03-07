import { useState } from "react";

import type { WorkspaceSidebarGroup, WorkspaceSidebarItem } from "../pages/WorkspaceCenterPage.navigation";
import {
  WorkspaceSidebarCard,
  WorkspaceSidebarCollapseButton,
  WorkspaceSidebarGroup as WorkspaceSidebarGroupSection,
  WorkspaceSidebarGroupBody,
  WorkspaceSidebarGroupHeader,
  WorkspaceSidebarGroupTitle,
  WorkspaceSidebarGroupToggleIcon,
  WorkspaceSidebarItemButton,
  WorkspaceSidebarScrollable
} from "./WorkspaceSidebarMenu.styles";
import WorkspaceSidebarHeaderBlock from "./WorkspaceSidebarHeaderBlock";
import type { WorkspaceSidebarMenuMetaItem } from "./WorkspaceSidebarMenu.types";

interface WorkspaceSecondarySidebarMenuProps {
  sidebarTitle: string;
  sidebarHint: string;
  sidebarMeta?: WorkspaceSidebarMenuMetaItem[];
  sidebarGroup: WorkspaceSidebarGroup | null;
  activeMenuID: string;
  onSelectMenuItem: (item: WorkspaceSidebarItem) => void;
}

export default function WorkspaceSecondarySidebarMenu({
  sidebarTitle,
  sidebarHint,
  sidebarMeta,
  sidebarGroup,
  activeMenuID,
  onSelectMenuItem
}: WorkspaceSecondarySidebarMenuProps) {
  const normalizedHeaderTitle = sidebarTitle.trim().toLowerCase();
  const normalizedGroupTitle = sidebarGroup?.title.trim().toLowerCase() || "";
  const shouldHideHeaderTitle = normalizedHeaderTitle.length > 0 && normalizedHeaderTitle === normalizedGroupTitle;
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [groupCollapsed, setGroupCollapsed] = useState(false);

  return (
    <WorkspaceSidebarCard $layoutMode="compact" $collapsed={menuCollapsed}>
      <WorkspaceSidebarHeaderBlock
        title={!menuCollapsed && !shouldHideHeaderTitle ? sidebarTitle : undefined}
        hint={!menuCollapsed ? sidebarHint : ""}
        meta={!menuCollapsed ? sidebarMeta : undefined}
        action={
          <WorkspaceSidebarCollapseButton
            type="button"
            className="workspace-sidebar-collapse-toggle"
            aria-expanded={!menuCollapsed}
            aria-label={menuCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setMenuCollapsed((previous) => !previous)}
          >
            {menuCollapsed ? "▸" : "▾"}
          </WorkspaceSidebarCollapseButton>
        }
      />

      {!menuCollapsed ? (
        <WorkspaceSidebarScrollable $layoutMode="compact">
          {sidebarGroup ? (
            <WorkspaceSidebarGroupSection>
              <WorkspaceSidebarGroupHeader
                type="button"
                className="workspace-sidebar-group-toggle"
                aria-expanded={!groupCollapsed}
                onClick={() => setGroupCollapsed((previous) => !previous)}
              >
                <WorkspaceSidebarGroupTitle>{sidebarGroup.title}</WorkspaceSidebarGroupTitle>
                <WorkspaceSidebarGroupToggleIcon $collapsed={groupCollapsed}>▾</WorkspaceSidebarGroupToggleIcon>
              </WorkspaceSidebarGroupHeader>
              <WorkspaceSidebarGroupBody $collapsed={groupCollapsed}>
                {sidebarGroup.items.map((item) => {
                  const active = item.id === activeMenuID;
                  return (
                    <WorkspaceSidebarItemButton
                      key={item.id}
                      type="button"
                      $active={active}
                      $variant="item"
                      onClick={() => onSelectMenuItem(item)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </WorkspaceSidebarItemButton>
                  );
                })}
              </WorkspaceSidebarGroupBody>
            </WorkspaceSidebarGroupSection>
          ) : null}
        </WorkspaceSidebarScrollable>
      ) : null}
    </WorkspaceSidebarCard>
  );
}
