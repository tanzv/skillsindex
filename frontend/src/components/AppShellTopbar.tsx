import type { ReactNode } from "react";
import { useMemo } from "react";

import type { TopbarActionItem } from "../pages/marketplaceHome/MarketplaceHomePage.lightTopbar";
import MarketplaceTopbarBase from "../pages/marketplacePublic/MarketplaceTopbarBase";
import type { MarketplaceTopbarRightRegistration } from "../pages/marketplacePublic/MarketplaceTopbar.rightRegistry";
import {
  renderMarketplaceTopbarActionButton,
  renderMarketplaceTopbarRightRegistrations,
  resolveMarketplaceTopbarRightRegistrations
} from "../pages/marketplacePublic/MarketplaceTopbar.shared";

export interface AppShellTopbarProps {
  brandTitle: string;
  brandSubtitle: string;
  onBrandClick: () => void;
  isLightTheme: boolean;
  primaryActions?: TopbarActionItem[];
  utilityActions?: TopbarActionItem[];
  localeThemeSwitch?: ReactNode;
  statusLabel?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
  shellClassName?: string;
  dataAnimated?: boolean;
  rightRegistrations?: MarketplaceTopbarRightRegistration[];
  leftAccessoryContent?: ReactNode;
  belowContent?: ReactNode;
  primaryNavigationContent?: ReactNode;
  primaryTrailingContent?: ReactNode;
}

export default function AppShellTopbar({
  brandTitle,
  brandSubtitle,
  onBrandClick,
  isLightTheme,
  primaryActions = [],
  utilityActions = [],
  localeThemeSwitch,
  statusLabel,
  secondaryCtaLabel,
  onSecondaryCtaClick,
  ctaLabel,
  onCtaClick,
  shellClassName = "",
  dataAnimated = false,
  rightRegistrations = [],
  leftAccessoryContent,
  belowContent,
  primaryNavigationContent,
  primaryTrailingContent
}: AppShellTopbarProps) {
  const resolvedRightRegistrations = useMemo(
    () =>
      resolveMarketplaceTopbarRightRegistrations({
        isLightTheme,
        localeThemeSwitch,
        utilityActions,
        statusLabel,
        secondaryCtaLabel,
        onSecondaryCtaClick,
        ctaLabel,
        onCtaClick,
        rightRegistrations
      }),
    [
      ctaLabel,
      isLightTheme,
      localeThemeSwitch,
      onCtaClick,
      onSecondaryCtaClick,
      rightRegistrations,
      secondaryCtaLabel,
      statusLabel,
      utilityActions
    ]
  );

  const rightContent = useMemo(
    () => renderMarketplaceTopbarRightRegistrations(resolvedRightRegistrations),
    [resolvedRightRegistrations]
  );

  return (
    <MarketplaceTopbarBase
      brandTitle={brandTitle}
      brandSubtitle={brandSubtitle}
      onBrandClick={onBrandClick}
      isLightTheme={isLightTheme}
      leftAccessoryContent={leftAccessoryContent}
      belowContent={belowContent}
      primaryNavigationContent={primaryNavigationContent}
      primaryTrailingContent={primaryTrailingContent}
      primaryActions={primaryActions}
      renderPrimaryActionButton={(action) => renderMarketplaceTopbarActionButton(action, "primary")}
      rightContent={rightContent}
      shellClassName={shellClassName}
      dataAnimated={dataAnimated}
    />
  );
}
