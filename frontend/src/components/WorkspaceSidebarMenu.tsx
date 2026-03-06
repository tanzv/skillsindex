import type { WorkspaceSidebarGroup, WorkspaceSidebarItem, WorkspaceSidebarPrimaryGroupEntry } from "../pages/WorkspaceCenterPage.navigation";
import {
  WorkspaceSidebarCard,
  WorkspaceSidebarGroup as WorkspaceSidebarGroupSection,
  WorkspaceSidebarGroupTitle,
  WorkspaceSidebarHeader,
  WorkspaceSidebarHint,
  WorkspaceSidebarItemButton,
  WorkspaceSidebarMetaPill,
  WorkspaceSidebarMetaRow,
  WorkspaceSidebarScrollable,
  WorkspaceSidebarTitle
} from "./WorkspaceSidebarMenu.styles";
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
  sidebarHint,
  sidebarMeta = [],
  primaryGroupTitle,
  primaryEntries,
  activeSidebarGroupID,
  activeSidebarGroup,
  activeMenuID,
  onSelectPrimaryGroup,
  onSelectMenuItem
}: WorkspaceSidebarMenuProps) {
  const shouldRenderPrimaryGroup = primaryEntries.length > 1;
  const shouldRenderActiveGroupTitle =
    shouldRenderPrimaryGroup ||
    !activeSidebarGroup ||
    activeSidebarGroup.title.trim().toLowerCase() !== sidebarTitle.trim().toLowerCase();

  return (
    <WorkspaceSidebarCard>
      <WorkspaceSidebarHeader>
        <WorkspaceSidebarTitle>{sidebarTitle}</WorkspaceSidebarTitle>
        <WorkspaceSidebarHint>{sidebarHint}</WorkspaceSidebarHint>
      </WorkspaceSidebarHeader>

      {sidebarMeta.length > 0 ? (
        <WorkspaceSidebarMetaRow>
          {sidebarMeta.map((item) => (
            <WorkspaceSidebarMetaPill key={item.id} $tone={item.tone}>
              {item.label}
            </WorkspaceSidebarMetaPill>
          ))}
        </WorkspaceSidebarMetaRow>
      ) : null}

      <WorkspaceSidebarScrollable>
        {shouldRenderPrimaryGroup ? (
          <WorkspaceSidebarGroupSection>
            <WorkspaceSidebarGroupTitle>{primaryGroupTitle}</WorkspaceSidebarGroupTitle>
            {primaryEntries.map((entry) => {
              const active = entry.groupID === activeSidebarGroupID;
              return (
                <WorkspaceSidebarItemButton
                  key={entry.id}
                  type="button"
                  $active={active}
                  onClick={() => onSelectPrimaryGroup(entry)}
                  aria-current={active ? "page" : undefined}
                >
                  {entry.label}
                </WorkspaceSidebarItemButton>
              );
            })}
          </WorkspaceSidebarGroupSection>
        ) : null}

        {activeSidebarGroup ? (
          <WorkspaceSidebarGroupSection>
            {shouldRenderActiveGroupTitle ? <WorkspaceSidebarGroupTitle>{activeSidebarGroup.title}</WorkspaceSidebarGroupTitle> : null}
            {activeSidebarGroup.items.map((item) => {
              const active = item.id === activeMenuID;
              return (
                <WorkspaceSidebarItemButton
                  key={item.id}
                  type="button"
                  $active={active}
                  onClick={() => onSelectMenuItem(item)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </WorkspaceSidebarItemButton>
              );
            })}
          </WorkspaceSidebarGroupSection>
        ) : null}
      </WorkspaceSidebarScrollable>
    </WorkspaceSidebarCard>
  );
}
