import styled from "@emotion/styled";

import { shellLayoutContractVars } from "./pageShellLayoutContract";

export const PrototypePageGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const PrototypeHeaderLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PrototypeLoadingCenter = styled.div`
  min-height: 280px;
  display: grid;
  place-items: center;
`;

export const PrototypeInfoStack = styled.div`
  display: grid;
  gap: 4px;
`;

export const PrototypeSplitRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

export const PrototypeCenterBody = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
`;

export const PrototypeActionRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const PrototypeMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const PrototypeDeckColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr);
  gap: 10px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeStack = styled.div`
  display: grid;
  gap: 10px;
`;

export const PrototypeFormLabel = styled.label`
  display: grid;
  gap: 5px;
`;

export const PrototypeFieldLabel = styled.span`
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-weight: 700;
  color: #9fc2ec;
`;

export const PrototypeInlineForm = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 8px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeList = styled.div`
  display: grid;
  gap: 8px;
`;

export const PrototypeListRow = styled.div`
  border-radius: 10px;
  border: 1px solid #2d4f82;
  background: #102a4f;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PrototypeListMain = styled.div`
  display: grid;
  gap: 4px;
`;

export const PrototypeListActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const PrototypeEmptyText = styled.p`
  margin: 0;
  color: #b7cde8;
  font-size: 0.76rem;
`;

export const PrototypeSideLinks = styled.div`
  display: grid;
  gap: 8px;
`;

export const PrototypeCodeBlock = styled.pre`
  margin: 0;
  border-radius: 10px;
  border: 1px solid #2d4f82;
  background: #0e2343;
  color: #cbe0ff;
  font-size: 0.72rem;
  line-height: 1.45;
  padding: 9px;
  max-height: 260px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const PrototypeUtilityShell = styled.div`
  --shell-utility-inline-gap: var(${shellLayoutContractVars.inlineGap}, 1rem);
  --shell-utility-top-margin: clamp(6px, 1.2vw, 14px);
  width: var(
    ${shellLayoutContractVars.contentWidth},
    min(var(${shellLayoutContractVars.contentMaxWidth}, 1412px), calc(100% - var(--shell-utility-inline-gap)))
  );
  margin: var(--shell-utility-top-margin) auto 0;
  display: grid;
  gap: 12px;
  padding-bottom: 16px;

  @media (max-width: 960px) {
    --shell-utility-inline-gap: var(${shellLayoutContractVars.inlineGap}, 0.75rem);
    --shell-utility-top-margin: 6px;
  }
`;

export const PrototypeUtilityHeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const PrototypeUtilityPanel = styled.div`
  border-radius: 16px;
  border: 1px solid #2d4f7f;
  background: #102a4f;
  padding: 14px;
  display: grid;
  gap: 12px;
`;

export const PrototypeUtilityLoading = styled.div`
  min-height: 120px;
  display: grid;
  place-items: center;
`;

export const PrototypeTwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeMetricTable = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 0.6fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeMetricTableHead = styled.div`
  color: #8fb3e3;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const PrototypeMetricTableRow = styled.div`
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 1px solid #2e5487;
  background: #14325c;
  padding: 8px;
  display: grid;
  grid-template-columns: minmax(150px, 0.6fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 8px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeMetricTableLabel = styled.span`
  color: #c6dbfb;
  font-size: 0.76rem;
  font-weight: 700;
`;

export const PrototypeMetricTableValue = styled.strong`
  color: #eef6ff;
  font-size: 0.78rem;
  font-weight: 600;
`;

export const PrototypeMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const PrototypeRelatedGrid = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;
