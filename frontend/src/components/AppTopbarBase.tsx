import type { ReactNode } from "react";

import type { TopbarActionItem } from "../pages/marketplaceHome/MarketplaceHomePage.lightTopbar";
import type { AppTopbarClassNames } from "./appTopbarClassNames";

export interface AppTopbarBaseProps {
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
  classNames: AppTopbarClassNames;
  shellClassName?: string;
  dataAnimated?: boolean;
}

export default function AppTopbarBase({
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
  classNames,
  shellClassName = "",
  dataAnimated = false
}: AppTopbarBaseProps) {
  const resolvedShellClassName = [classNames.shell, shellClassName].filter(Boolean).join(" ");

  return (
    <header className={resolvedShellClassName} data-animated={dataAnimated ? "true" : undefined}>
      <div className={classNames.topbar}>
        <div className={classNames.leftGroup}>
          <button type="button" className={classNames.brand} onClick={onBrandClick}>
            <span className={classNames.brandDot}>SI</span>
            <span className={classNames.brandCopy}>
              <strong>{brandTitle}</strong>
              <small>{brandSubtitle}</small>
            </span>
          </button>

          {leftAccessoryContent ? <div className={classNames.leftAccessory}>{leftAccessoryContent}</div> : null}

          {primaryNavigationContent ? (
            primaryNavigationContent
          ) : primaryActions.length > 0 ? (
            <div className={classNames.lightNav} role="group" aria-label="Primary navigation">
              {primaryActions.map((action) => renderPrimaryActionButton(action))}
            </div>
          ) : null}

          {primaryTrailingContent ? (
            <div className={classNames.primaryTrailing} role="group" aria-label="Primary navigation controls">
              {primaryTrailingContent}
            </div>
          ) : null}
        </div>

        {isLightTheme ? (
          <div className={classNames.lightUtility} role="group" aria-label="Top utility">
            {rightContent}
          </div>
        ) : (
          <div className={classNames.actions}>{rightContent}</div>
        )}
      </div>
      {belowContent ? <div className={classNames.belowContent}>{belowContent}</div> : null}
    </header>
  );
}
