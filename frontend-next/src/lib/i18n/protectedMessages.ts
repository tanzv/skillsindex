export type {
  AccountShellMessages,
  AdminNavigationMessages,
  AdminRouteMessages,
  AdminShellMessages,
  ProtectedMessages,
  ProtectedTopbarMessages,
  WorkspaceShellMessages
} from "./protectedMessages.types";
export { protectedMessageKeyMap } from "./protectedMessages.keys";
import type { ProtectedTopbarMessages } from "./protectedMessages.types";

export const protectedTopbarMessageFallbacks = {
  navigationAriaLabelAdmin: "Admin top navigation",
  navigationAriaLabelWorkspace: "Workspace top navigation",
  navigationAriaLabelAccount: "Account top navigation",
  overflowControlsAriaLabel: "Protected navigation overflow controls",
  overflowPanelAriaLabel: "Expanded protected navigation panel",
  expandNavigationPanel: "Expand protected navigation panel",
  collapseNavigationPanel: "Collapse protected navigation panel",
  moreLabel: "More",
  hideLabel: "Hide",
  marketplacePublic: "Marketplace Public",
  marketplaceRestricted: "Marketplace Restricted",
  marketplaceLinkLabel: "Marketplace",
  openAccountCenterAriaLabel: "Open account center",
  closeAccountCenterAriaLabel: "Close account center",
  accountMenuNavigationTitle: "Account",
  accountMenuPreferencesTitle: "Preferences",
  accountMenuProfileLabel: "Profile",
  accountMenuSecurityLabel: "Security",
  accountMenuSessionsLabel: "Sessions",
  accountMenuApiCredentialsLabel: "API Credentials",
  accountMenuLocaleLabel: "Language",
  accountMenuThemeLabel: "Theme",
  accountMenuLocaleZhLabel: "中文",
  accountMenuLocaleEnLabel: "English",
  accountMenuThemeLightLabel: "Light",
  accountMenuThemeDarkLabel: "Dark",
  accountMenuLogoutLabel: "Sign Out",
  guestUser: "Guest User",
  guestRole: "guest",
  visitorStatus: "visitor",
  publicChip: "public",
  restrictedChip: "restricted",
  overflowVisibleMetricLabel: "Visible",
  overflowHiddenMetricLabel: "Hidden",
  quickCategoriesLabel: "Categories",
  quickCategoriesDescription: "Browse the original market taxonomy and entry points.",
  quickTopLabel: "Top",
  quickTopDescription: "Open the ranking and leaderboard route from the marketplace shell.",
  quickGovernanceLabel: "Governance",
  quickGovernanceDescription: "Inspect public governance guidance and policy posture.",
  quickDocsLabel: "Docs",
  quickDocsDescription: "Open shared documentation and migration references.",
  overflowGroupCountAriaLabelTemplate: "{count} actions",
  sessionRoleAdmin: "admin",
  sessionRoleOwner: "owner",
  sessionRoleMember: "member",
  sessionRoleViewer: "viewer",
  sessionRoleGuest: "guest",
  sessionRoleUnknown: "unknown",
  sessionStatusActive: "active",
  sessionStatusInactive: "inactive",
  sessionStatusDisabled: "disabled",
  sessionStatusVisitor: "visitor",
  sessionStatusUnknown: "unknown"
} as const satisfies ProtectedTopbarMessages;

export function formatProtectedSessionRole(value: string | null | undefined, messages: ProtectedTopbarMessages) {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "admin":
      return messages.sessionRoleAdmin;
    case "owner":
      return messages.sessionRoleOwner;
    case "viewer":
      return messages.sessionRoleViewer;
    case "member":
      return messages.sessionRoleMember;
    case "guest":
      return messages.sessionRoleGuest;
    default:
      return messages.sessionRoleUnknown;
  }
}

export function formatProtectedSessionStatus(value: string | null | undefined, messages: ProtectedTopbarMessages) {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "active":
      return messages.sessionStatusActive;
    case "inactive":
      return messages.sessionStatusInactive;
    case "disabled":
      return messages.sessionStatusDisabled;
    case "visitor":
      return messages.sessionStatusVisitor;
    case "unknown":
      return messages.sessionStatusUnknown;
    default:
      return messages.sessionStatusUnknown;
  }
}

export function formatProtectedMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}
