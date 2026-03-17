import { PublicProgramPage } from "@/src/features/public/PublicProgramPage";
import {
  loadPublicMarketplaceSnapshotFromRequest,
  type PublicSnapshotSearchParams
} from "@/src/lib/api/publicSnapshot.server";

interface RolloutPageProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

export default async function RolloutPage({ searchParams }: RolloutPageProps) {
  const marketplace = await loadPublicMarketplaceSnapshotFromRequest(searchParams);

  return <PublicProgramPage pageKey="rollout" marketplace={marketplace} />;
}
