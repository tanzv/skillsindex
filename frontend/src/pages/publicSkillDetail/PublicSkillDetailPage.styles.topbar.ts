import { css } from "@emotion/react";

import { buildShellLayoutContract } from "../prototype/pageShellLayoutContract";

export const publicSkillDetailTopbarStyles = css`
  .skill-detail-page.marketplace-home {
    ${buildShellLayoutContract({
      inlineGap: "calc(var(--skill-detail-inline-padding) * 2)",
      topbarMaxWidth: "1360px",
      contentMaxWidth: "1360px"
    })}
  }

  .skill-detail-page.marketplace-home.is-mobile {
    --si-layout-shell-inline-gap: 0.75rem;
  }
`;
