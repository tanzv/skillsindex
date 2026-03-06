import styled from "@emotion/styled";

export const WorkspaceSidebarCard = styled.aside`
  position: sticky;
  top: 68px;
  margin-left: -18px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--si-color-accent) 26%, var(--si-color-border-soft));
  background:
    linear-gradient(165deg, color-mix(in srgb, var(--si-color-accent) 16%, transparent) 0%, transparent 58%),
    color-mix(in srgb, var(--si-color-panel) 86%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--si-color-border-soft) 52%, transparent),
    0 18px 34px color-mix(in srgb, #070b13 44%, transparent);
  backdrop-filter: blur(9px);
  padding: 14px 13px 15px;
  height: min(980px, calc(100dvh - 82px));
  min-height: min(760px, calc(100dvh - 82px));
  display: flex;
  flex-direction: column;
  gap: 12px;
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
    margin-left: 0;
    height: auto;
    min-height: 0;
  }
`;

export const WorkspaceSidebarHeader = styled.div`
  display: grid;
  gap: 5px;
`;

export const WorkspaceSidebarTitle = styled.h2`
  margin: 0;
  color: var(--si-color-text-primary);
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 700;
`;

export const WorkspaceSidebarHint = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.73rem;
  line-height: 1.42;
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
`;

export const WorkspaceSidebarScrollable = styled.div`
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding-right: 6px;
  padding-bottom: 2px;
  margin-right: -2px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--si-color-accent) 36%, transparent) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--si-color-accent) 32%, transparent);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
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

export const WorkspaceSidebarItemButton = styled.button<{ $active?: boolean; $variant?: "item" | "label" }>`
  border: 1px solid
    ${({ $active, $variant }) =>
      $variant === "label"
        ? "color-mix(in srgb, var(--si-color-border-soft) 64%, transparent)"
        : $active
          ? "color-mix(in srgb, #60a5fa 68%, transparent)"
          : "color-mix(in srgb, var(--si-color-border) 62%, transparent)"};
  border-style: ${({ $variant }) => ($variant === "label" ? "dashed" : "solid")};
  border-radius: 12px;
  background:
    ${({ $active, $variant }) =>
      $variant === "label"
        ? "linear-gradient(165deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.02))"
        : $active
          ? "linear-gradient(150deg, rgba(59, 130, 246, 0.68), rgba(37, 99, 235, 0.48))"
          : "linear-gradient(165deg, rgba(30, 64, 125, 0.2), rgba(15, 23, 42, 0.08))"},
    ${({ $active, $variant }) =>
      $variant === "label"
        ? "color-mix(in srgb, var(--si-color-surface-alt) 56%, transparent)"
        : $active
          ? "color-mix(in srgb, var(--si-color-accent) 52%, transparent)"
          : "color-mix(in srgb, var(--si-color-surface) 78%, transparent)"};
  color: ${({ $active, $variant }) =>
    $variant === "label"
      ? "color-mix(in srgb, var(--si-color-text-secondary) 78%, #9ec8ff)"
      : $active
        ? "var(--si-color-accent-contrast)"
        : "var(--si-color-text-primary)"};
  font-size: ${({ $variant }) => ($variant === "label" ? "0.68rem" : "0.78rem")};
  font-weight: ${({ $active, $variant }) => ($variant === "label" ? 700 : $active ? 700 : 600)};
  letter-spacing: ${({ $variant }) => ($variant === "label" ? "0.06em" : "normal")};
  text-transform: ${({ $variant }) => ($variant === "label" ? "uppercase" : "none")};
  text-align: left;
  line-height: 1.34;
  min-height: 34px;
  padding: 8px 11px;
  display: flex;
  align-items: center;
  cursor: ${({ $variant }) => ($variant === "label" ? "default" : "pointer")};
  box-shadow: ${({ $active, $variant }) =>
    $variant === "label" ? "none" : $active ? "0 8px 16px rgba(19, 51, 115, 0.26)" : "none"};
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.12s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ $variant }) =>
      $variant === "label"
        ? "color-mix(in srgb, var(--si-color-border-soft) 64%, transparent)"
        : "color-mix(in srgb, #60a5fa 58%, transparent)"};
    background:
      ${({ $variant }) =>
        $variant === "label"
          ? "linear-gradient(165deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.02))"
          : "linear-gradient(165deg, rgba(37, 99, 235, 0.28), rgba(30, 64, 175, 0.12))"},
      ${({ $variant }) =>
        $variant === "label"
          ? "color-mix(in srgb, var(--si-color-surface-alt) 56%, transparent)"
          : "color-mix(in srgb, var(--si-color-surface-alt) 72%, transparent)"};
  }

  &:focus-visible {
    outline: ${({ $variant }) =>
      $variant === "label" ? "none" : "2px solid color-mix(in srgb, var(--si-color-accent) 74%, transparent)"};
    outline-offset: 2px;
  }

  &:active {
    transform: ${({ $variant }) => ($variant === "label" ? "none" : "translateY(1px)")};
  }

  &[aria-disabled="true"] {
    pointer-events: none;
  }
`;
