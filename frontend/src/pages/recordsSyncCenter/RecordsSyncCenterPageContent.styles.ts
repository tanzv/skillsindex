import styled from "@emotion/styled";

import { WorkspaceCodeBlock } from "../workspace/WorkspaceCenterPage.styles";

export const RecordsSyncStack = styled.div`
  display: grid;
  gap: 12px;
`;

export const RecordsSyncCardHeader = styled.div`
  display: grid;
  gap: 6px;
`;

export const RecordsSyncFilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) 160px auto;
  gap: 10px;
  align-items: end;

  .ant-btn {
    min-height: 40px;
    border-radius: 10px;
    padding-inline: 14px;
    font-size: 0.76rem;
    font-weight: 620;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const RecordsSyncFieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const RecordsSyncField = styled.label`
  display: grid;
  gap: 6px;

  .ant-input,
  .ant-select-selector {
    border-radius: 10px !important;
  }

  .ant-input,
  .ant-select-selector,
  .ant-select-single {
    min-height: 40px;
  }

  .ant-select-selector {
    display: flex;
    align-items: center;
  }
`;

export const RecordsSyncFieldLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.2;
`;

export const RecordsSyncRunList = styled.div`
  display: grid;
  gap: 10px;
`;

export const RecordsSyncEmptyState = styled.div`
  min-height: 180px;
  display: grid;
  place-items: center;
  padding: 18px;
  border-radius: 14px;
  border: 1px dashed color-mix(in srgb, var(--si-color-border-soft) 74%, transparent);
  background: color-mix(in srgb, var(--si-color-surface) 76%, transparent);
  color: var(--si-color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: center;
`;

export const RecordsSyncRunRow = styled.article<{ $active: boolean }>`
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--si-color-accent) 42%, transparent)"
        : "color-mix(in srgb, var(--si-color-border-soft) 76%, transparent)"};
  background:
    ${({ $active }) =>
      $active
        ? "linear-gradient(160deg, color-mix(in srgb, var(--si-color-accent) 10%, transparent) 0%, transparent 70%), color-mix(in srgb, var(--si-color-surface) 88%, transparent)"
        : "color-mix(in srgb, var(--si-color-muted-surface) 82%, transparent)"};
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;

  &:hover,
  &:focus-within {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--si-color-accent) 36%, transparent);
  }
`;

export const RecordsSyncRunHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const RecordsSyncRunTitle = styled.strong`
  color: var(--si-color-text-primary);
  font-size: 0.86rem;
  font-weight: 720;
  line-height: 1.25;
`;

export const RecordsSyncTagRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .ant-tag {
    margin-inline-end: 0;
    border-radius: 999px;
    font-size: 0.68rem;
    line-height: 1.15;
    padding: 4px 9px;
  }
`;

export const RecordsSyncMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const RecordsSyncMetaItem = styled.div`
  display: grid;
  gap: 4px;
`;

export const RecordsSyncMetaLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.2;
`;

export const RecordsSyncMetaValue = styled.span`
  color: var(--si-color-text-primary);
  font-size: 0.76rem;
  line-height: 1.45;
  word-break: break-word;
`;

export const RecordsSyncStatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const RecordsSyncStatChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 72%, transparent);
  background: color-mix(in srgb, var(--si-color-surface) 84%, transparent);
  color: var(--si-color-text-secondary);
  font-size: 0.7rem;
  line-height: 1.2;
`;

export const RecordsSyncErrorLine = styled.div`
  color: var(--si-color-danger-text);
  font-size: 0.73rem;
  line-height: 1.45;
  word-break: break-word;
`;

export const RecordsSyncCodeBlock = styled(WorkspaceCodeBlock)`
  max-height: 260px;
  overflow: auto;
`;

export const RecordsSyncDefinitionList = styled.div`
  display: grid;
  gap: 8px;
`;

export const RecordsSyncDefinitionItem = styled.div`
  display: grid;
  gap: 4px;
  padding: 10px 11px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--si-color-border-soft) 72%, transparent);
  background: color-mix(in srgb, var(--si-color-surface) 80%, transparent);
`;

export const RecordsSyncDefinitionLabel = styled.span`
  color: var(--si-color-text-secondary);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.2;
`;

export const RecordsSyncDefinitionValue = styled.span`
  color: var(--si-color-text-primary);
  font-size: 0.76rem;
  line-height: 1.45;
  word-break: break-word;
`;
