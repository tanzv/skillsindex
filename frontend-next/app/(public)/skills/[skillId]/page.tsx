import { headers } from "next/headers";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { loadInitialSkillDetailPageData } from "@/src/features/public/loadInitialSkillDetailPageData";
import { PublicSkillInteractiveDetail } from "@/src/features/public/PublicSkillInteractiveDetail";

interface SkillDetailPageProps {
  params: Promise<{
    skillId: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { skillId } = await params;
  const numericSkillId = Number(skillId);

  if (!Number.isFinite(numericSkillId) || numericSkillId <= 0) {
    return <ErrorState title="Invalid skill" description={`The provided skill id "${skillId}" is invalid.`} />;
  }

  const requestHeaders = new Headers(await headers());
  const {
    detail,
    resources,
    versions,
    initialResourceContent,
    errorMessage
  } = await loadInitialSkillDetailPageData(requestHeaders, numericSkillId);

  if (!detail) {
    return <ErrorState description={errorMessage || "Failed to load skill detail."} />;
  }

  return (
    <PublicSkillInteractiveDetail
      initialDetail={detail}
      resources={resources}
      versions={versions}
      initialResourceContent={initialResourceContent}
    />
  );
}
