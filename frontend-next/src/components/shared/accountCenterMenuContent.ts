import type { AccountCenterMenuEntry } from "./accountCenterMenu.types";

export const accountMessageFallbacks = {
  closePanelAction: "Cancel",
  profileSectionDescription: "Review personal identity, display name, avatar, and public profile details.",
  profileLoadingMessage: "Loading profile…",
  profileDisplayNamePlaceholder: "Display name",
  profileAvatarUrlPlaceholder: "https://example.com/avatar.png",
  profileBioPlaceholder: "Short biography",
  profileSaveAction: "Save Profile",
  profileSaveSuccess: "Profile updated.",
  profileSaveError: "Unable to update profile."
} as const;

export interface AccountCenterMenuDescriptionMessages {
  profileSectionDescription?: string;
  profileLoadingMessage?: string;
  routeSecurityDescription?: string;
  routeSessionsDescription?: string;
  routeCredentialsDescription?: string;
}

export function resolveAccountCenterMenuEntryDescription(
  entry: AccountCenterMenuEntry,
  accountMessages: AccountCenterMenuDescriptionMessages
) {
  switch (entry.id) {
    case "account-profile":
      return accountMessages.profileSectionDescription || entry.description;
    case "account-security":
      return accountMessages.routeSecurityDescription || entry.description;
    case "account-sessions":
      return accountMessages.routeSessionsDescription || entry.description;
    case "account-api-credentials":
      return accountMessages.routeCredentialsDescription || entry.description;
    default:
      return entry.description;
  }
}
