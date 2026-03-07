import styled from "@emotion/styled";

type SidebarCardLayoutMode = "fill" | "compact";
type SidebarItemVariant = "item" | "primary";
type SidebarGroupVariant = "default" | "flat";

function resolveIsFillLayout(layoutMode?: SidebarCardLayoutMode): boolean {
  return layoutMode !== "compact";
}

function resolveSidebarWidth(collapsed?: boolean): string {
  return collapsed ? "56px" : "clamp(208px, 15.5vw, 232px)";
}

function resolveSidebarItemBorder(variant: SidebarItemVariant, active?: boolean): string {
  if (active) {
    return "var(--workspace-sidebar-item-border-active)";
  }
  return variant === "primary" ? "var(--workspace-sidebar-segment-border)" : "var(--workspace-sidebar-item-border)";
}

function resolveSidebarItemBackground(variant: SidebarItemVariant, active?: boolean): string {
  if (active) {
    return variant === "primary" ? "var(--workspace-sidebar-primary-bg-active)" : "var(--workspace-sidebar-item-bg-active)";
  }
  return variant === "primary" ? "var(--workspace-sidebar-primary-bg)" : "var(--workspace-sidebar-item-bg)";
}

function resolveSidebarItemTextColor(variant: SidebarItemVariant, active?: boolean): string {
  if (active) {
    return "var(--workspace-sidebar-item-text-active)";
  }
  return variant === "primary" ? "var(--si-color-text-secondary)" : "var(--si-color-text-primary)";
}

export const WorkspaceSidebarCard = styled.aside<{ $layoutMode?: SidebarCardLayoutMode; $collapsed?: boolean }>`
  --workspace-sidebar-compact-height: clamp(560px, calc(100dvh - 100px), 820px);
  --workspace-sidebar-border: color-mix(in srgb, var(--si-color-border) 72%, transparent);
  --workspace-sidebar-border-soft: color-mix(in srgb, var(--si-color-border-soft) 70%, transparent);
  --workspace-sidebar-surface: color-mix(in srgb, var(--si-color-panel) 96%, transparent);
  --workspace-sidebar-surface-alt: color-mix(in srgb, var(--si-color-surface) 94%, transparent);
  --workspace-sidebar-section-surface: color-mix(in srgb, var(--si-color-surface) 48%, transparent);
  --workspace-sidebar-item-border: color-mix(in srgb, var(--si-color-border-soft) 76%, transparent);
  --workspace-sidebar-item-border-active: color-mix(in srgb, var(--si-color-accent) 28%, var(--si-color-border) 72%);
  --workspace-sidebar-item-bg: transparent;
  --workspace-sidebar-item-bg-active: color-mix(in srgb, var(--si-color-accent) 12%, var(--si-color-surface) 88%);
  --workspace-sidebar-primary-bg: color-mix(in srgb, var(--si-color-surface) 74%, transparent);
  --workspace-sidebar-primary-bg-active: color-mix(in srgb, var(--si-color-accent) 10%, var(--si-color-surface) 90%);
  --workspace-sidebar-segment-border: color-mix(in srgb, var(--si-color-border-soft) 82%, transparent);
  --workspace-sidebar-item-text-active: var(--si-color-text-primary);
  --workspace-sidebar-group-title: color-mix(in srgb, var(--si-color-text-secondary) 84%, var(--si-color-text-primary) 16%);

  position: sticky;
  top: 68px;
  align-self: start;
  width: ${({ $collapsed }) => resolveSidebarWidth($collapsed)};
  min-width: ${({ $collapsed }) => resolveSidebarWidth($collapsed)};
  margin-left: ${({ $collapsed }) => ($collapsed ? "-4px" : "-12px")};
  border-radius: 12px;
  border: 1px solid var(--workspace-sidebar-border);
  background: var(--workspace-sidebar-surface);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--si-color-canvas) 10%, transparent);
  padding: ${({ $collapsed }) => ($collapsed ? "8px 6px" : "9px")};
  height: ${({ $layoutMode, $collapsed }) =>
    $collapsed ? "auto" : resolveIsFillLayout($layoutMode) ? "min(980px, calc(100dvh - 82px))" : "var(--workspace-sidebar-compact-height)"};
  min-height: ${({ $layoutMode, $collapsed }) =>
    $collapsed ? "0" : resolveIsFillLayout($layoutMode) ? "min(760px, calc(100dvh - 82px))" : "var(--workspace-sidebar-compact-height)"};
  max-height: ${({ $layoutMode, $collapsed }) =>
    $collapsed ? "none" : resolveIsFillLayout($layoutMode) ? "none" : "var(--workspace-sidebar-compact-height)"};
  display: flex;
  transition: width 0.18s ease, padding 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;

  @media (max-width: 1120px) {
    position: static;
    width: auto;
    min-width: 0;
    margin-left: 0;
    height: auto;
    min-height: 0;
    max-height: none;
  }
`;

export const WorkspaceSidebarHeader = styled.div`
  display: grid;
  gap: 4px;
  padding: 0 1px 2px;
`;

export const WorkspaceSidebarHeaderTop = styled.div<{ $hasTitle?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $hasTitle }) => ($hasTitle ? "space-between" : "center")};
  gap: 6px;
  min-height: 22px;
  width: 100%;
`;

export const WorkspaceSidebarCollapseButtonSlot = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding-left: 2px;
`;

export const WorkspaceSidebarCollapseButton = styled.button`
  border: none;
  background: transparent;
  color: var(--workspace-sidebar-group-title);
  border-radius: 8px;
  min-width: 22px;
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;

  &:hover {
    background: color-mix(in srgb, var(--workspace-sidebar-section-surface) 58%, transparent);
    color: var(--si-color-text-primary);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--si-color-accent) 42%, transparent);
    outline-offset: 2px;
  }
`;

export const WorkspaceSidebarTitle = styled.h2`
  margin: 0;
  color: var(--si-color-text-primary);
  font-size: 0.78rem;
  line-height: 1.2;
  font-weight: 700;
`;

export const WorkspaceSidebarHint = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.42;
  text-wrap: pretty;
`;

export const WorkspaceSidebarMetaRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
`;

export const WorkspaceSidebarMetaPill = styled.span<{ $tone?: "neutral" | "accent" }>`
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) => ($tone === "accent" ? "var(--workspace-sidebar-item-border-active)" : "var(--workspace-sidebar-border-soft)")};
  background: ${({ $tone }) =>
    $tone === "accent"
      ? "color-mix(in srgb, var(--si-color-accent) 12%, var(--workspace-sidebar-surface-alt))"
      : "var(--workspace-sidebar-surface-alt)"};
  color: ${({ $tone }) => ($tone === "accent" ? "var(--si-color-text-primary)" : "var(--si-color-text-secondary)")};
  font-family: "JetBrains Mono", monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
  padding: 3px 7px;
`;

export const WorkspaceSidebarGroup = styled.section<{ $variant?: SidebarGroupVariant }>`
  display: grid;
  gap: 6px;
  padding: ${({ $variant = "default" }) => ($variant === "flat" ? "0" : "7px")};
  border-radius: ${({ $variant = "default" }) => ($variant === "flat" ? "0" : "10px")};
  border: ${({ $variant = "default" }) => ($variant === "flat" ? "none" : "1px solid var(--workspace-sidebar-border-soft)")};
  background: ${({ $variant = "default" }) =>
    $variant === "flat" ? "transparent" : "color-mix(in srgb, var(--workspace-sidebar-section-surface) 70%, transparent)"};
`;

export const WorkspaceSidebarGroupHeader = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  color: inherit;

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--si-color-accent) 42%, transparent);
    outline-offset: 2px;
    border-radius: 8px;
  }
`;

export const WorkspaceSidebarGroupTitle = styled.h3`
  margin: 0;
  font-size: 0.56rem;
  font-weight: 650;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--workspace-sidebar-group-title) 78%, transparent);
  font-family: "JetBrains Mono", monospace;
`;

export const WorkspaceSidebarGroupToggleIcon = styled.span<{ $collapsed?: boolean }>`
  color: var(--si-color-text-secondary);
  font-size: 0.68rem;
  line-height: 1;
  transform: ${({ $collapsed }) => ($collapsed ? "rotate(-90deg)" : "rotate(0deg)")};
  transition: transform 0.18s ease;
`;

export const WorkspaceSidebarGroupBody = styled.div<{ $collapsed?: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? "none" : "grid")};
  gap: 6px;
`;

export const WorkspaceSidebarScrollable = styled.div<{ $layoutMode?: SidebarCardLayoutMode }>`
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-right: 1px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--si-color-accent) 22%, transparent) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--si-color-accent) 20%, transparent);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const WorkspaceSidebarItemButton = styled.button<{ $active?: boolean; $variant?: SidebarItemVariant }>`
  border: 1px solid ${({ $variant = "item", $active }) => resolveSidebarItemBorder($variant, $active)};
  border-radius: ${({ $variant = "item" }) => ($variant === "primary" ? "10px" : "10px")};
  background: ${({ $variant = "item", $active }) => resolveSidebarItemBackground($variant, $active)};
  color: ${({ $variant = "item", $active }) => resolveSidebarItemTextColor($variant, $active)};
  font-size: ${({ $variant = "item" }) => ($variant === "primary" ? "0.7rem" : "0.72rem")};
  font-weight: ${({ $active }) => ($active ? 650 : 600)};
  text-align: left;
  line-height: 1.3;
  min-height: ${({ $variant = "item" }) => ($variant === "primary" ? "30px" : "32px")};
  padding: ${({ $variant = "item" }) => ($variant === "primary" ? "6px 10px" : "7px 10px")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;

  &:hover {
    border-color: var(--workspace-sidebar-item-border-active);
    background: ${({ $variant = "item", $active }) =>
      $active
        ? resolveSidebarItemBackground($variant, true)
        : $variant === "primary"
          ? "color-mix(in srgb, var(--si-color-surface-alt) 82%, transparent)"
          : "color-mix(in srgb, var(--si-color-surface-alt) 62%, transparent)"};
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--si-color-accent) 42%, transparent);
    outline-offset: 2px;
  }
`;
