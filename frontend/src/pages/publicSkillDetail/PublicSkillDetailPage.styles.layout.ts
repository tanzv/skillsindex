import { css } from "@emotion/react";

export const publicSkillDetailLayoutStyles = css`
  .skill-detail-page {
    --skill-detail-inline-padding: clamp(14px, 2.2vw, 30px);
    --skill-detail-content-width: min(1360px, calc(100% - (var(--skill-detail-inline-padding) * 2)));
  }

  .skill-detail-page .skill-detail-main .skill-detail-card.is-file-tree.is-preview-only,
  .skill-detail-page .skill-detail-main .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
    border: 0;
    box-shadow: none;
  }

  .skill-detail-page .skill-detail-right-col {
    position: sticky;
    top: 16px;
    align-self: start;
  }

  .skill-detail-page.is-visual-baseline {
    --skill-detail-inline-padding: 0px;
    --skill-detail-content-width: 1360px;
  }

  @media (max-width: 1320px) {
    .skill-detail-page:not(.is-visual-baseline) {
      --skill-detail-inline-padding: clamp(12px, 2.4vw, 24px);
    }
  }

  @media (max-width: 760px) {
    .skill-detail-page:not(.is-visual-baseline) {
      --skill-detail-inline-padding: 12px;
    }
  }
`;
