import { PublicProgramPage } from "@/src/features/public/PublicProgramPage";
import {
  loadPublicMarketplaceSnapshotFromRequest,
  type PublicSnapshotSearchParams
} from "@/src/lib/api/publicSnapshot.server";

interface AboutPageProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const marketplace = await loadPublicMarketplaceSnapshotFromRequest(searchParams);

  return <PublicProgramPage pageKey="about" marketplace={marketplace} />;
}
