"use client";

import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";

import { DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import type { ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";

import type { ProtectedTopbarModel } from "./protectedTopbarModel";
import styles from "./ProtectedTopbarNav.module.scss";

interface ProtectedTopbarPrimaryNavProps {
  navigationRef: RefObject<HTMLElement | null>;
  navigationAriaLabel: string;
  hasMeasuredPrimaryNavigation: boolean;
  model: ProtectedTopbarModel;
  dataTestId: string;
  overflowExpanded: boolean;
  overflowPanelId: string;
  messages: ProtectedTopbarMessages;
}

export function ProtectedTopbarPrimaryNav({
  navigationRef,
  navigationAriaLabel,
  hasMeasuredPrimaryNavigation,
  model,
  dataTestId,
  overflowExpanded,
  overflowPanelId,
  messages
}: ProtectedTopbarPrimaryNavProps) {
  const hasOverflow = model.hiddenEntries.length > 0;

  return (
    <nav ref={navigationRef} className={styles.primaryNav} aria-label={navigationAriaLabel}>
      <div className={styles.primaryShell} data-navigation-ready={hasMeasuredPrimaryNavigation ? "true" : "false"}>
        {model.primaryGroups.length > 0 ? (
          <div className={styles.primaryGroups} role="group" aria-label={navigationAriaLabel}>
            {model.primaryGroups.map((group) => (
              <div key={group.id} className={styles.primaryGroup} role="group" aria-label={group.label}>
                <span className={styles.primaryGroupLabel} aria-hidden="true">
                  {group.tagLabel}
                </span>
                {group.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    aria-current={entry.active ? "page" : undefined}
                    className={cn(styles.navButton, entry.active && styles.navButtonActive)}
                  >
                    <span className={styles.navButtonLabel}>{entry.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {hasOverflow ? (
          <div className={styles.overflowToggleGroup} role="group" aria-label={messages.overflowControlsAriaLabel}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-testid={`${dataTestId}-more`}
                className={cn(styles.overflowToggle, overflowExpanded && styles.overflowToggleExpanded)}
                aria-label={overflowExpanded ? messages.collapseNavigationPanel : messages.expandNavigationPanel}
                aria-expanded={overflowExpanded}
                aria-controls={overflowPanelId}
                aria-haspopup="menu"
                title={overflowExpanded ? messages.hideLabel : messages.moreLabel}
              >
                <span className={styles.overflowToggleContent} aria-hidden="true">
                  <span className={styles.overflowToggleGlyphShell}>
                    <LayoutGrid className={styles.overflowTogglePanelIcon} />
                  </span>
                  {!overflowExpanded ? (
                    <span className={styles.overflowToggleBadge}>
                      <span className={styles.overflowToggleBadgeCount}>{model.hiddenEntries.length}</span>
                    </span>
                  ) : null}
                  <ChevronDown className={styles.overflowToggleIcon} />
                </span>
              </button>
            </DropdownMenuTrigger>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
