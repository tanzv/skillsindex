import type { ReactNode } from "react";

import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";

interface MarketplaceTopbarBaseProps {
  brandTitle: string;
  brandSubtitle: string;
  onBrandClick: () => void;
  isLightTheme: boolean;
  leftAccessoryContent?: ReactNode;
  belowContent?: ReactNode;
  primaryNavigationContent?: ReactNode;
  primaryTrailingContent?: ReactNode;
  primaryActions?: TopbarActionItem[];
  renderPrimaryActionButton: (action: TopbarActionItem) => ReactNode;
  rightContent: ReactNode;
  shellClassName?: string;
  dataAnimated?: boolean;
}

export default function MarketplaceTopbarBase({
  brandTitle,
  brandSubtitle,
  onBrandClick,
  isLightTheme,
  leftAccessoryContent,
  belowContent,
  primaryNavigationContent,
  primaryTrailingContent,
  primaryActions = [],
  renderPrimaryActionButton,
  rightContent,
  shellClassName = "",
  dataAnimated = false
}: MarketplaceTopbarBaseProps) {
  const resolvedShellClassName = ["marketplace-topbar-shell", shellClassName].filter(Boolean).join(" ");

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

          {leftAccessoryContent ? <div className="marketplace-topbar-left-accessory">{leftAccessoryContent}</div> : null}

          {primaryNavigationContent ? (
            primaryNavigationContent
          ) : primaryActions.length > 0 ? (
            <div className="marketplace-topbar-light-nav" role="group" aria-label="Primary navigation">
              {primaryActions.map((action) => renderPrimaryActionButton(action))}
            </div>
          ) : null}

          {primaryTrailingContent ? (
            <div className="marketplace-topbar-primary-trailing" role="group" aria-label="Primary navigation controls">
              {primaryTrailingContent}
            </div>
          ) : null}
        </div>

        {isLightTheme ? (
          <div className="marketplace-topbar-light-utility" role="group" aria-label="Top utility">
            {rightContent}
          </div>
        ) : (
          <div className="marketplace-topbar-actions">{rightContent}</div>
        )}
      </div>
      {belowContent ? <div className="marketplace-topbar-below-content">{belowContent}</div> : null}
    </header>
  );
}
