import { PublicProgramPage } from "@/src/features/public/PublicProgramPage";
import {
  loadPublicMarketplaceSnapshotFromRequest,
  type PublicSnapshotSearchParams
} from "@/src/lib/api/publicSnapshot.server";

interface TimelinePageProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const marketplace = await loadPublicMarketplaceSnapshotFromRequest(searchParams);

  return <PublicProgramPage pageKey="timeline" marketplace={marketplace} />;
}
