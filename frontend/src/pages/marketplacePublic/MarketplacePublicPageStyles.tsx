import { Global, css } from "@emotion/react";
import { marketplaceHomeDimensionTokenStyles } from "../marketplaceHome/MarketplaceHomePage.styles.dimensionTokens";
import { marketplaceHomeResponsiveStyles } from "../marketplaceHome/MarketplaceHomePage.styles.responsive";
import { marketplaceHomeResultsStyles } from "../marketplaceHome/MarketplaceHomePage.styles.results";
import { marketplaceHomeResultsPageStyles } from "../marketplaceHome/MarketplaceHomePage.styles.resultsPage";
import { marketplaceHomeSearchStyles } from "../marketplaceHome/MarketplaceHomePage.styles.search";
import { marketplaceHomeThemeStyles } from "../marketplaceHome/MarketplaceHomePage.styles.theme";

const marketplacePublicPageStyles = css`
  ${marketplaceHomeThemeStyles}
  ${marketplaceHomeDimensionTokenStyles}
  ${marketplaceHomeSearchStyles}
  ${marketplaceHomeResultsPageStyles}
  ${marketplaceHomeResultsStyles}
  ${marketplaceHomeResponsiveStyles}
`;

export default function MarketplacePublicPageStyles() {
  return <Global styles={marketplacePublicPageStyles} />;
}
