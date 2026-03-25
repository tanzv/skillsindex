"use client";

import Link from "next/link";

import { DropdownMenuContent } from "@/src/components/ui/dropdown-menu";
import { formatProtectedMessage, type ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";
import { cn } from "@/src/lib/utils";

import type { ProtectedTopbarModel } from "./protectedTopbarModel";
import styles from "./ProtectedTopbarNav.module.scss";
import overflowStyles from "./ProtectedTopbarOverflow.module.scss";

interface ProtectedTopbarOverflowPanelProps {
  overflow: ProtectedTopbarModel["overflow"];
  dataTestId: string;
  overflowPanelId: string;
  messages: ProtectedTopbarMessages;
}

export function ProtectedTopbarOverflowPanel({
  overflow,
  dataTestId,
  overflowPanelId,
  messages
}: ProtectedTopbarOverflowPanelProps) {
  return (
    <DropdownMenuContent
      id={overflowPanelId}
      align="end"
      side="bottom"
      sideOffset={12}
      collisionPadding={24}
      className={cn(overflowStyles.overflowMenu, "border-0 bg-transparent p-0 shadow-none")}
      data-testid={`${dataTestId}-overflow-panel`}
    >
      <div
        className={overflowStyles.overflowPanel}
        role="region"
        aria-label={messages.overflowPanelAriaLabel}
      >
        <div className={overflowStyles.overflowHeader}>
          <div className={overflowStyles.overflowTitleBlock}>
            <h3 className={overflowStyles.overflowTitle}>{overflow.title}</h3>
          </div>
          <div className={overflowStyles.overflowSummary} aria-hidden="true">
            {overflow.groups.map((group) => (
              <span
                key={group.id}
                className={cn(overflowStyles.overflowSummaryPill, group.active && overflowStyles.overflowSummaryPillActive)}
              >
                <span className={overflowStyles.overflowSummaryPillLabel}>{group.title}</span>
                <span className={overflowStyles.overflowSummaryPillCount}>{group.countLabel}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={overflowStyles.overflowGroups}>
          {overflow.groups.map((group) => (
            <section
              key={group.id}
              className={cn(overflowStyles.overflowGroup, group.active && overflowStyles.overflowGroupActive)}
              data-testid={`${dataTestId}-overflow-group-${group.id}`}
            >
              <div className={overflowStyles.overflowGroupHeader}>
                <h4 className={overflowStyles.overflowGroupTitle}>{group.title}</h4>
                <span
                  className={overflowStyles.overflowGroupCount}
                  aria-label={formatProtectedMessage(messages.overflowGroupCountAriaLabelTemplate, {
                    count: group.entries.length
                  })}
                >
                  {group.countLabel}
                </span>
              </div>

              <div className={overflowStyles.overflowGroupActions}>
                {group.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    aria-current={entry.active ? "page" : undefined}
                    className={cn(styles.navButton, entry.active && styles.navButtonActive, overflowStyles.overflowNavButton)}
                  >
                    <span className={overflowStyles.actionCopy}>
                      <span className={styles.navButtonLabel}>{entry.label}</span>
                      <span className={overflowStyles.actionNote}>{entry.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DropdownMenuContent>
  );
}
