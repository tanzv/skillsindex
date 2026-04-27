import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("admin ingestion route contracts", () => {
  it("keeps client actions on BFF endpoints and server snapshots on backend endpoints", () => {
    const pageSource = readRepoFile("src/features/adminIngestion/AdminIngestionPage.tsx");
    const snapshotSource = readRepoFile("src/features/adminIngestion/adminIngestionSnapshot.server.ts");

    expect(pageSource).toContain('from "@/src/lib/routing/protectedSurfaceEndpoints"');
    expect(snapshotSource).toContain('from "@/src/lib/routing/protectedSurfaceEndpoints"');
    expect(pageSource).toContain("adminManualIntakeBFFEndpoint");
    expect(pageSource).toContain("adminRepositoryIntakeBFFEndpoint");
    expect(pageSource).toContain("buildAdminSkillsCollectionBFFEndpoint");
    expect(snapshotSource).toContain("adminSyncPolicyEndpoint");
    expect(snapshotSource).toContain("buildAdminSkillsCollectionEndpoint");
    expect(snapshotSource).toContain("buildAdminSyncJobsCollectionEndpoint");
    expect(snapshotSource).not.toContain("adminSyncPolicyBFFEndpoint");
    expect(snapshotSource).not.toContain("buildAdminSkillsCollectionBFFEndpoint");
    expect(snapshotSource).not.toContain("buildAdminSyncJobsCollectionBFFEndpoint");
  });
});
