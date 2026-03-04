import styled from "@emotion/styled";

export const WorkspaceContentLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(228px, 268px) minmax(0, 1fr);
  align-items: start;
  gap: 14px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const WorkspaceSidebarCard = styled.aside`
  position: sticky;
  top: 74px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--si-color-accent) 20%, var(--si-color-border));
  background:
    linear-gradient(168deg, rgba(24, 71, 145, 0.22) 0%, rgba(17, 44, 90, 0.08) 42%, rgba(5, 12, 22, 0) 100%),
    color-mix(in srgb, var(--si-color-panel) 80%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--si-color-border-soft) 46%, transparent),
    0 18px 34px rgba(8, 15, 30, 0.26);
  backdrop-filter: blur(10px);
  padding: 12px 12px 14px;
  display: grid;
  gap: 10px;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.7), rgba(59, 130, 246, 0.28) 52%, transparent);
    pointer-events: none;
  }

  @media (max-width: 1120px) {
    position: static;
  }
`;

export const WorkspaceSidebarHeader = styled.div`
  display: grid;
  gap: 4px;
`;

export const WorkspaceSidebarHint = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.74rem;
  line-height: 1.38;
  text-wrap: pretty;
`;

export const WorkspaceSidebarMetaRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const WorkspaceSidebarMetaPill = styled.span<{ $tone?: "neutral" | "accent" }>`
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "accent"
        ? "color-mix(in srgb, var(--si-color-accent) 56%, transparent)"
        : "color-mix(in srgb, var(--si-color-border-soft) 64%, transparent)"};
  background: ${({ $tone }) =>
    $tone === "accent"
      ? "color-mix(in srgb, var(--si-color-accent) 28%, transparent)"
      : "color-mix(in srgb, var(--si-color-surface) 74%, transparent)"};
  color: ${({ $tone }) => ($tone === "accent" ? "var(--si-color-text-inverse)" : "var(--si-color-text-secondary)")};
  font-family: "JetBrains Mono", monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
  padding: 4px 8px;
`;

export const WorkspaceSidebarGroup = styled.section`
  display: grid;
  gap: 7px;
`;

export const WorkspaceSidebarGroupTitle = styled.h3`
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--si-color-text-secondary) 72%, #9ec8ff);
  font-family: "JetBrains Mono", monospace;
`;

export const WorkspaceSidebarItemButton = styled.button<{ $active?: boolean }>`
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, #60a5fa 68%, transparent)"
        : "color-mix(in srgb, var(--si-color-border) 62%, transparent)"};
  border-radius: 11px;
  background:
    ${({ $active }) =>
      $active
        ? "linear-gradient(150deg, rgba(59, 130, 246, 0.68), rgba(37, 99, 235, 0.48))"
        : "linear-gradient(165deg, rgba(30, 64, 125, 0.2), rgba(15, 23, 42, 0.08))"},
    ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--si-color-accent) 52%, transparent)"
      : "color-mix(in srgb, var(--si-color-surface) 78%, transparent)"};
  color: ${({ $active }) => ($active ? "var(--si-color-accent-contrast)" : "var(--si-color-text-primary)")};
  font-size: 0.77rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  text-align: left;
  line-height: 1.3;
  padding: 8px 10px;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 8px 16px rgba(19, 51, 115, 0.26)" : "none")};
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.12s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, #60a5fa 58%, transparent);
    background:
      linear-gradient(165deg, rgba(37, 99, 235, 0.28), rgba(30, 64, 175, 0.12)),
      color-mix(in srgb, var(--si-color-surface-alt) 72%, transparent);
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
