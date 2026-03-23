import {
  renderPublicRankingRoute,
  type PublicRankingRouteProps
} from "@/src/features/public/publicRankingRouteEntry";

export default async function RankingsPage({ searchParams }: PublicRankingRouteProps) {
  return renderPublicRankingRoute(searchParams);
}
