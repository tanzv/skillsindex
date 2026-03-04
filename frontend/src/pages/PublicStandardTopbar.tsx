import { ReactNode } from "react";
import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";

interface PublicStandardTopbarProps {
  brandTitle: string;
  brandSubtitle: string;
  onBrandClick: () => void;
  isLightTheme: boolean;
  primaryActions?: TopbarActionItem[];
  utilityActions?: TopbarActionItem[];
  localeThemeSwitch?: ReactNode;
  statusLabel?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  shellClassName?: string;
  dataAnimated?: boolean;
}

export default function PublicStandardTopbar({
  brandTitle,
  brandSubtitle,
  onBrandClick,
  isLightTheme,
  primaryActions = [],
  utilityActions = [],
  localeThemeSwitch,
  statusLabel,
  ctaLabel,
  onCtaClick,
  shellClassName = "",
  dataAnimated = false
}: PublicStandardTopbarProps) {
  const resolvedShellClassName = ["marketplace-topbar-shell", shellClassName].filter(Boolean).join(" ");

  function renderActionButton(action: TopbarActionItem, namespace: "primary" | "utility") {
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

  return (
    <header className={resolvedShellClassName} data-animated={dataAnimated ? "true" : undefined}>
      <div className="marketplace-topbar">
        <div className="marketplace-topbar-left-group">
          <button type="button" className="marketplace-topbar-brand" onClick={onBrandClick}>
            <span className="marketplace-topbar-brand-dot">SI</span>
            <span className="marketplace-topbar-brand-copy">
              <strong>{brandTitle}</strong>
              <small>{brandSubtitle}</small>
            </span>
          </button>

          {primaryActions.length > 0 ? (
            <div className="marketplace-topbar-light-nav" role="group" aria-label="Primary navigation">
              {primaryActions.map((action) => renderActionButton(action, "primary"))}
            </div>
          ) : null}
        </div>

        {isLightTheme ? (
          <div className="marketplace-topbar-light-utility" role="group" aria-label="Top utility">
            {localeThemeSwitch}
            {utilityActions.map((action) => renderActionButton(action, "utility"))}
          </div>
        ) : (
          <div className="marketplace-topbar-actions">
            {statusLabel ? <span className="marketplace-topbar-status">{statusLabel}</span> : null}
            {localeThemeSwitch}
            {ctaLabel && onCtaClick ? (
              <button type="button" className="marketplace-topbar-cta" onClick={onCtaClick}>
                {ctaLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
