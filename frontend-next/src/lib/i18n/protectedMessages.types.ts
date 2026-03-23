export interface ProtectedTopbarMessages {
  navigationAriaLabelAdmin: string;
  navigationAriaLabelWorkspace: string;
  navigationAriaLabelAccount: string;
  overflowControlsAriaLabel: string;
  overflowPanelAriaLabel: string;
  expandNavigationPanel: string;
  collapseNavigationPanel: string;
  moreLabel: string;
  hideLabel: string;
  marketplacePublic: string;
  marketplaceRestricted: string;
  marketplaceLinkLabel: string;
  openAccountCenterAriaLabel: string;
  closeAccountCenterAriaLabel: string;
  accountMenuNavigationTitle: string;
  accountMenuPreferencesTitle: string;
  accountMenuProfileLabel: string;
  accountMenuSecurityLabel: string;
  accountMenuSessionsLabel: string;
  accountMenuApiCredentialsLabel: string;
  accountMenuLocaleLabel: string;
  accountMenuThemeLabel: string;
  accountMenuLocaleZhLabel: string;
  accountMenuLocaleEnLabel: string;
  accountMenuThemeLightLabel: string;
  accountMenuThemeDarkLabel: string;
  accountMenuLogoutLabel: string;
  guestUser: string;
  guestRole: string;
  visitorStatus: string;
  publicChip: string;
  restrictedChip: string;
  overflowVisibleMetricLabel: string;
  overflowHiddenMetricLabel: string;
  quickCategoriesLabel: string;
  quickCategoriesDescription: string;
  quickTopLabel: string;
  quickTopDescription: string;
  quickGovernanceLabel: string;
  quickGovernanceDescription: string;
  quickDocsLabel: string;
  quickDocsDescription: string;
  overflowGroupCountAriaLabelTemplate: string;
  sessionRoleAdmin: string;
  sessionRoleOwner: string;
  sessionRoleMember: string;
  sessionRoleViewer: string;
  sessionRoleGuest: string;
  sessionRoleUnknown: string;
  sessionStatusActive: string;
  sessionStatusInactive: string;
  sessionStatusDisabled: string;
  sessionStatusVisitor: string;
  sessionStatusUnknown: string;
}

export interface AdminShellMessages {
  brandSubtitleSuffix: string;
  controlSectionsTitle: string;
  currentAdminTitle: string;
  groupRouteCount: string;
  marketplaceAccessLine: string;
  marketplaceAccessPublic: string;
  marketplaceAccessRestricted: string;
  unknownUser: string;
  guestRole: string;
  inactiveStatus: string;
}

export interface AdminNavigationMessages {
  topbarPrimaryGroupLabel: string;
  topbarPrimaryGroupTag: string;
  topbarQuickGroupLabel: string;
  topbarQuickGroupTag: string;
  groupOverviewLabel: string;
  groupCatalogLabel: string;
  groupOperationsLabel: string;
  groupUsersLabel: string;
  groupSecurityLabel: string;
  moduleAdministrationLabel: string;
  moduleAdministrationDescription: string;
  hubWorkspaceLabel: string;
  hubWorkspaceDescription: string;
  hubAccountLabel: string;
  hubAccountDescription: string;
  itemOverviewLabel: string;
  itemOverviewDescription: string;
  itemManualIntakeLabel: string;
  itemManualIntakeDescription: string;
  itemRepositoryIntakeLabel: string;
  itemRepositoryIntakeDescription: string;
  itemImportsLabel: string;
  itemImportsDescription: string;
  itemSkillsLabel: string;
  itemSkillsDescription: string;
  itemJobsLabel: string;
  itemJobsDescription: string;
  itemSyncJobsLabel: string;
  itemSyncJobsDescription: string;
  itemSyncPolicyLabel: string;
  itemSyncPolicyDescription: string;
  itemOpsMetricsLabel: string;
  itemOpsMetricsDescription: string;
  itemIntegrationsLabel: string;
  itemIntegrationsDescription: string;
  itemOpsAlertsLabel: string;
  itemOpsAlertsDescription: string;
  itemAuditExportLabel: string;
  itemAuditExportDescription: string;
  itemReleaseGatesLabel: string;
  itemReleaseGatesDescription: string;
  itemRecoveryDrillsLabel: string;
  itemRecoveryDrillsDescription: string;
  itemReleasesLabel: string;
  itemReleasesDescription: string;
  itemChangeApprovalsLabel: string;
  itemChangeApprovalsDescription: string;
  itemBackupPlansLabel: string;
  itemBackupPlansDescription: string;
  itemBackupRunsLabel: string;
  itemBackupRunsDescription: string;
  itemAccountsLabel: string;
  itemAccountsDescription: string;
  itemRolesLabel: string;
  itemRolesDescription: string;
  itemAccessLabel: string;
  itemAccessDescription: string;
  itemOrganizationsLabel: string;
  itemOrganizationsDescription: string;
  itemApiKeysLabel: string;
  itemApiKeysDescription: string;
  itemModerationLabel: string;
  itemModerationDescription: string;
  topbarOverflowTitle: string;
  topbarOverflowHint: string;
  topbarOverflowPrimaryTitle: string;
  topbarOverflowMarketplaceTitle: string;
  topbarOverflowRelatedTitle: string;
}

export interface AdminRouteMessages {
  eyebrow: string;
  openEndpointAction: string;
  unknownRouteTitle: string;
  unknownRouteDescriptionTemplate: string;
  loadFailureDescription: string;
  responsePayloadTitle: string;
  recordTitleTemplate: string;
  objectValueLabel: string;
}

export interface WorkspaceShellMessages {
  brandSubtitleSuffix: string;
  deckTitle: string;
  deckDescription: string;
  connectedSurfacesTitle: string;
  connectedSurfacesDescription: string;
  currentSessionTitle: string;
  marketplaceVisibilityPublic: string;
  marketplaceVisibilityRestricted: string;
  marketplaceAccessLine: string;
  marketplaceAccessPublic: string;
  marketplaceAccessRestricted: string;
  guestUser: string;
  guestRole: string;
  visitorStatus: string;
}

export interface AccountShellMessages {
  brandSubtitleSuffix: string;
  sectionsTitle: string;
  currentUserTitle: string;
  marketplaceAccessLine: string;
  marketplaceAccessPublic: string;
  marketplaceAccessRestricted: string;
  unknownUser: string;
  guestRole: string;
  inactiveStatus: string;
  navProfileLabel: string;
  navProfileNote: string;
  navSecurityLabel: string;
  navSecurityNote: string;
  navSessionsLabel: string;
  navSessionsNote: string;
  navApiCredentialsLabel: string;
  navApiCredentialsNote: string;
  topbarOverflowTitle: string;
  topbarOverflowHint: string;
}

export interface ProtectedMessages {
  topbar: ProtectedTopbarMessages;
  adminShell: AdminShellMessages;
  adminNavigation: AdminNavigationMessages;
  adminRoute: AdminRouteMessages;
  workspaceShell: WorkspaceShellMessages;
  accountShell: AccountShellMessages;
}
