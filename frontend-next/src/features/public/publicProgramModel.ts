import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

export type PublicProgramPageKey = "about" | "governance" | "rollout" | "timeline";

export interface PublicProgramDescriptor {
  title: string;
  description: string;
  route: string;
}

export function resolvePublicProgramDescriptor(
  messages: PublicMarketplaceMessages,
  pageKey: PublicProgramPageKey
): PublicProgramDescriptor {
  switch (pageKey) {
    case "about":
      return {
        title: messages.aboutTitle,
        description: messages.aboutDescription,
        route: "/about"
      };
    case "governance":
      return {
        title: messages.governanceTitle,
        description: messages.governanceDescription,
        route: "/governance"
      };
    case "rollout":
      return {
        title: messages.rolloutTitle,
        description: messages.rolloutDescription,
        route: "/rollout"
      };
    case "timeline":
      return {
        title: messages.timelineTitle,
        description: messages.timelineDescription,
        route: "/timeline"
      };
    default:
      return {
        title: messages.aboutTitle,
        description: messages.aboutDescription,
        route: "/about"
      };
  }
}
