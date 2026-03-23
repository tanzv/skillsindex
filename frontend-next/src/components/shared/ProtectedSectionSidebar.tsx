"use client";

import Link from "next/link";

import { cn } from "@/src/lib/utils";

import styles from "./ProtectedSectionSidebar.module.scss";

type ProtectedSectionSidebarScope = "workspace-shell" | "admin-shell" | "account-shell";
type ProtectedSectionSidebarItemVariant = "default" | "group";

export interface ProtectedSectionSidebarItem {
  id: string;
  href: string;
  label: string;
  note: string;
  active?: boolean;
  variant?: ProtectedSectionSidebarItemVariant;
}

export interface ProtectedSectionSidebarGroup {
  id: string;
  title?: string;
  items: ProtectedSectionSidebarItem[];
}

interface ProtectedSectionSidebarProps {
  scope: ProtectedSectionSidebarScope;
  title: string;
  description?: string;
  groups: ProtectedSectionSidebarGroup[];
  dataTestId?: string;
}

function resolvePanelClassName(scope: ProtectedSectionSidebarScope) {
  return `${scope}-panel`;
}

function resolvePanelTitleClassName(scope: ProtectedSectionSidebarScope) {
  return `${scope}-panel-title`;
}

function resolvePanelCopyClassName(scope: ProtectedSectionSidebarScope) {
  return `${scope}-panel-copy`;
}

function resolveListClassName(scope: ProtectedSectionSidebarScope, variant: ProtectedSectionSidebarItemVariant) {
  if (scope === "admin-shell" && variant === "group") {
    return "admin-shell-group-list";
  }

  return `${scope}-side-list`;
}

function resolveLinkClassName(scope: ProtectedSectionSidebarScope, variant: ProtectedSectionSidebarItemVariant) {
  if (scope === "admin-shell" && variant === "group") {
    return "admin-shell-group-link";
  }

  return `${scope}-side-link`;
}

function resolveLinkNoteClassName(scope: ProtectedSectionSidebarScope, variant: ProtectedSectionSidebarItemVariant) {
  if (scope === "admin-shell" && variant === "group") {
    return "admin-shell-group-link-note";
  }

  return `${scope}-side-link-note`;
}

export function ProtectedSectionSidebar({
  scope,
  title,
  description,
  groups,
  dataTestId
}: ProtectedSectionSidebarProps) {
  const panelClassName = resolvePanelClassName(scope);
  const panelTitleClassName = resolvePanelTitleClassName(scope);
  const panelCopyClassName = resolvePanelCopyClassName(scope);

  return (
    <section className={cn(panelClassName, styles.panel)} data-scope={scope} data-testid={dataTestId}>
      <div className={styles.header}>
        <p className={cn(panelTitleClassName, styles.panelTitle)}>{title}</p>
        {description ? <p className={cn(panelCopyClassName, styles.panelCopy)}>{description}</p> : null}
      </div>

      <div className={styles.groups}>
        {groups.map((group) => (
          <div key={group.id} className={styles.group}>
            {group.title ? (
              <div className={styles.groupHeader}>
                <p className={styles.groupTitle}>{group.title}</p>
              </div>
            ) : null}

            <div
              className={cn(resolveListClassName(scope, group.items[0]?.variant || "default"), styles.groupList)}
              data-variant={group.items[0]?.variant || "default"}
            >
              {group.items.map((item) => {
                const itemVariant = item.variant || "default";

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    data-variant={itemVariant}
                    className={cn(resolveLinkClassName(scope, itemVariant), styles.link, item.active && "is-active")}
                  >
                    <span className={styles.linkBody}>
                      <span className={styles.linkLabel}>{item.label}</span>
                      <span className={cn(resolveLinkNoteClassName(scope, itemVariant), styles.linkNote)}>{item.note}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
