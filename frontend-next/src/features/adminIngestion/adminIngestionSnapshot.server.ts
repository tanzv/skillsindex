import "server-only";

import { headers } from "next/headers";

import { fetchAdminCollection } from "@/src/lib/api/admin";

import {
  createAdminIngestionRepositorySnapshot,
  type AdminIngestionRepositorySnapshot
} from "./model";

export async function loadAdminIngestionRepositorySnapshot(
  requestHeaders: Headers
): Promise<AdminIngestionRepositorySnapshot> {
  const [skillsPayload, policyPayload, syncRunsPayload] = await Promise.all([
    fetchAdminCollection(requestHeaders, "/api/bff/admin/skills?source=repository"),
    fetchAdminCollection(requestHeaders, "/api/bff/admin/sync-policy/repository"),
    fetchAdminCollection(requestHeaders, "/api/bff/admin/sync-jobs?limit=6")
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
