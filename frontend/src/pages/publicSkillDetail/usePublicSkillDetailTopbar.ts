import { useMemo } from "react";

import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { marketplaceHomeCopy } from "../marketplaceHome/MarketplaceHomePage.copy";
import { buildMarketplaceTopbarActionBundle } from "../marketplaceHome/MarketplaceHomePage.lightTopbar";
import { buildMarketplaceWorkspaceAccessRightRegistrations } from "../marketplacePublic/MarketplaceTopbarRightRegistrations";

interface UsePublicSkillDetailTopbarOptions {
  locale: AppLocale;
  lightMode: boolean;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  sessionUser: SessionUser | null;
  toPublicPath: (path: string) => string;
}

export function usePublicSkillDetailTopbar({
  locale,
  lightMode,
  onNavigate,
  onLogout,
  sessionUser,
  toPublicPath
}: UsePublicSkillDetailTopbarOptions) {
  const topbarCopy = marketplaceHomeCopy[locale] || marketplaceHomeCopy.en;

  function handleTopbarAuthAction(): void {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath,
        locale,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? topbarCopy.signOut : topbarCopy.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, onNavigate, sessionUser, toPublicPath, topbarCopy.signIn, topbarCopy.signOut]
  );

  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAccessRightRegistrations({
        sessionUser,
        signedInLabel: topbarCopy.signedIn,
        signedOutLabel: topbarCopy.signedOut,
        workspaceLabel: topbarCopy.openWorkspace,
        signInLabel: topbarCopy.signIn,
        onNavigate,
        toPublicPath
      }),
    [onNavigate, sessionUser, toPublicPath, topbarCopy.openWorkspace, topbarCopy.signIn, topbarCopy.signedIn, topbarCopy.signedOut]
  );

  return {
    topbarThemeMode: (lightMode ? "light" : "dark") as ThemeMode,
    topbarBrandTitle: "SkillsIndex",
    topbarBrandSubtitle: topbarCopy.brandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations
  };
}
