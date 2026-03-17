import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

export interface StateDescriptor {
  title: string;
  description: string;
}

export function resolvePublicStateDescriptor(messages: PublicMarketplaceMessages, rawState: string): StateDescriptor | null {
  const normalizedState = rawState === "permission-denied" ? "permission" : rawState;

  switch (normalizedState) {
    case "loading":
      return {
        title: messages.stateLoadingTitle,
        description: messages.stateLoadingDescription
      };
    case "empty":
      return {
        title: messages.stateEmptyTitle,
        description: messages.stateEmptyDescription
      };
    case "error":
      return {
        title: messages.stateErrorTitle,
        description: messages.stateErrorDescription
      };
    case "permission":
      return {
        title: messages.statePermissionTitle,
        description: messages.statePermissionDescription
      };
    default:
      return null;
  }
}
