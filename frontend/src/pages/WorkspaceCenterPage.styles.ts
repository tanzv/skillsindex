import styled from "@emotion/styled";

export const WorkspaceContentLayout = styled.div`
  display: block;
  align-items: start;
  width: 100%;
`;

export const WorkspaceMainColumn = styled.div`
  display: grid;
  gap: 14px;
`;

export const WorkspaceSectionAnchor = styled.section`
  display: grid;
  gap: 12px;
  scroll-margin-top: 86px;
`;

export const WorkspaceHeroTextStack = styled.div`
  max-width: 64ch;
  display: grid;
  gap: 8px;
`;

export const WorkspaceHeroTitle = styled.h2`
  margin: 0;
  color: var(--si-color-text-primary);
  font-family: "Syne", sans-serif;
  font-size: clamp(1.16rem, 2.1vw, 1.62rem);
  line-height: 1.18;
  letter-spacing: 0.01em;
`;

export const WorkspaceHeroSubtitle = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.82rem;
  line-height: 1.5;
  text-wrap: pretty;
`;

export const WorkspaceActionRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  .ant-btn {
    border-radius: 10px;
    min-height: 34px;
    padding-inline: 14px;
    font-size: 0.76rem;
    font-weight: 600;
  }
`;

export const WorkspaceMetricLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.2;
`;

export const WorkspaceMetricValue = styled.strong`
  color: var(--si-color-text-primary);
  font-size: 1.18rem;
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: 0.01em;
`;

export const WorkspacePanelHeading = styled.h3`
  margin: 0;
  color: var(--si-color-text-primary);
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.3;
`;

export const WorkspaceMutedText = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.74rem;
  line-height: 1.45;
`;

export const WorkspaceTagCloud = styled.div`
  display: flex;
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

export const WorkspaceQueueLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .ant-tag {
    margin-inline-end: 0;
    border-radius: 999px;
    font-size: 0.67rem;
    padding: 3px 9px;
    border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 70%, transparent);
    background: color-mix(in srgb, var(--si-color-surface) 82%, transparent);
  }
`;

export const WorkspaceSegmentHint = styled.p`
  margin: 0;
  color: var(--si-color-text-secondary);
  font-size: 0.73rem;
  line-height: 1.4;
`;

export const WorkspaceQuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  .ant-btn {
    width: 100%;
    border-radius: 10px;
    min-height: 34px;
    font-size: 0.75rem;
    font-weight: 620;
    justify-content: flex-start;
    padding-inline: 12px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;


export const WorkspaceSubpageGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.24fr) minmax(280px, 0.96fr);
  gap: 12px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspaceSubpageRail = styled.div`
  display: grid;
  gap: 12px;
`;

export const WorkspaceInlineMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const WorkspaceInlineMetricItem = styled.div`
  display: grid;
  gap: 4px;
  min-height: 72px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 70%, transparent);
  background: color-mix(in srgb, var(--si-color-surface) 78%, transparent);
  padding: 10px 11px;
`;

export const WorkspaceCodeBlock = styled.pre`
  margin: 0;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 72%, transparent);
  background: color-mix(in srgb, var(--si-color-panel) 88%, transparent);
  color: color-mix(in srgb, var(--si-color-text-primary) 92%, #d6ebff);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.72rem;
  line-height: 1.55;
  padding: 12px 13px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const WorkspaceActionCluster = styled.div`
  display: grid;
  gap: 9px;
`;

export const WorkspaceActionClusterTitle = styled.h4`
  margin: 0;
  color: var(--si-color-text-primary);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.25;
`;
