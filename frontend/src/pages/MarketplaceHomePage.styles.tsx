import { Global, css } from "@emotion/react";
import { marketplaceHomeResponsiveStyles } from "./MarketplaceHomePage.styles.responsive";
import { marketplaceHomeResultsStyles } from "./MarketplaceHomePage.styles.results";
import { marketplaceHomeResultsPageStyles } from "./MarketplaceHomePage.styles.resultsPage";
import { marketplaceHomeSearchStyles } from "./MarketplaceHomePage.styles.search";
import { marketplaceHomeThemeStyles } from "./MarketplaceHomePage.styles.theme";

const marketplaceHomeStyles = css`
  ${marketplaceHomeThemeStyles}
  ${marketplaceHomeSearchStyles}
  ${marketplaceHomeResultsPageStyles}
  ${marketplaceHomeResultsStyles}
  ${marketplaceHomeResponsiveStyles}
`;

export default function MarketplaceHomePageStyles() {
  return <Global styles={marketplaceHomeStyles} />;
}
