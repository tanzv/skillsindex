import styled from "@emotion/styled";

import { PrototypeUtilityShell } from "../prototype/prototypeCssInJs";
import {
  buildShellLayoutContract,
  type ShellLayoutVariant,
  shellLayoutContractVars
} from "../prototype/pageShellLayoutContract";
import { WorkspaceContentLayout } from "./WorkspaceCenterPage.styles";

export const WorkspacePrototypeStage = styled.div`
  min-height: 100dvh;
  overflow: hidden;

  @media (max-width: 1120px) {
    overflow: visible;
  }
`;

export const WorkspacePrototypeRoot = styled.div<{ $layoutVariant?: ShellLayoutVariant }>`
  ${({ $layoutVariant }) =>
    buildShellLayoutContract({
      inlineGap: "1rem",
      topbarMaxWidth: "1412px",
      contentMaxWidth: "1412px",
      layoutVariant: $layoutVariant
    })}
  min-height: 100dvh;
  height: 100dvh;
  padding-bottom: 0;
  gap: 0;
  overflow: hidden;

  @media (max-width: 1120px) {
    min-height: 100dvh;
    height: auto;
    overflow: visible;
  }
`;

export const WorkspacePrototypeUtilityFrame = styled(PrototypeUtilityShell)<{ $layoutVariant?: ShellLayoutVariant }>`
  flex: 1 1 auto;
  min-height: 0;
  width: var(${shellLayoutContractVars.contentWidth});
  max-width: none;
  padding-bottom: 0;
`;

export const WorkspacePrototypeContentLayoutFrame = styled(WorkspaceContentLayout)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
`;

export const WorkspacePrototypePageGrid = styled.div<{ $singleColumn?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $singleColumn }) => ($singleColumn ? "minmax(0, 1fr)" : "auto minmax(0, 1fr)")};
  align-items: start;
  gap: clamp(12px, 1.4vw, 18px);
  min-height: 0;
  height: 100%;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspacePrototypeContentScroll = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: none;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--si-color-accent) 24%, transparent) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--si-color-accent) 20%, transparent);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 1120px) {
    height: auto;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
`;

export const WorkspacePrototypeSummaryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const WorkspacePrototypeEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: color-mix(in srgb, var(--si-color-accent) 78%, var(--si-color-text-secondary));
  font-family: "JetBrains Mono", monospace;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const WorkspacePrototypeSummaryMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspacePrototypeSummaryMetricCard = styled.div`
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--si-color-border) 74%, transparent);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--si-color-accent) 12%, transparent) 0%, transparent 66%),
    color-mix(in srgb, var(--si-color-surface) 82%, transparent);
  padding: 12px 13px;
  display: grid;
  gap: 6px;
`;

export const WorkspacePrototypePanelGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(292px, 0.92fr);
  gap: 14px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspacePrototypePanelStack = styled.div`
  display: grid;
  gap: 14px;
`;

export const WorkspacePrototypeList = styled.div`
  display: grid;
  gap: 10px;
`;

export const WorkspacePrototypeListItem = styled.div`
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--si-color-border) 76%, transparent);
  background: color-mix(in srgb, var(--si-color-surface) 78%, transparent);
  padding: 11px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const WorkspacePrototypeMarker = styled.span<{ $accent?: boolean }>`
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $accent }) =>
      $accent
        ? "color-mix(in srgb, var(--si-color-accent) 72%, transparent)"
        : "color-mix(in srgb, var(--si-color-border-soft) 70%, transparent)"};
  background: ${({ $accent }) =>
    $accent
      ? "color-mix(in srgb, var(--si-color-accent) 22%, transparent)"
      : "color-mix(in srgb, var(--si-color-surface-alt) 68%, transparent)"};
  color: ${({ $accent }) => ($accent ? "var(--si-color-accent-contrast)" : "var(--si-color-text-primary)")};
  font-family: "JetBrains Mono", monospace;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1;
`;

export const WorkspacePrototypeTextStack = styled.div`
  min-width: 0;
  display: grid;
  gap: 5px;
`;

export const WorkspacePrototypeItemTitle = styled.h4`
  margin: 0;
  color: var(--si-color-text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.35;
`;

export const WorkspacePrototypeItemText = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.75rem;
  line-height: 1.52;
  text-wrap: pretty;
`;

export const WorkspacePrototypeActionCluster = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const WorkspacePrototypeInlineMeta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .ant-tag {
    margin-inline-end: 0;
    border-radius: 999px;
    font-size: 0.66rem;
    line-height: 1.1;
    padding: 4px 9px;
    border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 68%, transparent);
    background: color-mix(in srgb, var(--si-color-surface) 84%, transparent);
    color: var(--si-color-text-secondary);
  }
`;

export const WorkspacePrototypeDataList = styled.div`
  display: grid;
  gap: 10px;
`;

export const WorkspacePrototypeDataItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--si-color-border-soft) 56%, transparent);

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const WorkspacePrototypeDataLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-size: 0.74rem;
  line-height: 1.4;
`;

export const WorkspacePrototypeDataValue = styled.strong`
  color: var(--si-color-text-primary);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.35;
`;
