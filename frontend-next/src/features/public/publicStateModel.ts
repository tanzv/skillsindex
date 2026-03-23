import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

export type StateDescriptorTone = "neutral" | "warning" | "danger" | "loading";
export type PublicStateActionId = "home" | "search" | "retry";

export interface StateDescriptor {
  code?: string;
  title: string;
  description: string;
  tone: StateDescriptorTone;
  actions: readonly PublicStateActionId[];
}

const supportedPublicStateRoutes = ["loading", "empty", "error", "permission", "404", "500", "503"] as const;
const publicStateAliases = {
  "permission-denied": "permission",
  "not-found": "404",
  "server-error": "500",
  "service-unavailable": "503"
} as const;

export type PublicStateRouteId = (typeof supportedPublicStateRoutes)[number];
export type PublicStateRouteAlias = keyof typeof publicStateAliases;

export function listSupportedPublicStateRoutes(): readonly PublicStateRouteId[] {
  return supportedPublicStateRoutes;
}

export function normalizePublicStateRoute(rawState: string): string {
  return publicStateAliases[rawState as PublicStateRouteAlias] || rawState;
}

export function isSupportedPublicStateRoute(rawState: string): rawState is PublicStateRouteId | PublicStateRouteAlias {
  return supportedPublicStateRoutes.includes(rawState as PublicStateRouteId) || rawState in publicStateAliases;
}

export function resolvePublicStateDescriptor(messages: PublicMarketplaceMessages, rawState: string): StateDescriptor | null {
  const normalizedState = normalizePublicStateRoute(rawState);

  switch (normalizedState) {
    case "loading":
      return {
        tone: "loading",
        title: messages.stateLoadingTitle,
        description: messages.stateLoadingDescription,
        actions: []
      };
    case "empty":
      return {
        tone: "neutral",
        title: messages.stateEmptyTitle,
        description: messages.stateEmptyDescription,
        actions: ["home", "search"]
      };
    case "error":
      return {
        tone: "danger",
        title: messages.stateErrorTitle,
        description: messages.stateErrorDescription,
        actions: ["retry", "home"]
      };
    case "permission":
      return {
        tone: "warning",
        title: messages.statePermissionTitle,
        description: messages.statePermissionDescription,
        actions: ["home", "search"]
      };
    case "404":
      return {
        code: "404",
        tone: "warning",
        title: messages.state404Title,
        description: messages.state404Description,
        actions: ["home", "search"]
      };
    case "500":
      return {
        code: "500",
        tone: "danger",
        title: messages.state500Title,
        description: messages.state500Description,
        actions: ["retry", "home"]
      };
    case "503":
      return {
        code: "503",
        tone: "danger",
        title: messages.state503Title,
        description: messages.state503Description,
        actions: ["retry", "home"]
      };
    default:
      return null;
  }
}
