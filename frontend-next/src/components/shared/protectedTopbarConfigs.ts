import {
  adminNavigationMessageFallbacks,
  type AccountShellMessages,
  type AdminNavigationMessages,
  type ProtectedTopbarMessages,
  type WorkspaceShellMessages
} from "@/src/lib/i18n/protectedMessages";
import { workspaceMessageFallbacks, type WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute,
  adminAccessRoute,
  adminIntegrationsRoute,
  adminOrganizationsRoute,
  adminOverviewRoute,
  adminReleaseGatesRoute,
  adminRolesRoute,
  workspaceOverviewRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import {
  buildAccountShellNavigationRegistry,
  buildAdminShellNavigationRegistry,
  buildWorkspaceShellNavigationRegistry,
  buildProtectedTopbarConfigFromRegistry
} from "@/src/lib/navigation/protectedNavigationRegistry";

import type {
  AccountCenterMenuEntryAction,
  AccountCenterMenuConfig,
  AccountCenterMenuEntry,
  AccountCenterMenuEntryKind,
  AccountCenterMenuIcon,
  AccountCenterMenuSection
} from "./accountCenterMenu.types";

interface CreateAccountEntryOptions {
  kind?: AccountCenterMenuEntryKind;
  action?: AccountCenterMenuEntryAction;
}

function createAccountEntry(
  id: string,
  href: string,
  label: string,
  icon: AccountCenterMenuIcon,
  description: string,
  options: CreateAccountEntryOptions = {}
): AccountCenterMenuEntry {
  return {
    id,
    href,
    label,
    icon,
    description,
    kind: options.kind ?? "account",
    action: options.action ?? "navigate"
  };
}

export function buildAccountCenterMenuConfig(
  messages: ProtectedTopbarMessages,
  extensions: AccountCenterMenuSection[] = []
): AccountCenterMenuConfig {
  return {
    sections: [
      ...extensions,
      {
        id: "account-center",
        title: messages.accountMenuNavigationTitle,
        entries: [
          createAccountEntry(
            "account-profile",
            accountProfileRoute,
            messages.accountMenuProfileLabel,
            "profile",
            "Review personal identity, display name, avatar, and public profile details.",
            { action: "quick-profile" }
          ),
          createAccountEntry(
            "account-security",
            accountSecurityRoute,
            messages.accountMenuSecurityLabel,
            "security",
            "Update password posture, revoke risky access, and keep sign-in hygiene aligned."
          ),
          createAccountEntry(
            "account-sessions",
            accountSessionsRoute,
            messages.accountMenuSessionsLabel,
            "sessions",
            "Inspect active devices, session age, and revoke stale session access when needed."
          ),
          createAccountEntry(
            "account-api-credentials",
            accountApiCredentialsRoute,
            messages.accountMenuApiCredentialsLabel,
            "credentials",
            "Create, rotate, and retire scoped personal API credentials without leaving the protected shell."
          )
        ]
      }
    ]
  };
}

export function buildAdminAccountCenterMenuConfig(
  topbarMessages: ProtectedTopbarMessages,
  navigationMessages: AdminNavigationMessages
): AccountCenterMenuConfig {
  return buildAccountCenterMenuConfig(topbarMessages, [
    {
      id: "admin-identity-services",
      title: navigationMessages.itemOrganizationsLabel,
      entries: [
        createAccountEntry(
          "admin-access",
            adminAccessRoute,
            navigationMessages.itemAccessLabel,
            "security",
            navigationMessages.itemAccessDescription,
            { kind: "admin" }
          ),
          createAccountEntry(
            "admin-roles",
            adminRolesRoute,
            navigationMessages.itemRolesLabel,
            "link",
            navigationMessages.itemRolesDescription,
            { kind: "admin" }
          ),
          createAccountEntry(
            "admin-organizations",
            adminOrganizationsRoute,
            navigationMessages.itemOrganizationsLabel,
            "link",
            navigationMessages.itemOrganizationsDescription,
            { kind: "admin" }
          )
        ]
      },
    {
      id: "admin-runtime-services",
      title: navigationMessages.moduleAdministrationLabel,
      entries: [
        createAccountEntry(
          "admin-integrations",
            adminIntegrationsRoute,
            navigationMessages.itemIntegrationsLabel,
            "link",
            navigationMessages.itemIntegrationsDescription,
            { kind: "admin" }
          ),
          createAccountEntry(
            "admin-release-gates",
            adminReleaseGatesRoute,
            navigationMessages.itemReleaseGatesLabel,
            "link",
            navigationMessages.itemReleaseGatesDescription,
            { kind: "admin" }
          )
        ]
      }
  ]);
}

interface TopbarRegistryOptions {
  navigationMessages?: AdminNavigationMessages;
  workspaceMessages?: WorkspaceMessages;
  workspaceShellMessages?: WorkspaceShellMessages;
  accountShellMessages?: AccountShellMessages;
}

function buildRegistryOptions(options: TopbarRegistryOptions) {
  return {
    adminNavigation: options.navigationMessages || adminNavigationMessageFallbacks,
    workspacePage: options.workspaceMessages || workspaceMessageFallbacks,
    workspaceShell: options.workspaceShellMessages,
    accountShell: options.accountShellMessages
  };
}

export function buildAdminProtectedTopbarConfig(
  navigationMessages: AdminNavigationMessages,
  topbarMessages: ProtectedTopbarMessages,
  workspaceMessages: WorkspaceMessages = workspaceMessageFallbacks
) {
  return buildProtectedTopbarConfigFromRegistry(
    adminOverviewRoute,
    buildAdminShellNavigationRegistry(buildRegistryOptions({ navigationMessages, workspaceMessages })),
    {
      primaryGroupLabel: navigationMessages.topbarPrimaryGroupLabel,
      primaryGroupTag: navigationMessages.topbarPrimaryGroupTag,
      overflowTitle: navigationMessages.topbarOverflowTitle,
      overflowHint: navigationMessages.topbarOverflowHint,
      overflowPrimaryTitle: navigationMessages.topbarOverflowPrimaryTitle
    },
    topbarMessages
  );
}

export function buildAccountProtectedTopbarConfig(
  navigationMessages: AdminNavigationMessages,
  shellMessages: AccountShellMessages,
  topbarMessages: ProtectedTopbarMessages,
  workspaceMessages: WorkspaceMessages = workspaceMessageFallbacks
) {
  return buildProtectedTopbarConfigFromRegistry(
    accountProfileRoute,
    buildAccountShellNavigationRegistry(
      buildRegistryOptions({
        navigationMessages,
        workspaceMessages,
        accountShellMessages: shellMessages
      })
    ),
    {
      primaryGroupLabel: navigationMessages.topbarPrimaryGroupLabel,
      primaryGroupTag: navigationMessages.topbarPrimaryGroupTag,
      overflowTitle: shellMessages.topbarOverflowTitle,
      overflowHint: shellMessages.topbarOverflowHint,
      overflowPrimaryTitle: navigationMessages.topbarOverflowPrimaryTitle
    },
    topbarMessages
  );
}

export function buildWorkspaceProtectedTopbarConfig(
  workspaceMessages: WorkspaceMessages,
  topbarMessages: ProtectedTopbarMessages,
  navigationMessages: AdminNavigationMessages = adminNavigationMessageFallbacks
) {
  return buildProtectedTopbarConfigFromRegistry(
    workspaceOverviewRoute,
    buildWorkspaceShellNavigationRegistry(buildRegistryOptions({ navigationMessages, workspaceMessages })),
    {
      primaryGroupLabel: workspaceMessages.topbarPrimaryGroupLabel,
      primaryGroupTag: workspaceMessages.topbarPrimaryGroupTag,
      overflowTitle: workspaceMessages.topbarOverflowTitle,
      overflowHint: workspaceMessages.topbarOverflowHint,
      overflowPrimaryTitle: workspaceMessages.topbarOverflowAppSectionsTitle
    },
    topbarMessages
  );
}
