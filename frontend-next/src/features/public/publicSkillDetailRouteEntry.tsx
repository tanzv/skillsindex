import type { ReactElement } from "react";

import { headers } from "next/headers";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { loadInitialSkillDetailPageData } from "./loadInitialSkillDetailPageData";

export interface PublicSkillDetailRouteParams {
  skillId: string;
}

export interface PublicSkillDetailRouteProps {
  params: Promise<PublicSkillDetailRouteParams>;
}

export async function renderPublicSkillDetailRoute(
  params: Promise<PublicSkillDetailRouteParams>
): Promise<ReactElement> {
  const { skillId } = await params;
  const numericSkillId = Number(skillId);

  if (!Number.isFinite(numericSkillId) || numericSkillId <= 0) {
    return <ErrorState title="Invalid skill" description={`The provided skill id "${skillId}" is invalid.`} />;
  }

  const requestHeaders = new Headers(await headers());
  const { detail, resources, versions, initialResourceContent, errorMessage } =
    await loadInitialSkillDetailPageData(requestHeaders, numericSkillId);

  if (!detail) {
    return <ErrorState description={errorMessage || "Failed to load skill detail."} />;
  }

  const { PublicSkillInteractiveDetail } = await import("./PublicSkillInteractiveDetail");

  return (
    <PublicSkillInteractiveDetail
      initialDetail={detail}
      resources={resources}
      versions={versions}
      initialResourceContent={initialResourceContent}
    />
  );
}
