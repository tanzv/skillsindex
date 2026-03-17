import { headers } from "next/headers";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PublicSkillInteractiveDetail } from "@/src/features/public/PublicSkillInteractiveDetail";
import { buildPublicSkillDetailFallback, resolvePublicSkillFallback } from "@/src/features/public/publicSkillDetailFallback";
import { fetchSkillDetail, fetchSkillResourceContent, fetchSkillResources, fetchSkillVersions } from "@/src/lib/api/public";

interface SkillDetailPageProps {
  params: Promise<{
    skillId: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { skillId } = await params;
  const numericSkillId = Number(skillId);
  let detail = null;
  let resources = null;
  let versions = null;
  let initialResourceContent = null;
  let errorMessage = "";

  if (!Number.isFinite(numericSkillId) || numericSkillId <= 0) {
    return <ErrorState title="Invalid skill" description={`The provided skill id "${skillId}" is invalid.`} />;
  }

  try {
    const requestHeaders = new Headers(await headers());
    [detail, resources, versions] = await Promise.all([
      fetchSkillDetail(requestHeaders, numericSkillId),
      fetchSkillResources(requestHeaders, numericSkillId).catch(() => null),
      fetchSkillVersions(requestHeaders, numericSkillId).catch(() => null)
    ]);

    const firstResourcePath = resources?.files[0]?.name;
    if (firstResourcePath) {
      initialResourceContent = await fetchSkillResourceContent(requestHeaders, numericSkillId, firstResourcePath).catch(() => null);
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load skill detail.";
  }

  if (!detail) {
    const fallbackSkill = resolvePublicSkillFallback(numericSkillId);

    if (!fallbackSkill) {
      return <ErrorState description={errorMessage || "Failed to load skill detail."} />;
    }

    const fallback = buildPublicSkillDetailFallback(numericSkillId);
    detail = fallback.detail;
    resources = fallback.resources;
    versions = fallback.versions;
    initialResourceContent = fallback.resourceContent;
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
