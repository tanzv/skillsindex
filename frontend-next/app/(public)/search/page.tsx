import {
  redirectPublicCompatibilityRoute,
  type PublicCompatibilityRouteProps
} from "@/src/features/public/publicCompatibilityRouteEntry";

export default async function SearchPage({ searchParams }: PublicCompatibilityRouteProps) {
  return redirectPublicCompatibilityRoute({
    canonicalRoute: "/results",
    searchParams
  });
}
