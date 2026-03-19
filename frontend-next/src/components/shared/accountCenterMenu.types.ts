export type ProtectedConsoleScope = "workspace" | "admin" | "account";

export type AccountCenterMenuIcon = "profile" | "security" | "sessions" | "credentials" | "link";

export interface AccountCenterMenuEntry {
  id: string;
  href: string;
  label: string;
  icon: AccountCenterMenuIcon;
}

export interface AccountCenterMenuSection {
  id: string;
  title: string;
  entries: AccountCenterMenuEntry[];
}

export interface AccountCenterMenuConfig {
  sections: AccountCenterMenuSection[];
}
