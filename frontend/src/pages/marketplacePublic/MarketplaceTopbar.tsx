import { ReactNode } from "react";

import AppShellTopbar from "../../components/AppShellTopbar";
import type { TopbarActionItem } from "../marketplaceHome/MarketplaceHomePage.lightTopbar";
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

export default function MarketplaceTopbar(props: MarketplaceTopbarProps) {
  return <AppShellTopbar {...props} />;
}
