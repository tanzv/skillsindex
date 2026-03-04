import styled from "@emotion/styled";

export const WorkspaceContentLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(216px, 252px) minmax(0, 1fr);
  align-items: start;
  gap: 12px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspaceSidebarCard = styled.aside`
  position: sticky;
  top: 74px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--si-color-border) 72%, transparent);
  background: color-mix(in srgb, var(--si-color-panel) 76%, transparent);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(10px);
  padding: 12px;
  display: grid;
  gap: 12px;

  @media (max-width: 1120px) {
    position: static;
  }
`;

export const WorkspaceSidebarGroup = styled.section`
  display: grid;
  gap: 8px;
`;

export const WorkspaceSidebarGroupTitle = styled.h3`
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
`;

export const WorkspaceSidebarItemButton = styled.button<{ $active?: boolean }>`
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--si-color-accent) 60%, transparent)"
        : "color-mix(in srgb, var(--si-color-border) 62%, transparent)"};
  border-radius: 10px;
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--si-color-accent) 72%, transparent)"
      : "color-mix(in srgb, var(--si-color-surface) 74%, transparent)"};
  color: ${({ $active }) => ($active ? "var(--si-color-accent-contrast)" : "var(--si-color-text-primary)")};
  font-size: 0.78rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  text-align: left;
  line-height: 1.3;
  padding: 9px 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.12s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--si-color-accent) 54%, transparent);
    background: color-mix(in srgb, var(--si-color-surface-alt) 70%, transparent);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--si-color-accent) 74%, transparent);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const WorkspaceMainColumn = styled.div`
  display: grid;
  gap: 12px;
`;

export const WorkspaceSectionAnchor = styled.section`
  display: grid;
  gap: 10px;
  scroll-margin-top: 86px;
`;
