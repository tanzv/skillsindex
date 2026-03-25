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

interface BuildAdminAccountCenterMenuOptions {
  includeElevatedGovernance?: boolean;
  includeUserManagement?: boolean;
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
            messages.accountMenuProfileLabel,
            { action: "quick-profile" }
          ),
          createAccountEntry(
            "account-security",
            accountSecurityRoute,
            messages.accountMenuSecurityLabel,
            "security",
            messages.accountMenuSecurityLabel
          ),
          createAccountEntry(
            "account-sessions",
            accountSessionsRoute,
            messages.accountMenuSessionsLabel,
            "sessions",
            messages.accountMenuSessionsLabel
          ),
          createAccountEntry(
            "account-api-credentials",
            accountApiCredentialsRoute,
            messages.accountMenuApiCredentialsLabel,
            "credentials",
            messages.accountMenuApiCredentialsLabel
          )
        ]
      }
    ]
  };
}

export function buildAdminAccountCenterMenuConfig(
  topbarMessages: ProtectedTopbarMessages,
  navigationMessages: AdminNavigationMessages,
  options: BuildAdminAccountCenterMenuOptions = {}
): AccountCenterMenuConfig {
  const identityEntries: AccountCenterMenuEntry[] = [];
  if (options.includeUserManagement !== false) {
    identityEntries.push(
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
      )
    );
  }
  identityEntries.push(
    createAccountEntry(
      "admin-organizations",
      adminOrganizationsRoute,
      navigationMessages.itemOrganizationsLabel,
      "link",
      navigationMessages.itemOrganizationsDescription,
      { kind: "admin" }
    )
  );

  const extensions: AccountCenterMenuSection[] = [
    {
      id: "admin-identity-services",
      title: navigationMessages.groupSecurityLabel,
      entries: identityEntries
    }
  ];

  if (options.includeElevatedGovernance !== false) {
    extensions.push({
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
    });
  }

  return buildAccountCenterMenuConfig(topbarMessages, extensions);
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
