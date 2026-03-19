"use client";

import {
  ChevronDown,
  ChevronRight,
  Globe2,
  Languages,
  LayoutGrid,
  LogOut,
  MoonStar,
  ShieldCheck,
  SunMedium,
  UserCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import {
  formatProtectedSessionRole,
  formatProtectedSessionStatus,
  type ProtectedTopbarMessages
} from "@/src/lib/i18n/protectedMessages";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";

import type { AccountCenterMenuConfig, AccountCenterMenuIcon } from "./protectedTopbarConfigs";

type ProtectedThemePreference = "light" | "dark";

interface AccountCenterMenuProps {
  session: SessionContext;
  messages: ProtectedTopbarMessages;
  menuConfig: AccountCenterMenuConfig;
  theme: ProtectedThemePreference;
  onThemeChange: (nextTheme: ProtectedThemePreference) => void;
  dataTestId: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

function useOptionalRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

function resolveUserInitials(displayName: string, fallback: string) {
  const tokens = displayName
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    const fallbackTokens = fallback
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (fallbackTokens.length === 0) {
      return "U";
    }
    if (fallbackTokens.length === 1) {
      return fallbackTokens[0].slice(0, 2).toUpperCase();
    }

    return `${fallbackTokens[0][0] || ""}${fallbackTokens[1][0] || ""}`.toUpperCase();
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] || ""}${tokens[1][0] || ""}`.toUpperCase();
}

function resolveAccountCenterMenuIcon(icon: AccountCenterMenuIcon) {
  switch (icon) {
    case "profile":
      return UserCircle2;
    case "security":
      return ShieldCheck;
    case "sessions":
      return Languages;
    case "credentials":
      return LayoutGrid;
    default:
      return Globe2;
  }
}

export function AccountCenterMenu({
  session,
  messages,
  menuConfig,
  theme,
  onThemeChange,
  dataTestId,
  onExpandedChange
}: AccountCenterMenuProps) {
  const router = useOptionalRouter();
  const { locale, setLocale } = useProtectedI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = `${dataTestId}-account-menu-region`;
  const userName = session.user?.displayName || session.user?.username || messages.guestUser;
  const userSubtitle = `${formatProtectedSessionRole(session.user?.role, messages)} · ${formatProtectedSessionStatus(session.user?.status, messages)}`;
  const userInitials = resolveUserInitials(userName, messages.guestUser);

  function setExpandedState(nextExpanded: boolean) {
    setIsExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const rootElement = rootRef.current;
      if (!rootElement || !(event.target instanceof Node)) {
        return;
      }

      if (!rootElement.contains(event.target)) {
        setIsExpanded(false);
        onExpandedChange?.(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
        onExpandedChange?.(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, onExpandedChange]);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const response = await fetch("/api/bff/auth/logout", {
        method: "POST",
        headers: {
          accept: "application/json"
        }
      });

      if (!response.ok) {
        setIsSigningOut(false);
        return;
      }

      setExpandedState(false);
      if (router) {
        router.push("/login");
        router.refresh();
      } else if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div ref={rootRef} className="protected-topbar-account-anchor">
      <button
        type="button"
        className={cn("workspace-topbar-user-trigger", "protected-topbar-account-trigger", isExpanded && "is-expanded")}
        aria-label={isExpanded ? messages.closeAccountCenterAriaLabel : messages.openAccountCenterAriaLabel}
        aria-controls={menuId}
        aria-expanded={isExpanded}
        data-testid={`${dataTestId}-account-trigger`}
        onClick={() => {
          setExpandedState(!isExpanded);
        }}
      >
        <span className="protected-topbar-account-trigger-copy" aria-hidden="true">
          <strong className="protected-topbar-account-trigger-title">{userName}</strong>
          <span className="protected-topbar-account-trigger-meta">{userSubtitle}</span>
        </span>
        <ChevronDown className="workspace-topbar-user-icon" />
        <span className="workspace-topbar-avatar">{userInitials}</span>
      </button>

      <div
        id={menuId}
        className={cn("protected-topbar-account-menu", isExpanded && "is-expanded")}
        data-testid={`${dataTestId}-account-menu`}
        aria-hidden={!isExpanded}
      >
        <div className="protected-topbar-account-card">
          <div className="protected-topbar-account-summary">
            <span className="workspace-topbar-avatar protected-topbar-account-avatar">{userInitials}</span>
            <div className="protected-topbar-account-copy">
              <span className="protected-topbar-account-summary-kicker">{messages.accountMenuNavigationTitle}</span>
              <strong>{userName}</strong>
              <small>{userSubtitle}</small>
              <div className="protected-topbar-account-summary-meta" aria-hidden="true">
                <span className="protected-topbar-account-summary-pill">{formatProtectedSessionRole(session.user?.role, messages)}</span>
                <span className="protected-topbar-account-summary-pill">{formatProtectedSessionStatus(session.user?.status, messages)}</span>
              </div>
            </div>
          </div>

          {menuConfig.sections.map((section) => (
            <section key={section.id} className="protected-topbar-account-section">
              <div className="protected-topbar-account-section-heading">
                <p className="protected-topbar-account-section-title">{section.title}</p>
                <span className="protected-topbar-account-section-count" aria-hidden="true">
                  {section.entries.length}
                </span>
              </div>
              <div className="protected-topbar-account-actions" role="list">
                {section.entries.map((entry) => {
                  const Icon = resolveAccountCenterMenuIcon(entry.icon);

                  return (
                    <Link
                      key={entry.id}
                      href={entry.href}
                      className="protected-topbar-account-link"
                      onClick={() => {
                        setExpandedState(false);
                      }}
                    >
                      <span className="protected-topbar-account-link-icon-shell" aria-hidden="true">
                        <Icon className="protected-topbar-account-link-icon" />
                      </span>
                      <span className="protected-topbar-account-link-copy">
                        <span className="protected-topbar-account-link-title">{entry.label}</span>
                      </span>
                      <ChevronRight className="protected-topbar-account-link-arrow" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="protected-topbar-account-section">
            <p className="protected-topbar-account-section-title">{messages.accountMenuPreferencesTitle}</p>

            <div className="protected-topbar-preference-row">
              <span className="protected-topbar-preference-label">{messages.accountMenuLocaleLabel}</span>
              <div className="protected-topbar-segmented-control" role="group" aria-label={messages.accountMenuLocaleLabel}>
                <button
                  type="button"
                  className={cn("protected-topbar-segmented-button", locale === "zh" && "is-active")}
                  data-testid={`${dataTestId}-locale-zh`}
                  aria-pressed={locale === "zh"}
                  onClick={() => setLocale("zh")}
                >
                  <Languages className="protected-topbar-segmented-icon" />
                  <span>{messages.accountMenuLocaleZhLabel}</span>
                </button>
                <button
                  type="button"
                  className={cn("protected-topbar-segmented-button", locale === "en" && "is-active")}
                  data-testid={`${dataTestId}-locale-en`}
                  aria-pressed={locale === "en"}
                  onClick={() => setLocale("en")}
                >
                  <Globe2 className="protected-topbar-segmented-icon" />
                  <span>{messages.accountMenuLocaleEnLabel}</span>
                </button>
              </div>
            </div>

            <div className="protected-topbar-preference-row">
              <span className="protected-topbar-preference-label">{messages.accountMenuThemeLabel}</span>
              <div className="protected-topbar-segmented-control" role="group" aria-label={messages.accountMenuThemeLabel}>
                <button
                  type="button"
                  className={cn("protected-topbar-segmented-button", theme === "light" && "is-active")}
                  data-testid={`${dataTestId}-theme-light`}
                  aria-pressed={theme === "light"}
                  onClick={() => onThemeChange("light")}
                >
                  <SunMedium className="protected-topbar-segmented-icon" />
                  <span>{messages.accountMenuThemeLightLabel}</span>
                </button>
                <button
                  type="button"
                  className={cn("protected-topbar-segmented-button", theme === "dark" && "is-active")}
                  data-testid={`${dataTestId}-theme-dark`}
                  aria-pressed={theme === "dark"}
                  onClick={() => onThemeChange("dark")}
                >
                  <MoonStar className="protected-topbar-segmented-icon" />
                  <span>{messages.accountMenuThemeDarkLabel}</span>
                </button>
              </div>
            </div>
          </section>

          <button
            type="button"
            className="protected-topbar-account-logout"
            data-testid={`${dataTestId}-logout`}
            onClick={() => {
              void handleSignOut();
            }}
          >
            <LogOut className="protected-topbar-account-link-icon" />
            <span>{isSigningOut ? `${messages.accountMenuLogoutLabel}...` : messages.accountMenuLogoutLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
