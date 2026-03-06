import { Fragment, type ReactNode } from "react";

import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import {
  createMarketplaceTopbarRightRegistry,
  type MarketplaceTopbarRightRegistration,
  type MarketplaceTopbarRightSlot
} from "./MarketplaceTopbar.rightRegistry";

export type MarketplaceTopbarActionNamespace = "primary" | "utility";

export function renderMarketplaceTopbarActionButton(
  action: TopbarActionItem,
  namespace: MarketplaceTopbarActionNamespace
): JSX.Element {
  const actionClassName = [
    namespace === "primary" ? "marketplace-topbar-nav-button" : "marketplace-topbar-utility-button",
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
      <span className="marketplace-topbar-action-label">{action.label}</span>
      {action.badge ? <span className="marketplace-topbar-action-badge">{action.badge}</span> : null}
    </button>
  );
}

interface ResolveMarketplaceTopbarRightRegistrationsInput {
  isLightTheme: boolean;
  localeThemeSwitch?: ReactNode;
  utilityActions?: TopbarActionItem[];
  statusLabel?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
  rightRegistrations?: MarketplaceTopbarRightRegistration[];
}

export function resolveMarketplaceTopbarRightRegistrations({
  isLightTheme,
  localeThemeSwitch,
  utilityActions = [],
  statusLabel,
  secondaryCtaLabel,
  onSecondaryCtaClick,
  ctaLabel,
  onCtaClick,
  rightRegistrations = []
}: ResolveMarketplaceTopbarRightRegistrationsInput): MarketplaceTopbarRightRegistration[] {
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
      render: () => utilityActions.map((action) => renderMarketplaceTopbarActionButton(action, "utility"))
    },
    {
      key: "dark-status",
      slot: "dark",
      order: 10,
      render: () => (statusLabel ? <span className="marketplace-topbar-status">{statusLabel}</span> : null)
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
          <button type="button" className="marketplace-topbar-secondary-cta" onClick={onSecondaryCtaClick}>
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
          <button type="button" className="marketplace-topbar-cta" onClick={onCtaClick}>
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

export function renderMarketplaceTopbarRightRegistrations(
  registrations: MarketplaceTopbarRightRegistration[]
): ReactNode[] {
  return registrations.map((registration) => <Fragment key={registration.key}>{registration.render()}</Fragment>);
}
