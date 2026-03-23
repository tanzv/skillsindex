import {
  redirectPublicCompatibilityRoute,
  type PublicCompatibilityRouteProps
} from "@/src/features/public/publicCompatibilityRouteEntry";

export default async function ComparePage({ searchParams }: PublicCompatibilityRouteProps) {
  return redirectPublicCompatibilityRoute({
    canonicalRoute: "/rankings",
    searchParams,
    defaultParams: {
      sort: "stars"
    }
  });
}
