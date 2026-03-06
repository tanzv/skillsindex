import { css } from "@emotion/react";
import { publicSkillDetailBaseStyles } from "./PublicSkillDetailPage.styles.base";
import { publicSkillDetailDocumentStyles } from "./PublicSkillDetailPage.styles.document";
import { publicSkillDetailFileTabsStyles } from "./PublicSkillDetailPage.styles.fileTabs";
import { publicSkillDetailLeftStyles } from "./PublicSkillDetailPage.styles.left";
import { publicSkillDetailLayoutStyles } from "./PublicSkillDetailPage.styles.layout";
import { publicSkillDetailResponsiveStyles } from "./PublicSkillDetailPage.styles.responsive";
import { publicSkillDetailRightStyles } from "./PublicSkillDetailPage.styles.right";
import { publicSkillDetailTopbarStyles } from "./PublicSkillDetailPage.styles.topbar";

export const publicSkillDetailThemeStyles = css`
  ${publicSkillDetailBaseStyles}
  ${publicSkillDetailTopbarStyles}
  ${publicSkillDetailFileTabsStyles}
  ${publicSkillDetailLeftStyles}
  ${publicSkillDetailDocumentStyles}
  ${publicSkillDetailRightStyles}
  ${publicSkillDetailLayoutStyles}
  ${publicSkillDetailResponsiveStyles}
`;
