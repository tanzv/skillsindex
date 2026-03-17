import { PublicProgramPage } from "@/src/features/public/PublicProgramPage";
import {
  loadPublicMarketplaceSnapshotFromRequest,
  type PublicSnapshotSearchParams
} from "@/src/lib/api/publicSnapshot.server";

interface GovernancePageProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

export default async function GovernancePage({ searchParams }: GovernancePageProps) {
  const marketplace = await loadPublicMarketplaceSnapshotFromRequest(searchParams);

  return <PublicProgramPage pageKey="governance" marketplace={marketplace} />;
}
