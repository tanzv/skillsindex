import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { resolvePublicNarrativeRouteDescriptorById } from "@/src/lib/navigation/publicNavigationRegistry";
import { publicAboutRoute } from "@/src/lib/routing/publicRouteRegistry";

type PublicProgramDescriptorMessages = Pick<
  PublicMarketplaceMessages,
  | "aboutDescription"
  | "aboutTitle"
  | "governanceDescription"
  | "governanceTitle"
  | "rolloutDescription"
  | "rolloutTitle"
  | "timelineDescription"
  | "timelineTitle"
>;

export type PublicProgramPageKey = "about" | "governance" | "rollout" | "timeline";

export interface PublicProgramDescriptor {
  title: string;
  description: string;
  route: string;
}

export function resolvePublicProgramDescriptor(
  messages: PublicProgramDescriptorMessages,
  pageKey: PublicProgramPageKey
): PublicProgramDescriptor {
  const route = resolvePublicNarrativeRouteDescriptorById(pageKey)?.corePath || publicAboutRoute;

  switch (pageKey) {
    case "about":
      return {
        title: messages.aboutTitle,
        description: messages.aboutDescription,
        route
      };
    case "governance":
      return {
        title: messages.governanceTitle,
        description: messages.governanceDescription,
        route
      };
    case "rollout":
      return {
        title: messages.rolloutTitle,
        description: messages.rolloutDescription,
        route
      };
    case "timeline":
      return {
        title: messages.timelineTitle,
        description: messages.timelineDescription,
        route
      };
    default:
      return {
        title: messages.aboutTitle,
        description: messages.aboutDescription,
        route
      };
  }
}
