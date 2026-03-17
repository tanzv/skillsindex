import type { ReactNode } from "react";
import { useMemo } from "react";

import type { TopbarActionItem } from "../pages/marketplaceHome/MarketplaceHomePage.lightTopbar";
import type { MarketplaceTopbarRightRegistration } from "../pages/marketplacePublic/MarketplaceTopbar.rightRegistry";
import {
  renderAppTopbarActionButton,
  renderAppTopbarRightRegistrations,
  resolveAppTopbarRightRegistrations
} from "./appTopbar.shared";
import AppTopbarBase from "./AppTopbarBase";
import { resolveAppTopbarClassNames, type AppTopbarVariant } from "./appTopbarClassNames";

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
  variant?: AppTopbarVariant;
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
  primaryTrailingContent,
  variant = "marketplace"
}: AppShellTopbarProps) {
  const classNames = useMemo(() => resolveAppTopbarClassNames(variant), [variant]);
  const resolvedRightRegistrations = useMemo(
    () =>
      resolveAppTopbarRightRegistrations({
        isLightTheme,
        localeThemeSwitch,
        utilityActions,
        statusLabel,
        secondaryCtaLabel,
        onSecondaryCtaClick,
        ctaLabel,
        onCtaClick,
        rightRegistrations,
        classNames
      }),
    [
      classNames,
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
    () => renderAppTopbarRightRegistrations(resolvedRightRegistrations),
    [resolvedRightRegistrations]
  );

  return (
    <AppTopbarBase
      brandTitle={brandTitle}
      brandSubtitle={brandSubtitle}
      onBrandClick={onBrandClick}
      isLightTheme={isLightTheme}
      leftAccessoryContent={leftAccessoryContent}
      belowContent={belowContent}
      primaryNavigationContent={primaryNavigationContent}
      primaryTrailingContent={primaryTrailingContent}
      primaryActions={primaryActions}
      renderPrimaryActionButton={(action) => renderAppTopbarActionButton(action, "primary", classNames)}
      rightContent={rightContent}
      classNames={classNames}
      shellClassName={shellClassName}
      dataAnimated={dataAnimated}
    />
  );
}
