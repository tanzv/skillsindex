import {
  renderPublicNarrativeSnapshotRoute,
  type PublicNarrativeSnapshotRouteProps
} from "@/src/features/public/publicNarrativeSnapshotRouteEntry";

export default async function DocsPage({ searchParams }: PublicNarrativeSnapshotRouteProps) {
  return renderPublicNarrativeSnapshotRoute("docs", searchParams);
}
