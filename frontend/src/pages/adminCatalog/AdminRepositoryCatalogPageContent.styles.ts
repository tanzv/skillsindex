import styled from "@emotion/styled";

import WorkspaceSurfaceCard from "../workspace/WorkspaceSurfaceCard";
import {
  WorkspaceActionCluster,
  WorkspaceActionClusterTitle,
  WorkspaceActionRow,
  WorkspaceCodeBlock,
  WorkspaceHeroSubtitle,
  WorkspaceHeroTextStack,
  WorkspaceHeroTitle,
  WorkspaceInlineMetricGrid,
  WorkspaceInlineMetricItem,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQuickActionGrid,
  WorkspaceSubpageGrid,
  WorkspaceSubpageRail
} from "../workspace/WorkspaceCenterPage.styles";
import {
  WorkspacePrototypeDataItem,
  WorkspacePrototypeDataLabel,
  WorkspacePrototypeDataList,
  WorkspacePrototypeDataValue,
  WorkspacePrototypeInlineMeta,
  WorkspacePrototypeSummaryHeader,
  WorkspacePrototypeSummaryMetricCard,
  WorkspacePrototypeSummaryMetricGrid
} from "../workspace/WorkspacePrototypePageShell.styles";

export const RepositoryPageRoot = styled.div`
  --repository-card-border: color-mix(in srgb, var(--si-color-border) 84%, transparent);
  --repository-card-border-strong: color-mix(in srgb, var(--si-color-border-soft) 84%, transparent);
  --repository-panel-surface: color-mix(in srgb, var(--si-color-surface) 88%, var(--si-color-panel) 12%);
  --repository-panel-surface-soft: color-mix(in srgb, var(--si-color-surface) 82%, var(--si-color-panel) 18%);
  --repository-panel-muted: color-mix(in srgb, var(--si-color-surface-alt) 72%, transparent);
  display: grid;
  gap: 16px;

  .ant-alert {
    border-radius: 14px;
    border-color: var(--repository-card-border);
    background: color-mix(in srgb, var(--repository-panel-surface) 90%, transparent);
    box-shadow: none;
  }

  .ant-alert .ant-alert-message,
  .ant-alert .ant-alert-description {
    color: var(--si-color-text-primary);
  }

  .ant-btn {
    box-shadow: none !important;
    transition:
      border-color 160ms ease,
      background-color 160ms ease,
      color 160ms ease;
  }

  .ant-btn-default {
    border-color: var(--repository-card-border);
    background: color-mix(in srgb, var(--repository-panel-surface) 94%, transparent);
    color: var(--si-color-text-primary);
  }

  .ant-btn-default:hover,
  .ant-btn-default:focus {
    border-color: var(--repository-card-border-strong);
    background: color-mix(in srgb, var(--repository-panel-surface-soft) 96%, transparent);
    color: var(--si-color-text-primary);
  }

  .ant-btn-primary {
    border-color: color-mix(in srgb, var(--si-color-accent) 26%, var(--repository-card-border) 74%);
    background: color-mix(in srgb, var(--si-color-accent) 16%, var(--repository-panel-surface) 84%);
    color: var(--si-color-text-primary);
  }

  .ant-btn-primary:hover,
  .ant-btn-primary:focus {
    border-color: color-mix(in srgb, var(--si-color-accent) 34%, var(--repository-card-border-strong) 66%);
    background: color-mix(in srgb, var(--si-color-accent) 22%, var(--repository-panel-surface-soft) 78%);
    color: var(--si-color-text-primary);
  }

  .ant-tag {
    margin-inline-end: 0;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--repository-card-border);
    background: color-mix(in srgb, var(--repository-panel-surface-soft) 92%, transparent);
    color: var(--si-color-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 0.64rem;
    font-weight: 700;
    line-height: 1;
  }

  .ant-switch {
    background: color-mix(in srgb, var(--si-color-surface-alt) 68%, transparent);
  }

  .ant-switch.ant-switch-checked {
    background: color-mix(in srgb, var(--si-color-accent) 84%, transparent);
  }

  .ant-input,
  .ant-select-selector {
    border-radius: 12px !important;
    border-color: var(--repository-card-border) !important;
    background: color-mix(in srgb, var(--repository-panel-surface) 96%, transparent) !important;
    color: var(--si-color-text-primary) !important;
    box-shadow: none !important;
  }

  .ant-input::placeholder {
    color: var(--si-color-text-secondary);
  }
`;

export const RepositoryHeroCard = styled(WorkspaceSurfaceCard)`
  border-radius: 18px !important;
  border: 1px solid var(--repository-card-border-strong) !important;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--repository-panel-surface) 92%, transparent) 0%, color-mix(in srgb, var(--repository-panel-surface-soft) 100%, transparent) 100%) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;

  .ant-card-body {
    padding: 20px 22px 18px !important;
    gap: 16px !important;
  }
`;

export const RepositoryPanelCard = styled(WorkspaceSurfaceCard)`
  border-radius: 16px !important;
  border: 1px solid var(--repository-card-border) !important;
  background: color-mix(in srgb, var(--repository-panel-surface) 96%, transparent) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;

  .ant-card-body {
    padding: 18px !important;
    gap: 14px !important;
  }
`;

export const RepositoryQuickCard = styled(WorkspaceSurfaceCard)`
  border-radius: 16px !important;
  border: 1px solid color-mix(in srgb, var(--si-color-accent) 18%, var(--repository-card-border) 82%) !important;
  background: color-mix(in srgb, var(--repository-panel-surface) 96%, transparent) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;

  .ant-card-body {
    padding: 18px !important;
    gap: 14px !important;
  }
`;

export const RepositorySummaryHeader = styled(WorkspacePrototypeSummaryHeader)`
  gap: 16px;
`;

export const RepositoryHeroTextStack = styled(WorkspaceHeroTextStack)`
  max-width: 70ch;
  gap: 10px;
`;

export const RepositoryHeroTitle = styled(WorkspaceHeroTitle)`
  font-family: "IBM Plex Sans", "Noto Sans", sans-serif;
  font-size: clamp(1.48rem, 2.2vw, 2rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
`;

export const RepositoryHeroSubtitle = styled(WorkspaceHeroSubtitle)`
  max-width: 72ch;
  font-size: 0.8rem;
  line-height: 1.6;
`;

export const RepositoryActionRow = styled(WorkspaceActionRow)`
  .ant-btn {
    min-height: 36px;
    padding-inline: 16px;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
  }
`;

export const RepositoryInlineMeta = styled(WorkspacePrototypeInlineMeta)`
  gap: 8px;

  .ant-tag {
    min-height: 30px;
    padding: 0 12px;
    border: 1px solid var(--repository-card-border);
    background: color-mix(in srgb, var(--repository-panel-surface-soft) 94%, transparent);
    color: var(--si-color-text-secondary);
    font-size: 0.62rem;
    letter-spacing: 0.03em;
  }
`;

export const RepositorySummaryMetricGrid = styled(WorkspacePrototypeSummaryMetricGrid)`
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

export const RepositorySummaryMetricCard = styled(WorkspacePrototypeSummaryMetricCard)`
  border-radius: 14px;
  border-color: var(--repository-card-border);
  background: color-mix(in srgb, var(--repository-panel-surface-soft) 96%, transparent);
  padding: 12px 14px;
  gap: 8px;
`;

export const RepositoryMetricLabel = styled(WorkspaceMetricLabel)`
  font-size: 0.62rem;
  letter-spacing: 0.08em;
`;

export const RepositoryMetricValue = styled(WorkspaceMetricValue)`
  font-family: "JetBrains Mono", monospace;
  font-size: 1rem;
  line-height: 1.35;
  letter-spacing: 0;
`;

export const RepositoryPanelHeading = styled(WorkspacePanelHeading)`
  font-size: 0.92rem;
`;

export const RepositoryMutedText = styled(WorkspaceMutedText)`
  font-size: 0.75rem;
  line-height: 1.56;
`;

export const RepositorySubpageGrid = styled(WorkspaceSubpageGrid)`
  grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
  gap: 16px;
`;

export const RepositorySubpageRail = styled(WorkspaceSubpageRail)`
  gap: 16px;
`;

export const RepositoryInlineMetricGrid = styled(WorkspaceInlineMetricGrid)`
  gap: 10px;
`;

export const RepositoryInlineMetricItem = styled(WorkspaceInlineMetricItem)`
  min-height: 76px;
  border-radius: 14px;
  border-color: var(--repository-card-border);
  background: color-mix(in srgb, var(--repository-panel-surface-soft) 96%, transparent);
  padding: 12px 14px;
`;

export const RepositoryActionCluster = styled(WorkspaceActionCluster)`
  gap: 12px;
`;

export const RepositoryActionClusterTitle = styled(WorkspaceActionClusterTitle)`
  font-size: 0.82rem;
`;

export const RepositoryQuickActionGrid = styled(WorkspaceQuickActionGrid)`
  .ant-btn {
    min-height: 38px;
    border-radius: 10px;
    justify-content: center;
    padding-inline: 14px;
  }
`;

export const RepositoryCodeBlock = styled(WorkspaceCodeBlock)`
  border-radius: 14px;
  border-color: var(--repository-card-border);
  background: color-mix(in srgb, var(--si-color-panel) 94%, transparent);
  padding: 14px 16px;
  box-shadow: none;
`;

export const RepositoryDataList = styled(WorkspacePrototypeDataList)`
  gap: 12px;
`;

export const RepositoryDataItem = styled(WorkspacePrototypeDataItem)`
  padding-bottom: 12px;
  border-bottom-color: color-mix(in srgb, var(--si-color-border-soft) 50%, transparent);
`;

export const RepositoryDataLabel = styled(WorkspacePrototypeDataLabel)`
  font-size: 0.72rem;
  line-height: 1.5;
`;

export const RepositoryDataValue = styled(WorkspacePrototypeDataValue)`
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
  line-height: 1.45;
`;

export const RepositoryStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const RepositoryRouteBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--repository-card-border);
  background: color-mix(in srgb, var(--repository-panel-muted) 92%, transparent);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const RepositoryRouteButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "var(--repository-card-border-strong)" : "transparent")};
  border-radius: 10px;
  background: ${({ $active }) => ($active ? "color-mix(in srgb, var(--repository-panel-surface) 98%, transparent)" : "transparent")};
  padding: 12px 13px;
  display: grid;
  gap: 5px;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease;

  &:hover {
    border-color: var(--repository-card-border);
    background: color-mix(in srgb, var(--repository-panel-surface-soft) 94%, transparent);
  }
`;

export const RepositoryRouteLabel = styled.span`
  color: var(--si-color-text-primary);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.3;
`;

export const RepositoryRouteHint = styled.span`
  color: var(--si-color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
`;

export const RepositoryTableWrap = styled.div`
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid var(--repository-card-border);
  background: color-mix(in srgb, var(--repository-panel-surface-soft) 96%, transparent);
`;

export const RepositoryTable = styled.table`
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;

  thead {
    background: color-mix(in srgb, var(--repository-panel-muted) 90%, transparent);
  }

  th,
  td {
    padding: 11px 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--si-color-border-soft) 44%, transparent);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--si-color-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.2;
    white-space: nowrap;
  }

  td {
    color: var(--si-color-text-primary);
    font-size: 0.76rem;
    line-height: 1.55;
  }

  tbody tr:hover td {
    background: color-mix(in srgb, var(--repository-panel-muted) 68%, transparent);
  }

  tbody tr:last-of-type td {
    border-bottom: none;
  }
`;

export const RepositoryTableMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const RepositoryEmptyState = styled.div`
  min-height: 180px;
  display: grid;
  place-items: center;
  color: var(--si-color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: center;
`;

export const RepositoryFieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const RepositoryField = styled.label`
  display: grid;
  gap: 7px;

  .ant-input,
  .ant-select-selector {
    min-height: 40px;
  }

  .ant-select-selector {
    display: flex;
    align-items: center;
  }
`;

export const RepositoryFieldLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
`;

export const RepositoryHintList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: var(--si-color-text-secondary);
  font-size: 0.75rem;
  line-height: 1.58;
`;

export const RepositoryMetricHelp = styled.span`
  color: var(--si-color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.45;
`;
