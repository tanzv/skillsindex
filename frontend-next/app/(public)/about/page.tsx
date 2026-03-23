import {
  renderPublicNarrativeSnapshotRoute,
  type PublicNarrativeSnapshotRouteProps
} from "@/src/features/public/publicNarrativeSnapshotRouteEntry";

export default async function AboutPage({ searchParams }: PublicNarrativeSnapshotRouteProps) {
  return renderPublicNarrativeSnapshotRoute("about", searchParams);
}
