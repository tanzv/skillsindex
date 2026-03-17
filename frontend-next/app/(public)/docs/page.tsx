import { PublicDocsPage } from "@/src/features/public/PublicDocsPage";
import {
  loadPublicMarketplaceSnapshotFromRequest,
  type PublicSnapshotSearchParams
} from "@/src/lib/api/publicSnapshot.server";

interface DocsPageProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const marketplace = await loadPublicMarketplaceSnapshotFromRequest(searchParams);

  return <PublicDocsPage marketplace={marketplace} />;
}
