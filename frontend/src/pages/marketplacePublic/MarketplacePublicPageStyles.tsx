import { Global, css } from "@emotion/react";
import { marketplaceHomeDimensionTokenStyles } from "../MarketplaceHomePage.styles.dimensionTokens";
import { marketplaceHomeResponsiveStyles } from "../MarketplaceHomePage.styles.responsive";
import { marketplaceHomeResultsStyles } from "../MarketplaceHomePage.styles.results";
import { marketplaceHomeResultsPageStyles } from "../MarketplaceHomePage.styles.resultsPage";
import { marketplaceHomeSearchStyles } from "../MarketplaceHomePage.styles.search";
import { marketplaceHomeThemeStyles } from "../MarketplaceHomePage.styles.theme";

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
