import {
  renderPublicNarrativeSnapshotRoute,
  type PublicNarrativeSnapshotRouteProps
} from "@/src/features/public/publicNarrativeSnapshotRouteEntry";

export default async function TimelinePage({ searchParams }: PublicNarrativeSnapshotRouteProps) {
  return renderPublicNarrativeSnapshotRoute("timeline", searchParams);
}
