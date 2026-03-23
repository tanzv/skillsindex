import type { AccountCenterMessages } from "@/src/lib/i18n/protectedPageMessages.accountCenter";
import type { AccountShellMessages } from "@/src/lib/i18n/protectedMessages.types";
import {
  accountApiCredentialsRoute,
  accountProfileRoute,
  accountSecurityRoute,
  accountSessionsRoute,
  adminOverviewRoute,
  marketplaceHomeRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import type { AccountRoute } from "@/src/lib/routing/routes";

export type AccountSection = "profile" | "security" | "sessions" | "credentials";

export interface AccountRouteMeta {
  kicker: string;
  description: string;
}

export interface AccountRouteAction {
  href: string;
  label: string;
}

export interface AccountSectionEntry {
  section: AccountSection;
  route: AccountRoute;
}

export interface AccountRouteDataRequirements {
  profile: true;
  sessions: boolean;
  credentials: boolean;
}

type AccountRouteMetaMessages = Pick<
  AccountCenterMessages,
  | "routeProfileKicker"
  | "routeProfileDescription"
  | "routeSecurityKicker"
  | "routeSecurityDescription"
  | "routeSessionsKicker"
  | "routeSessionsDescription"
  | "routeCredentialsKicker"
  | "routeCredentialsDescription"
>;

type AccountRouteActionMessages = Pick<
  AccountCenterMessages,
  | "routeActionOpenMarketplace"
  | "routeActionOpenAdmin"
  | "routeActionReviewSessions"
  | "routeActionOpenSecurity"
  | "routeActionOpenProfile"
>;

type AccountRouteSignalMessages = Pick<
  AccountCenterMessages,
  | "routeSignalProfile"
  | "routeSignalSecurity"
  | "routeSignalSessions"
  | "routeSignalCredentials"
>;

type AccountQuickActionMessages = Pick<
  AccountCenterMessages,
  | "quickActionMarketplace"
  | "quickActionAdmin"
  | "quickActionSessions"
  | "quickActionApiCredentials"
>;

type AccountSectionLabelMessages = Pick<
  AccountCenterMessages,
  | "sectionProfile"
  | "sectionSecurity"
  | "sectionSessions"
  | "sectionCredentials"
>;

type AccountSectionRouteHintMessages = Pick<
  AccountCenterMessages,
  | "routeHintProfile"
  | "routeHintSecurity"
  | "routeHintSessions"
  | "routeHintCredentials"
>;

type AccountSectionNavigationMessages = Pick<
  AccountShellMessages,
  | "navProfileLabel"
  | "navProfileNote"
  | "navSecurityLabel"
  | "navSecurityNote"
  | "navSessionsLabel"
  | "navSessionsNote"
  | "navApiCredentialsLabel"
  | "navApiCredentialsNote"
>;

interface AccountRouteDescriptor {
  route: AccountRoute;
  section: AccountSection;
  requiresSessions: boolean;
  requiresCredentials: boolean;
  resolveMeta: (messages: AccountRouteMetaMessages) => AccountRouteMeta;
  resolveActions: (messages: AccountRouteActionMessages) => AccountRouteAction[];
  resolveSignal: (messages: AccountRouteSignalMessages) => string;
  resolveSectionLabel: (messages: AccountSectionLabelMessages) => string;
  resolveSectionRouteHint: (messages: AccountSectionRouteHintMessages) => string;
  resolveNavigationLabel: (messages: AccountSectionNavigationMessages) => string;
  resolveNavigationDescription: (messages: AccountSectionNavigationMessages) => string;
}

const accountRouteDescriptors = [
  {
    route: accountProfileRoute,
    section: "profile",
    requiresSessions: false,
    requiresCredentials: false,
    resolveMeta: (messages) => ({
      kicker: messages.routeProfileKicker,
      description: messages.routeProfileDescription
    }),
    resolveActions: (messages) => [
      { href: marketplaceHomeRoute, label: messages.routeActionOpenMarketplace },
      { href: adminOverviewRoute, label: messages.routeActionOpenAdmin }
    ],
    resolveSignal: (messages) => messages.routeSignalProfile,
    resolveSectionLabel: (messages) => messages.sectionProfile,
    resolveSectionRouteHint: (messages) => messages.routeHintProfile,
    resolveNavigationLabel: (messages) => messages.navProfileLabel,
    resolveNavigationDescription: (messages) => messages.navProfileNote
  },
  {
    route: accountSecurityRoute,
    section: "security",
    requiresSessions: true,
    requiresCredentials: false,
    resolveMeta: (messages) => ({
      kicker: messages.routeSecurityKicker,
      description: messages.routeSecurityDescription
    }),
    resolveActions: (messages) => [
      { href: accountSessionsRoute, label: messages.routeActionReviewSessions },
      { href: adminOverviewRoute, label: messages.routeActionOpenAdmin }
    ],
    resolveSignal: (messages) => messages.routeSignalSecurity,
    resolveSectionLabel: (messages) => messages.sectionSecurity,
    resolveSectionRouteHint: (messages) => messages.routeHintSecurity,
    resolveNavigationLabel: (messages) => messages.navSecurityLabel,
    resolveNavigationDescription: (messages) => messages.navSecurityNote
  },
  {
    route: accountSessionsRoute,
    section: "sessions",
    requiresSessions: true,
    requiresCredentials: false,
    resolveMeta: (messages) => ({
      kicker: messages.routeSessionsKicker,
      description: messages.routeSessionsDescription
    }),
    resolveActions: (messages) => [
      { href: accountSecurityRoute, label: messages.routeActionOpenSecurity },
      { href: adminOverviewRoute, label: messages.routeActionOpenAdmin }
    ],
    resolveSignal: (messages) => messages.routeSignalSessions,
    resolveSectionLabel: (messages) => messages.sectionSessions,
    resolveSectionRouteHint: (messages) => messages.routeHintSessions,
    resolveNavigationLabel: (messages) => messages.navSessionsLabel,
    resolveNavigationDescription: (messages) => messages.navSessionsNote
  },
  {
    route: accountApiCredentialsRoute,
    section: "credentials",
    requiresSessions: false,
    requiresCredentials: true,
    resolveMeta: (messages) => ({
      kicker: messages.routeCredentialsKicker,
      description: messages.routeCredentialsDescription
    }),
    resolveActions: (messages) => [
      { href: marketplaceHomeRoute, label: messages.routeActionOpenMarketplace },
      { href: accountProfileRoute, label: messages.routeActionOpenProfile }
    ],
    resolveSignal: (messages) => messages.routeSignalCredentials,
    resolveSectionLabel: (messages) => messages.sectionCredentials,
    resolveSectionRouteHint: (messages) => messages.routeHintCredentials,
    resolveNavigationLabel: (messages) => messages.navApiCredentialsLabel,
    resolveNavigationDescription: (messages) => messages.navApiCredentialsNote
  }
] as const satisfies readonly AccountRouteDescriptor[];

function buildAccountRouteRecord<Value>(
  resolveValue: (descriptor: AccountRouteDescriptor) => Value
): Record<AccountRoute, Value> {
  return Object.fromEntries(
    accountRouteDescriptors.map((descriptor) => [descriptor.route, resolveValue(descriptor)])
  ) as Record<AccountRoute, Value>;
}

function buildAccountSectionRecord(): Record<AccountSection, AccountRoute> {
  return Object.fromEntries(
    accountRouteDescriptors.map((descriptor) => [descriptor.section, descriptor.route])
  ) as Record<AccountSection, AccountRoute>;
}

const accountRouteDescriptorByRoute = buildAccountRouteRecord((descriptor) => descriptor);

export const accountSectionByRoute: Record<AccountRoute, AccountSection> = buildAccountRouteRecord(
  (descriptor) => descriptor.section
);

export const accountRouteBySection: Record<AccountSection, AccountRoute> = buildAccountSectionRecord();

export function resolveAccountRouteMeta(
  route: AccountRoute,
  messages: AccountRouteMetaMessages
): AccountRouteMeta {
  return accountRouteDescriptorByRoute[route].resolveMeta(messages);
}

export function resolveAccountRouteActions(
  route: AccountRoute,
  messages: AccountRouteActionMessages
): AccountRouteAction[] {
  return accountRouteDescriptorByRoute[route].resolveActions(messages);
}

export function resolveAccountRouteSignal(
  route: AccountRoute,
  messages: AccountRouteSignalMessages
): string {
  return accountRouteDescriptorByRoute[route].resolveSignal(messages);
}

export function resolveAccountRouteDataRequirements(
  route: AccountRoute
): AccountRouteDataRequirements {
  const descriptor = accountRouteDescriptorByRoute[route];

  return {
    profile: true,
    sessions: descriptor.requiresSessions,
    credentials: descriptor.requiresCredentials
  };
}

export function buildAccountQuickActions(
  messages: AccountQuickActionMessages
): AccountRouteAction[] {
  return [
    { href: marketplaceHomeRoute, label: messages.quickActionMarketplace },
    { href: adminOverviewRoute, label: messages.quickActionAdmin },
    { href: accountSessionsRoute, label: messages.quickActionSessions },
    { href: accountApiCredentialsRoute, label: messages.quickActionApiCredentials }
  ];
}

export function listAccountSectionEntries(): AccountSectionEntry[] {
  return accountRouteDescriptors.map((descriptor) => ({
    section: descriptor.section,
    route: descriptor.route
  }));
}

export function resolveAccountSectionLabel(
  section: AccountSection,
  messages: AccountSectionLabelMessages
): string {
  const route = accountRouteBySection[section];
  return accountRouteDescriptorByRoute[route].resolveSectionLabel(messages);
}

export function resolveAccountSectionRouteHint(
  section: AccountSection,
  messages: AccountSectionRouteHintMessages
): string {
  const route = accountRouteBySection[section];
  return accountRouteDescriptorByRoute[route].resolveSectionRouteHint(messages);
}

export function resolveAccountSectionNavigationLabel(
  section: AccountSection,
  messages: AccountSectionNavigationMessages
): string {
  const route = accountRouteBySection[section];
  return accountRouteDescriptorByRoute[route].resolveNavigationLabel(messages);
}

export function resolveAccountSectionNavigationDescription(
  section: AccountSection,
  messages: AccountSectionNavigationMessages
): string {
  const route = accountRouteBySection[section];
  return accountRouteDescriptorByRoute[route].resolveNavigationDescription(messages);
}
