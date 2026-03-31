import {
  redirectPublicCompatibilityRoute,
  type PublicCompatibilityRouteProps
} from "@/src/features/public/publicCompatibilityRouteEntry";
import { publicRankingsRoute } from "@/src/lib/routing/publicRouteRegistry";

export default async function ComparePage({ searchParams }: PublicCompatibilityRouteProps) {
  return redirectPublicCompatibilityRoute({
    canonicalRoute: publicRankingsRoute,
    searchParams,
    defaultParams: {
      sort: "stars"
    }
  });
}
