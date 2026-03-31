import {
  redirectPublicCompatibilityRoute,
  type PublicCompatibilityRouteProps
} from "@/src/features/public/publicCompatibilityRouteEntry";
import { publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";

export default async function SearchPage({ searchParams }: PublicCompatibilityRouteProps) {
  return redirectPublicCompatibilityRoute({
    canonicalRoute: publicResultsRoute,
    searchParams
  });
}
