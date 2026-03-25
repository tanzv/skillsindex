"use client";

import {
  ChevronDown,
  ChevronRight,
  Globe2,
  LogOut,
  MoonStar,
  SunMedium,
  Languages
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";

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
import {
  accountMessageFallbacks,
  resolveAccountCenterMenuEntryDescription
} from "./accountCenterMenuContent";
import {
  resolveAccountCenterMenuIcon,
  useOptionalRouter
} from "./accountCenterMenuHelpers";
import { performAccountMenuSignOut } from "./accountCenterMenuSignOut";

import type {
  AccountCenterMenuConfig
} from "./accountCenterMenu.types";

type ProtectedThemePreference = "light" | "dark";

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
  const [signOutError, setSignOutError] = useState("");
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
    if (signOutError) {
      setSignOutError("");
    }
    setIsExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError("");
    const result = await performAccountMenuSignOut({
      logoutErrorMessage: messages.accountMenuLogoutError
    });

    if (result.ok) {
      setExpandedState(false);
      if (router) {
        router.push(publicLoginRoute);
        router.refresh();
      } else if (typeof window !== "undefined") {
        window.location.assign(publicLoginRoute);
      }
      return;
    }

    setIsSigningOut(false);
    setSignOutError(result.errorMessage);
  }

  return (
    <DropdownMenu modal={false} open={isExpanded} onOpenChange={setExpandedState}>
      <div className={styles.accountAnchor}>
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>

        <DropdownMenuContent
          id={menuId}
          align="end"
          sideOffset={12}
          aria-hidden={!isExpanded}
          className={cn(styles.menu, "border-0 bg-transparent p-0 shadow-none")}
          data-testid={`${dataTestId}-account-menu`}
          onCloseAutoFocus={(event) => {
            if (profileEditorOpen) {
              event.preventDefault();
            }
          }}
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
                    const entryDescription = resolveAccountCenterMenuEntryDescription(entry, accountMessages);
                    const entryContent = (
                      <>
                        <span className={styles.iconShell} aria-hidden="true">
                          <Icon className={styles.linkIcon} />
                        </span>
                        <span className={styles.linkCopy}>
                          <span className={styles.linkTitle}>{entry.label}</span>
                          <span className={styles.linkDescription}>{entryDescription}</span>
                        </span>
                        <ChevronRight className={styles.linkArrow} aria-hidden="true" />
                      </>
                    );

                    if (entry.action === "quick-profile") {
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          className={styles.accountLink}
                          onClick={() => {
                            setExpandedState(false);
                            void openProfileEditor();
                          }}
                        >
                          {entryContent}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={entry.id}
                        href={entry.href}
                        className={styles.accountLink}
                        onClick={() => {
                          setExpandedState(false);
                        }}
                      >
                        {entryContent}
                      </Link>
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
                    onClick={() => {
                      setSignOutError("");
                      setLocale("zh");
                    }}
                  >
                    <Languages className={styles.segmentedIcon} />
                    <span>{messages.accountMenuLocaleZhLabel}</span>
                  </button>
                  <button
                    type="button"
                    className={cn(styles.segmentedButton, locale === "en" && styles.segmentedButtonActive)}
                    data-testid={`${dataTestId}-locale-en`}
                    aria-pressed={locale === "en"}
                    onClick={() => {
                      setSignOutError("");
                      setLocale("en");
                    }}
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
                    onClick={() => {
                      setSignOutError("");
                      onThemeChange("light");
                    }}
                  >
                    <SunMedium className={styles.segmentedIcon} />
                    <span>{messages.accountMenuThemeLightLabel}</span>
                  </button>
                  <button
                    type="button"
                    className={cn(styles.segmentedButton, theme === "dark" && styles.segmentedButtonActive)}
                    data-testid={`${dataTestId}-theme-dark`}
                    aria-pressed={theme === "dark"}
                    onClick={() => {
                      setSignOutError("");
                      onThemeChange("dark");
                    }}
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
              disabled={isSigningOut}
              onClick={() => {
                void handleSignOut();
              }}
            >
              <LogOut className={styles.linkIcon} />
              <span>{isSigningOut ? `${messages.accountMenuLogoutLabel}...` : messages.accountMenuLogoutLabel}</span>
            </button>
            {signOutError ? (
              <p className={styles.actionError} role="alert">
                {signOutError}
              </p>
            ) : null}
          </div>
        </DropdownMenuContent>
      </div>
      
      <AccountCenterQuickProfileDialog
        open={profileEditorOpen}
        closeLabel={messages.closeAccountCenterAriaLabel}
        title={messages.accountMenuProfileLabel}
        description={accountMessages.profileSectionDescription}
        loadingMessage={accountMessages.profileLoadingMessage || accountMessageFallbacks.profileLoadingMessage}
        displayNameLabel={accountMessages.profileDisplayNamePlaceholder}
        avatarURLLabel={accountMessages.profileAvatarUrlPlaceholder}
        bioLabel={accountMessages.profileBioPlaceholder}
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
    </DropdownMenu>
  );
}
