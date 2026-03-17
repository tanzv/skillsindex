import { css } from "@emotion/react";
import { publicSkillDetailBaseStyles } from "./PublicSkillDetailPage.styles.base";
import { publicSkillDetailDocumentStyles } from "./PublicSkillDetailPage.styles.document";
import { publicSkillDetailFileTabsStyles } from "./PublicSkillDetailPage.styles.fileTabs";
import { publicSkillDetailLeftStyles } from "./PublicSkillDetailPage.styles.left";
import { publicSkillDetailLayoutStyles } from "./PublicSkillDetailPage.styles.layout";
import { publicSkillDetailMarketDetailStyles } from "./PublicSkillDetailPage.styles.marketDetail";
import { publicSkillDetailPolishStyles } from "./PublicSkillDetailPage.styles.polish";
import { publicSkillDetailResponsiveStyles } from "./PublicSkillDetailPage.styles.responsive";
import { publicSkillDetailRightStyles } from "./PublicSkillDetailPage.styles.right";

export const publicSkillDetailThemeStyles = css`
  ${publicSkillDetailBaseStyles}
  ${publicSkillDetailFileTabsStyles}
  ${publicSkillDetailLeftStyles}
  ${publicSkillDetailDocumentStyles}
  ${publicSkillDetailRightStyles}
  ${publicSkillDetailMarketDetailStyles}
  ${publicSkillDetailLayoutStyles}
  ${publicSkillDetailResponsiveStyles}
  ${publicSkillDetailPolishStyles}
`;
