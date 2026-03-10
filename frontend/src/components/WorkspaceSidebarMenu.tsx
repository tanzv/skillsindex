import { useEffect, useState } from "react";

import type { WorkspaceSidebarGroup, WorkspaceSidebarItem, WorkspaceSidebarPrimaryGroupEntry } from "../pages/workspace/WorkspaceCenterPage.navigation";
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

interface WorkspaceSidebarMenuProps {
  sidebarTitle: string;
  sidebarHint: string;
  sidebarMeta?: WorkspaceSidebarMenuMetaItem[];
  primaryGroupTitle: string;
  primaryEntries: WorkspaceSidebarPrimaryGroupEntry[];
  activeSidebarGroupID: string;
  activeSidebarGroup: WorkspaceSidebarGroup | null;
  activeMenuID: string;
  onSelectPrimaryGroup: (entry: WorkspaceSidebarPrimaryGroupEntry) => void;
  onSelectMenuItem: (item: WorkspaceSidebarItem) => void;
}

export default function WorkspaceSidebarMenu({
  sidebarTitle,
  sidebarMeta,
  primaryGroupTitle,
  primaryEntries,
  activeSidebarGroupID,
  activeSidebarGroup,
  activeMenuID,
  onSelectPrimaryGroup,
  onSelectMenuItem
}: WorkspaceSidebarMenuProps) {
  const shouldRenderPrimaryGroup = primaryEntries.length > 1;
  const activePrimaryEntry = primaryEntries.find((entry) => entry.groupID === activeSidebarGroupID) || null;
  const normalizedHeaderTitle = sidebarTitle.trim().toLowerCase();
  const normalizedGroupTitle = activeSidebarGroup?.title.trim().toLowerCase() || "";
  const normalizedPrimaryEntryLabel = activePrimaryEntry?.label.trim().toLowerCase() || "";
  const shouldHideHeaderTitle =
    normalizedHeaderTitle.length > 0 &&
    (normalizedHeaderTitle === normalizedGroupTitle || normalizedHeaderTitle === normalizedPrimaryEntryLabel);
  const shouldRenderActiveGroupTitle = Boolean(activeSidebarGroup && normalizedGroupTitle !== normalizedHeaderTitle);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [primaryGroupCollapsed, setPrimaryGroupCollapsed] = useState(false);
  const [activeGroupCollapsed, setActiveGroupCollapsed] = useState(false);

  useEffect(() => {
    setActiveGroupCollapsed(false);
  }, [activeSidebarGroup?.id]);

  return (
    <WorkspaceSidebarCard $layoutMode="compact" $collapsed={menuCollapsed}>
      <WorkspaceSidebarHeaderBlock
        title={!menuCollapsed && !shouldHideHeaderTitle ? sidebarTitle : undefined}
        hint=""
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
          {shouldRenderPrimaryGroup ? (
            <WorkspaceSidebarGroupSection $variant="flat">
              <WorkspaceSidebarGroupHeader
                type="button"
                className="workspace-sidebar-group-toggle"
                aria-expanded={!primaryGroupCollapsed}
                onClick={() => setPrimaryGroupCollapsed((previous) => !previous)}
              >
                <WorkspaceSidebarGroupTitle>{primaryGroupTitle}</WorkspaceSidebarGroupTitle>
                <WorkspaceSidebarGroupToggleIcon $collapsed={primaryGroupCollapsed}>▾</WorkspaceSidebarGroupToggleIcon>
              </WorkspaceSidebarGroupHeader>
              <WorkspaceSidebarGroupBody $collapsed={primaryGroupCollapsed}>
                {primaryEntries.map((entry) => {
                  const active = entry.groupID === activeSidebarGroupID;
                  return (
                    <WorkspaceSidebarItemButton
                      key={entry.id}
                      type="button"
                      $active={active}
                      $variant="primary"
                      onClick={() => onSelectPrimaryGroup(entry)}
                      aria-current={active ? "page" : undefined}
                    >
                      {entry.label}
                    </WorkspaceSidebarItemButton>
                  );
                })}
              </WorkspaceSidebarGroupBody>
            </WorkspaceSidebarGroupSection>
          ) : null}

          {activeSidebarGroup ? (
            <WorkspaceSidebarGroupSection>
              {shouldRenderActiveGroupTitle ? (
                <WorkspaceSidebarGroupHeader
                  type="button"
                  className="workspace-sidebar-group-toggle"
                  aria-expanded={!activeGroupCollapsed}
                  onClick={() => setActiveGroupCollapsed((previous) => !previous)}
                >
                  <WorkspaceSidebarGroupTitle>{activeSidebarGroup.title}</WorkspaceSidebarGroupTitle>
                  <WorkspaceSidebarGroupToggleIcon $collapsed={activeGroupCollapsed}>▾</WorkspaceSidebarGroupToggleIcon>
                </WorkspaceSidebarGroupHeader>
              ) : null}
              <WorkspaceSidebarGroupBody $collapsed={shouldRenderActiveGroupTitle ? activeGroupCollapsed : false}>
                {activeSidebarGroup.items.map((item) => {
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
