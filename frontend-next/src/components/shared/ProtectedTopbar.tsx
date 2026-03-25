"use client";

import { PanelLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { DropdownMenu } from "@/src/components/ui/dropdown-menu";

import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import type { ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";
import type { ProtectedTopbarConfig } from "@/src/lib/navigation/protectedTopbarContracts";
import { buildProtectedTopbarModel } from "./protectedTopbarModel";
import type { AccountCenterMenuConfig } from "./accountCenterMenu.types";
import { AccountCenterMenu } from "./AccountCenterMenu";
import { ProtectedTopbarOverflowPanel } from "./ProtectedTopbarOverflowPanel";
import { ProtectedTopbarPrimaryNav } from "./ProtectedTopbarPrimaryNav";
import { useThemeAwareFavicon } from "./themeAwareFavicon";
import { useProtectedTopbarLayout } from "./useProtectedTopbarLayout";
import navStyles from "./ProtectedTopbarNav.module.scss";
import styles from "./ProtectedTopbar.module.scss";

type ProtectedThemePreference = "light" | "dark";

export interface ProtectedTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle?: string;
  brandHref: string;
  config: ProtectedTopbarConfig;
  accountCenterMenu: AccountCenterMenuConfig;
  accountMenuTriggerVariant?: "pill" | "avatar";
  dataTestId: string;
  navigationAriaLabel: string;
  messages: ProtectedTopbarMessages;
  utilityLink?: {
    href: string;
    label: string;
  };
  theme: ProtectedThemePreference;
  onThemeChange: (nextTheme: ProtectedThemePreference) => void;
  defaultOverflowExpanded?: boolean;
  onOpenNavigation?: () => void;
  navigationToggleLabel?: string;
  navigationToggleTestId?: string;
  navigationToggleControlsId?: string;
  navigationToggleExpanded?: boolean;
}

function resolveProtectedBrandWordmarkSrc(theme: ProtectedThemePreference) {
  return theme === "dark" ? "/brand/skillsindex-wordmark-light.svg" : "/brand/skillsindex-wordmark-dark.svg";
}

export function ProtectedTopbar({
  pathname,
  session,
  brandTitle,
  brandHref,
  config,
  accountCenterMenu,
  accountMenuTriggerVariant = "pill",
  dataTestId,
  navigationAriaLabel,
  messages,
  utilityLink,
  theme,
  onThemeChange,
  defaultOverflowExpanded = false,
  onOpenNavigation,
  navigationToggleLabel = "Open navigation",
  navigationToggleTestId,
  navigationToggleControlsId,
  navigationToggleExpanded = false
}: ProtectedTopbarProps) {
  useThemeAwareFavicon(theme);
  const overflowPanelId = `${dataTestId}-overflow-panel-region`;
  const {
    hasMeasuredPrimaryNavigation,
    isOverflowExpanded,
    overflowScopeRef,
    primaryNavigationRef,
    primaryVisibleCount,
    setIsOverflowExpanded,
    showNavigationToggle
  } = useProtectedTopbarLayout({
    config,
    defaultOverflowExpanded
  });
  const model = useMemo(() => buildProtectedTopbarModel(pathname, config, primaryVisibleCount), [config, pathname, primaryVisibleCount]);
  const hasOverflow = model.hiddenEntries.length > 0;
  const overflowExpanded = hasOverflow && isOverflowExpanded;
  const brandLinkLabel = `Open ${brandTitle} home`;
  const brandLinkTitle = `${brandTitle} control hub`;
  const brandWordmarkSrc = resolveProtectedBrandWordmarkSrc(theme);
  const brandWordmarkAlt = `${brandTitle} wordmark`;

  return (
    <div ref={overflowScopeRef} className={styles.interactionScope} data-testid={dataTestId}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <div className={styles.headerRow} data-testid={`${dataTestId}-header-row`}>
            <div className={styles.leadingGroup}>
              {onOpenNavigation ? (
                <button
                  type="button"
                  data-testid={navigationToggleTestId}
                  className={styles.menuTrigger}
                  style={showNavigationToggle ? { display: "inline-flex" } : undefined}
                  aria-label={navigationToggleLabel}
                  aria-controls={navigationToggleControlsId}
                  aria-expanded={navigationToggleExpanded}
                  onClick={onOpenNavigation}
                >
                  <PanelLeft className={styles.menuTriggerIcon} />
                </button>
              ) : null}

              <Link
                href={brandHref}
                className={cn(styles.brandLink, styles.brandLinkCompact)}
                aria-label={brandLinkLabel}
                title={brandLinkTitle}
              >
                <Image
                  src={brandWordmarkSrc}
                  alt={brandWordmarkAlt}
                  width={560}
                  height={72}
                  className={styles.brandWordmark}
                />
              </Link>

              <div className={styles.navigationRow} data-testid={`${dataTestId}-nav-row`}>
                <DropdownMenu modal={false} open={overflowExpanded} onOpenChange={setIsOverflowExpanded}>
                  <ProtectedTopbarPrimaryNav
                    navigationRef={primaryNavigationRef}
                    navigationAriaLabel={navigationAriaLabel}
                    hasMeasuredPrimaryNavigation={hasMeasuredPrimaryNavigation}
                    model={model}
                    dataTestId={dataTestId}
                    overflowExpanded={overflowExpanded}
                    overflowPanelId={overflowPanelId}
                    messages={messages}
                  />
                  {hasOverflow ? (
                    <ProtectedTopbarOverflowPanel
                      overflow={model.overflow}
                      dataTestId={dataTestId}
                      overflowPanelId={overflowPanelId}
                      messages={messages}
                    />
                  ) : null}
                </DropdownMenu>
              </div>
            </div>

            <div className={styles.trailingGroup}>
              <div className={styles.utility} data-testid={`${dataTestId}-utility`}>
                {utilityLink ? (
                  <Link href={utilityLink.href} className={navStyles.utilityLink}>
                    <span className={navStyles.navButtonLabel}>{utilityLink.label}</span>
                  </Link>
                ) : null}
              </div>

              <AccountCenterMenu
                session={session}
                messages={messages}
                menuConfig={accountCenterMenu}
                theme={theme}
                onThemeChange={onThemeChange}
                dataTestId={dataTestId}
                triggerVariant={accountMenuTriggerVariant}
                onExpandedChange={(isExpanded) => {
                  if (isExpanded) {
                    setIsOverflowExpanded(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
