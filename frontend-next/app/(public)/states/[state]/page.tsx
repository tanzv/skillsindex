import { notFound } from "next/navigation";

import { PublicStatePage } from "@/src/features/public/PublicStatePage";

interface PublicStateRoutePageProps {
  params: Promise<{
    state: string;
  }>;
}

export default async function PublicStateRoutePage({ params }: PublicStateRoutePageProps) {
  const { state } = await params;
  const allowedStates = new Set(["loading", "empty", "error", "permission", "permission-denied"]);

  if (!allowedStates.has(state)) {
    notFound();
  }

  return <PublicStatePage state={state} />;
}
