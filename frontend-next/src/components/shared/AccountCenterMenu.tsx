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
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  formatProtectedSessionRole,
  formatProtectedSessionStatus,
  type ProtectedTopbarMessages
} from "@/src/lib/i18n/protectedMessages";
import {
  resolveAccountProfileDisplayName,
  resolveAvatarInitials,
} from "@/src/lib/account/accountProfile";
import { useProtectedI18n } from "@/src/lib/i18n/ProtectedI18nProvider";
import { publicLoginRoute } from "@/src/lib/routing/publicRouteRegistry";
import type { SessionContext } from "@/src/lib/schemas/session";
import { cn } from "@/src/lib/utils";
import styles from "./AccountCenterMenu.module.scss";
import { AccountCenterQuickProfileDialog } from "./AccountCenterQuickProfileDialog";
import { useAccountCenterProfileEditor } from "./useAccountCenterProfileEditor";

import type { AccountCenterMenuConfig, AccountCenterMenuIcon } from "./accountCenterMenu.types";

type ProtectedThemePreference = "light" | "dark";

const accountMessageFallbacks = {
  closePanelAction: "Cancel",
  profileSectionDescription: "Review personal identity, display name, avatar, and public profile details.",
  profileDisplayNamePlaceholder: "Display name",
  profileAvatarUrlPlaceholder: "https://example.com/avatar.png",
  profileBioPlaceholder: "Short biography",
  profileSaveAction: "Save Profile",
  profileSaveSuccess: "Profile updated.",
  profileSaveError: "Unable to update profile."
} as const;

interface AccountCenterMenuProps {
  session: SessionContext;
  messages: ProtectedTopbarMessages;
  menuConfig: AccountCenterMenuConfig;
  theme: ProtectedThemePreference;
  onThemeChange: (nextTheme: ProtectedThemePreference) => void;
  dataTestId: string;
  triggerVariant?: "pill" | "avatar";
  onExpandedChange?: (isExpanded: boolean) => void;
}

function useOptionalRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
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
  triggerVariant = "pill",
  onExpandedChange
}: AccountCenterMenuProps) {
  const router = useOptionalRouter();
  const { locale, messages: protectedMessages, setLocale } = useProtectedI18n();
  const accountMessages = protectedMessages.accountCenter || accountMessageFallbacks;
  const fallbackUserName = session.user?.displayName || session.user?.username || messages.guestUser;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = `${dataTestId}-account-menu-region`;
  const {
    closeProfileEditor,
    openProfileEditor,
    profileDraft,
    profileEditorOpen,
    profileError,
    profileLoading,
    profileMessage,
    profilePayload,
    profileSaving,
    saveProfile,
    setProfileDraft
  } = useAccountCenterProfileEditor({
    fallbackUserName,
    messages: accountMessages,
    onSaved: () => router?.refresh()
  });
  const userName = resolveAccountProfileDisplayName(profilePayload, fallbackUserName) || fallbackUserName;
  const userSubtitle = `${formatProtectedSessionRole(session.user?.role, messages)} · ${formatProtectedSessionStatus(session.user?.status, messages)}`;
  const userInitials = resolveAvatarInitials(userName, messages.guestUser);
  const profileEditorAvatarInitials = resolveAvatarInitials(profileDraft.displayName || userName, messages.guestUser);

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
        router.push(publicLoginRoute);
        router.refresh();
      } else if (typeof window !== "undefined") {
        window.location.assign(publicLoginRoute);
      }
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div ref={rootRef} className={styles.accountAnchor}>
      <button
        type="button"
        className={cn(
          styles.userTrigger,
          triggerVariant === "avatar" && styles.userTriggerAvatarOnly,
          isExpanded && styles.userTriggerExpanded
        )}
        aria-label={isExpanded ? messages.closeAccountCenterAriaLabel : messages.openAccountCenterAriaLabel}
        aria-controls={menuId}
        aria-expanded={isExpanded}
        data-testid={`${dataTestId}-account-trigger`}
        data-trigger-variant={triggerVariant}
        title={userName}
        onClick={() => {
          setExpandedState(!isExpanded);
        }}
      >
        {triggerVariant === "pill" ? (
          <>
            <span className={styles.triggerCopy} aria-hidden="true">
              <strong className={styles.triggerTitle}>{userName}</strong>
              <span className={styles.triggerMeta}>{userSubtitle}</span>
            </span>
            <ChevronDown className={styles.userIcon} />
          </>
        ) : <span className={styles.visuallyHidden}>{userName}</span>}
        <span className={styles.avatar}>{userInitials}</span>
      </button>

      <div
        id={menuId}
        className={cn(styles.menu, isExpanded && styles.menuExpanded)}
        data-testid={`${dataTestId}-account-menu`}
        aria-hidden={!isExpanded}
      >
        <div className={styles.card}>
          <div className={styles.summary}>
            <span className={cn(styles.avatar, styles.accountAvatar)}>{userInitials}</span>
            <div className={styles.copy}>
              <span className={styles.summaryKicker}>{messages.accountMenuNavigationTitle}</span>
              <strong>{userName}</strong>
              <small>{userSubtitle}</small>
              <div className={styles.summaryMeta} aria-hidden="true">
                <span className={styles.summaryPill}>{formatProtectedSessionRole(session.user?.role, messages)}</span>
                <span className={styles.summaryPill}>{formatProtectedSessionStatus(session.user?.status, messages)}</span>
              </div>
            </div>
          </div>

          {menuConfig.sections.map((section) => (
            <section key={section.id} className={styles.section}>
              <div className={styles.sectionHeading}>
                <p className={styles.sectionTitle}>{section.title}</p>
                <span className={styles.sectionCount} aria-hidden="true">
                  {section.entries.length}
                </span>
              </div>
              <div className={styles.actions} role="list">
                {section.entries.map((entry) => {
                  const Icon = resolveAccountCenterMenuIcon(entry.icon);

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className={styles.accountLink}
                      onClick={() => {
                        if (entry.action === "quick-profile") {
                          setExpandedState(false);
                          void openProfileEditor();
                          return;
                        }

                        setExpandedState(false);
                        if (router) {
                          router.push(entry.href);
                          router.refresh();
                          return;
                        }

                        if (typeof window !== "undefined") {
                          window.location.assign(entry.href);
                        }
                      }}
                    >
                      <span className={styles.iconShell} aria-hidden="true">
                        <Icon className={styles.linkIcon} />
                      </span>
                      <span className={styles.linkCopy}>
                        <span className={styles.linkTitle}>{entry.label}</span>
                        <span className={styles.linkDescription}>{entry.description}</span>
                      </span>
                      <ChevronRight className={styles.linkArrow} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <section className={styles.section}>
            <p className={styles.sectionTitle}>{messages.accountMenuPreferencesTitle}</p>

            <div className={styles.preferenceRow}>
              <span className={styles.preferenceLabel}>{messages.accountMenuLocaleLabel}</span>
              <div className={styles.segmentedControl} role="group" aria-label={messages.accountMenuLocaleLabel}>
                <button
                  type="button"
                  className={cn(styles.segmentedButton, locale === "zh" && styles.segmentedButtonActive)}
                  data-testid={`${dataTestId}-locale-zh`}
                  aria-pressed={locale === "zh"}
                  onClick={() => setLocale("zh")}
                >
                  <Languages className={styles.segmentedIcon} />
                  <span>{messages.accountMenuLocaleZhLabel}</span>
                </button>
                <button
                  type="button"
                  className={cn(styles.segmentedButton, locale === "en" && styles.segmentedButtonActive)}
                  data-testid={`${dataTestId}-locale-en`}
                  aria-pressed={locale === "en"}
                  onClick={() => setLocale("en")}
                >
                  <Globe2 className={styles.segmentedIcon} />
                  <span>{messages.accountMenuLocaleEnLabel}</span>
                </button>
              </div>
            </div>

            <div className={styles.preferenceRow}>
              <span className={styles.preferenceLabel}>{messages.accountMenuThemeLabel}</span>
              <div className={styles.segmentedControl} role="group" aria-label={messages.accountMenuThemeLabel}>
                <button
                  type="button"
                  className={cn(styles.segmentedButton, theme === "light" && styles.segmentedButtonActive)}
                  data-testid={`${dataTestId}-theme-light`}
                  aria-pressed={theme === "light"}
                  onClick={() => onThemeChange("light")}
                >
                  <SunMedium className={styles.segmentedIcon} />
                  <span>{messages.accountMenuThemeLightLabel}</span>
                </button>
                <button
                  type="button"
                  className={cn(styles.segmentedButton, theme === "dark" && styles.segmentedButtonActive)}
                  data-testid={`${dataTestId}-theme-dark`}
                  aria-pressed={theme === "dark"}
                  onClick={() => onThemeChange("dark")}
                >
                  <MoonStar className={styles.segmentedIcon} />
                  <span>{messages.accountMenuThemeDarkLabel}</span>
                </button>
              </div>
            </div>
          </section>

          <button
            type="button"
            className={styles.accountLogout}
            data-testid={`${dataTestId}-logout`}
            onClick={() => {
              void handleSignOut();
            }}
          >
            <LogOut className={styles.linkIcon} />
            <span>{isSigningOut ? `${messages.accountMenuLogoutLabel}...` : messages.accountMenuLogoutLabel}</span>
          </button>
        </div>
      </div>

      <AccountCenterQuickProfileDialog
        open={profileEditorOpen}
        closeLabel={messages.closeAccountCenterAriaLabel}
        title={messages.accountMenuProfileLabel}
        description={accountMessages.profileSectionDescription}
        displayNameLabel="Display Name"
        avatarURLLabel="Avatar URL"
        bioLabel="Bio"
        displayNamePlaceholder={accountMessages.profileDisplayNamePlaceholder}
        avatarURLPlaceholder={accountMessages.profileAvatarUrlPlaceholder}
        bioPlaceholder={accountMessages.profileBioPlaceholder}
        saveLabel={accountMessages.profileSaveAction}
        cancelLabel={accountMessages.closePanelAction}
        statusMessage={profileMessage}
        errorMessage={profileError}
        loading={profileLoading}
        saving={profileSaving}
        avatarInitials={profileEditorAvatarInitials}
        draft={profileDraft}
        onDraftChange={(patch) => setProfileDraft((currentDraft) => ({ ...currentDraft, ...patch }))}
        onClose={closeProfileEditor}
        onSave={() => {
          void saveProfile();
        }}
      />
    </div>
  );
}
