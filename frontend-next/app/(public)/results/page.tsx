import {
  renderPublicResultsRoute,
  type PublicResultsRouteProps
} from "@/src/features/public/publicResultsRouteEntry";

export default async function ResultsPage({ searchParams }: PublicResultsRouteProps) {
  return renderPublicResultsRoute(searchParams);
}
