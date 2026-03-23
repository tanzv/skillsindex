"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { resolveBrandWordmarkAlt, resolveBrandWordmarkSrc } from "@/src/components/shared/brandWordmark";
import { useThemeAwareFavicon } from "@/src/components/shared/themeAwareFavicon";

import { PublicLink } from "./PublicLink";
import type { PublicTopbarModel } from "./publicShellModel";

export interface PublicTopbarSlots {
  brandContent?: ReactNode;
  primaryNavigationContent?: ReactNode;
  statusContent?: ReactNode;
  actionsContent?: ReactNode;
  utilityActions?: ReactNode;
  belowContent?: ReactNode;
}

interface PublicTopbarProps {
  brandTitle: string;
  brandSubtitle: string;
  isLightTheme: boolean;
  model: PublicTopbarModel;
  messages: Pick<PublicMarketplaceMessages, "shellNavigationAriaLabel" | "themeSwitchAriaLabel" | "localeSwitchAriaLabel">;
  locale: "zh" | "en";
  onLocaleChange: (nextLocale: "zh" | "en") => void;
  slots?: PublicTopbarSlots | null;
}

function resolveButtonClassName(variant: "default" | "primary" | "subtle" | undefined): string {
  if (variant === "primary") {
    return "marketplace-topbar-button is-primary";
  }
  if (variant === "subtle") {
    return "marketplace-topbar-button is-subtle";
  }

  return "marketplace-topbar-button";
}

export function PublicTopbar({ brandTitle, brandSubtitle, isLightTheme, model, messages, locale, onLocaleChange, slots }: PublicTopbarProps) {
  useThemeAwareFavicon(isLightTheme ? "light" : "dark");
  const brandWordmarkSrc = resolveBrandWordmarkSrc(isLightTheme);

  return (
    <header className="marketplace-topbar-shell">
      <div className="marketplace-topbar">
        <div className="marketplace-topbar-main">
          {slots?.brandContent ? (
            slots.brandContent
          ) : (
            <PublicLink href={model.brandHref} className="marketplace-brand">
              <Image
                src={brandWordmarkSrc}
                alt={resolveBrandWordmarkAlt(brandTitle)}
                width={560}
                height={72}
                className="marketplace-brand-wordmark"
              />
              <span className="marketplace-brand-copy marketplace-brand-copy-accessible">
                <strong>{brandTitle}</strong>
                <small>{brandSubtitle}</small>
              </span>
            </PublicLink>
          )}

          {slots?.primaryNavigationContent ? (
            slots.primaryNavigationContent
          ) : (
            <nav className="marketplace-nav-shell" aria-label={messages.shellNavigationAriaLabel}>
              {model.navItems.map((item) => (
                <PublicLink
                  key={item.href}
                  href={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                  className={cn("marketplace-nav-button", item.isActive && "is-active")}
                >
                  {item.label}
                </PublicLink>
              ))}
            </nav>
          )}
        </div>

        <div className="marketplace-topbar-right">
          {slots?.statusContent ? (
            slots.statusContent
          ) : (
            <div className="marketplace-topbar-status-row">
              {model.statusLabels.map((label) => (
                <span key={label} className="marketplace-topbar-status">
                  {label}
                </span>
              ))}
            </div>
          )}

          {slots?.actionsContent ? (
            slots.actionsContent
          ) : (
            <div className="marketplace-topbar-actions">
              {model.utilityLinks.map((item) => (
                <PublicLink key={`${item.href}-${item.label}`} href={item.href} className={resolveButtonClassName(item.variant)}>
                  {item.label}
                </PublicLink>
              ))}

              {slots?.utilityActions}

              <div className="marketplace-topbar-switch" role="group" aria-label={messages.themeSwitchAriaLabel}>
                {model.themeLinks.map((item) => (
                  <a
                    key={`${item.href || item.label}-${item.label}`}
                    href={item.href || "#"}
                    aria-current={item.isActive ? "true" : undefined}
                    className={cn("marketplace-toggle-button", item.isActive && "is-active")}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="marketplace-topbar-switch" role="group" aria-label={messages.localeSwitchAriaLabel}>
                {model.localeActions.map((item, index) => {
                  const nextLocale = index === 0 ? "zh" : "en";

                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={cn("marketplace-toggle-button", item.isActive && "is-active")}
                      onClick={() => onLocaleChange(nextLocale)}
                      aria-pressed={locale === nextLocale}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {slots?.belowContent ? <div className="marketplace-topbar-below">{slots.belowContent}</div> : null}
    </header>
  );
}
