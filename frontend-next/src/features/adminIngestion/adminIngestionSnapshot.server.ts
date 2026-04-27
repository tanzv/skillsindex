import "server-only";

import { headers } from "next/headers";

import { fetchAdminCollection } from "@/src/lib/api/admin";
import {
  adminSyncPolicyEndpoint,
  buildAdminSkillsCollectionEndpoint,
  buildAdminSyncJobsCollectionEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

import {
  createAdminIngestionRepositorySnapshot,
  type AdminIngestionRepositorySnapshot
} from "./model";

export async function loadAdminIngestionRepositorySnapshot(
  requestHeaders: Headers
): Promise<AdminIngestionRepositorySnapshot> {
  const [skillsPayload, policyPayload, syncRunsPayload] = await Promise.all([
    fetchAdminCollection(requestHeaders, buildAdminSkillsCollectionEndpoint("repository")),
    fetchAdminCollection(requestHeaders, adminSyncPolicyEndpoint),
    fetchAdminCollection(requestHeaders, buildAdminSyncJobsCollectionEndpoint(6))
  ]);

  return createAdminIngestionRepositorySnapshot({
    skillsPayload,
    policyPayload,
    syncRunsPayload
  });
}

export async function loadAdminIngestionRepositorySnapshotFromRequest(): Promise<AdminIngestionRepositorySnapshot> {
  const requestHeaders = new Headers(await headers());
  return loadAdminIngestionRepositorySnapshot(requestHeaders);
}
