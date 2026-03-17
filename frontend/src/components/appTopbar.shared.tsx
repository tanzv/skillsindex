import { Fragment, type ReactNode } from "react";

import type { TopbarActionItem } from "../pages/marketplaceHome/MarketplaceHomePage.lightTopbar";
import {
  createMarketplaceTopbarRightRegistry,
  type MarketplaceTopbarRightRegistration,
  type MarketplaceTopbarRightSlot
} from "../pages/marketplacePublic/MarketplaceTopbar.rightRegistry";
import { marketplaceTopbarClassNames, type AppTopbarClassNames } from "./appTopbarClassNames";

export type AppTopbarActionNamespace = "primary" | "utility";

export function renderAppTopbarActionButton(
  action: TopbarActionItem,
  namespace: AppTopbarActionNamespace,
  classNames: AppTopbarClassNames = marketplaceTopbarClassNames
): JSX.Element {
  const actionClassName = [
    namespace === "primary" ? classNames.navButton : classNames.utilityButton,
    action.active ? "is-active" : "",
    action.tone ? `is-${action.tone}` : "",
    action.className || ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      key={action.id}
      type="button"
      className={actionClassName}
      onClick={action.onClick}
      disabled={Boolean(action.disabled)}
      aria-label={action.ariaLabel || action.label}
      aria-current={action.active ? "page" : undefined}
    >
      <span className={classNames.actionLabel}>{action.label}</span>
      {action.badge ? <span className={classNames.actionBadge}>{action.badge}</span> : null}
    </button>
  );
}

interface ResolveAppTopbarRightRegistrationsInput {
  isLightTheme: boolean;
  localeThemeSwitch?: ReactNode;
  utilityActions?: TopbarActionItem[];
  statusLabel?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
  rightRegistrations?: MarketplaceTopbarRightRegistration[];
  classNames?: AppTopbarClassNames;
}

export function resolveAppTopbarRightRegistrations({
  isLightTheme,
  localeThemeSwitch,
  utilityActions = [],
  statusLabel,
  secondaryCtaLabel,
  onSecondaryCtaClick,
  ctaLabel,
  onCtaClick,
  rightRegistrations = [],
  classNames = marketplaceTopbarClassNames
}: ResolveAppTopbarRightRegistrationsInput): MarketplaceTopbarRightRegistration[] {
  const defaultRegistrations: MarketplaceTopbarRightRegistration[] = [
    {
      key: "light-locale-switch",
      slot: "light",
      order: 10,
      render: () => localeThemeSwitch || null
    },
    {
      key: "light-utility-actions",
      slot: "light",
      order: 20,
      render: () => utilityActions.map((action) => renderAppTopbarActionButton(action, "utility", classNames))
    },
    {
      key: "dark-status",
      slot: "dark",
      order: 10,
      render: () => (statusLabel ? <span className={classNames.status}>{statusLabel}</span> : null)
    },
    {
      key: "dark-locale-switch",
      slot: "dark",
      order: 20,
      render: () => localeThemeSwitch || null
    },
    {
      key: "dark-secondary-cta",
      slot: "dark",
      order: 30,
      render: () =>
        secondaryCtaLabel && onSecondaryCtaClick ? (
          <button type="button" className={classNames.secondaryCta} onClick={onSecondaryCtaClick}>
            {secondaryCtaLabel}
          </button>
        ) : null
    },
    {
      key: "dark-cta",
      slot: "dark",
      order: 40,
      render: () =>
        ctaLabel && onCtaClick ? (
          <button type="button" className={classNames.cta} onClick={onCtaClick}>
            {ctaLabel}
          </button>
        ) : null
    }
  ];

  const slot: MarketplaceTopbarRightSlot = isLightTheme ? "light" : "dark";
  const registry = createMarketplaceTopbarRightRegistry(defaultRegistrations);
  for (const registration of rightRegistrations) {
    registry.register(registration);
  }
  return registry.resolve(slot);
}

export function renderAppTopbarRightRegistrations(registrations: MarketplaceTopbarRightRegistration[]): ReactNode[] {
  return registrations.map((registration) => <Fragment key={registration.key}>{registration.render()}</Fragment>);
}
