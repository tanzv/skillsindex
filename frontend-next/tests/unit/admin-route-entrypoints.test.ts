import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  adminAccessRoute,
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminAlertsRoute,
  adminAPIKeysRoute,
  adminAuditExportRoute,
  adminAuditRoute,
  adminBackupPlansRoute,
  adminBackupRunsRoute,
  adminChangeApprovalsRoute,
  adminIntegrationsRoute,
  adminJobsRoute,
  adminManualIntakeRoute,
  adminMetricsRoute,
  adminModerationRoute,
  adminOrganizationsRoute,
  adminOverviewRoute,
  adminRecoveryDrillsRoute,
  adminReleaseGatesRoute,
  adminReleasesRoute,
  adminRepositoryIntakeRoute,
  adminRolesNewRoute,
  adminRolesRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute,
  adminImportsRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin route entrypoints", () => {
  it("keeps the admin index redirect aligned with the protected route contract", () => {
    const routeSource = readAppFile("app/(admin)/admin/page.tsx");

    expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
    expect(routeSource).toContain("adminOverviewRoute");
    expect(routeSource).not.toContain('redirect("/admin/overview")');
  });

  it("routes admin pages through the shared admin route helper and protected route contract", () => {
    const routeFiles = [
      { file: "app/(admin)/admin/access/page.tsx", route: adminAccessRoute },
      { file: "app/(admin)/admin/accounts/new/page.tsx", route: adminAccountsNewRoute },
      { file: "app/(admin)/admin/accounts/page.tsx", route: adminAccountsRoute },
      { file: "app/(admin)/admin/audit/page.tsx", route: adminAuditRoute },
      { file: "app/(admin)/admin/apikeys/page.tsx", route: adminAPIKeysRoute },
      { file: "app/(admin)/admin/ingestion/manual/page.tsx", route: adminManualIntakeRoute },
      { file: "app/(admin)/admin/ingestion/repository/page.tsx", route: adminRepositoryIntakeRoute },
      { file: "app/(admin)/admin/integrations/page.tsx", route: adminIntegrationsRoute },
      { file: "app/(admin)/admin/jobs/page.tsx", route: adminJobsRoute },
      { file: "app/(admin)/admin/moderation/page.tsx", route: adminModerationRoute },
      { file: "app/(admin)/admin/ops/alerts/page.tsx", route: adminAlertsRoute },
      { file: "app/(admin)/admin/ops/audit-export/page.tsx", route: adminAuditExportRoute },
      { file: "app/(admin)/admin/ops/backup/plans/page.tsx", route: adminBackupPlansRoute },
      { file: "app/(admin)/admin/ops/backup/runs/page.tsx", route: adminBackupRunsRoute },
      { file: "app/(admin)/admin/ops/change-approvals/page.tsx", route: adminChangeApprovalsRoute },
      { file: "app/(admin)/admin/ops/metrics/page.tsx", route: adminMetricsRoute },
      { file: "app/(admin)/admin/ops/recovery-drills/page.tsx", route: adminRecoveryDrillsRoute },
      { file: "app/(admin)/admin/ops/release-gates/page.tsx", route: adminReleaseGatesRoute },
      { file: "app/(admin)/admin/ops/releases/page.tsx", route: adminReleasesRoute },
      { file: "app/(admin)/admin/organizations/page.tsx", route: adminOrganizationsRoute },
      { file: "app/(admin)/admin/overview/page.tsx", route: adminOverviewRoute },
      { file: "app/(admin)/admin/records/imports/page.tsx", route: adminImportsRoute },
      { file: "app/(admin)/admin/roles/new/page.tsx", route: adminRolesNewRoute },
      { file: "app/(admin)/admin/roles/page.tsx", route: adminRolesRoute },
      { file: "app/(admin)/admin/skills/page.tsx", route: adminSkillsRoute },
      { file: "app/(admin)/admin/sync-jobs/page.tsx", route: adminSyncJobsRoute },
      { file: "app/(admin)/admin/sync-policy/repository/page.tsx", route: adminSyncPolicyRoute }
    ];

    for (const { file, route } of routeFiles) {
      const routeSource = readAppFile(file);

      expect(routeSource).toContain('from "@/src/features/admin/adminRouteEntry"');
      expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
      expect(routeSource).not.toContain('from "@/src/features/admin/renderAdminRoute"');
      expect(routeSource).not.toContain("renderAdminRoute(");
      expect(routeSource).not.toContain(`renderAdminPageRoute("${route}")`);
    }
  });
});
