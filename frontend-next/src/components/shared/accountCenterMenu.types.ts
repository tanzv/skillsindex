export type ProtectedConsoleScope = "workspace" | "admin" | "account";

export type AccountCenterMenuIcon = "profile" | "security" | "sessions" | "credentials" | "link";
export type AccountCenterMenuEntryKind = "account" | "admin";
export type AccountCenterMenuEntryAction = "navigate" | "quick-profile";

export interface AccountCenterMenuEntry {
  id: string;
  href: string;
  label: string;
  icon: AccountCenterMenuIcon;
  description: string;
  kind: AccountCenterMenuEntryKind;
  action: AccountCenterMenuEntryAction;
}

export interface AccountCenterMenuSection {
  id: string;
  title: string;
  entries: AccountCenterMenuEntry[];
}

export interface AccountCenterMenuConfig {
  sections: AccountCenterMenuSection[];
}
