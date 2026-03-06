import type { WorkspaceSidebarGroup, WorkspaceSidebarItem } from "../pages/WorkspaceCenterPage.navigation";
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
  sidebarMeta = [],
  sidebarGroup,
  activeMenuID,
  onSelectMenuItem
}: WorkspaceSecondarySidebarMenuProps) {
  const shouldRenderGroupTitle =
    sidebarGroup &&
    sidebarGroup.title.trim().toLowerCase() !== sidebarTitle.trim().toLowerCase();

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
        {sidebarGroup ? (
          <WorkspaceSidebarGroupSection>
            {shouldRenderGroupTitle ? <WorkspaceSidebarGroupTitle>{sidebarGroup.title}</WorkspaceSidebarGroupTitle> : null}
            {sidebarGroup.items.map((item) => {
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
