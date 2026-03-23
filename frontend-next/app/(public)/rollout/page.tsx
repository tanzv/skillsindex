import {
  renderPublicNarrativeSnapshotRoute,
  type PublicNarrativeSnapshotRouteProps
} from "@/src/features/public/publicNarrativeSnapshotRouteEntry";

export default async function RolloutPage({ searchParams }: PublicNarrativeSnapshotRouteProps) {
  return renderPublicNarrativeSnapshotRoute("rollout", searchParams);
}
