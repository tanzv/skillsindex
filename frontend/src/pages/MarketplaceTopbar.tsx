import { ReactNode, useMemo } from "react";

import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import MarketplaceTopbarBase from "./MarketplaceTopbarBase";
import {
  renderMarketplaceTopbarActionButton,
  renderMarketplaceTopbarRightRegistrations,
  resolveMarketplaceTopbarRightRegistrations
} from "./MarketplaceTopbar.shared";
import type { MarketplaceTopbarRightRegistration } from "./MarketplaceTopbar.rightRegistry";

interface MarketplaceTopbarProps {
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
}

export default function MarketplaceTopbar({
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
  rightRegistrations = []
}: MarketplaceTopbarProps) {
  const resolvedRightRegistrations = useMemo(() => {
    return resolveMarketplaceTopbarRightRegistrations({
      isLightTheme,
      localeThemeSwitch,
      utilityActions,
      statusLabel,
      secondaryCtaLabel,
      onSecondaryCtaClick,
      ctaLabel,
      onCtaClick,
      rightRegistrations
    });
  }, [
    ctaLabel,
    isLightTheme,
    localeThemeSwitch,
    onCtaClick,
    onSecondaryCtaClick,
    rightRegistrations,
    secondaryCtaLabel,
    statusLabel,
    utilityActions
  ]);

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
      primaryActions={primaryActions}
      renderPrimaryActionButton={(action) => renderMarketplaceTopbarActionButton(action, "primary")}
      rightContent={rightContent}
      shellClassName={shellClassName}
      dataAnimated={dataAnimated}
    />
  );
}
